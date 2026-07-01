-- Migration: Add text_style column to section_backgrounds
-- Run this in Supabase SQL Editor

ALTER TABLE section_backgrounds 
ADD COLUMN IF NOT EXISTS text_style JSONB;

COMMENT ON COLUMN section_backgrounds.text_style IS '文字样式配置 {color, headingColor, size, align, weight}';
