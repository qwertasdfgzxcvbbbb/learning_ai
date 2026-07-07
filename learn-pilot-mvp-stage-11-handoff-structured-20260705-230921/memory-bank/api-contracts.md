# API 合约说明

当前项目优先使用 Next.js App Router 和 server action。页面文件只负责组合 UI，具体业务写入通过 feature action、service 和 repository 完成。

## Server Actions

### `createPlanAction`

文件：

```text
src/features/plan-creation/actions.ts
```

用途：创建学习计划草稿。

调用来源：

```text
src/features/plan-creation/plan-creation-form.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `learningDirection` | string | 学习方向，例如“AI 产品经理”。 |
| `specificGoal` | string | 具体学习目标。 |
| `goalType` | enum | 目标类型，例如快速入门、系统学习、求职作品集等。 |
| `foundationLevel` | enum | 当前基础水平。 |
| `durationDays` | number | 学习周期，3 到 365 天。 |
| `dailyMinutes` | number | 每天学习时间，10 到 480 分钟。 |
| `weeklyStudyDays` | number | 每周学习天数，1 到 7 天。 |
| `preferredResources` | string[] | 偏好的资源类型，至少 1 个。 |
| `targetOutcome` | string | 可选，目标产出。 |

校验规则：

```text
src/features/plan-creation/schema.ts
```

成功结果：

- 创建 `LearningPlan` 草稿。
- 默认关联演示用户 `demo-user`。
- `status` 为 `draft`。
- 同时创建 `PlanVersion` 第 1 版快照。
- 成功后跳转到 `/plans/[planId]`。

失败结果：

- 返回 `PlanCreationActionState`。
- 表单会展示整体错误或字段错误。
- 如果本地 PostgreSQL 未启动，会提示用户确认数据库状态。

## 后续约定

### `submitAssessmentAction`

文件：

```text
src/features/assessment/actions.ts
```

用途：提交基础测评答案。

调用来源：

```text
src/features/assessment/assessment-form.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID。 |
| `selfLevel` | enum | 用户自评基础：零基础、入门、中级、进阶。 |
| `question:*` | string | 每道题的选项值。 |

成功结果：

- 创建一条 `Assessment`。
- `status = completed`。
- 保存生成题目、用户答案、分数、结果等级、优势、短板和置信说明。
- 跳转回 `/plans/[planId]`。

失败结果：

- 返回 `AssessmentActionState`。
- 表单展示整体错误。
- 如果答案不完整或数据库不可用，不写入测评记录。

### `skipAssessmentAction`

文件：

```text
src/features/assessment/actions.ts
```

用途：跳过基础测评。

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID。 |

成功结果：

- 创建一条 `Assessment`。
- `status = skipped`。
- `resultLevel = beginner`。
- `score = 24`。
- 保存说明：用户跳过测评，MVP 默认按初级偏保守处理。
- 跳转回 `/plans/[planId]`。

失败结果：

- 如果没有 `planId`，跳回 `/plans`。
- 如果计划不存在或数据库不可用，server action 会抛出错误，由页面错误边界处理。

### `generateRoadmapAction`

文件：

```text
src/features/roadmap/actions.ts
```

用途：为计划生成 mock AI 路线图。

调用来源：

```text
src/app/plans/[planId]/page.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID。 |

前置条件：

- 计划必须属于演示用户 `demo-user`。
- 计划必须至少有一条 `Assessment`。
- 如果计划已经有 `RoadmapStage`，不会重复生成。

成功结果：

- 写入 `RoadmapStage`。
- 写入 `DailyTask`。
- 写入 `ResourceRecommendation`。
- 写入 `AiCallLog`。
- 更新 `LearningPlan.status = active`。
- 更新 `LearningPlan.aiGenerated = true`。
- 更新 `LearningPlan.sourcePromptVersion = mock-roadmap-v1`。
- 跳转回 `/plans/[planId]?roadmap=generated`。

其他结果：

- 已有路线图：跳转回 `/plans/[planId]?roadmap=already-exists`。
- 缺少测评：跳转回 `/plans/[planId]?roadmap=assessment-required`。
- 计划不存在：跳转回 `/plans`。

AI 输出校验：

```text
src/server/ai/schemas/roadmap-output.schema.ts
```

当前阶段说明：

- 使用 mock AI。
- 不调用真实 OpenAI API。
- 资源建议必须包含核验提示。

### `updateTaskStatusAction`

文件：

```text
src/features/daily-tasks/actions.ts
```

用途：更新每日任务状态。

调用来源：

```text
src/features/daily-tasks/task-list.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `taskId` | string | 当前任务 ID。 |
| `nextStatus` | enum | 目标状态：`todo`、`in_progress`、`done`、`skipped`、`delayed`。 |

成功结果：

- 更新 `DailyTask.status`。
- 如果目标状态是 `done`，写入 `ProgressLog.type = task_completed`。
- 如果目标状态是 `skipped`，写入 `ProgressLog.type = task_skipped`。
- 如果目标状态是 `delayed`，写入 `ProgressLog.type = task_delayed`。
- 刷新 `/`、`/plans` 和 `/plans/[planId]`。

防重复规则：

- 如果任务当前已经是目标状态，不重复写入进度日志。
- 如果任务已经完成，不允许继续改为其他状态。
- 同一个任务同一种进度日志只写一次。

业务规则来源：

```text
src/features/daily-tasks/status.ts
src/server/services/daily-task.service.ts
```

### `updateResourceStatusAction`

文件：

```text
src/features/resources/actions.ts
```

用途：更新资源建议状态。

调用来源：

