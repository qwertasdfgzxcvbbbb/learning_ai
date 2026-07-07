# 手机 App 使用方式

这个项目已经配置为 PWA，可以像 App 一样安装到手机桌面。

## 推荐方式

把项目部署到支持 HTTPS 的服务器或平台，然后用手机浏览器打开部署地址。

- Android Chrome：打开网址后，点菜单里的“安装应用”或“添加到主屏幕”。
- iPhone Safari：打开网址后，点分享按钮，再点“添加到主屏幕”。

## 局域网预览

如果只想先在手机浏览器里测试，可以让电脑和手机连接同一个 Wi-Fi，然后在电脑项目目录运行：

```bash
npm run build
npm run start:mobile
```

再在手机浏览器打开：

```text
http://你的电脑局域网IP:3000
```

局域网 HTTP 地址适合预览，但完整 PWA 安装和 service worker 通常需要 HTTPS。

## 注意

这个应用仍然依赖 Next.js 服务端和 Prisma/Postgres 数据库。手机上安装的是 App 外壳和前端入口，数据处理仍需要服务器和数据库正常运行。
