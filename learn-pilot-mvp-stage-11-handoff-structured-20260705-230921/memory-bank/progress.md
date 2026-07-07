# 进度记录

## 2026-07-06 - 阶段 13：AI 调整建议基础版

状态：已完成。计划复盘页现在可以基于最近一次周复盘生成 mock AI 调整建议。建议默认保存为待确认状态，不会自动修改原计划；只有用户点击“确认应用”后，才会更新计划说明和每日学习时长，并写入新的计划版本快照。

### 本次完成内容

- 新增复盘调整建议 prompt：
  - `src/server/ai/prompts/generate-review-adjustment.prompt.ts`
  - 版本号：`mock-review-adjustment-v1`
- 新增 AI 输出 schema：
  - `src/server/ai/schemas/review-adjustment-output.schema.ts`
  - 要求输出包含 `status = pending`、建议标题、建议理由、影响范围和结构化变更。
- 新增 mock AI 调整建议 task：
  - `src/server/ai/tasks/generate-review-adjustment.ts`
  - 根据计划、最近周复盘完成率、延期/跳过任务、阻碍、满意度和下周目标生成小幅调整建议。
- 新增调整建议 repository：
  - `src/server/repositories/plan-adjustment.repository.ts`
  - 支持创建、按复盘去重、按计划查询、按 ID 查询，以及确认应用时事务内更新计划和创建 `PlanVersion`。
- 新增调整建议服务层：
  - `src/server/services/review-adjustment.service.ts`
  - 校验计划必须属于演示用户。
  - 生成建议时只创建 `PlanAdjustment` 和 `AiCallLog`，不修改 `LearningPlan`。
  - schema 失败时不创建建议，并写入失败 AI 日志。
  - 确认应用时只允许 `pending` 建议生效，已应用建议不会重复应用。
  - 应用后更新 `LearningPlan.notes`、`LearningPlan.dailyMinutes`，并创建 `PlanVersion.source = ai_adjustment`。
- 更新复盘 actions：
  - `src/features/review/actions.ts`
  - 新增 `generateReviewAdjustmentAction` 和 `applyReviewAdjustmentAction`。
- 更新复盘页 UI：
  - `src/features/review/review-summary.tsx`
  - 原 AI 调整占位替换为真实建议面板，支持生成建议、查看待确认/已应用状态和确认应用。
  - `src/app/plans/[planId]/review/page.tsx`
  - 复盘页传入调整建议列表。
- 新增测试：
  - `tests/unit/review-adjustment.test.tsx`
  - 覆盖 schema 必填、mock 输出、schema 失败日志、确认前不生效、确认应用、重复应用防护和 UI 展示。

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
11 个测试文件通过
54 个测试用例通过
```

构建结果显示 `/plans/[planId]/review` 继续正常纳入 Next.js 路由。

### 给后续开发者的重要说明

- 阶段 13 已完成；下一阶段是阶段 14：端到端闭环测试。
- 当前调整建议仍是 mock AI，不调用真实 OpenAI API。
- `PlanAdjustment.status = pending` 时不得修改计划；只有确认应用后才能修改计划。
- 确认应用当前只修改计划说明和每日学习时长，不自动重排所有任务。
- 阶段 14 应优先用 Playwright 覆盖移动端核心闭环。

## 2026-07-06 - 本地 PostgreSQL 便携环境补齐

状态：已完成。用户验证阶段 12 时发现项目内 `.tools` 缺失，`scripts/start-postgres.cmd` 无法找到 PostgreSQL。已按便携版方案补齐本地数据库运行时，没有安装系统级 PostgreSQL 服务。

### 本次完成内容

- 下载并解压 EnterpriseDB PostgreSQL 17.6 Windows x64 binaries 到工作区共享目录：
  - `D:\vibe coding\.tools\postgres-17.6\pgsql`
- 初始化数据目录：
  - `D:\vibe coding\.tools\postgres-data`
- 新增本地 `.env`，使用本地连接串：
  - `postgresql://postgres:postgres@localhost:5432/learn_pilot_mvp?schema=public`
