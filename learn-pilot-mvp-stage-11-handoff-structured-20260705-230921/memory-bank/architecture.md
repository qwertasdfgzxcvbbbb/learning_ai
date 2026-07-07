# 架构说明

## 当前阶段

项目当前完成到阶段 13：移动端主布局、底部导航、首页、计划列表页、计划详情页、基础反馈组件、页面展示数据服务、学习目标创建表单、基础测评流程、mock AI 路线图生成、路线图展示增强、每日任务基础闭环、进度反馈、资源建议增强、简单笔记、基础周复盘，以及 AI 调整建议基础版都已完成。

当前应用采用模块化单体架构：一个 Next.js 项目中清晰区分页面组合、通用 UI、业务 feature、服务端逻辑、AI 逻辑、数据库访问和共享工具。

## MVP 已确认的产品决策

- 鉴权：第一版 MVP 不做真实登录，默认使用一个演示用户。
- 数据库：先使用本地 PostgreSQL，后续再迁移到托管 PostgreSQL。
- AI：早期开发使用 mock AI 响应，后续再接真实 API。
- 资源推荐：可以推荐具体书籍、课程、网站或链接，但必须展示核验提示。
- 测评题目：先由 mock AI 根据用户学习目标动态生成。
- 计划生成：先生成高层路线图，每日或每周任务后续动态生成。
- 时区：统一使用北京时间 `Asia/Shanghai`。
- 进度计算：跳过任务不计入完成率分母；延期任务算未完成。
- 计划调整：用户确认后的 AI 建议可以修改目标、周期、资源等计划内容。
- 版本历史：保留计划快照，让用户能对比原计划和调整后计划。
- 笔记：MVP 只保存用户原文，不做 AI 摘要。
- 提醒：只做晚上 8 点 App 内提醒，不做浏览器或系统通知。
- 掌握度判断：MVP 暂不做，先只看任务完成情况。
- memory-bank 命名：统一使用无 `@` 的普通文件名。

## 项目根目录

- `package.json`：项目脚本和依赖。数据库相关脚本包括 `db:migrate`、`db:seed`、`prisma:generate`。
- `package-lock.json`：锁定依赖版本。
- `tsconfig.json`：TypeScript strict 配置和 `@/*` 路径别名。
- `next.config.ts`：Next.js 配置。
- `eslint.config.mjs`：ESLint 配置；`next-env.d.ts` 和 `.tools/**` 会被忽略，避免自动生成文件和本地便携工具被误扫。
- `prettier.config.js`：代码格式化规则。
- `tailwind.config.ts`：Tailwind 主题和文件扫描配置。
- `postcss.config.js`：Tailwind/PostCSS 处理链路。
- `components.json`：shadcn/ui 风格组件配置。
- `.env.example`：环境变量模板。
- `.env`：本地开发环境变量，连接本地 PostgreSQL；该文件被 `.gitignore` 忽略。
- `.gitignore`：忽略构建产物、本地环境文件、依赖目录和 `.tools/`。
- `playwright.config.ts`：后续移动端优先 E2E 测试配置。
- `vitest.config.ts`：单元测试和组件测试配置。
- `scripts/start-postgres.cmd`：启动便携版 PostgreSQL。优先使用项目内 `.tools`，不存在时使用工作区共享 `D:\vibe coding\.tools`；窗口保持打开时数据库运行。
- `scripts/migrate-and-seed.cmd`：在数据库已启动时执行 Prisma 迁移和 seed。优先使用便携 Node，不存在时回退到 PATH 中的 `npm.cmd`。
- `scripts/start-dev.cmd`：启动 Next.js 开发服务器，默认使用 `http://127.0.0.1:3000`。优先使用便携 Node，不存在时回退到 PATH 中的 `npm.cmd`。

## 本地工具

