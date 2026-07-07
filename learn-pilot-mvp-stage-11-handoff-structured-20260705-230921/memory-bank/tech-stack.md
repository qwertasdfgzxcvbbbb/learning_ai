# Tech Stack

## 1. Product Context

本产品是一款移动端优先的 AI 学习计划 App，面向个人学习者，帮助用户把模糊学习目标转化为可执行、可追踪、可复盘的学习计划。

MVP 阶段的核心目标不是做大型教育平台、社区、付费系统或多人协作，而是验证一个闭环：

1. 用户输入学习目标、基础水平、可用时间和偏好。
2. AI 生成阶段化学习路线、每日任务、资源建议和验收标准。
3. 用户执行任务、记录进度、写笔记、完成复盘。
4. AI 根据执行情况给出调整建议，用户确认后再应用。

核心功能包括：

- 学习目标创建
- 基础测评
- AI 学习路线图生成
- 每日学习任务
- 学习资源建议
- 进度追踪与打卡
- 笔记记录与 AI 总结
- 周复盘与计划调整
- 阶段测评与掌握度判断

关键技术挑战：

- AI 输出必须结构化、可编辑、可追溯，不能只生成一段聊天文本。
- 学习计划、任务、资源、笔记、复盘之间有明确数据关系，需要可靠持久化。
- 移动端体验优先，页面必须轻量、快速、适合碎片时间使用。
- AI 调用要放在后端，避免泄露密钥，并便于做成本控制、日志、重试和风控。
- MVP 要避免过度架构，不能为了“看起来高级”引入微服务、复杂消息队列、重型实时系统或 3D 引擎。

## 2. Recommended Stack

