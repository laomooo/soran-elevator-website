# 🏢 广州索然电梯配件有限公司 官方网站

广州索然电梯配件有限公司（SORAN Elevator Parts）企业官网，采用 Apple 风格设计，包含前台产品展示与后台内容管理系统（CMS），支持移动端响应式访问。

---

## 🚀 技术栈

| 层级 | 技术 |
|------|------|
| **后端** | Node.js + Express |
| **数据库** | SQLite (better-sqlite3) |
| **后台认证** | Cookie-based Session + bcryptjs |
| **文件上传** | Multer |
| **前台设计** | Apple 官网风格，响应式布局 |
| **移动端** | 自适应 + 汉堡菜单 + 触摸优化 |

## 📁 项目结构

```
soran-website/
├── backend/                    # 后端服务
│   ├── server.js               # Express 入口，路由挂载
│   ├── models/
│   │   └── database.js         # SQLite 数据库初始化 + 表结构
│   ├── routes/
│   │   ├── api.js              # 前台公开 API
│   │   ├── admin.js            # 后台管理 API（需登录）
│   │   └── upload.js           # 图片上传接口
│   ├── middleware/              # 中间件目录（预留）
│   ├── utils/
│   │   └── hash.js             # bcryptjs 密码哈希工具
│   ├── public/                 # 静态资源（upload 目录）
│   └── data/                   # SQLite 数据库文件（自动生成）
├── frontend/                   # 前台页面
│   ├── index.html              # 首页（Hero + 轮播 + 精选产品 + CTA）
│   ├── products.html           # 产品列表（分类筛选 + 分页）
│   ├── product-detail.html     # 产品详情（图集 + 规格 + 推荐）
│   ├── about.html              # 关于我们
│   ├── contact.html            # 联系我们（在线留言）
│   ├── css/
│   │   └── style.css           # 前台 Apple 风格样式
│   ├── js/
│   │   └── main.js             # 前台交互逻辑
│   └── images/                 # Logo / Favicon / Banner
├── admin/                      # 后台管理
│   ├── login.html              # 后台登录页
│   ├── index.html              # 后台主界面（SPA：Dashboard + 6 个管理模块）
│   ├── css/
│   │   └── admin.css           # 后台样式
│   └── js/
│       └── admin.js            # 后台业务逻辑
└── package.json
```

## 🎨 品牌色

| 色值 | 用途 |
|------|------|
| `#1B2E5A` | 主色 - 深蓝（Header / Footer / 关键元素） |
| `#3A7BC8` | 强调色 - 亮蓝（按钮 / 链接 / 高亮） |

## 🗄️ 数据库表

| 表 | 说明 |
|----|------|
| `site_config` | 站点配置（公司名、联系方式、关于我们等） |
| `categories` | 产品分类（6 个默认分类） |
| `products` | 产品信息（型号、描述、规格、图片等） |
| `banners` | 首页轮播图 |
| `news` | 新闻动态 |
| `partners` | 合作伙伴 |
| `admins` | 管理员账户 |
| `messages` | 用户留言 |

## 🔧 快速开始

### 安装依赖

```bash
npm install
```

### 启动服务

```bash
npm start        # 生产模式
npm run dev      # 开发模式（自动重启）
```

### 访问地址

- **前台首页**: http://localhost:3000
- **后台管理**: http://localhost:3000/admin

### 默认管理员

| 用户名 | 密码 |
|--------|------|
| `admin` | `soran2024` |

> ⚠️ 首次登录后请立即修改密码

## 🔌 API 接口

### 前台公开 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/config` | 站点配置 |
| GET | `/api/categories` | 产品分类列表 |
| GET | `/api/products` | 产品列表（支持 `?category=1&page=1&limit=12`） |
| GET | `/api/products/featured` | 精选产品 |
| GET | `/api/products/:id` | 产品详情 |
| GET | `/api/banners` | 轮播图 |
| GET | `/api/news` | 新闻列表 |
| GET | `/api/partners` | 合作伙伴 |
| POST | `/api/messages` | 提交留言 |

### 后台管理 API（需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 登录 |
| POST | `/api/admin/logout` | 登出 |
| GET | `/api/admin/stats` | 统计数据 |
| GET/PUT | `/api/admin/config` | 站点配置 |
| CRUD | `/api/admin/categories` | 分类管理 |
| CRUD | `/api/admin/products` | 产品管理 |
| CRUD | `/api/admin/banners` | 轮播管理 |
| CRUD | `/api/admin/news` | 新闻管理 |
| GET/PATCH | `/api/admin/messages` | 留言管理 |
| POST | `/api/admin/upload` | 图片上传 |

## 🖥️ 后台功能模块

后台为单页面（SPA）设计，包含以下模块：

1. **📊 仪表盘** - 产品/分类/留言数量统计
2. **📦 产品管理** - 添加/编辑/删除/上架/下架/精选产品
3. **📁 分类管理** - 产品分类的增删改查
4. **🖼️ 轮播管理** - 首页 Banner 图片管理
5. **📰 新闻动态** - 新闻内容发布与编辑
6. **💬 留言管理** - 查看/标记已处理用户留言
7. **⚙️ 站点设置** - 公司信息、联系方式、SEO 配置

## 📱 移动端适配

- 响应式布局：桌面 / 平板 / 手机全适配
- 汉堡菜单：小屏自动切换
- 触摸优化：大按钮、合理间距
- CSS `clamp()` 弹性字体
- `viewport-fit=cover` 刘海屏适配

---

© 2024 广州索然电梯配件有限公司 | Guangzhou Soran Elevator Parts Co., Ltd.
