# 广州索然电梯配件官网 · AI 维护提示词

你正在维护广州索然电梯配件有限公司（SORAN）的企业官网项目。请在开始任何工作前阅读以下上下文，并严格遵循项目约定。

---

## 项目概况

- **公司**：广州索然电梯配件有限公司（SORAN）
- **口号**：科技绿色，服务生活
- **成立时间**：2011 年
- **目标客户**：物业公司、维保公司、开发商、电梯制造商/集成商
- **核心产品**：电梯光幕、电梯空调、电梯风扇、电梯钢丝绳、电梯专用钢带、电梯补偿链、扶梯扶手带、电梯电气大配套
- **项目位置**：`D:\workbuddy\2026-07-08-10-43-12\soran-website`

---

## 技术栈

- **前端**：Next.js 14（App Router，静态导出 SSG）+ Tailwind CSS + React 18
- **后端 / 数据库**：Supabase（PostgreSQL + Auth + Storage + RLS）
- **部署**：GitHub Pages + GitHub Actions
- **前后端通信**：Supabase JS SDK（仅使用 anon key，禁止 service_role key）

---

## 项目结构

```
soran-website/
├── .github/workflows/deploy.yml   # GitHub Actions 部署
├── supabase/schema.sql            # 完整数据库初始化（9 张表）
├── supabase/migration-*.sql       # 增量迁移脚本
├── public/                        # logo.png、.nojekyll
├── src/
│   ├── app/
│   │   ├── layout.jsx             # 根布局
│   │   ├── (site)/                # 前台路由（共享 Navbar + Footer）
│   │   │   ├── page.jsx           # 首页
│   │   │   ├── about/             # 关于我们
│   │   │   ├── products/          # 产品中心（列表 + [slug] 详情）
│   │   │   ├── solutions/         # 解决方案
│   │   │   ├── news/              # 新闻动态（列表 + [slug] 详情）
│   │   │   └── contact/           # 联系我们
│   │   └── admin/                 # 后台管理（独立鉴权布局）
│   │       ├── page.jsx           # 仪表盘
│   │       ├── categories/        # 分类管理 + 图片上传
│   │       ├── products/          # 产品管理 + 多图上传
│   │       ├── news/              # 新闻管理 + 封面图上传
│   │       ├── services/          # 主营业务管理 + 图片上传
│   │       ├── inquiries/         # 留言管理
│   │       └── company/           # 公司信息与站点设置
│   ├── components/                # 可复用组件
│   └── lib/
│       ├── supabase.js            # Supabase 客户端
│       ├── data.js                # 服务端数据获取（含兜底数据）
│       └── client-data.js         # 客户端数据获取
```

---

## 数据模型（9 张表）

`product_categories` / `products` / `solutions` / `cases` / `news` / `inquiries` / `company_info` / `site_settings` / `business_services`

- 字段命名统一使用 `snake_case`
- 主键为 UUID，统一含 `created_at` / `updated_at`
- 图片字段：`product_categories.image_url`、`products.images`（数组）、`news.cover_image`、`business_services.image_url`
- Storage bucket：`product-images`（产品和分类图片）、`news-images`（新闻封面）、`company-assets`（主营业务图片）

---

## 品牌规范

- **主色**：深靛蓝 `#1E3A8A`
- **辅色**：浅蓝 `#60A5FA`
- **导航栏品牌**：`SORAN`
- **Logo**：使用 `public/logo.png`，组件为 `src/components/Logo.jsx`，使用原生 `<img>` 标签
- **导航栏**：统一浅色背景，确保任何页面和滚动位置都清晰可见
- **页面顶部标题**：白色字体
- **风格**：专业严谨、简洁现代、Apple 风格动效

---

## 关键约定

1. **静态导出限制**：Next.js 使用 `output: 'export'`。后台修改内容后，前台静态页面需要重新构建才能更新。因此首页产品中心、明星产品、新闻动态、产品列表、新闻列表、产品详情、新闻详情、主营业务、首页核心数据、CTA 等均改为客户端组件，浏览器加载后拉取 Supabase 最新数据。
2. **图片上传**：复用 `src/components/ImageUpload.jsx`，支持指定 bucket 和 folder。
3. **兜底数据**：`src/lib/data.js` 包含所有模块的兜底静态数据，确保未配置 Supabase 时也能构建和展示。
4. **安全**：仅使用 anon key；所有表启用 RLS；`.env.local` 不提交 git。
5. **响应式**：移动优先，使用 Tailwind 断点 `sm/md/lg/xl`。

---

## 当前已知问题与待办

- [ ] **P0**：`next@14.2.5` 存在安全漏洞，建议升级到 patched 版本
- [ ] **P1**：删除产品/分类/新闻/主营业务时，未同步删除 Supabase Storage 中的图片文件
- [ ] **P1**：后台管理当前所有 authenticated 用户均可访问，建议增加角色/邮箱白名单
- [ ] **P2**：Navbar.jsx 中 `isLight` 始终为 true，存在冗余分支代码
- [ ] **P2**：图片上传未做服务端压缩，建议限制最大宽度
- [ ] **P2**：数据库高频查询字段（如 `is_featured`、`is_published`）建议增加索引
- [ ] **P2**：解决方案暂无独立详情页 `/solutions/[slug]`
- [ ] **P3**：client-data.js 可引入 SWR 缓存减少重复请求

---

## 每次工作前必读

1. 读取 `.workbuddy/memory/MEMORY.md` 和最近 3 天日志
2. 读取 `soran-website/代码审查报告.md` 和 `soran-website/测试报告-全项目.md`
3. 确认当前 dev server 端口和 Supabase 配置
4. 如涉及数据库变更，优先检查 `supabase/schema.sql` 和现有 `migration-*.sql`

---

## 每次工作后必做

1. 运行 `npm run build` 验证构建
2. 如有数据库变更，提供增量 migration SQL
3. 更新 `.workbuddy/memory/YYYY-MM-DD.md` 每日日志
4. 如变更影响长期约定，更新 `.workbuddy/memory/MEMORY.md`
5. 更新 `soran-website/README.md` 功能列表（如新增后台模块）
6. 更新本提示词文档中过时的信息

---

## 常用命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建静态站点
npm run build

# 测试 Supabase 连接与业务表
node scripts/full-project-test.js
node scripts/test-business-services.js
```

---

## 部署检查清单

- [ ] Supabase 项目已执行 `schema.sql`
- [ ] Authentication > Users 已创建管理员账号
- [ ] `.env.local` 已配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] GitHub 仓库已推送代码
- [ ] GitHub Secrets 已配置 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] GitHub Variables 已配置 `NEXT_PUBLIC_BASE_PATH`
- [ ] GitHub Pages Source 已选择 GitHub Actions
- [ ] `npm run build` 本地构建通过