```text
src/features/resources/resource-list.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `resourceId` | string | 当前资源建议 ID。 |
| `nextStatus` | enum | 目标状态：`want_to_learn`、`learned`、`unsuitable`。 |

成功结果：

- 更新 `ResourceRecommendation.status`。
- 刷新 `/`、`/plans` 和 `/plans/[planId]`。

防重复和隔离规则：

- 如果资源当前已经是目标状态，不重复写入。
- 如果资源不属于演示用户，按未找到处理。
- 资源状态不会写入 `ProgressLog`。
- 资源状态不会改变任务完成率。

业务规则来源：

```text
src/features/resources/status.ts
src/server/services/resource.service.ts
```

### `createNoteAction`

文件：

```text
src/features/notes/actions.ts
```

用途：创建纯文本学习笔记。

调用来源：

```text
src/features/notes/note-panel.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID。 |
| `taskId` | string | 可选，关联任务 ID。为空时创建计划级笔记。 |
| `content` | string | 用户输入的原文笔记。 |

成功结果：

- 创建 `Note`。
- 保存用户原文 `content`。
- 如果传入 `taskId`，关联到同计划下的任务。
- 刷新 `/plans/[planId]`。

校验和边界：

- 空笔记不保存。
- 单条笔记最多 2000 字。
- 计划必须属于演示用户。
- 关联任务必须属于同一个计划。
- MVP 不做 AI 摘要、改写、图片、附件或富文本。

业务规则来源：

```text
src/features/notes/schema.ts
src/server/services/note.service.ts
```

### `createReviewAction`

文件：

```text
src/features/review/actions.ts
```

用途：创建计划级周复盘记录。

调用来源：

```text
src/features/review/review-form.tsx
src/app/plans/[planId]/review/page.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID。 |
| `satisfactionScore` | number | 本周满意度，1 到 5 分。 |
| `blockers` | string | 可选，本周遇到的阻碍，最多 1000 字。 |
| `nextGoal` | string | 可选，下周目标，最多 500 字。 |

成功结果：

- 创建一条 `Review`。
- `reviewType = weekly`。
- `periodStart` 和 `periodEnd` 使用北京时间自然周范围。
- 保存本周任务完成率、延期任务数、跳过任务数、满意度、阻碍和下周目标。
- 刷新 `/plans/[planId]/review`、`/plans/[planId]` 和 `/review`。

校验和边界：

- 计划必须属于演示用户。
- 满意度必须是 1 到 5 的整数。
- 完成率统计中，跳过任务不计入分母，延期任务算未完成。
- 延期和跳过数量会结合当前任务状态与本周进度日志去重统计。
- `createReviewAction` 只保存复盘，不直接生成或应用 AI 调整建议；调整建议走独立 action。

业务规则来源：

```text
src/features/review/schema.ts
src/server/services/review.service.ts
```

### `generateReviewAdjustmentAction`

文件：

```text
src/features/review/actions.ts
```

用途：基于最近一次复盘生成待确认的 mock AI 调整建议。

调用来源：

```text
src/features/review/review-summary.tsx
src/app/plans/[planId]/review/page.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID。 |

前置条件：

- 计划必须属于演示用户。
- 计划必须至少有一条 `Review`。
- 如果最近复盘已经有关联调整建议，不重复生成。

成功结果：

- 调用 mock AI 调整建议 task。
- AI 输出经过 Zod schema 校验。
- 创建 `PlanAdjustment`，`status = pending`。
- 写入 `beforeSnapshot` 和预览用 `afterSnapshot`。
- 写入 `AiCallLog.taskType = generate_review_adjustment`。
- 刷新 `/plans/[planId]/review`、`/plans/[planId]` 和 `/review`。

边界：

- 生成建议不会修改 `LearningPlan`。
- 生成建议不会创建新的 `PlanVersion`。
- schema 校验失败时不创建 `PlanAdjustment`，会写入失败的 `AiCallLog`。

业务规则来源：

```text
src/server/ai/prompts/generate-review-adjustment.prompt.ts
src/server/ai/schemas/review-adjustment-output.schema.ts
src/server/ai/tasks/generate-review-adjustment.ts
src/server/services/review-adjustment.service.ts
```

### `applyReviewAdjustmentAction`

文件：

```text
src/features/review/actions.ts
```

用途：用户确认后应用一条待确认调整建议。

调用来源：

```text
src/features/review/review-summary.tsx
```

输入字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `planId` | string | 当前学习计划 ID，用于刷新和跳转。 |
| `adjustmentId` | string | 待确认的调整建议 ID。 |

成功结果：

- 只允许应用 `status = pending` 的 `PlanAdjustment`。
- 更新 `LearningPlan.notes`，追加 AI 调整说明。
- 根据建议调整 `LearningPlan.dailyMinutes`，并限制在 10 到 480 分钟。
- 创建新的 `PlanVersion`，`source = ai_adjustment`。
- 更新 `PlanAdjustment.status = applied`，写入 `confirmedAt`、`appliedAt` 和最终 `afterSnapshot`。
- 刷新 `/plans/[planId]/review`、`/plans/[planId]` 和 `/review`。

边界：

- 已应用的建议不会重复应用。
- 非 pending 状态不会修改计划。
- 调整建议不属于演示用户计划时按未找到处理。

业务规则来源：

```text
src/server/repositories/plan-adjustment.repository.ts
src/server/services/review-adjustment.service.ts
```

- 阶段 5 的基础测评可以继续使用 server action。
- 如果后续新增 route handler，route 文件必须保持很薄，只做参数解析和响应封装，业务逻辑放入 service。
- 所有数据库访问必须经过 repository 或 service。
- 所有 AI 调用必须经过 `src/server/ai/`。
