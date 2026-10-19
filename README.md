<div align="center">

# 🌐 Web Dev Agency

**商业接单官网 · 网站定制开发服务平台**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-sql.js-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sql.js.org)

</div>

---

## 📖 项目简介

一个完整的**网站定制开发服务接单平台**：用户可以浏览开发套餐、在线下单、查看订单进度；管理员可以在后台管理套餐与订单。前后端一体，开箱即跑。

## ✨ 功能特性

| 模块 | 功能 |
|------|------|
| 🏠 首页 | 服务介绍、套餐推荐、案例展示 |
| 📦 套餐 | 分类筛选、套餐详情、价格与原价对比 |
| 🛒 下单 | 选择套餐、填写联系方式与需求、生成订单号 |
| 👤 会员 | 注册 / 登录、个人中心、我的订单、进度追踪 |
| 💬 登录 | 账号密码登录 + 微信扫码登录（演示模式） |
| 🛠 管理后台 | 管理员登录、套餐管理、订单管理、状态流转 |

## 🧱 技术栈

- **后端**：Node.js · Express 4 · express-session
- **数据库**：SQLite（`sql.js`，纯 JS 实现，无需安装数据库服务）
- **上传/工具**：multer · uuid
- **前端**：原生 HTML / CSS / JavaScript（无框架，轻量）

## 🚀 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 启动服务
npm start
```

启动后访问：

| 页面 | 地址 |
|------|------|
| 网站首页 | http://localhost:3001 |
| 管理后台 | http://localhost:3001/admin |

> 管理员演示账号：`admin` / `admin123`

数据库会在首次启动时自动创建于 `data/agency.db`，并写入默认套餐数据。

## 📁 目录结构

```text
web-dev-agency/
├── server.js              # 服务入口与路由挂载
├── database.js            # sql.js 初始化、建表与套餐种子数据
├── routes/
│   ├── auth.js            # 注册 / 登录 / 微信扫码（演示）
│   ├── packages.js        # 套餐列表与详情
│   ├── orders.js          # 创建订单 / 查询订单 / 进度
│   └── admin.js           # 管理后台接口
├── public/
│   ├── index.html         # 单页应用入口
│   ├── css/style.css      # 页面样式
│   └── js/                # api.js / app.js 前端逻辑
├── data/                  # 运行时数据库（自动生成，不提交）
└── package.json
```

## 🔌 API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET  | `/api/auth/wx/qrcode` | 获取微信登录二维码（演示） |
| GET  | `/api/packages` | 套餐列表（支持 `?category=`） |
| POST | `/api/orders/create` | 创建订单 |
| GET  | `/api/orders/my` | 我的订单 |
| POST | `/api/admin/login` | 管理员登录 |
| GET  | `/api/admin/packages` | 套餐管理 |
| GET  | `/api/admin/orders` | 订单管理 |

## ⚠️ 说明

- 本项目为**学习与演示用途**，管理员账号、Session 密钥等为演示默认值。
- 如需部署到公网，请先修改管理员密码与 `session.secret`，并接入正式的支付与微信登录。
- `data/` 下的数据库为运行时数据，已加入 `.gitignore`。

---

<div align="center">

**以网络为底座，以代码为信号。** 🌐

</div>
