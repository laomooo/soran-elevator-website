-- ============================================================
-- 广州索然电梯配件有限公司官网 · Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本即可完成建表、预置数据与 RLS 策略
-- ============================================================

-- 扩展
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. 表结构
-- ============================================================

-- 产品分类
create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_cn text not null,
  name_en text,
  sort_order int default 0,
  icon text,
  image_url text,
  short_desc text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 产品
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references product_categories(id) on delete set null,
  slug text not null unique,
  name_cn text not null,
  model text,
  brand text,
  one_line_selling text,
  description text,
  specs jsonb default '[]'::jsonb,
  applicable_scenes text,
  advantages text,
  installation_notes text,
  images text[] default '{}',
  is_featured boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 解决方案
create table if not exists solutions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  process_steps jsonb default '[]'::jsonb,
  components text[] default '{}',
  advantages text[] default '{}',
  applicable_scenes text,
  cover_image text,
  content text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 客户案例
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client_type text,
  service_type text,
  industry text,
  background text,
  pain_points text,
  solution text,
  used_products text[] default '{}',
  process text,
  results text,
  testimonial text,
  cover_image text,
  gallery text[] default '{}',
  published_at timestamptz,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 新闻动态
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  summary text,
  content text,
  cover_image text,
  author text,
  published_at timestamptz,
  is_published boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 在线留言
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  phone text not null,
  email text,
  inquiry_type text not null,
  message text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- 主营业务（后台可编辑图片、标题、描述）
create table if not exists business_services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 公司信息（键值对）
create table if not exists company_info (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  group_name text,
  updated_at timestamptz default now()
);