- `.tools/`：项目内便携工具目录，已被 git 忽略；当前 PostgreSQL 实际安装在工作区共享 `D:\vibe coding\.tools`。
- `D:\vibe coding\.tools\postgres-17.6\pgsql\`：便携版 PostgreSQL 程序目录。
- `D:\vibe coding\.tools\postgres-data\`：本地 PostgreSQL 数据目录，已经初始化并迁移过项目表结构。
- 便携版 Node.js 可放在项目内或工作区共享 `.tools`；如果不存在，脚本会回退到 PATH 中的 `npm.cmd`。
- `node_modules/`：项目依赖，已被 git 忽略。
- `.next/`：Next.js 构建产物，已被 git 忽略。

## App Router

- `src/app/layout.tsx`：根 HTML 布局和页面 metadata。
- `src/app/page.tsx`：首页，展示今日任务、当前计划、进度概览、资源建议和晚上 8 点 App 内提醒。
- `src/app/loading.tsx`：全局路由加载状态。
- `src/app/error.tsx`：全局路由错误状态。
- `src/app/plans/page.tsx`：计划列表页，展示演示用户已有计划。
- `src/app/plans/new/page.tsx`：创建计划页面，只组合页面说明和计划创建表单。
- `src/app/plans/[planId]/page.tsx`：计划详情页，组合路线图、任务、资源、进度入口、基础测评入口、路线图生成入口和学习笔记入口。
- `src/app/plans/[planId]/assessment/page.tsx`：基础测评页面，展示自评等级和 6 道 mock 测评题。
- `src/app/plans/[planId]/review/page.tsx`：计划级周复盘页面，展示本周统计、近期笔记、复盘表单、AI 调整建议和历史复盘。
- `src/app/plans/[planId]/not-found.tsx`：计划不存在或不属于演示用户时的提示页。
- `src/app/review/page.tsx`：全局复盘入口页，列出演示用户计划并跳转到计划级周复盘。
- `src/app/globals.css`：Tailwind 引入和全局设计变量。

页面文件只负责路由、布局和组件组合，不直接访问 Prisma、API key 或 AI SDK。

## 通用组件

- `src/components/ui/button.tsx`：shadcn/ui 风格按钮基础组件。
- `src/components/ui/input.tsx`：shadcn/ui 风格输入框基础组件。
- `src/components/ui/card.tsx`：shadcn/ui 风格卡片基础组件。
- `src/components/layout/mobile-shell.tsx`：移动端主外壳，包含顶部标题区、提醒图标、主体容器和底部导航。
- `src/components/layout/bottom-nav.tsx`：底部导航，当前包含首页、计划、复盘。
- `src/components/feedback/empty-state.tsx`：空状态组件。
- `src/components/feedback/error-state.tsx`：错误状态组件，默认提示启动本地 PostgreSQL。
- `src/components/feedback/loading-block.tsx`：加载骨架组件。
- `src/components/charts/`：预留给后续进度和统计图表组件。

## 业务 Feature 模块

- `src/features/plan-creation/plan-creation-form.tsx`：计划创建客户端表单，负责收集学习方向、具体目标、周期、每天时间、每周天数、基础水平和资源偏好。
- `src/features/plan-creation/schema.ts`：计划创建 Zod schema 和目标合理性提示规则。
- `src/features/plan-creation/actions.ts`：计划创建 server action。服务端校验通过后保存草稿并跳转到详情页。
- `src/features/plan-creation/types.ts`：计划创建表单状态和提示类型。
- `src/features/plans/plan-card.tsx`：计划卡片，只接收展示数据，不查询数据库。
- `src/features/assessment/assessment-form.tsx`：基础测评客户端表单，支持提交答案和跳过测评。
- `src/features/assessment/actions.ts`：基础测评 server action。完成或跳过后写入 `Assessment` 并返回计划详情。
- `src/features/assessment/questions.ts`：根据学习方向生成 mock 测评题。
- `src/features/assessment/schema.ts`：测评提交输入校验。
- `src/features/assessment/scoring.ts`：测评评分和基础等级判断规则。
- `src/features/assessment/types.ts`：测评题目、选项和 action 状态类型。
- `src/features/roadmap/roadmap-list.tsx`：路线图展示客户端组件。支持阶段折叠展开、阶段日期、内容提纲、预期产出、验收方式、AI 来源和核验提醒。
- `src/features/roadmap/actions.ts`：路线图生成 server action。读取 `planId` 后调用服务层生成路线图，并跳回计划详情。
- `src/features/daily-tasks/task-list.tsx`：任务列表展示和状态操作组件。支持开始、完成、延期、跳过。
- `src/features/daily-tasks/actions.ts`：任务状态更新 server action。提交任务 ID 和目标状态后刷新首页、计划列表和计划详情。
- `src/features/daily-tasks/status.ts`：任务状态流转规则，以及任务状态到进度日志类型的映射。
- `src/features/resources/resource-list.tsx`：资源建议展示组件。展示类型、来源、状态、难度、预计时间、适用阶段、推荐理由和用户自行核验提示，并提供“想学、已学、不适合”状态操作。
- `src/features/resources/actions.ts`：资源状态更新 server action。提交资源 ID 和目标状态后刷新首页、计划列表和计划详情。
- `src/features/resources/status.ts`：资源状态白名单。MVP 只开放 `want_to_learn`、`learned`、`unsuitable`，数据库中的 `invalid` 暂不暴露给用户。
- `src/features/resources/types.ts`：资源 feature 类型占位；后续如果资源状态或筛选类型增多，可在这里沉淀跨组件类型。
- `src/features/progress/progress-summary.tsx`：进度概览展示组件。展示今日完成率、计划总进度、连续学习天数、今天和全部任务进度条，以及今日是否已有核心任务完成。
- `src/features/progress/calculations.ts`：纯函数进度计算，已覆盖“跳过不计分母、延期算未完成”、今日/总体进度汇总、连续学习天数和有效学习判断。
- `src/features/progress/types.ts`：进度 feature 类型占位；后续如果进度展示类型增多，可在这里沉淀跨组件类型。
- `src/features/notes/note-panel.tsx`：纯文本笔记输入和列表组件。支持计划级笔记和任务关联笔记，展示已有笔记和空状态。
- `src/features/notes/actions.ts`：笔记创建 server action。提交原文笔记后刷新当前计划详情页。
- `src/features/notes/schema.ts`：笔记输入校验。空内容不保存，单条最多 2000 字。
- `src/features/notes/types.ts`：笔记 feature 类型占位；后续如果笔记筛选或编辑能力增多，可在这里沉淀跨组件类型。
- `src/features/review/schema.ts`：周复盘输入校验，满意度必填，阻碍和下周目标为可选文本。
- `src/features/review/actions.ts`：周复盘与调整建议 server actions。支持保存复盘、生成待确认调整建议、确认应用调整，并刷新复盘页、计划详情页和全局复盘入口。
- `src/features/review/review-form.tsx`：周复盘客户端表单，收集满意度、阻碍和下周目标。
- `src/features/review/review-summary.tsx`：复盘展示组件，包含本周统计、近期笔记、历史复盘和 AI 调整建议面板。
- `src/features/review/types.ts`：复盘与调整建议展示数据类型。

## 共享客户端与领域工具

- `src/lib/env.ts`：基于 Zod 的环境变量校验。
- `src/lib/constants.ts`：MVP 共享常量，例如应用名、演示用户、北京时间时区、晚上 8 点提醒时间。
- `src/lib/dates.ts`：共享日期格式化、北京时间当天范围和自然周范围工具。日期逻辑应集中放在这里。
- `src/lib/result.ts`：后续 server action 和 service 可复用的稳定返回类型。
- `src/lib/utils.ts`：小型 UI 工具，目前用于 className 合并。
- `src/hooks/`：预留给跨模块共享 React hooks。
- `src/types/`：只放跨 feature 的共享类型。
- `src/utils/`：预留给不适合放入 `src/lib` 的小型领域工具。

## 服务端边界

- `src/server/ai/provider.ts`：早期 AI provider 模式辅助函数。真实模型调用必须始终封装在 `src/server/ai` 后面。
- `src/server/ai/prompts/generate-roadmap.prompt.ts`：路线图生成 prompt 和版本号 `mock-roadmap-v1`。
- `src/server/ai/prompts/generate-review-adjustment.prompt.ts`：复盘调整建议 prompt 和版本号 `mock-review-adjustment-v1`。
- `src/server/ai/schemas/roadmap-output.schema.ts`：路线图 AI 输出 Zod schema，校验阶段、任务和资源建议。
- `src/server/ai/schemas/review-adjustment-output.schema.ts`：复盘调整建议 AI 输出 Zod schema，要求待确认状态、建议理由、影响范围和结构化变更。
- `src/server/ai/tasks/generate-roadmap.ts`：mock AI 路线图生成 task。根据计划和最近一次测评生成结构化输出。
- `src/server/ai/tasks/generate-review-adjustment.ts`：mock AI 调整建议 task。根据计划和最近周复盘生成待确认调整建议。
- `src/server/auth/`：后续鉴权和 session 边界；MVP 先使用演示用户模式。
- `src/server/db/prisma.ts`：Prisma Client 单例边界，避免开发环境重复创建连接。
- `src/server/repositories/`：直接访问数据库的数据层。
- `src/server/repositories/plan.repository.ts`：学习计划查询和创建入口。`findById` 会带出路线图阶段、每日任务、带适用阶段的资源建议、最近测评、进度日志和笔记记录。
- `src/server/repositories/assessment.repository.ts`：基础测评创建和最近测评查询入口。
- `src/server/repositories/task.repository.ts`：每日任务查询、按日期范围查询、按 ID 查询和状态更新入口。
- `src/server/repositories/note.repository.ts`：笔记创建和查询入口。按计划查询时会带出关联任务标题。
- `src/server/repositories/plan-adjustment.repository.ts`：计划调整建议创建、查询和确认应用入口。确认应用时会在事务内更新计划并创建 `PlanVersion`。
- `src/server/repositories/review.repository.ts`：复盘创建和查询入口。
- `src/server/repositories/resource.repository.ts`：资源建议批量创建、按计划查询、按 ID 查询和状态更新入口。按计划查询时会带出适用阶段。
- `src/server/repositories/progress-log.repository.ts`：进度日志创建、按计划查询、按任务和类型查询入口。
- `src/server/repositories/ai-call-log.repository.ts`：AI 调用日志写入入口。
- `src/server/services/progress.service.ts`：基于任务状态汇总完成率和打卡资格。当前保留给后续独立进度页面或复盘统计复用。
- `src/server/services/dashboard.service.ts`：页面展示数据汇总层。首页、计划列表和计划详情通过它获取整理后的展示数据；当前会整理计划状态、任务、资源、路线图、测评摘要、今日进度、总进度、连续学习天数、今日有效学习提示和笔记列表。资源展示数据包含状态、难度、预计时间和适用阶段；笔记展示数据包含原文内容、创建日期和关联任务标题。
- `src/server/services/plan-creation.service.ts`：阶段 4 计划草稿创建服务。负责生成草稿标题、计算开始/结束日期、写入 `LearningPlan` 和初始 `PlanVersion`。
- `src/server/services/assessment.service.ts`：阶段 5 基础测评服务。负责读取计划、生成 mock 题目、保存完成测评、保存跳过测评。
- `src/server/services/roadmap-generation.service.ts`：阶段 6 路线图生成服务。负责读取计划和最近测评、调用 mock AI task、写入阶段、任务、资源建议和 `AiCallLog`。
- `src/server/services/daily-task.service.ts`：阶段 8 任务状态服务。负责校验演示用户权限、校验状态流转、更新任务状态、写入进度日志并防止重复完成重复计入。
- `src/server/services/resource.service.ts`：阶段 10 资源状态服务。负责校验演示用户权限、校验资源状态白名单、更新资源状态，并保持资源状态和任务完成率隔离。
- `src/server/services/note.service.ts`：阶段 11 笔记服务。负责校验演示用户权限、校验关联任务属于同一个计划，并只保存用户原文 `content`。
- `src/server/services/review.service.ts`：阶段 12 基础复盘服务。负责读取复盘页数据、按北京时间自然周计算完成率、延期/跳过统计、近期笔记和历史复盘，并保存周复盘记录。
- `src/server/services/review-adjustment.service.ts`：阶段 13 调整建议服务。负责基于最近复盘生成待确认 `PlanAdjustment`、记录 mock AI 调用、确认应用后更新计划说明/每日学习时长，并写入新的 `PlanVersion` 快照。

## 数据库

- `prisma/schema.prisma`：MVP 核心数据模型和枚举。
- `prisma/seed.mjs`：本地演示数据 seed。当前会重置 `demo-user` 的演示数据并写入正常中文内容。
- `prisma/migrations/20260704133000_init/migration.sql`：初始迁移 SQL，已修复为无 BOM UTF-8。
- `prisma/migrations/migration_lock.toml`：Prisma migration provider 锁定文件。

本地 PostgreSQL 已验证：

```text
公共 schema 下共有 13 张表
初始迁移 20260704133000_init 已应用
演示数据可正常 seed
```

## 测试

- `tests/setup.ts`：Vitest 初始化配置。
- `tests/unit/env.test.ts`：验证环境变量校验行为。
- `tests/unit/progress-calculations.test.ts`：验证完成率、打卡规则、连续学习天数、进度总览和无任务场景。
- `tests/unit/task-status.test.ts`：验证任务状态流转规则。
- `tests/unit/resource-status.test.tsx`：验证资源状态白名单、资源列表展示、资源状态服务、跨用户拒绝、重复状态不重复写和进度隔离。
- `tests/unit/note-flow.test.tsx`：验证笔记 schema、原文保存、任务关联校验、跨用户拒绝、笔记列表和空状态。
- `tests/unit/review-flow.test.tsx`：验证复盘 schema、周统计计算、复盘保存、跨用户拒绝、复盘摘要、笔记入口和表单渲染。
- `tests/unit/review-adjustment.test.tsx`：验证调整建议输出 schema、mock 生成、schema 失败日志、确认前不生效、确认应用和 UI 展示。
- `tests/unit/`：单元测试目录。
- `tests/integration/`：后续集成测试目录。
- `tests/e2e/`：后续 Playwright 测试目录。

## 文档

- `memory-bank/implementation-plan.md`：分阶段实施任务来源。
- `memory-bank/product-design-document.md`：产品需求和用户流程。
- `memory-bank/tech-stack.md`：技术栈和工程规则。
- `memory-bank/progress.md`：按时间记录开发进度。
- `memory-bank/architecture.md`：当前架构说明。
- `memory-bank/ai-rules.md`：AI 行为和风控规则。
- `memory-bank/database.md`：数据库决策和本地运行说明。
- `memory-bank/api-contracts.md`：API 合约说明。
- `memory-bank/design-system.md`：UI 和设计系统说明。
- `memory-bank/testing.md`：测试策略说明。
- `docs/prompts.md`：prompt 文档占位。
- `docs/deployment.md`：部署文档占位。

## 下一阶段规则

- 阶段 13 已完成；下一阶段是阶段 14：端到端闭环测试。
- 阶段 14 应创建 Playwright 测试，覆盖创建计划、测评/路线图、完成任务、记录笔记、进入复盘与调整建议的核心移动端路径。
- 不要把业务逻辑写进 `src/app/page.tsx` 或 route 文件。
- 数据库访问必须放在 repository 或 service 后面。
- AI 调用必须放在 `src/server/ai` 后面。
- 在用户明确要求真实 API 集成前，继续使用 mock AI 行为。
- 架构或文件职责发生变化时，必须同步更新本文档。