| 层级 / 模块 | 推荐技术 | 选择理由 | 替代方案 | 为什么不选替代方案 |
| --- | --- | --- | --- | --- |
| 前端框架 | Next.js + React + TypeScript | 同时支持前端页面、后端 API、服务端逻辑和部署；适合 AI Web App MVP；生态成熟，AI 编码助手生成质量高 | Vue / Nuxt、纯 React + Vite、Flutter、React Native | Flutter / React Native 更适合原生 App 长期路线，但 MVP 会增加开发和发布成本；Vite 需要单独搭后端；Nuxt 生态也成熟但 React/Next 对 AI 应用样板更多 |
| UI 方案 | Tailwind CSS + shadcn/ui | 快速构建现代移动端 UI，组件可复制进项目，易于定制，适合 AI 生成模块化组件 | Material UI、Ant Design、Chakra UI | Ant Design 更偏后台管理；Material UI 风格重；Chakra 维护和生态热度不如 Tailwind + shadcn 组合 |
| 移动端能力 | 响应式 Web + PWA | MVP 阶段成本低，可直接覆盖手机浏览器；后续可加离线缓存、桌面图标、推送能力 | 原生 iOS / Android、React Native、Flutter | 当前 PRD 不需要强原生能力；原生双端或跨端 App 会提高调试、发布和上架成本 |
| 状态管理 | React Server Components + URL state + React Hook Form + TanStack Query；必要时用 Zustand | 大部分数据来自服务端；表单、查询缓存、少量本地 UI 状态分开管理，避免全局状态膨胀 | Redux Toolkit、MobX、Jotai 全局化 | Redux 对 MVP 偏重；所有状态全局化容易让代码变复杂 |
| 路由 | Next.js App Router | 文件路由清晰，支持布局、加载状态、服务端组件和 API Route | React Router | React Router 需要单独后端和部署方案，整体复杂度更高 |
| 后端框架 | Next.js Route Handlers / Server Actions | 前后端同仓库、同语言、部署简单；足够承载 MVP 的 AI 调用、CRUD、鉴权和业务逻辑 | NestJS、Express、FastAPI、Django | NestJS / Django 对当前 MVP 偏重；Express 需要补很多工程规范；FastAPI 需要多语言栈 |
| 数据库 | PostgreSQL | 关系清晰、可靠、可扩展，适合学习计划、任务、笔记、复盘、AI 生成记录等结构化数据 | SQLite、MongoDB、MySQL | SQLite 本地开发方便但线上扩展和并发弱；MongoDB 对强关系数据不如 PostgreSQL；MySQL 也可用但 JSON、全文和托管生态上 PostgreSQL 更适合 |
| ORM / 数据访问层 | Prisma | 类型安全、迁移清晰、AI 生成代码稳定，适合 Next.js + TypeScript | Drizzle、TypeORM、直接 SQL | Drizzle 更轻但对新手规范要求更高；TypeORM 历史包袱较多；直接 SQL 容易散落在业务代码中 |
| 实时通信方案 | MVP 不引入实时通信；需要时先用轮询或 Server-Sent Events | 产品是个人计划工具，不需要多人实时协作；AI 生成状态可用普通请求或轻量进度展示 | WebSocket、Socket.IO、实时数据库 | WebSocket 对当前需求过度设计，会增加连接管理、部署和测试复杂度 |
| 3D / 游戏引擎 | 不引入 | PRD 没有 3D、游戏、多人互动或物理仿真需求 | Three.js、Phaser、Unity WebGL | 会显著增加包体和开发复杂度，不能提升核心学习闭环价值 |
| AI API 集成方案 | 后端统一封装 AI Provider Service，优先使用 OpenAI API 或兼容 OpenAI SDK 的供应商 | 密钥只在服务端；可集中做 prompt 管理、结构化输出、重试、超时、成本记录和模型切换 | 前端直连 AI API、多个页面各自调用模型 | 前端直连会泄露密钥；分散调用会导致 prompt 不一致、成本不可控、难以测试 |
| Prompt 管理 | `src/server/ai/prompts/` + 版本号 + Zod schema 校验 | 学习路线、任务拆解、复盘调整等 prompt 必须可维护、可测试、可回滚 | Prompt 直接写在页面组件里 | 会导致组件臃肿、难复用、难审查，AI 编码助手容易生成巨文件 |
| 结构化输出校验 | Zod | 校验 AI 输出、表单输入、API 响应和环境变量；类型与运行时校验统一 | Yup、手写校验 | Yup 与 TypeScript 联动较弱；手写校验容易遗漏 |
| 文件存储 | MVP 先不做复杂文件上传；如需图片笔记，使用 Supabase Storage 或 S3 兼容存储 | PRD 第一版以文本、链接、资源类型为主；文件能力可后置 | 本地文件系统、Cloudinary | 本地文件系统不适合云部署；Cloudinary 偏图片媒体场景，学习笔记附件不一定需要 |
| 身份认证 | Auth.js 或 Supabase Auth；MVP 可先支持 Email magic link / OAuth | 成熟、简单，适合个人 App；可快速支持用户私有数据 | 自研鉴权、Clerk | 自研鉴权风险高；Clerk 体验好但商业化和成本绑定更强 |
| 测试框架 | Vitest + React Testing Library + Playwright | 单元、组件和端到端测试覆盖关键闭环；生态成熟 | Jest、Cypress | Jest 可用但 Vitest 与现代前端工具更轻；Cypress 偏重浏览器测试，Playwright 多浏览器和移动视口更灵活 |
| 代码质量工具 | ESLint + Prettier + TypeScript strict + lint-staged | 保证基础一致性，降低 AI 生成代码的风格漂移 | 只靠人工 Review | AI 协作项目必须自动化约束格式、类型和基础质量 |
| 部署方案 | Vercel + 托管 PostgreSQL，推荐 Supabase / Neon | Next.js 部署最省心；数据库托管降低运维成本；适合 MVP 快速上线 | AWS ECS、Kubernetes、传统 VPS | 当前阶段不需要容器编排和复杂云架构；VPS 运维成本高 |
| 日志与监控 | Vercel Logs + Sentry；AI 调用另建 `ai_call_logs` 表 | 快速定位前端错误、API 错误和 AI 成本问题 | 自建 ELK / Prometheus | 对 MVP 过重，维护成本大 |
| 环境变量管理 | `.env.local` + `.env.example` + Zod 环境变量校验 | 防止缺失配置导致运行期错误；便于部署和协作 | 直接读取 `process.env` | 容易出现未配置、拼写错误、线上线下不一致 |