-- 站点全局设置
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. updated_at 自动更新触发器
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array[
    'product_categories','products','solutions','cases','news','company_info','site_settings','business_services'
  ] loop
    execute format('drop trigger if exists set_updated_at on %I;', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function update_updated_at();', t);
  end loop;
end$$;

-- ============================================================
-- 3. 预置数据
-- ============================================================

-- 产品分类
insert into product_categories (slug, name_cn, name_en, sort_order, icon, short_desc) values
  ('elevator-light-curtain', '电梯光幕', 'Elevator Light Curtain', 1, 'shield', '红外感应，98% 通用型电梯适配'),
  ('elevator-air-conditioner', '电梯空调', 'Elevator Air Conditioner', 2, 'wind', '单冷/冷暖可选，专业安装'),
  ('elevator-fan', '电梯风扇', 'Elevator Fan', 3, 'fan', '圆形/方形，低噪稳定'),
  ('elevator-wire-rope', '电梯钢丝绳', 'Elevator Wire Rope', 4, 'link', '高破断拉力，柔韧耐磨'),
  ('elevator-steel-belt', '电梯专用钢带', 'Elevator Steel Belt', 5, 'box', '高强度镀锌芯，TPU 包覆'),
  ('elevator-compensation-chain', '电梯补偿链', 'Elevator Compensation Chain', 6, 'git-merge', '阻燃耐老化，运行平稳'),
  ('escalator-handrail', '扶梯扶手带', 'Escalator Handrail', 7, 'circle', '多层复合，耐磨抗撕裂'),
  ('elevator-electrical', '电梯电气大配套', 'Elevator Electrical System', 8, 'cpu', '符合 GB7588.1，免调试交付')
on conflict (slug) do nothing;

-- 示例产品（每分类一条）
insert into products (category_id, slug, name_cn, model, brand, one_line_selling, description, specs, applicable_scenes, advantages, is_featured) values
  ((select id from product_categories where slug='elevator-light-curtain'), 'g1a1-609ab', '电梯光幕 G1A1-609AB', 'G1A1-609AB', '通用型', '98% 通用型电梯适配，响应快，抗光干扰', '索然电梯光幕采用红外线扫描感应技术，用于电梯门区安全防护，防止夹人夹物。', '[{"label":"型号","value":"G1A1-609AB"},{"label":"适配梯型","value":"98% 通用型电梯"},{"label":"防护等级","value":"IP54"},{"label":"响应时间","value":"≤ 80ms"},{"label":"工作电压","value":"AC 100-240V"}]', '乘客电梯、载货电梯、医用电梯', '响应快速、抗光干扰、防护等级 IP54、安装便捷', true),
  ((select id from product_categories where slug='elevator-air-conditioner'), 'sr-t03', '电梯空调 SR-T03（冷暖 1P）', 'SR-T03', '索然', '冷暖双模式，适配 300-1350KG 轿厢，低噪舒适', '索然自主研发电梯空调，专为电梯轿厢设计，制冷制热一体，节能静音。', '[{"label":"型号","value":"SR-T03"},{"label":"类型","value":"冷暖 1P"},{"label":"适配轿厢","value":"300-1350KG"},{"label":"噪音","value":"≤ 45 dB(A)"},{"label":"电源","value":"AC 220V/50Hz"}]', '乘客电梯、观光电梯、医用电梯', '冷暖可选、节能静音、专业安装、售后完善', true),
  ((select id from product_categories where slug='elevator-fan'), 'fb-9b', '电梯风扇 FB-9B', 'FB-9B', '通用型', '100% 尺寸适配，低噪 ≤ 47 dB(A)', '索然电梯风扇覆盖圆形与方形多种规格，适配各类轿厢尺寸，运行安静稳定。', '[{"label":"型号","value":"FB-9B"},{"label":"规格","value":"圆形"},{"label":"噪音","value":"≤ 47 dB(A)"},{"label":"电压","value":"AC 220V"}]', '乘客电梯、货梯、观光梯', '尺寸全覆盖、低噪、长寿命', false),
  ((select id from product_categories where slug='elevator-wire-rope'), '8x19s-iwrc', '电梯钢丝绳 8×19S+IWRC', '8×19S+IWRC', '通用型', '高破断拉力，柔韧耐磨，乘客梯安全系数 ≥ 12', '钢芯结构电梯钢丝绳，适用于各类曳引式电梯，破断拉力高，使用寿命长。', '[{"label":"结构","value":"8×19S+IWRC（钢芯）"},{"label":"安全系数","value":"≥ 12（乘客梯）"},{"label":"直径","value":"8-16mm 可选"}]', '乘客电梯、载货电梯', '高破断拉力、柔韧、耐磨、低旋转', false),
  ((select id from product_categories where slug='elevator-steel-belt'), 'pbx34', '电梯专用钢带 PBX34', 'PBX34', '通用型', '高强度镀锌钢丝绳芯，TPU 包覆，耐油耐水解', '索然电梯专用钢带，采用高强度镀锌钢丝绳芯与 TPU 包覆层，适用于高速电梯。', '[{"label":"型号","value":"PBX34"},{"label":"芯材","value":"镀锌钢丝绳"},{"label":"包覆","value":"TPU"}]', '高速乘客电梯', '高强度、耐油耐水解耐低温', false),
  ((select id from product_categories where slug='elevator-compensation-chain'), 'compensation-chain', '电梯平衡补偿链', '包塑/全塑', '索然', '弹性好、弯曲半径小、阻燃耐老化', '索然电梯补偿链分包塑与全塑两种，运行平稳，有效补偿轿厢与对重侧钢丝绳重量差。', '[{"label":"类型","value":"包塑 / 全塑"},{"label":"特性","value":"阻燃耐老化"}]', '中高速乘客电梯', '弹性好、弯曲半径小、阻燃、运行平稳', false),
  ((select id from product_categories where slug='escalator-handrail'), 'escalator-handband', '扶梯扶手带', '多规格', '通用型', '多层复合结构，耐磨抗撕裂，表面光滑易清洁', '索然扶梯扶手带适用于自动扶梯、自动人行道及轿厢装饰，耐磨耐用。', '[{"label":"类型","value":"扶梯 / 人行道 / 装饰"},{"label":"结构","value":"多层复合"}]', '自动扶梯、自动人行道', '耐磨抗撕裂、表面光滑、易清洁', false),
  ((select id from product_categories where slug='elevator-electrical'), 'electrical-system', '电梯电气大配套', '成套', '索然', '符合 GB7588.1 标准，布线简约，免调试交付', '索然电梯电气大配套涵盖控制柜、一体化控制器、人机界面、井道电气、门系统、线束线缆等。', '[{"label":"标准","value":"GB7588.1"},{"label":"范围","value":"控制柜/人机界面/井道电气/门系统/线束"}]', '新梯配套、旧梯改造', '标准领先、布线简约、电气安全、免调试交付', true)
on conflict (slug) do nothing;

-- 解决方案
insert into solutions (slug, title, summary, process_steps, components, advantages, applicable_scenes, content) values
  ('elevator-ac-installation', '一站式电梯空调安装服务', '从现场勘测到交付验收的 6 步标准流程，专业团队全流程服务。',
    '[{"step":1,"title":"现场勘测","desc":"工程师上门勘测轿厢尺寸与安装条件"},{"step":2,"title":"机型选配","desc":"根据轿厢规格与需求选配空调机型"},{"step":3,"title":"运输配送","desc":"配送至现场并核对配件清单"},{"step":4,"title":"上门安装","desc":"专业安装团队规范施工"},{"step":5,"title":"电气接线及调试","desc":"接线、检漏、调试运行"},{"step":6,"title":"交付验收","desc":"客户验收并签署交付文件"}]',
    '{}', '{"快速响应","现场勘测","快速交付","专业安装","技术支持","售后服务"}',
    '高端住宅、写字楼、产业园、公共设施',
    '索然提供从选型到交付的一站式电梯空调安装服务，确保安装规范、运行稳定。'),
  ('elevator-upgrade', '电梯升级改造整体解决方案', '涵盖控制柜、门系统、光幕、电气配套的旧梯改造整体方案。',
    '[]',
    '{"控制柜","应急救援装置","门系统","电梯光幕","操纵盘 & 外呼盒","底坑检修箱","曳引机","编码器","钢丝绳 / 钢带","轿顶一体箱","感应器","成套线缆"}',
    '{"标准领先","布线简约","电气安全","免调试交付","功能集成"}',
    '旧梯改造、功能升级、安全合规改造',
    '索然电梯升级改造整体解决方案，帮助客户以最小代价提升电梯安全性与乘坐体验。')
on conflict (slug) do nothing;

-- 示例新闻
insert into news (slug, title, category, summary, content, author, published_at, is_published) values
  ('soran-2024-service-milestone', '索然服务次数突破 300 万次', '公司新闻', '截至当前，索然累计电梯配件服务交付次数突破 300 万次。',
    '广州索然电梯配件有限公司自 2011 年成立以来，始终专注于电梯配件供应与技术服务。截至目前，累计服务交付次数突破 300 万次，覆盖全国众多物业、维保与开发商客户。',
    '索然', now(), true),
  ('elevator-ac-selection-guide', '电梯空调选型指南：如何为轿厢选择合适的空调', '产品知识', '从轿厢载重、使用场景到冷暖需求，一文看懂电梯空调选型。',
    '电梯空调选型需综合考虑轿厢载重、使用场景、冷暖需求与电源条件。300-1350KG 轿厢推荐 SR-T03（冷暖 1P），大型轿厢或观光梯推荐 SR-T06（冷暖 2P）。',
    '索然技术部', now(), true),
  ('gb7588-1-standard-overview', 'GB7588.1 电梯制造标准要点解读', '行业资讯', '解读 GB7588.1 对电梯电气安全的核心要求。',
    'GB7588.1 是电梯制造与安装安全规范的核心标准，对电气安全、门系统、紧急操作等提出明确要求。索然电气大配套严格遵循该标准。',
    '索然技术部', now(), true)
on conflict (slug) do nothing;

-- 公司信息
insert into company_info (key, value, group_name) values
  ('full_name', '广州索然电梯配件有限公司', 'basic'),
  ('full_name_en', 'GUANGZHOU SORAN ELEVATOR PARTS CO., LTD.', 'basic'),
  ('founded_year', '2011', 'basic'),
  ('slogan', '科技绿色，服务生活', 'basic'),
  ('address', '中国广东省广州市白云区嘉禾街新科科甲联兴路 6 号', 'contact'),
  ('hotline', '020-84040443', 'contact'),
  ('mobile', '18899735905', 'contact'),
  ('contact_person', '罗斯琪', 'contact'),
  ('qq', '3311803064', 'contact'),
  ('email', 'guangzhousoran@163.com', 'contact'),
  ('work_hours', '周一至周五 9:00 - 18:00', 'contact'),
  ('service_count', '300万+次', 'basic'),
  ('wechat', '索然电梯配件', 'social')
on conflict (key) do nothing;

-- 站点设置
insert into site_settings (key, value) values
  ('hero_title', '科技绿色 · 服务生活'),
  ('hero_subtitle', '一站式电梯配件供应与技术服务专家'),
  ('stat_founded', '2011 年成立'),
  ('stat_service', '300 万+ 次服务交付'),
  ('stat_brands', '覆盖主流电梯品牌配件'),
  ('stat_factory', '自有研发与生产基地'),
  ('cta_title', '需要电梯配件或升级改造方案？'),
  ('footer_copyright', '广州索然电梯配件有限公司')
on conflict (key) do nothing;

-- 主营业务预置数据
insert into business_services (title, description, sort_order, is_active) values
  ('主流品牌零部件供应', '多家龙头电梯部件企业核心代理商，一站式满足采购需求', 1, true),
  ('自主研发生产', '电梯空调、梯控系统等加装类产品，品质与交付可控', 2, true),
  ('技术服务支持', '从选型到交付的全流程标准化服务与技术支持', 3, true)
on conflict (id) do nothing;

-- ============================================================
-- 4. RLS 行级安全策略
-- ============================================================

alter table product_categories enable row level security;
alter table products enable row level security;
alter table solutions enable row level security;
alter table cases enable row level security;
alter table news enable row level security;
alter table inquiries enable row level security;
alter table company_info enable row level security;
alter table site_settings enable row level security;
alter table business_services enable row level security;

-- 公开内容表：anon 可读，authenticated 可写
create policy "public read product_categories" on product_categories for select using (true);
create policy "auth write product_categories" on product_categories for all to authenticated using (true) with check (true);

create policy "public read products" on products for select using (true);
create policy "auth write products" on products for all to authenticated using (true) with check (true);

create policy "public read solutions" on solutions for select using (true);
create policy "auth write solutions" on solutions for all to authenticated using (true) with check (true);

create policy "public read cases" on cases for select using (true);
create policy "auth write cases" on cases for all to authenticated using (true) with check (true);

create policy "public read news" on news for select using (true);
create policy "auth write news" on news for all to authenticated using (true) with check (true);

create policy "public read company_info" on company_info for select using (true);
create policy "auth write company_info" on company_info for all to authenticated using (true) with check (true);

create policy "public read site_settings" on site_settings for select using (true);
create policy "auth write site_settings" on site_settings for all to authenticated using (true) with check (true);

create policy "public read business_services" on business_services for select using (true);
create policy "auth write business_services" on business_services for all to authenticated using (true) with check (true);

-- 留言表：anon 仅可插入，authenticated 可全权管理
create policy "anon insert inquiries" on inquiries for insert to anon, authenticated with check (true);
create policy "auth read inquiries" on inquiries for select to authenticated using (true);
create policy "auth update inquiries" on inquiries for update to authenticated using (true);
create policy "auth delete inquiries" on inquiries for delete to authenticated using (true);

-- ============================================================
-- 5. Storage（在 Supabase Dashboard > Storage 手动创建以下公开 bucket）
--    product-images / case-images / news-images / company-assets
--    或执行以下 SQL（需 storage schema 权限）：
-- ============================================================
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('case-images', 'case-images', true),
  ('news-images', 'news-images', true),
  ('company-assets', 'company-assets', true)
on conflict (id) do nothing;

create policy "public read storage" on storage.objects for select using (bucket_id in ('product-images','case-images','news-images','company-assets'));
create policy "auth write storage" on storage.objects for insert to authenticated with check (bucket_id in ('product-images','case-images','news-images','company-assets'));
create policy "auth update storage" on storage.objects for update to authenticated using (bucket_id in ('product-images','case-images','news-images','company-assets'));
create policy "auth delete storage" on storage.objects for delete to authenticated using (bucket_id in ('product-images','case-images','news-images','company-assets'));

-- ============================================================
-- 完成提示：
-- 1. 在 Supabase > Authentication > Users 创建管理员账号（邮箱+密码）
-- 2. 在项目设置 > API 获取 URL 与 anon key，填入网站 .env
-- 3. 重新部署网站即可在 /admin 登录管理内容
-- ============================================================
