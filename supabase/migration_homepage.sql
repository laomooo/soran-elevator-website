-- ==================== 首页内容管理 数据库迁移 ====================
-- 请在 Supabase SQL Editor 中执行此文件

-- 1. 扩展 site_config 表，添加 Hero 和 CTA 区域字段
ALTER TABLE site_config 
ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255) DEFAULT '科技绿色\n服务生活',
ADD COLUMN IF NOT EXISTS hero_subtitle VARCHAR(500) DEFAULT '专业电梯配件 · 精工品质 · 值得信赖',
ADD COLUMN IF NOT EXISTS hero_bg_color1 VARCHAR(7) DEFAULT '#1B2E5A',
ADD COLUMN IF NOT EXISTS hero_bg_color2 VARCHAR(7) DEFAULT '#3A7BC8',
ADD COLUMN IF NOT EXISTS cta_title VARCHAR(255) DEFAULT '准备好开始合作了吗？',
ADD COLUMN IF NOT EXISTS cta_subtitle VARCHAR(500) DEFAULT '我们的专业团队随时为您提供技术咨询和报价服务',
ADD COLUMN IF NOT EXISTS cta_button_text VARCHAR(50) DEFAULT '立即联系 →';

-- 2. 创建首页特色卡片表
CREATE TABLE IF NOT EXISTS home_features (
    id SERIAL PRIMARY KEY,
    icon VARCHAR(10) DEFAULT '✅',
    title VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 开启 home_features 的 RLS
ALTER TABLE home_features ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略：所有人可读
CREATE POLICY "Anyone can read home_features" ON home_features
    FOR SELECT USING (true);

-- 5. RLS 策略：管理员可增删改
CREATE POLICY "Admins can insert home_features" ON home_features
    FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update home_features" ON home_features
    FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete home_features" ON home_features
    FOR DELETE USING (is_admin());

-- 6. 插入默认首页特色卡片
INSERT INTO home_features (icon, title, description, sort_order) VALUES
('🏭', '专业制造', '拥有先进的生产设备和工艺流程，确保每一件产品都达到行业高标准', 1),
('🔬', '技术创新', '持续投入研发，不断推出符合市场需求的新产品和解决方案', 2),
('🌍', '全球服务', '产品远销多个国家和地区，拥有完善的售后服务体系', 3),
('✅', '品质保证', '严格的质量管理体系，通过多项国际认证，品质可靠有保障', 4)
ON CONFLICT DO NOTHING;

-- 7. 修复自增序列（如果之前有执行过）
SELECT setval('home_features_id_seq', (SELECT COALESCE(MAX(id),0) FROM home_features));
