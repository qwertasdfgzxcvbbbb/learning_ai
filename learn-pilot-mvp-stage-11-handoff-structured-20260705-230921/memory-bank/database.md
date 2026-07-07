# 数据库说明

## 当前状态

阶段 2 已建立 Prisma 数据模型、初始迁移 SQL、repository 层和 seed 脚本，并已经用本地 PostgreSQL 完成真实迁移验证。

MVP 开发先使用本地 PostgreSQL。后续如果要上线，可以再迁移到托管 PostgreSQL，例如 Supabase、Neon、Railway 或云厂商数据库。

## 本地 PostgreSQL

本机没有使用系统级 PostgreSQL 安装包，而是在项目目录内放了便携版 PostgreSQL：

```text
D:\vibe coding\.tools\postgres-17.6\pgsql
```

数据目录：

```text
D:\vibe coding\.tools\postgres-data
```

`.tools/` 已被 git 忽略，不会进入代码仓库。

### 连接信息

本地 `.env` 使用：

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/learn_pilot_mvp?schema=public
```

需要存在数据库：

```text
learn_pilot_mvp
```

### 启动方式

因为这是便携版 PostgreSQL，不是系统服务，所以开发前需要先启动数据库。

推荐直接运行：

```text
scripts\start-postgres.cmd
```

这个窗口保持打开时，数据库就是运行状态。关闭窗口或按 `Ctrl+C` 会停止数据库。

也可以在 PowerShell 里手动运行：

```powershell
$pgBin = "D:\vibe coding\.tools\postgres-17.6\pgsql\bin"
& "$pgBin\postgres.exe" -D "D:\vibe coding\.tools\postgres-data" -p 5432
```

## 迁移与 seed

初始迁移 SQL：

```text
prisma/migrations/20260704133000_init/migration.sql
```

seed 脚本：

```text
prisma/seed.mjs
```

数据库启动后运行：

```text
scripts\migrate-and-seed.cmd
```

也可以在 PowerShell 里手动运行：

```powershell
$nodeDir = "D:\vibe coding\.tools\node-v22.23.1-win-x64-install\node-v22.23.1-win-x64"
& "$nodeDir\npm.cmd" run db:migrate
& "$nodeDir\npm.cmd" run db:seed
```

本次已成功验证：

```text
公共 schema 下共有 13 张表
初始迁移 20260704133000_init 已应用
演示数据：1 个用户、1 个学习计划、2 个每日任务
```

2026-07-06 已在当前工作区重新安装便携版 PostgreSQL 17.6：

```text
程序目录：D:\vibe coding\.tools\postgres-17.6\pgsql
数据目录：D:\vibe coding\.tools\postgres-data
数据库：learn_pilot_mvp
```

已完成 `initdb`、`prisma migrate dev` 和 `prisma db seed`。项目脚本已调整为优先查找项目内 `.tools`，不存在时使用工作区共享 `D:\vibe coding\.tools`。

## 核心模型

- `User`：演示用户和后续真实用户账号。
- `LearningPlan`：学习计划主记录。
- `Assessment`：基础测评记录，支持 AI/mock AI 生成题目、答案和结果等级。
- `RoadmapStage`：路线图阶段。
- `DailyTask`：每日任务。
- `ResourceRecommendation`：资源建议，包含核验提示。
- `ProgressLog`：任务完成、延期、跳过、打卡和学习时长记录。
- `Note`：用户原文笔记；MVP 不做 AI 摘要。
- `Review`：周复盘或阶段复盘。
- `PlanAdjustment`：AI 调整建议，默认待确认。
- `PlanVersion`：计划快照，用于对比原计划和调整后计划。
- `AiCallLog`：AI 调用日志；早期 mock AI 也应记录。

## 访问规则

- Prisma Client 单例只放在 `src/server/db/prisma.ts`。
- 数据库读写入口放在 `src/server/repositories/`。
- 页面、通用组件、feature UI 不得直接访问 Prisma。
- 复杂业务流程应放到 `src/server/services/`。