- 创建数据库 `learn_pilot_mvp`。
- 成功运行 `prisma migrate dev` 和 `prisma db seed`。
- 调整脚本：
  - `scripts/start-postgres.cmd`
  - `scripts/migrate-and-seed.cmd`
  - `scripts/start-dev.cmd`
  - 脚本现在优先使用项目内 `.tools`，不存在时使用工作区共享 `.tools`；Node/npm 不存在便携版时回退到 PATH 中的 `npm.cmd`。

### 已通过的验证

- `scripts/start-postgres.cmd` 已用短超时验证可启动 PostgreSQL。
- PostgreSQL 日志显示数据库系统准备接受连接。
- 迁移和 seed 已完成，演示数据已写入。

### 后续修正

- 用户运行 `start-dev.cmd` 时，裸 `npm.cmd` fallback 被解析到错误的项目内 `node_modules\npm` 路径，导致 `npm-prefix.js` 和 `npm-cli.js` 找不到。
- 已修正 `start-dev.cmd` 和 `migrate-and-seed.cmd`：fallback 时通过 PATH 定位 `npm.cmd` 的完整路径后再调用。
- 已用短超时验证 `start-dev.cmd` 可启动 Next.js，并输出 `Ready` 和 `http://127.0.0.1:3000`。

## 2026-07-06 - 阶段 12：基础复盘

状态：已完成。计划详情页现在可以进入计划级周复盘页，复盘页会汇总本周任务完成率、延期任务、跳过任务、进度日志数量和最近笔记，并支持保存用户主观反馈。AI 调整建议只预留待确认入口，本阶段不生成或应用调整。

### 本次完成内容

- 新增计划级复盘路由：
  - `src/app/plans/[planId]/review/page.tsx`
  - 展示当前计划、本周复盘统计、复盘表单、笔记入口、AI 调整建议预留区和历史复盘记录。
- 更新复盘 Tab：
  - `src/app/review/page.tsx`
  - 从占位页改为计划选择入口，可进入对应计划的复盘页。
- 更新计划详情页：
  - `src/app/plans/[planId]/page.tsx`
  - 新增“基础复盘”卡片和 `/plans/[planId]/review` 入口。
- 新增复盘 feature：
  - `src/features/review/schema.ts`
  - `src/features/review/actions.ts`
  - `src/features/review/review-form.tsx`
  - `src/features/review/review-summary.tsx`
  - `src/features/review/types.ts`
  - 复盘表单收集本周满意度、卡点和下周目标。
  - 满意度必须为 1 到 5 分，文本字段会 trim，空文本不保存。
- 新增复盘服务层：
  - `src/server/services/review.service.ts`
  - 校验计划必须属于演示用户。
  - 按北京时间自然周汇总任务和进度日志。
  - 跳过任务不计入完成率分母，延期任务仍算未完成。
  - 保存 `Review` 时写入 `periodStart`、`periodEnd`、`completionRate`、`delayedTaskCount`、`skippedTaskCount`、`blockers`、`satisfactionScore` 和 `nextGoal`。
- 扩展日期工具：
  - `src/lib/dates.ts`
  - 新增北京时间自然周范围计算。
- 新增测试：
  - `tests/unit/review-flow.test.tsx`
  - 覆盖复盘 schema、周统计计算、复盘保存服务、跨用户拒绝和复盘 UI 展示。

### 已通过的验证

```text
npm run prisma:generate
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
10 个测试文件通过
47 个测试用例通过
```

构建结果显示 `/plans/[planId]/review` 已纳入 Next.js 路由。

### 给后续开发者的重要说明

- 阶段 12 已完成；在用户完成验证前，不要继续做阶段 13。
- 阶段 13 才实现 AI 调整建议生成、`PlanAdjustment` 写入、确认应用和确认前不生效的测试。
- 当前阶段的 AI 调整区域只是预留入口，不会自动修改原计划。
- 复盘保存必须继续走 `review.service.ts`，不要在页面或组件里直接写数据库。
- 复盘统计当前以北京时间自然周为准，数据来自 `DailyTask` 和 `ProgressLog`。

## 2026-07-05 - 阶段 11：简单笔记

状态：已完成。计划详情页现在包含纯文本笔记输入和笔记列表，笔记保存用户原文，不做 AI 摘要、改写、图片、附件或富文本。

