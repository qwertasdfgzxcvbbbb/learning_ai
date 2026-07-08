# Vercel 部署步骤

这个项目是 Next.js + Prisma + PostgreSQL，不是纯静态页面。部署时需要一个 Vercel 项目和一个 PostgreSQL 数据库。

## 1. 导入 GitHub 仓库

在 Vercel 新建项目，选择 GitHub 仓库：

```text
qwertasdfgzxcvbbbb/learning_ai
```

导入时把 Root Directory 设置为：

```text
learn-pilot-mvp-stage-11-handoff-structured-20260705-230921
```

项目内的 `vercel.json` 已经指定：

```text
Build Command: npm run vercel-build
Install Command: npm ci
Framework: Next.js
```

## 2. 创建 PostgreSQL 数据库

在 Vercel 项目里添加一个 PostgreSQL 数据库集成，比如 Neon/Postgres。然后在项目环境变量里配置：

```text
DATABASE_URL=你的 pooled PostgreSQL 连接串
DIRECT_URL=你的 direct PostgreSQL 连接串
NEXTAUTH_SECRET=一串随机密钥
NEXTAUTH_URL=https://你的-vercel-域名
OPENAI_MODEL=mock
OPENAI_API_KEY=
SENTRY_DSN=
```

如果数据库服务只给了一个连接串，先把 `DATABASE_URL` 和 `DIRECT_URL` 都填成同一个值也可以。正式生产环境更推荐 `DATABASE_URL` 用 pooled 连接，`DIRECT_URL` 用 direct 连接。

## 3. 首次部署

保存环境变量后点击 Deploy。构建命令会自动执行：

```bash
prisma generate
prisma migrate deploy
next build
```

迁移完成后，数据库表会自动创建。

## 4. Web 访问

部署成功后，用电脑或手机浏览器打开 Vercel 给你的 HTTPS 地址即可使用。

这个项目现在按普通 Web 模式运行，不再启用 PWA 安装和 service worker 缓存。

## 5. 常见问题

如果页面显示服务不可用，优先检查 Vercel 的 Environment Variables 里 `DATABASE_URL` 和 `DIRECT_URL` 是否配置正确。

如果创建计划失败，通常是数据库迁移没有成功，查看 Vercel Deployment Logs 里是否有 `prisma migrate deploy` 的报错。
