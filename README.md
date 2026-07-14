# 广州索然电梯配件有限公司官网

基于 Next.js + Supabase + GitHub Pages 的企业官网，前台展示产品 / 新闻 / 解决方案等内容，后台可在 `/admin` 直接编辑管理。

## 技术栈

- **前端**：Next.js 14（App Router，静态导出）+ Tailwind CSS，移动优先响应式
- **后端 / 数据库**：Supabase（PostgreSQL + Auth + Storage + RLS）
- **部署**：GitHub Pages + GitHub Actions（推送 main 自动构建部署）

## 功能

### 前台
- 首页（Hero、核心数据、产品入口、解决方案、服务优势、明星产品、新闻、CTA）
- 关于我们（公司简介、发展历程、主营业务）
- 产品中心（分类筛选、产品详情含技术参数表）
- 解决方案（电梯空调安装、升级改造）
- 新闻动态（列表 + 详情）
- 联系我们（联系方式 + 在线留言表单）

### 后台 `/admin`
- 登录鉴权（Supabase Auth）
- 仪表盘（数据统计）
- 分类管理（增删改查、上传分类图片）
- 产品管理（增删改查、多图上传、技术参数编辑）
- 新闻管理（增删改查、封面图上传、草稿/发布切换）
- 主营业务管理（增删改查、业务图片上传）
- 留言管理（查看详情、状态流转）
- 公司信息与站点设置编辑（首屏文案、联系方式等）

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入 Supabase 地址与 anon key

# 3. 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

> 未配置 Supabase 时，前台仍可正常展示（使用内置兜底数据）；后台管理与留言提交需配置真实 Supabase。

## Supabase 配置

1. 在 [supabase.com](https://supabase.com) 创建项目。
2. 进入 SQL Editor，执行 `supabase/schema.sql`（建表 + 预置数据 + RLS 策略 + Storage bucket）。
3. 进入 Authentication > Users，创建管理员账号（邮箱 + 密码）。
4. 进入 Project Settings > API，复制 `Project URL` 与 `anon public key`，填入 `.env.local`：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 部署到 GitHub Pages

1. 在 GitHub 创建仓库并推送代码。
2. 仓库 Settings > Pages > Source 选择 **GitHub Actions**。
3. 仓库 Settings > Secrets and variables > Actions：
   - Secrets 中添加 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Variables 中添加 `NEXT_PUBLIC_BASE_PATH`（若部署到 `https://<user>.github.io/<repo>`，设为 `/<repo>`；若为 `<user>.github.io` 根域名则留空）
4. 推送 `main` 分支，GitHub Actions 自动构建并部署。

## 内容更新

- **后台编辑**：访问 `/admin` 登录后直接编辑产品、新闻、公司信息，数据实时保存在 Supabase。
- **前台静态页更新**：后台修改内容后，前台静态页面在下次 GitHub Actions 构建后同步更新（可手动触发 workflow）。

## 目录结构

```
soran-website/
├── .github/workflows/deploy.yml   # GitHub Actions 部署
├── supabase/
│   ├── schema.sql                 # 数据库初始化脚本
│   ├── migration-add-category-image.sql
│   └── migration-add-business-services.sql
├── public/                        # 静态资源
├── scripts/                       # 测试脚本
├── src/
│   ├── app/
│   │   ├── layout.jsx             # 根布局
│   │   ├── globals.css            # 全局样式
│   │   ├── (site)/                # 前台路由组（含导航页脚）
│   │   │   ├── layout.jsx
│   │   │   ├── page.jsx           # 首页
│   │   │   ├── about/ products/ solutions/ news/ contact/
│   │   └── admin/                 # 后台管理（独立布局）
│   │       ├── layout.jsx         # 鉴权 + 侧边栏
│   │       ├── page.jsx           # 仪表盘
│   │       ├── categories/        # 分类管理
│   │       ├── products/          # 产品管理
│   │       ├── news/              # 新闻管理
│   │       ├── services/          # 主营业务管理
│   │       ├── inquiries/         # 留言管理
│   │       └── company/           # 公司信息
│   ├── components/                # Navbar、Footer、ImageUpload、AnimatedSection 等
│   └── lib/
│       ├── supabase.js            # Supabase 客户端
│       ├── data.js                # 服务端数据获取（含兜底数据）
│       └── client-data.js         # 客户端数据获取（解决 SSG 不同步）
├── next.config.js                 # 静态导出配置
├── tailwind.config.js             # 品牌色与断点
└── package.json
```

## 品牌信息

- 公司：广州索然电梯配件有限公司（SORAN）
- 口号：科技绿色，服务生活
- 热线：020-84040443 / 18899735905
- 邮箱：guangzhousoran@163.com