### 本次完成内容

- 新增笔记输入和列表组件：
  - `src/features/notes/note-panel.tsx`
  - 支持选择关联任务，也可以只记录计划级笔记。
  - 展示已有笔记、创建日期和关联任务标题。
  - 无笔记时显示清晰空状态。
  - 明确提示“MVP 只保存你的原文，不做 AI 摘要或改写”。
- 新增笔记 schema：
  - `src/features/notes/schema.ts`
  - 空笔记不会保存。
  - 单条笔记最多 2000 字。
- 新增笔记 server action：
  - `src/features/notes/actions.ts`
  - 保存后刷新当前计划详情页。
- 新增笔记服务层：
  - `src/server/services/note.service.ts`
  - 校验计划必须属于演示用户。
  - 如果关联任务，校验任务必须属于同一个计划。
  - 只保存用户输入的原文 `content`。
- 扩展 repository：
  - `src/server/repositories/note.repository.ts`：按计划读取笔记时带出关联任务标题。
  - `src/server/repositories/plan.repository.ts`：计划详情读取时带出 `notesRecords`。
- 扩展展示数据服务：
  - `src/server/services/dashboard.service.ts`
  - `PlanDetailResult` 新增 `notes`。
  - 新增 `NoteView`，包含笔记内容、创建日期和关联任务标题。
- 更新计划详情页：
  - `src/app/plans/[planId]/page.tsx`
  - 组合 `NotePanel`。
- 新增测试：
  - `tests/unit/note-flow.test.tsx`
  - 覆盖空笔记拒绝、原文保存、计划级笔记、任务关联笔记、跨用户拒绝、跨计划任务拒绝、笔记列表和空状态。

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
9 个测试文件通过
42 个测试用例通过
```

本地页面验证：

```text
http://127.0.0.1:3000/ 返回 200
http://127.0.0.1:3000/plans 返回 200
没有检测到 Runtime Error
```

### 给后续开发者的重要说明

- 阶段 11 已完成；下一阶段是阶段 12：基础复盘。
- 笔记保存必须继续走 `note.service.ts`，不要在组件里直接写数据库。
- MVP 只保存 `Note.content` 原文，不接 AI 摘要，不加图片、附件或富文本入口。
- 如果当前开发服务器没有显示“学习笔记”，重启 `scripts/start-dev.cmd`，因为本次执行过 `next build`，旧 dev 缓存可能还在。

## 2026-07-05 - 阶段 10：资源建议

状态：已完成。资源建议现在会展示更完整的资源信息，并支持“想学、已学、不适合”三种状态切换；资源状态不会影响任务完成率。

### 本次完成内容

- 增强资源建议组件：
  - `src/features/resources/resource-list.tsx`
  - 展示资源类型、来源、当前状态、难度、预计时间、适用阶段、推荐理由和核验提示。
  - 支持将资源标记为“想学”“已学”“不适合”。
  - 当前状态按钮会禁用，避免重复提交。
- 新增资源状态规则：
  - `src/features/resources/status.ts`
  - MVP 只开放 `want_to_learn`、`learned`、`unsuitable`。
  - 数据库中的 `invalid` 暂时不暴露给用户，保留给后续失效资源处理。
- 新增资源状态 server action：
  - `src/features/resources/actions.ts`
  - 状态更新后刷新首页、计划列表和计划详情页。
- 新增资源服务层：
  - `src/server/services/resource.service.ts`
  - 校验资源是否属于演示用户。
  - 状态未变化时不重复写入。
  - 只允许 MVP 开放的资源状态。
- 扩展 repository：
  - `src/server/repositories/resource.repository.ts`：新增 `findById`，按计划查询时带出适用阶段。
  - `src/server/repositories/plan.repository.ts`：计划详情读取资源时带出适用阶段。
- 扩展展示数据服务：
  - `src/server/services/dashboard.service.ts`
  - `ResourceView` 新增状态、难度、适用阶段和预计时间字段。
- 新增测试：
  - `tests/unit/resource-status.test.tsx`
  - 覆盖资源状态白名单、资源列表展示、资源状态服务、跨用户拒绝、重复状态不重复写、资源状态不影响任务完成率。

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
8 个测试文件通过
36 个测试用例通过
```

