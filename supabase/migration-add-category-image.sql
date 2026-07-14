-- ============================================================
-- 增量脚本：为 product_categories 表添加 image_url 字段
-- 若已执行过完整 schema.sql，直接在 Supabase SQL Editor 执行此脚本即可
-- ============================================================

-- 1. 安全添加 image_url 字段（若不存在）
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'product_categories' and column_name = 'image_url'
  ) then
    alter table product_categories add column image_url text;
  end if;
end$$;

-- 2. 确保 updated_at 触发器存在（完整 schema 已含，此处幂等）
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
  foreach t in array array['product_categories','products','solutions','cases','news','company_info','site_settings'] loop
    execute format('drop trigger if exists set_updated_at on %I;', t);
    execute format('create trigger set_updated_at before update on %I for each row execute function update_updated_at();', t);
  end loop;
end$$;

-- 3. 确保 Storage bucket 存在（分类图片存入 product-images）
insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 4. 确保 RLS 策略存在（PostgreSQL 不支持 create policy if not exists，使用 drop + create）
alter table product_categories enable row level security;

drop policy if exists "public read product_categories" on product_categories;
create policy "public read product_categories" on product_categories for select using (true);

drop policy if exists "auth write product_categories" on product_categories;
create policy "auth write product_categories" on product_categories for all to authenticated using (true) with check (true);

drop policy if exists "public read storage" on storage.objects;
create policy "public read storage" on storage.objects for select using (bucket_id in ('product-images','case-images','news-images','company-assets'));

drop policy if exists "auth write storage" on storage.objects;
create policy "auth write storage" on storage.objects for insert to authenticated with check (bucket_id in ('product-images','case-images','news-images','company-assets'));

drop policy if exists "auth update storage" on storage.objects;
create policy "auth update storage" on storage.objects for update to authenticated using (bucket_id in ('product-images','case-images','news-images','company-assets'));

drop policy if exists "auth delete storage" on storage.objects;
create policy "auth delete storage" on storage.objects for delete to authenticated using (bucket_id in ('product-images','case-images','news-images','company-assets'));
