# 交接说明

这个项目是移动端优先的 AI 学习计划 MVP。当前已完成到阶段 11：简单笔记。

## 当前进度

- 阶段 1：项目骨架与基础规范，已完成。
- 阶段 2：数据模型与本地 PostgreSQL，已完成。
- 阶段 3：基础页面与移动端导航，已完成。
- 阶段 4：学习目标创建，已完成。
- 阶段 5：基础测评，已完成。
- 阶段 6：mock AI 路线图生成，已完成。
- 阶段 7：路线图展示，已完成。
- 阶段 8：每日任务基础闭环，已完成。
- 阶段 9：进度反馈，已完成。
- 阶段 10：资源建议，已完成。
- 阶段 11：简单笔记，已完成。

下一阶段是阶段 12：基础复盘。请先阅读 `memory-bank/implementation-plan.md`、`memory-bank/progress.md`、`memory-bank/architecture.md` 和当前要修改模块附近的代码与测试。

## 重要规则

- 页面文件只负责路由、布局和组件组合。
- 数据库访问必须经过 repository 或 service。
- AI 调用必须放在 `src/server/ai` 后面。
- 当前仍使用演示用户模式，不做真实登录。
- 当前仍使用 mock AI，不接真实 OpenAI API。
- 资源建议必须保留核验提示。
- 笔记只保存用户原文，不做 AI 摘要、改写、图片、附件或富文本。

## 本地运行

先启动本地 PostgreSQL：

```text
scripts\start-postgres.cmd
```

再启动 Next.js：

```text
scripts\start-dev.cmd
```

访问：

```text
http://127.0.0.1:3000/
```

## 已通过验证

最近一次阶段 11 验证：

```text
npm run typecheck
npm run lint
npm run test:run
npm run build
```

测试结果：

```text
9 个测试文件通过
42 个测试用例通过
```

## 交接包说明

交接包不包含：

- `.env`
- `.git`
- `.next`
- `.tools`
- `node_modules`
- 本机 Node 安装包
- TypeScript 构建缓存

这些内容不是源码交接所必需，且可能包含本机路径、体积过大或敏感信息。
