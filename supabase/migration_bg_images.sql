-- ============================================================
-- 迁移：首页背景图字段
-- 给 site_config 增加 Hero 和 CTA 背景图字段
-- 请在 Supabase SQL Editor 中执行本脚本
-- ============================================================

-- 1. 添加背景图字段
ALTER TABLE site_config 
  ADD COLUMN IF NOT EXISTS hero_bg_image TEXT,
  ADD COLUMN IF NOT EXISTS cta_bg_image TEXT;

-- 2. 验证
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'site_config' 
  AND column_name IN ('hero_bg_image', 'cta_bg_image');