推荐结论：

第一版建议使用 `Next.js + TypeScript + Tailwind CSS + shadcn/ui + PostgreSQL + Prisma + Zod + OpenAI API + Vercel`。

这套方案足够简单：一个代码仓库即可覆盖页面、接口、AI 服务、数据访问和部署。

这套方案也足够健壮：数据库是可靠的关系型数据库，AI 调用在后端统一封装，类型和 schema 校验贯穿前后端，后续可以平滑扩展到 PWA、移动端壳、异步任务、资源搜索和多用户数据同步。

## 3. Architecture Overview

整体架构采用模块化单体架构，也就是一个项目、清晰分层、按功能拆模块。MVP 不做微服务。

客户端组织方式：

- `src/app/` 负责页面路由、布局、加载状态和错误边界。
- `src/components/` 负责通用 UI 组件，只放无业务或弱业务组件。
- `src/features/` 按业务功能拆分，例如计划创建、路线图、每日任务、笔记、复盘。
- 每个 feature 内部可以包含自己的组件、hooks、schema、actions 和工具函数。
- 页面文件只负责组合模块，不直接写大量业务逻辑。

服务端组织方式：

- `src/server/` 放服务端业务逻辑。
- `src/server/ai/` 统一封装 AI 调用、prompt、结构化输出和成本记录。
- `src/server/services/` 放业务服务，例如 plan service、task service、review service。
- `src/server/repositories/` 放数据库访问逻辑，页面和组件不能直接调用 Prisma。
- `src/server/auth/` 放认证、session、权限检查。

数据流：

1. 用户在前端填写学习目标表单。
2. 表单数据通过 Zod 校验。
3. 前端调用服务端 action 或 API route。
4. 服务端再次校验输入，保存目标草稿。
5. 服务端调用 AI Provider Service，使用版本化 prompt 生成结构化路线图。
6. AI 输出通过 Zod schema 校验。
7. 校验通过后写入 PostgreSQL，包括计划、阶段、任务、资源建议和 AI 调用日志。
8. 前端展示路线图，用户可编辑、确认或重新生成。
9. 后续每日任务、打卡、笔记、复盘都基于数据库状态流转。

AI 能力接入方式：

- 所有 AI 调用必须经过 `src/server/ai/provider.ts` 或同等封装。
- 每类 AI 能力必须有独立文件，例如：
  - `generate-learning-plan.ts`
  - `generate-daily-tasks.ts`
  - `summarize-note.ts`
  - `generate-review-suggestion.ts`
  - `evaluate-mastery.ts`
- 每个 AI 能力必须包含输入 schema、输出 schema、prompt 版本和错误处理。
- AI 建议默认是“待确认”状态，不能自动覆盖用户已有计划。

哪些逻辑放前端：

- 表单交互
- 页面展示
- 本地 UI 状态
- 移动端布局
- 用户确认、编辑、筛选、展开折叠
- 乐观 UI，可用于任务完成状态，但必须能回滚

哪些逻辑放后端：

- AI API 调用
- Prompt 拼装
- 成本记录
- 数据库写入
- 权限校验
- 计划重排
- 任务状态流转
- 资源建议去重和风险提示
- 用户私有数据访问

必须独立成文件的模块：

- 数据模型与 schema
- 数据库访问层
- AI prompt
- AI 输出 schema
- 业务服务
- 页面组件
- 表单组件
- 图表组件
- hooks
- 测试用例

