# 良缘答谢宴请柬

一个手机优先的良缘答谢宴 H5 请柬项目，包含：

- `/admin`：手机后台，录入宾客并生成专属链接
- `/i/[code]`：宾客专属 H5 动画请柬
- 本地 JSON 存储 fallback
- Vercel/Neon 数据库接入

## 本地开发

```bash
npm install
npm run dev
```

访问：

- 示例请柬：http://localhost:3000/i/demo
- 后台：http://localhost:3000/admin

本地默认后台密码是 `admin123`。生产环境不会使用默认密码，上线前必须在 Vercel 环境变量里设置 `ADMIN_PASSWORD`。

## 数据存储

本地没有配置 `DATABASE_URL` 时，项目会自动使用 `data/guests.json`。

部署到 Vercel 后，必须在 Vercel Marketplace 添加 Neon 数据库，并配置：

```bash
DATABASE_URL=...
ADMIN_PASSWORD=...
```

应用首次访问数据库时会自动创建 `guests` 表。生产环境没有 `DATABASE_URL` 时不会使用本地 JSON 文件，因为 Vercel 函数文件系统不能持久写入。

## 婚宴信息

婚宴时间、地点、新人姓名等内容在 [lib/wedding-config.ts](./lib/wedding-config.ts) 中修改。

## 验证

```bash
npm run lint
npm run build
```