本地页面验证：

```text
http://127.0.0.1:3000/ 返回 200
首页 HTML 已包含“资源建议”
没有检测到 Runtime Error
```

### 给后续开发者的重要说明

- 阶段 10 已完成；下一阶段是阶段 11：简单笔记。
- 资源状态更新必须继续走 `resource.service.ts`，不要在组件里直接写数据库。
- 资源状态不写入 `ProgressLog`，也不改变任务完成率。
- 资源建议仍然必须展示“请自行核验”提示，不要展示无法核验的 AI 编造链接。

## 2026-07-05 - 阶段 9：进度反馈

状态：已完成。首页和计划详情页现在会展示今日完成率、计划总进度、连续学习天数，并说明今天是否已经完成核心任务。

### 本次完成内容

- 扩展进度计算纯函数：
  - `src/features/progress/calculations.ts`
  - 新增 `calculateCurrentStreakDays`，只把 `task_completed` 和 `check_in` 计入连续学习天数。
  - 新增 `calculateProgressOverview`，统一汇总今日完成率、总完成率、连续学习天数和今日是否可打卡。
  - 延期任务继续算未完成，跳过任务继续不计入完成率分母。
- 更新进度概览组件：
  - `src/features/progress/progress-summary.tsx`
  - 展示“今日完成”“计划进度”“连续学习”三项核心指标。
  - 分别展示今天和全部任务的进度条。
  - 根据今天是否完成核心任务显示有效学习提示。
- 更新页面展示数据服务：
  - `src/server/services/dashboard.service.ts`
  - `PlanCardView` 新增今日进度、连续天数和可打卡字段。
  - 首页和计划详情页继续只接收整理后的展示数据，不直接计算业务规则。
- 更新计划 repository：
  - `src/server/repositories/plan.repository.ts`
  - `findById` 会带出 `progressLogs`，供进度统计使用。
- 扩展测试：
  - `tests/unit/progress-calculations.test.ts`
  - 覆盖 0%、部分完成、全部完成、无任务、连续学习天数、延期和跳过不计入连续学习等场景。

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
7 个测试文件通过
30 个测试用例通过
```

本地页面验证：

```text
http://127.0.0.1:3000/ 返回 200
首页 HTML 已包含“进度概览”
没有检测到 Runtime Error
```

### 给后续开发者的重要说明

- 阶段 9 已完成；下一阶段是阶段 10：资源建议。
- 进度计算规则应继续放在 `src/features/progress/calculations.ts`，不要写进页面组件。
- 连续学习天数当前以北京时间为准，只看截至今天是否连续存在 `task_completed` 或 `check_in` 日志。
- 今日有效学习提示只依赖今日是否完成核心任务；MVP 暂不做掌握度判断。

## 2026-07-05 - 阶段 8：每日任务基础闭环

状态：已完成。任务卡片现在支持状态切换，完成、跳过、延期会写入 `ProgressLog`，并防止重复完成重复记进度。

### 本次完成内容

- 更新任务列表组件：
  - `src/features/daily-tasks/task-list.tsx`
  - 支持开始、完成、延期、跳过。
  - 已完成和已跳过的任务不再显示状态按钮，避免重复操作。
  - 修复任务卡片中文文案乱码。
- 新增任务状态 server action：
  - `src/features/daily-tasks/actions.ts`
- 新增任务服务层：
  - `src/server/services/daily-task.service.ts`
  - 校验任务是否属于演示用户。
  - 校验状态流转是否合法。
  - 第一次完成任务时写入 `task_completed` 进度日志。
  - 跳过任务时写入 `task_skipped` 进度日志。
  - 延期任务时写入 `task_delayed` 进度日志。
  - 如果任务已经是目标状态，不重复写入日志。
- 扩展 repository：
  - `src/server/repositories/task.repository.ts`：新增 `findById`，并带出所属计划用户。
  - `src/server/repositories/progress-log.repository.ts`：新增按任务和日志类型查询。
- 扩展任务状态纯函数：
  - `src/features/daily-tasks/status.ts`
  - 新增 `getProgressLogTypeForTaskStatus`。
- 扩展测试：
  - `tests/unit/task-status.test.ts`
  - 覆盖完成、跳过、延期对应的进度日志类型。

### 产品行为

- `todo` 可以切换为进行中、完成、延期、跳过。
- `in_progress` 可以切换为完成、延期、跳过。
- `delayed` 可以重新安排或直接完成。
- `done` 不允许继续改变状态。
- `skipped` 不显示继续操作按钮。
- 跳过任务仍然不计入完成率分母。
- 延期任务仍然算未完成。

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
7 个测试文件通过
24 个测试用例通过
```

