-- ============================================================
-- 增量脚本：新增 business_services 表（关于我们-主营业务）
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- 1. 创建主营业务表
CREATE TABLE IF NOT EXISTS business_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 确保 updated_at 触发器函数存在
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 给 business_services 添加自动更新 updated_at 触发器
DROP TRIGGER IF EXISTS set_updated_at ON business_services;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON business_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. 预置三条主营业务数据
INSERT INTO business_services (title, description, sort_order, is_active) VALUES
  ('主流品牌零部件供应', '多家龙头电梯部件企业核心代理商，一站式满足采购需求', 1, true),
  ('自主研发生产', '电梯空调、梯控系统等加装类产品，品质与交付可控', 2, true),
  ('技术服务支持', '从选型到交付的全流程标准化服务与技术支持', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 5. 启用 RLS 并创建策略
ALTER TABLE business_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read business_services" ON business_services;
CREATE POLICY "public read business_services" ON business_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "auth write business_services" ON business_services;
CREATE POLICY "auth write business_services" ON business_services FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. 确保图片 Storage bucket 存在（图片存于 company-assets）
INSERT INTO storage.buckets (id, name, public)
  VALUES ('company-assets', 'company-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public read company-assets" ON storage.objects;
CREATE POLICY "public read company-assets" ON storage.objects
  FOR SELECT USING (bucket_id IN ('company-assets'));

DROP POLICY IF EXISTS "auth write company-assets" ON storage.objects;
CREATE POLICY "auth write company-assets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('company-assets'));

DROP POLICY IF EXISTS "auth update company-assets" ON storage.objects;
CREATE POLICY "auth update company-assets" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id IN ('company-assets'));

DROP POLICY IF EXISTS "auth delete company-assets" ON storage.objects;
CREATE POLICY "auth delete company-assets" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id IN ('company-assets'));
