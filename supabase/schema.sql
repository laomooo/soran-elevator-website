-- ============================================================
-- SORAN 索然电梯配件官网 - Supabase SQL Schema
-- ============================================================
-- 使用方法: 在 Supabase Dashboard -> SQL Editor 中执行此文件
-- ============================================================

-- ============================================================
-- 1. 创建所有表
-- ============================================================

-- 站点配置表（单行配置）
CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    company_name TEXT DEFAULT '广州索然电梯配件有限公司',
    company_name_en TEXT DEFAULT 'Guangzhou Soran Elevator Parts Co., Ltd.',
    slogan TEXT DEFAULT '科技绿色 服务生活',
    slogan_en TEXT DEFAULT 'Technology Green, Serving Life',
    address TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    wechat TEXT DEFAULT '',
    about_text TEXT DEFAULT '',
    about_text_en TEXT DEFAULT '',
    logo_url TEXT DEFAULT '/images/logo.png',
    icp TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 产品分类表
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT DEFAULT '',
    description TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 产品表
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    model_number TEXT DEFAULT '',
    name TEXT NOT NULL,
    name_en TEXT DEFAULT '',
    short_desc TEXT DEFAULT '',
    short_desc_en TEXT DEFAULT '',
    full_desc TEXT DEFAULT '',
    full_desc_en TEXT DEFAULT '',
    specifications JSONB DEFAULT '{}'::jsonb,
    image_urls JSONB DEFAULT '[]'::jsonb,
    main_image TEXT DEFAULT '',
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 轮播图表
CREATE TABLE IF NOT EXISTS banners (
    id SERIAL PRIMARY KEY,
    title TEXT DEFAULT '',
    title_en TEXT DEFAULT '',
    subtitle TEXT DEFAULT '',
    subtitle_en TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 新闻动态表
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    summary TEXT DEFAULT '',
    cover_image TEXT DEFAULT '',
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 合作伙伴表
CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT DEFAULT '',
    website TEXT DEFAULT '',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 管理员表（关联 Supabase Auth）
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    company TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    content TEXT DEFAULT '',
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. 创建索引
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_sort ON banners(sort_order);
CREATE INDEX IF NOT EXISTS idx_news_active ON news(is_active);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- ============================================================
-- 3. 启用 RLS (Row Level Security)
-- ============================================================
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. 创建辅助函数：检查用户是否为管理员
-- ============================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. 创建 RLS Policies
-- ============================================================

-- --- site_config: 所有人可读，仅管理员可写 ---
CREATE POLICY "Public read site_config" ON site_config
    FOR SELECT USING (true);

CREATE POLICY "Admin update site_config" ON site_config
    FOR UPDATE USING (is_admin())
    WITH CHECK (is_admin());

-- --- categories: 所有人可读激活的分类，管理员可全部操作 ---
CREATE POLICY "Public read active categories" ON categories
    FOR SELECT USING (is_active = 1);

CREATE POLICY "Admin all categories" ON categories
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- --- products: 所有人可读激活的产品，管理员可全部操作 ---
CREATE POLICY "Public read active products" ON products
    FOR SELECT USING (is_active = 1);

CREATE POLICY "Admin all products" ON products
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- --- banners: 所有人可读激活的轮播图，管理员可全部操作 ---
CREATE POLICY "Public read active banners" ON banners
    FOR SELECT USING (is_active = 1);

CREATE POLICY "Admin all banners" ON banners
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- --- news: 所有人可读发布的新闻，管理员可全部操作 ---
CREATE POLICY "Public read active news" ON news
    FOR SELECT USING (is_active = 1);

CREATE POLICY "Admin all news" ON news
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- --- partners: 所有人可读，仅管理员可写 ---
CREATE POLICY "Public read partners" ON partners
    FOR SELECT USING (is_active = 1);

CREATE POLICY "Admin all partners" ON partners
    FOR ALL USING (is_admin())
    WITH CHECK (is_admin());

-- --- admins: 仅管理员可读自己的记录 ---
CREATE POLICY "Admin read own record" ON admins
    FOR SELECT USING (id = auth.uid());

-- --- messages: 匿名用户可插入，管理员可读写 ---
CREATE POLICY "Public insert messages" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin read messages" ON messages
    FOR SELECT USING (is_admin());

CREATE POLICY "Admin update messages" ON messages
    FOR UPDATE USING (is_admin());

CREATE POLICY "Admin delete messages" ON messages
    FOR DELETE USING (is_admin());

-- ============================================================
-- 6. 创建 Supabase Storage 存储桶（用于图片上传）
-- ============================================================
-- 注意: 此操作需要在 Supabase Dashboard -> Storage 中手动创建
-- 或者使用 Supabase SQL API 创建:
-- SELECT storage.create_bucket('images', '{"public": true}');

-- 在 SQL Editor 中执行以下语句来创建存储桶:
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('images', 'images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
EXCEPTION WHEN unique_violation THEN
    -- 存储桶已存在
END;
$$;

-- 设置存储桶策略: 所有人可读取图片
CREATE POLICY "Public read images" ON storage.objects
    FOR SELECT USING (bucket_id = 'images');

-- 仅管理员可上传图片
CREATE POLICY "Admin upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'images' AND is_admin());

-- 管理员可更新图片
CREATE POLICY "Admin update images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'images' AND is_admin());

-- 管理员可删除图片
CREATE POLICY "Admin delete images" ON storage.objects
    FOR DELETE USING (bucket_id = 'images' AND is_admin());

-- ============================================================
-- 7. 初始化默认数据
-- ============================================================

-- 初始化站点配置
INSERT INTO site_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 初始化默认分类
INSERT INTO categories (id, name, name_en, sort_order) VALUES
(1, '电梯光幕系统', 'Elevator Light Curtain System', 1),
(2, '红外线感应器', 'Infrared Sensor', 2),
(3, '门机及门系统', 'Door Operator & Door System', 3),
(4, '控制柜组件', 'Control Cabinet Components', 4),
(5, '安全部件', 'Safety Components', 5),
(6, '其他配件', 'Other Accessories', 99)
ON CONFLICT DO NOTHING;

-- 初始化默认产品示例
INSERT INTO products (category_id, model_number, name, short_desc, is_featured, sort_order) VALUES
(1, 'G1A1-609AB', '红外线感应器 G1A1-609AB', '高精度红外线感应器，适用于各类电梯门系统', 1, 1),
(1, 'G1A1-709AB', '红外线感应器 G1A1-709AB', '新一代红外线感应器，响应速度更快', 1, 2),
(2, 'LC-2000', '电梯光幕 LC-2000', '2000mm光幕系统，154束红外光束', 1, 3),
(3, 'DM-800', '电梯门机 DM-800', '高效静音门机，适用于住宅和商用电梯', 1, 4)
ON CONFLICT DO NOTHING;

-- 初始化默认轮播图
INSERT INTO banners (title, subtitle, image_url, sort_order) VALUES
('专业电梯光幕系统', '高精度 · 高可靠 · 高安全', 
 'https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?w=1200&h=500&fit=crop', 1),
('全方位技术支持', '研发 · 生产 · 售后一体化服务',
 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=500&fit=crop', 2)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 8. 创建管理员账号说明
-- ============================================================
-- 管理员账号通过 Supabase Dashboard 创建:
-- 1. 打开 Supabase Dashboard -> Authentication -> Users
-- 2. 点击 "Add user" -> "Create new user"
-- 3. 填写邮箱和密码
-- 4. 创建后，复制用户的 UUID
-- 5. 在 SQL Editor 中执行（替换 YOUR_USER_UUID 和 YOUR_USERNAME）:
--
-- INSERT INTO admins (id, username, role)
-- VALUES ('YOUR_USER_UUID', 'admin', 'admin');
--
-- 或者通过 Supabase Dashboard -> Table Editor -> admins 表手动插入

-- 示例（请替换为实际的 UUID）:
-- INSERT INTO admins (id, username, role)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'admin', 'admin');