### 给后续开发者的重要说明

- 阶段 8 已完成；在用户明确要求前，不要开始阶段 9。
- 阶段 9 应聚焦进度反馈展示，包括今日完成率、计划总进度、连续打卡天数和进度概览组件增强。
- 任务状态切换必须继续走 `daily-task.service.ts`，不要在组件里直接写数据库。

## 2026-07-05 - 阶段 7：路线图展示

状态：已完成。路线图现在支持移动端友好的阶段展示、折叠展开、AI 来源提示、空状态和核验提醒。

### 本次完成内容

- 重写路线图展示组件：
  - `src/features/roadmap/roadmap-list.tsx`
- 路线图展示增强：
  - 默认展开第一个阶段。
  - 每个阶段可展开/收起。
  - 展示阶段状态、日期范围、阶段目标。
  - 展开后展示内容提纲、预期产出、验收方式。
  - 展示来源：`mock AI 生成` 和 prompt 版本。
  - 展示 AI 建议需要自行核验的提示。
- 更新计划详情页中文文案：
  - `src/app/plans/[planId]/page.tsx`
- 更新页面展示数据服务：
  - `src/server/services/dashboard.service.ts`
  - `StageView` 增加 `startsOn`、`endsOn`、`aiGenerated`、`sourcePromptVersion`。
  - 修复状态、类型、测评结果等用户可见中文标签。
- 新增路线图组件测试：
  - `tests/unit/roadmap-list.test.tsx`

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
7 个测试文件通过
22 个测试用例通过
```

### 给后续开发者的重要说明

- 阶段 7 已完成；在用户明确要求前，不要开始阶段 8。
- 阶段 8 应实现每日任务基础闭环，包括任务列表、状态切换、完成时写入 `ProgressLog` 和防止重复完成。
- 路线图组件现在是客户端组件，只负责交互展示，不访问数据库。
- AI 来源提示和资源核验提示必须继续保留。

## 2026-07-05 - 阶段 6：AI 路线图生成

状态：已完成。当前阶段使用 mock AI，不调用真实模型。计划详情页现在可以在完成或跳过测评后生成路线图。

### 本次完成内容

- 新增路线图生成 prompt：
  - `src/server/ai/prompts/generate-roadmap.prompt.ts`
- 新增 AI 输出 Zod schema：
  - `src/server/ai/schemas/roadmap-output.schema.ts`
- 新增 mock AI 路线图任务：
  - `src/server/ai/tasks/generate-roadmap.ts`
- 新增路线图生成服务：
  - `src/server/services/roadmap-generation.service.ts`
- 新增路线图生成 server action：
  - `src/features/roadmap/actions.ts`
- 更新计划详情页：
  - `src/app/plans/[planId]/page.tsx`
  - 有测评结果且还没有路线图时，显示“生成路线图”按钮。
  - 已有路线图时不重复生成。
  - 没有测评结果时提示先完成或跳过测评。
  - 生成后通过 query message 显示生成结果。
- 重写展示数据服务中文标签：
  - `src/server/services/dashboard.service.ts`
  - 修复计划状态、任务状态、阶段状态、资源类型、测评状态等用户可见中文。
- 重写测评 repository 的跳过测评中文说明：
  - `src/server/repositories/assessment.repository.ts`
- 新增路线图生成测试：
  - `tests/unit/roadmap-generation.test.ts`

### 生成内容

mock AI 输出会经过 Zod 校验，并包含：

- 2 到 4 个学习阶段。
- 前几天的核心学习任务。
- 2 到 6 条资源建议。
- 每条资源建议都包含用户自行核验提示。

保存到数据库时会写入：

- `RoadmapStage`
- `DailyTask`
- `ResourceRecommendation`
- `AiCallLog`

同时会更新 `LearningPlan`：

- `status = active`
- `aiGenerated = true`
- `sourcePromptVersion = mock-roadmap-v1`

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
6 个测试文件通过
20 个测试用例通过
```