禁止把页面、表单、AI 调用、数据库操作、业务规则和 UI 组件全部写进同一个文件。

## 4. Recommended Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
    plans/
      page.tsx
      new/
        page.tsx
      [planId]/
        page.tsx
        roadmap/
          page.tsx
        tasks/
          page.tsx
        review/
          page.tsx
    api/
      ai/
        generate-plan/
          route.ts
      health/
        route.ts

  components/
    ui/
    layout/
    feedback/
    charts/

  features/
    plan-creation/
      components/
      hooks/
      schemas/
      actions.ts
      types.ts
    assessment/
      components/
      schemas/
      scoring.ts
      types.ts
    roadmap/
      components/
      schemas/
      types.ts
    daily-tasks/
      components/
      hooks/
      schemas/
      types.ts
    resources/
      components/
      schemas/
      types.ts
    notes/
      components/
      schemas/
      types.ts
    review/
      components/
      schemas/
      types.ts
    progress/
      components/
      calculations.ts
      types.ts

  hooks/
    use-mobile.ts
    use-toast.ts

  lib/
    env.ts
    dates.ts
    result.ts
    constants.ts

  server/
    ai/
      provider.ts
      prompts/
        generate-learning-plan.prompt.ts
        generate-daily-tasks.prompt.ts
        summarize-note.prompt.ts
        generate-review-suggestion.prompt.ts
        evaluate-mastery.prompt.ts
      schemas/
        learning-plan-output.schema.ts
        daily-tasks-output.schema.ts
        review-output.schema.ts
      tasks/
        generate-learning-plan.ts
        generate-daily-tasks.ts
        summarize-note.ts
        generate-review-suggestion.ts
        evaluate-mastery.ts
    auth/
      config.ts
      require-user.ts
    db/
      prisma.ts
    repositories/
      plan.repository.ts
      task.repository.ts
      note.repository.ts
      review.repository.ts
      ai-call-log.repository.ts
    services/
      plan.service.ts
      task.service.ts
      note.service.ts
      review.service.ts
      progress.service.ts
      resource.service.ts

  types/
    common.ts
    domain.ts

  utils/
    formatters.ts
    validators.ts

  tests/
    unit/
    integration/
    e2e/

prisma/
  schema.prisma
  migrations/
  seed.ts

memory-bank/
  @architecture.md
  @product.md
  @ai-rules.md
  @database.md
  @api-contracts.md
  @design-system.md
  @testing.md

docs/
  tech-stack.md
  prompts.md
  deployment.md

