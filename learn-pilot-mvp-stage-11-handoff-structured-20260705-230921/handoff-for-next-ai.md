# 当前交接入口

当前目录就是应用根目录。目录名称是历史名称，不代表当前开发进度。

请从该目录开始阅读以下文件，然后查看相关代码和测试。

- `memory-bank/implementation-plan.md`
- `memory-bank/progress.md`
- `memory-bank/architecture.md`
- `docs/stage-12-audit.md`

最新源码已经包含阶段 12 基础周复盘与阶段 13 mock AI 调整建议。ZIP 是较早的阶段 11 快照，缺少当前目录中的复盘功能和文档，不应覆盖当前源码。后续计划是阶段 14 端到端测试。本次工作补强阶段 12 的错误反馈、刷新与边界验证。

继续使用演示用户和 mock AI。不要配置真实 OpenAI 模型或密钥。页面只负责路由、布局和组件组合，数据库访问经过 repository/service，AI 调用位于 `src/server/ai`。调整建议只有用户确认后才可生效。笔记保留原文，资源保留核验提示。

## 本地运行和检查

在应用目录运行 `npm ci` 和 `npm run prisma:generate`。复制 `.env.example` 为本地 `.env` 并配置 PostgreSQL，保持 `OPENAI_MODEL=mock` 且 API key 为空。现有 Windows 便携启动脚本为 `scripts/start-postgres.cmd` 和 `scripts/start-dev.cmd`。使用其他系统时请自行启动 PostgreSQL，再运行 `npm run db:deploy` 和 `npm run dev`。`db:seed` 会重置演示数据，只能在独立演示数据库使用。

检查命令为 `npm run typecheck`、`npm run lint`、`npm run test:run`、`npm run build`。数据库和移动端 E2E 的运行结果需要单独确认。