### 给后续开发者的重要说明

- 阶段 6 已完成；在用户明确要求前，不要开始阶段 7。
- 阶段 7 应增强路线图展示，而不是改写生成逻辑。
- 当前生成逻辑仍是 mock AI；不要接真实 OpenAI API，除非用户明确要求。
- 路线图已存在时不会重复生成，避免重复写入阶段、任务和资源。
- 资源建议必须继续显示核验提示。

## 2026-07-05 - 阶段 5：基础测评

状态：已完成。用户可以从计划详情进入基础测评，完成自评与 6 道题，或跳过测评并按初级偏保守处理。

### 本次完成内容

- 新增基础测评页面：
  - `src/app/plans/[planId]/assessment/page.tsx`
- 新增测评表单：
  - `src/features/assessment/assessment-form.tsx`
- 新增测评 server action：
  - `src/features/assessment/actions.ts`
- 新增测评题目、schema、评分规则和类型：
  - `src/features/assessment/questions.ts`
  - `src/features/assessment/schema.ts`
  - `src/features/assessment/scoring.ts`
  - `src/features/assessment/types.ts`
- 新增测评 repository 和 service：
  - `src/server/repositories/assessment.repository.ts`
  - `src/server/services/assessment.service.ts`
- 更新计划详情页：
  - `src/app/plans/[planId]/page.tsx`
  - 增加“基础测评”卡片。
  - 可以看到最近一次测评状态、得分和基础等级。
  - 可以进入测评页重新测评。
- 更新计划详情数据服务：
  - `src/server/services/dashboard.service.ts`
  - 详情页会返回最近一次 `Assessment` 摘要。
- 更新计划 repository：
  - `src/server/repositories/plan.repository.ts`
  - `findById` 会包含最近一次 `Assessment`。
- 新增评分测试：
  - `tests/unit/assessment-scoring.test.ts`

### 产品行为

- 测评包含自评等级和 6 道基础题。
- 题目由 mock 逻辑根据计划的 `learningDirection` 生成。
- 完成测评后写入 `Assessment`：
  - `status = completed`
  - 保存 `selfLevel`
  - 保存题目和答案 JSON
  - 保存 `score`
  - 保存 `resultLevel`
  - 保存优势、短板和置信说明
- 跳过测评后写入 `Assessment`：
  - `status = skipped`
  - 默认 `resultLevel = beginner`
  - 默认 `score = 24`
  - 说明为“用户跳过测评，MVP 默认按初级偏保守处理”