.env.example
package.json
tsconfig.json
next.config.ts
eslint.config.mjs
prettier.config.js
```

目录原则：

- `src/app/` 只做路由和页面组合。
- `src/features/` 按业务能力拆分，不按技术层硬塞所有组件。
- `src/server/` 只放服务端代码，前端组件不能导入这里的数据库或 AI 模块。
- `src/server/ai/prompts/` 存 prompt，不允许散落在页面中。
- `src/server/repositories/` 是唯一直接访问数据库的业务层。
- `memory-bank/` 存长期项目约定，AI 编码助手写代码前必须阅读。

## 5. Data Model Direction

MVP 推荐核心实体：

| 实体 | 说明 |
| --- | --- |
| User | 用户账号与认证信息 |
| LearningPlan | 一个学习计划，例如“30 天入门 AI 产品经理” |
| Assessment | 基础测评记录 |
| RoadmapStage | 路线图阶段 |
| DailyTask | 每日任务 |
| ResourceRecommendation | 资源建议，不直接承诺真实资源质量 |
| ProgressLog | 任务完成、学习时长、打卡记录 |
| Note | 学习笔记 |
| Review | 周复盘或阶段复盘 |
| PlanAdjustment | AI 生成的调整建议，用户确认后生效 |
| MasteryEvaluation | 阶段掌握度判断 |
| AiCallLog | AI 调用日志、模型、token、成本、状态、错误信息 |

数据建模原则：

- AI 生成内容必须可追踪来源，保留 prompt version、模型名和生成时间。
- AI 调整建议必须先保存为建议，不直接覆盖原计划。
- 用户编辑后的内容要与 AI 原始建议区分。
- 任务状态使用枚举，例如 `todo`、`in_progress`、`done`、`skipped`、`delayed`。
- 资源建议必须包含类型、推荐理由、难度、适用阶段和核验提示。

## 6. AI Integration Strategy

AI 能力应该产品化，而不是聊天框化。

推荐 AI 模块：

- 目标结构化：把用户自然语言目标转为结构化字段。
- 基础测评解释：根据自评和题目结果判断基础水平。
- 路线图生成：生成阶段、目标、任务、产出和验收方式。
- 每日任务拆解：根据路线图和可用时间生成具体任务。
- 资源建议：优先输出资源类型、筛选规则、关键词和核验提示，避免编造具体链接。
- 笔记总结：保留原文，生成摘要、知识点、问题和下一步行动。
- 周复盘调整：根据完成率、反馈和延误情况给出调整建议。
- 掌握度判断：结合测试、产出、笔记和完成情况给出建议性判断。

AI 风控规则：

- 不承诺绝对学习效果。
- 不编造不存在的课程、论文、链接或网站。
- 不把 AI 输出当作唯一正确答案。
- 对考试、政策、学术、医学、法律等时效性或高风险内容，必须提示用户核验。
- 所有 AI 调整建议默认待确认。
- AI 输出必须通过 schema 校验，失败时给出可恢复错误。

## 7. Deployment Plan

MVP 推荐部署：

- Web 应用：Vercel
- 数据库：Supabase Postgres 或 Neon Postgres
- 文件存储：暂不启用；需要时使用 Supabase Storage
- 错误监控：Sentry
- 日志：Vercel Logs + 数据库中的 `AiCallLog`
- 域名：自定义域名接入 Vercel

环境变量示例：

```text
DATABASE_URL=
DIRECT_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
OPENAI_API_KEY=
OPENAI_MODEL=
SENTRY_DSN=
```

所有环境变量必须在 `src/lib/env.ts` 中用 Zod 校验。

## 8. Testing Strategy

测试优先级：

1. Zod schema 测试：确保 AI 输出、表单输入和 API 响应结构稳定。
2. 业务服务测试：计划生成、任务状态流转、复盘调整、进度计算。
3. 组件测试：关键表单、任务列表、路线图展示、复盘确认。
4. E2E 测试：从创建计划到生成路线图，再到完成任务和查看进度。
5. AI mock 测试：测试 AI 输出异常、字段缺失、超时、拒绝服务等情况。

最低测试要求：

- 每个 service 至少有单元测试。
- 每个 AI task 至少测试成功输出和 schema 失败两种情况。
- 核心用户路径必须有 Playwright 测试。
- 修复 bug 时必须补充对应测试，除非明确说明无法测试的原因。

## 9. AI Coding Rules

### 9.1 Always Rules

这些规则必须始终遵守。

1. 写代码前必须先阅读以下文件：
   - `AI学习计划App_PRD.md`
   - `tech-stack.md`
   - `memory-bank/@architecture.md`，如果存在
   - `memory-bank/@product.md`，如果存在
   - `memory-bank/@ai-rules.md`，如果存在
   - 当前要修改模块附近的 README、schema、types、tests

2. 在实现任何功能前，必须先确认该功能属于哪个 feature 模块。不得把业务逻辑直接堆进页面文件。

3. 禁止生成单体巨文件。单个业务文件超过 250 行时，必须优先拆分；单个 React 组件超过 180 行时，必须拆分子组件、hooks 或工具函数。

4. 页面文件只负责路由、布局和组合组件。复杂表单、业务规则、AI 调用、数据库访问不得直接写在 `page.tsx` 中。

5. 前端组件不得直接访问数据库、AI SDK、密钥或服务端环境变量。

6. 所有数据库访问必须经过 repository 或 service 层，不得在页面、组件或 API route 中散写 Prisma 查询。

7. 所有 AI 调用必须经过 `src/server/ai/` 的统一封装，不得在组件、页面或普通业务文件中直接调用模型 SDK。

8. 每个 AI 输出必须定义 Zod schema，并在写入数据库前校验。

9. Prompt 必须独立成文件，并带有明确用途和版本标识，不得写死在 UI 组件中。

10. AI 生成的计划调整必须先保存为待确认建议，用户确认后才能修改原计划。

11. 所有用户输入必须做服务端校验。前端校验只用于体验，不能替代服务端校验。

12. 所有新增代码必须使用 TypeScript 类型，不允许使用 `any` 逃避类型问题。确实需要时必须用注释说明原因。

13. 新增功能必须遵守现有目录结构、命名风格和组件风格。

14. 不得引入新的大型依赖，除非能说明它解决了当前项目的真实问题，并且没有更轻的现有方案。

15. 不得引入微服务、消息队列、WebSocket、3D 引擎、复杂状态管理库，除非 PRD 或后续需求明确要求。

16. 任何涉及密钥、token、API key 的逻辑必须只存在服务端，且不得提交真实密钥。

17. 每次新增环境变量必须同步更新 `.env.example` 和环境变量校验文件。

18. 任何数据模型变更必须同步更新 Prisma schema、迁移、相关类型、service 和测试。

19. 每个模块必须职责单一，命名清晰。不能创建 `utils.ts` 后不断塞入不相关函数。

20. 完成代码后必须运行相关类型检查、lint 或测试；如果无法运行，必须说明原因。

### 9.2 General Rules

这些规则在大多数场景下应遵守。

1. 优先实现最小可用闭环，再扩展边缘能力。

2. 优先使用服务端组件获取只读数据，交互组件再使用客户端组件。

3. 表单统一使用 React Hook Form + Zod resolver。

4. 服务端函数返回稳定结构，例如：

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

5. 所有日期处理集中在 `src/lib/dates.ts`，避免到处手写日期逻辑。

6. 进度计算、完成率、连续打卡等逻辑必须独立成纯函数，便于测试。

7. UI 组件应优先组合已有组件，不要重复造按钮、输入框、弹窗和卡片。

8. 移动端优先设计，关键页面必须在窄屏下可用。

9. 资源推荐要强调“类型、筛选规则、核验提示”，不要虚构具体链接。

10. 错误提示要面向用户解释下一步行动，不暴露内部堆栈。

11. 空状态、加载状态、错误状态必须和正常状态一起考虑。

12. 业务枚举应集中定义，避免散落字符串。

13. API route 应薄，复杂逻辑放到 service。

14. 测试优先覆盖业务规则和 AI schema，而不是追求无意义快照测试。

15. 对 AI mock 数据要放在测试夹具中，不要混进生产代码。

16. 如果发现 PRD、技术栈文档和现有代码冲突，应先说明冲突，再选择最小改动方案。

17. 删除或重构已有代码前，必须确认它没有被其他模块引用。

18. 命名应反映业务含义，例如 `LearningPlan`、`RoadmapStage`、`DailyTask`，不要使用含糊的 `Item`、`Data`、`Manager`。

19. 注释只解释复杂业务原因，不解释显而易见的代码。

20. 每个功能完成后，应补充或更新对应文档，尤其是架构、数据模型、AI prompt 或 API contract 发生变化时。

## 10. Monolith Prevention Rules

为了避免 AI 编码助手生成难以维护的单体巨文件，必须遵守以下限制：

| 对象 | 建议上限 | 超过时处理方式 |
| --- | --- | --- |
| 单个 React 组件 | 180 行 | 拆分展示组件、表单组件、列表项组件、状态组件 |
| 单个业务服务文件 | 250 行 | 按 use case 拆分 service 或提取纯函数 |
| 单个工具文件 | 150 行 | 按领域拆分，例如 dates、formatters、validators |
| 单个 prompt 文件 | 200 行 | 拆分系统规则、输出格式、示例 |
| 单个测试文件 | 250 行 | 按场景拆分 |
| 单个 API route | 80 行 | 把业务逻辑移入 service |

拆分优先级：

1. 先按业务能力拆分。
2. 再按 UI 展示、状态管理、数据转换拆分。
3. 最后才抽通用工具。

禁止模式：

- `components/App.tsx` 包含整个产品。
- `page.tsx` 同时包含表单、API 调用、AI prompt、数据库查询和所有 UI。
- `utils.ts` 存放所有无关函数。
- `ai.ts` 存放所有 prompt 和所有模型调用。
- `types.ts` 存放全项目所有类型。
- `service.ts` 处理所有业务模块。

推荐模式：

- 一个页面组合多个 feature。
- 一个 feature 自己维护组件、schema、types 和 actions。
- 一个 service 只处理一个业务领域。
- 一个 AI task 只处理一种模型能力。
- 一个 prompt 文件只服务一个明确任务。

## 11. Trade-Off Summary

为什么不选原生 App：

- PRD 虽然移动端优先，但 MVP 目标是验证学习计划闭环，不是验证原生能力。
- 响应式 Web + PWA 更快、更便宜、更容易迭代。
- 后续如果验证成功，可以复用 API 和业务逻辑，再做 React Native 或 Flutter。

为什么不选微服务：

- 当前没有高并发、多团队、强隔离或独立扩缩容需求。
- 微服务会引入服务治理、部署、日志、鉴权和数据一致性成本。
- 模块化单体更适合个人项目和 4 周 MVP。

为什么不选 WebSocket：

- 产品没有多人协作或实时对战场景。
- AI 生成进度可以用请求状态、轮询或 SSE 解决。
- WebSocket 会增加部署和连接稳定性复杂度。

为什么不选 3D / 游戏引擎：

- PRD 没有 3D 学习空间、游戏化战斗或互动地图需求。
- 学习路线图可以用普通 UI 和图表表达。
- 3D 会增加包体、性能和开发成本。

为什么选择 PostgreSQL：

- 学习计划数据具有强关系结构。
- 后续可以支持统计、搜索、JSON 字段、审计日志和用户数据隔离。
- 托管 PostgreSQL 成熟稳定，适合 MVP 到早期产品。

为什么选择 Next.js：

- 前后端一体，减少项目数量。
- 对 AI 应用、表单、API、服务端渲染和部署都友好。
- 适合 AI 编码助手生成小模块，而不是在多仓库之间跳转。

## 12. MVP Technical Scope

第一版应该做：

- 响应式 Web App
- 用户登录
- 创建学习计划
- 基础测评
- AI 路线图生成
- 每日任务
- 资源建议
- 进度记录
- 笔记
- 周复盘
- AI 调整建议
- 基础日志和错误监控

第一版不应该做：

- 付费订阅
- 社区
- 好友排名
- 多人协作
- 复杂后台管理
- 全网资源爬取
- 自动校验所有外部资源真实性
- 原生 App 上架
- 3D 场景
- WebSocket 实时协作
- 微服务
- Kubernetes

## 13. Final Recommendation

本项目最合适的第一版技术路线是：

```text
Next.js + React + TypeScript
Tailwind CSS + shadcn/ui
PostgreSQL + Prisma
Zod
OpenAI API through server-side AI service
Auth.js or Supabase Auth
Vitest + React Testing Library + Playwright
Vercel + Supabase/Neon + Sentry
```

这是一套“简单但健壮”的技术栈：开发成本低，部署路径短，AI 编码助手容易遵守结构，后续扩展空间足够，同时不会在 MVP 阶段背上重型架构负担。
