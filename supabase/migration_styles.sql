-- ============================================================
-- 全页面背景自定义系统 — 数据库迁移
-- 创建 section_backgrounds 表，支持 9 个 section 的独立背景配置
-- ============================================================

-- 1. 创建表
CREATE TABLE IF NOT EXISTS section_backgrounds (
    id SERIAL PRIMARY KEY,
    section_key VARCHAR(50) UNIQUE NOT NULL,
    section_label VARCHAR(100),
    bg_type VARCHAR(20) DEFAULT 'gradient' CHECK (bg_type IN ('image','color','gradient','none')),
    is_active INTEGER DEFAULT 1,

    -- 图片背景参数
    bg_image TEXT,
    bg_size VARCHAR(20) DEFAULT 'cover',
    bg_position VARCHAR(30) DEFAULT 'center center',
    bg_repeat VARCHAR(10) DEFAULT 'no-repeat',
    bg_fixed INTEGER DEFAULT 0,

    -- 渐变参数
    gradient_type VARCHAR(10) DEFAULT 'linear',
    gradient_angle INTEGER DEFAULT 135,
    gradient_shape VARCHAR(20) DEFAULT 'circle',
    gradient_position VARCHAR(20) DEFAULT 'center',
    gradient_colors JSONB DEFAULT '["#1B2E5A","#3A7BC8"]'::jsonb,

    -- 纯色参数
    bg_color VARCHAR(7),

    -- 叠加层参数
    overlay_color VARCHAR(7),
    overlay_opacity DECIMAL(3,2) DEFAULT 0,

    -- 内边距
    custom_padding VARCHAR(50),

    -- 元数据
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS 策略
ALTER TABLE section_backgrounds ENABLE ROW LEVEL SECURITY;

-- 所有人可读激活的配置
DROP POLICY IF EXISTS "Public read active section_backgrounds" ON section_backgrounds;
CREATE POLICY "Public read active section_backgrounds" ON section_backgrounds
    FOR SELECT USING (is_active = 1);

-- 管理员可增删改（依赖 is_admin() 函数，已在 schema.sql 中创建）
DROP POLICY IF EXISTS "Admin manage section_backgrounds" ON section_backgrounds;
CREATE POLICY "Admin manage section_backgrounds" ON section_backgrounds
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 3. 插入所有 9 个 section 的默认配置
INSERT INTO section_backgrounds (section_key, section_label, bg_type, gradient_type, gradient_angle, gradient_colors, sort_order) VALUES
    ('body',     '页面背景',   'color',    'linear', 135, '["#ffffff"]'::jsonb,                       0),
    ('header',   '导航栏',     'color',    'linear', 135, '["rgba(255,255,255,0.82)"]'::jsonb,         1),
    ('hero',     '首屏 Hero',  'gradient', 'linear', 135, '["#1B2E5A","#3A7BC8"]'::jsonb,              2),
    ('banner',   '轮播区域',   'color',    'linear', 135, '["#f5f5f7"]'::jsonb,                         3),
    ('products', '产品展示',   'color',    'linear', 135, '["#f5f5f7"]'::jsonb,                         4),
    ('features', '特色优势',   'none',     'linear', 135, '["#ffffff"]'::jsonb,                         5),
    ('categories','分类展示',  'color',    'linear', 135, '["#f5f5f7"]'::jsonb,                         6),
    ('cta',      '行动号召',   'gradient', 'linear', 135, '["#1B2E5A","#3A7BC8"]'::jsonb,              7),
    ('footer',   '页脚',       'color',    'linear', 135, '["#0F1D3A"]'::jsonb,                         8)
ON CONFLICT (section_key) DO NOTHING;

-- 4. 从 site_config 迁移 hero/cta 的现有自定义配置（如果有图片或自定义颜色）
UPDATE section_backgrounds
SET 
    bg_type = CASE 
        WHEN sc.hero_bg_image IS NOT NULL AND sc.hero_bg_image != '' THEN 'image'
        ELSE 'gradient'
    END,
    bg_image = CASE WHEN sc.hero_bg_image IS NOT NULL AND sc.hero_bg_image != '' THEN sc.hero_bg_image ELSE bg_image END,
    gradient_colors = jsonb_build_array(
        COALESCE(NULLIF(sc.hero_bg_color1, ''), '#1B2E5A'),
        COALESCE(NULLIF(sc.hero_bg_color2, ''), '#3A7BC8')
    )
FROM site_config sc
WHERE section_backgrounds.section_key = 'hero' AND sc.id = 1;

UPDATE section_backgrounds
SET 
    bg_type = CASE 
        WHEN sc.cta_bg_image IS NOT NULL AND sc.cta_bg_image != '' THEN 'image'
        ELSE 'gradient'
    END,
    bg_image = CASE WHEN sc.cta_bg_image IS NOT NULL AND sc.cta_bg_image != '' THEN sc.cta_bg_image ELSE bg_image END
FROM site_config sc
WHERE section_backgrounds.section_key = 'cta' AND sc.id = 1;