- 成功后回到计划详情页。
- 本阶段不生成路线图、不调用真实 AI、不创建每日任务。

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
5 个测试文件通过
18 个测试用例通过
```

构建结果显示 `/plans/[planId]/assessment` 已纳入 Next.js 路由。

### 冒烟测试说明

在当前已运行的开发服务器上访问新测评路由时，出现过：

```text
Cannot find module './611.js'
```

原因是我执行了 `next build`，而用户当前打开的 `next dev` 进程仍持有旧的 `.next` 开发缓存。代码构建已通过；本地验证时需要停止 `scripts\start-dev.cmd` 对应窗口，再重新运行：

```text
.\scripts\start-dev.cmd
```

### 给后续开发者的重要说明

- 阶段 5 已完成；在用户明确要求前，不要开始阶段 6。
- 阶段 6 应读取 `LearningPlan` 和最近一次 `Assessment`，用 mock AI 生成路线图。
- 测评结果只保存为新的 `Assessment` 记录，不直接修改计划内容。
- 跳过测评必须继续按初级偏保守处理。

## 2026-07-05 - 阶段 4：学习目标创建

状态：已完成。用户现在可以从首页或计划列表进入 `/plans/new`，填写学习目标并保存为计划草稿。

### 本次完成内容

- 新增创建计划页面：
  - `src/app/plans/new/page.tsx`
- 新增计划创建表单：
  - `src/features/plan-creation/plan-creation-form.tsx`
- 新增计划创建 server action：
  - `src/features/plan-creation/actions.ts`
- 新增计划创建 schema 和目标合理性提示规则：
  - `src/features/plan-creation/schema.ts`
  - `src/features/plan-creation/types.ts`
- 新增计划创建服务：
  - `src/server/services/plan-creation.service.ts`
- 更新入口：
  - 首页右上角新增按钮进入 `/plans/new`
  - 计划列表右上角新增按钮进入 `/plans/new`
  - 无计划空状态也会引导进入创建计划
- 保存行为：
  - 表单提交后创建 `LearningPlan` 草稿。
  - 默认使用演示用户 `demo-user`。
  - 保存 `learningDirection`、`specificGoal`、`goalType`、`foundationLevel`、`durationDays`、`dailyMinutes`、`weeklyStudyDays`、`preferredResources` 和 `targetOutcome`。
  - 计划状态为 `draft`。
  - 同时创建 `PlanVersion` 第 1 版快照，用于后续“原计划 / 调整后计划”对比。
  - 保存成功后跳转到计划详情页。
- 表单校验：
  - 前端使用必填、最小值、最大值等基础约束。
  - 服务端使用 Zod 再校验一次，防止非法输入直接写入数据库。
  - 至少选择一种偏好资源。
  - 学习周期限制为 3 到 365 天。
  - 每天学习时间限制为 10 到 480 分钟。
  - 每周学习天数限制为 1 到 7 天。
- 目标合理性提示：
  - 周期少于 7 天时提醒收窄目标。
  - 每天少于 30 分钟时提醒适合轻任务。
  - 目标较大但周期较短时提醒后续需要拆分。
- 新增测试：
  - `tests/unit/plan-creation-schema.test.ts`

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

当前单元测试结果：

```text
4 个测试文件通过
14 个测试用例通过
```

构建结果显示 `/plans/new` 已纳入 Next.js 路由。

### 给后续开发者的重要说明

- 阶段 4 已完成；在用户明确要求前，不要开始阶段 5。
- 阶段 4 只创建计划草稿，不生成测评、不生成路线图、不调用 AI。
- 阶段 5 应从基础测评页面开始，读取刚创建的 draft 计划并保存 `Assessment`。
- 创建计划的数据库写入必须继续走 `plan-creation.service.ts` 和 repository 边界。

## 2026-07-04 - 阶段 3：基础页面与移动端导航

状态：已完成。已建立移动端主布局、底部导航、首页、计划列表页、计划详情页、复盘占位页，以及基础加载、错误、空状态组件。

### 本次完成内容

- 新增移动端 App 外壳：
  - `src/components/layout/mobile-shell.tsx`
  - `src/components/layout/bottom-nav.tsx`
- 新增通用反馈组件：
  - `src/components/feedback/empty-state.tsx`
  - `src/components/feedback/error-state.tsx`
  - `src/components/feedback/loading-block.tsx`
- 新增基础页面：
  - `src/app/page.tsx`：首页，展示今日任务、当前计划、进度概览、资源建议和晚上 8 点 App 内提醒。
  - `src/app/plans/page.tsx`：计划列表页，展示演示用户已有计划。
  - `src/app/plans/[planId]/page.tsx`：计划详情页，组合路线图、任务、资源和进度入口。
  - `src/app/plans/[planId]/not-found.tsx`：计划不存在时的清晰提示。
  - `src/app/review/page.tsx`：复盘入口占位页，真实复盘留到阶段 12。
  - `src/app/loading.tsx`：页面加载状态。
  - `src/app/error.tsx`：页面错误状态。
- 新增展示组件：
  - `src/features/plans/plan-card.tsx`
  - `src/features/daily-tasks/task-list.tsx`
  - `src/features/resources/resource-list.tsx`
  - `src/features/roadmap/roadmap-list.tsx`
  - `src/features/progress/progress-summary.tsx`
- 新增页面展示数据服务：
  - `src/server/services/dashboard.service.ts`
- 扩展 repository 读取能力：
  - `src/server/repositories/task.repository.ts`：新增按日期范围读取任务。
  - `src/server/repositories/resource.repository.ts`：新增按计划读取资源建议。
- 扩展日期工具：
  - `src/lib/dates.ts`：新增北京时间短日期、时间、当天范围工具。
- 修复用户可见中文文案：
  - `src/lib/constants.ts`
  - `src/app/layout.tsx`
  - `prisma/seed.mjs`
- 重写 seed 演示数据为正常中文，并重新执行 seed。当前演示数据包括：
  - 1 个演示用户
  - 1 个进行中的学习计划
  - 2 个路线图阶段
  - 2 个今日任务
  - 2 条资源建议
  - 1 个初始计划快照
- 新增开发启动脚本：
  - `scripts/start-dev.cmd`

### 已通过的验证

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
scripts\migrate-and-seed.cmd
```

构建结果显示以下页面已纳入 Next.js 路由：

```text
/
/plans
/plans/[planId]
/review
```

曾在同一次启动流程中验证过首页 `http://127.0.0.1:3000/` 返回 200。后续尝试做更完整的后台启动/停止路由验证时，被当前沙盒的后台进程策略拦截；用户本机可用脚本直接验证。

### 用户本机验证方式

打开两个 PowerShell 窗口：

```text
scripts\start-postgres.cmd
```

另一个窗口运行：

```text
scripts\start-dev.cmd
```

然后访问：

```text
http://localhost:3000/
http://localhost:3000/plans
```

### 给后续开发者的重要说明

- 阶段 3 已完成；在用户明确要求前，不要开始阶段 4。
- 当前页面只负责组合组件，不直接访问 Prisma。
- `dashboard.service.ts` 是阶段 3 的页面数据汇总层；后续如果首页数据变复杂，应继续在 service/repository 内扩展，不要把查询逻辑塞进页面。
- `/review` 只是导航占位页，真实复盘逻辑属于阶段 12。
- `/plans/new` 还没有实现，创建计划属于阶段 4。
- 底部导航当前包含：首页、计划、复盘。

## 2026-07-04 - 阶段 2：数据模型与本地数据库基础

状态：已完成。Prisma schema、初始迁移、repository、seed、基础业务规则测试，以及本地 PostgreSQL 迁移验证都已完成。

### 关键完成内容

- 创建 MVP 核心数据模型：`User`、`LearningPlan`、`Assessment`、`RoadmapStage`、`DailyTask`、`ResourceRecommendation`、`ProgressLog`、`Note`、`Review`、`PlanAdjustment`、`PlanVersion`、`AiCallLog`。
- 创建初始迁移：`prisma/migrations/20260704133000_init/migration.sql`。
- 添加 Prisma Client 边界：`src/server/db/prisma.ts`。
- 添加 repository 层，避免页面和组件直接访问数据库。
- 添加进度计算与任务状态流转规则及单元测试。
- 安装项目内便携版 PostgreSQL：

```text
D:\vibe coding\.tools\postgres-17.6\pgsql
```

- 初始化本地数据目录：

```text
D:\vibe coding\.tools\postgres-data
```

- 已创建并验证数据库：

```text
learn_pilot_mvp
```

### 阶段 2 验证结果

```text
npm run prisma:generate
npx prisma validate
npm run typecheck
npm run lint
npm run test:run
npm run build
npm run db:migrate
npm run db:seed
```

## 2026-07-04 - 阶段 1：项目骨架与基础规范

状态：已完成，并已由用户验证通过。

### 关键完成内容

- 创建 Next.js + React + TypeScript 项目骨架。
- 添加 Tailwind CSS、shadcn/ui 风格组件配置、ESLint、Prettier、Vitest、Playwright。
- 添加基础 UI 组件：`button`、`input`、`card`。
- 添加移动端优先的阶段 1 占位首页。
- 添加 `.env.example` 和 `src/lib/env.ts` 环境变量校验。
- 因为本机没有全局 Node/npm，已在 `.tools/` 下安装项目内便携版 Node.js。

### 阶段 1 验证结果

用户确认以下检查无报错：

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```
