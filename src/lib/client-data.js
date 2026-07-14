// 客户端数据获取：页面加载后从 Supabase 拉取最新数据，覆盖静态 HTML 中的兜底/旧数据
'use client';

import { supabase, isSupabaseConfigured } from './supabase';

export async function fetchCategories() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('sort_order');
  return error ? [] : data || [];
}

export async function fetchFeaturedProducts() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .order('sort_order');
  return error ? [] : data || [];
}

export async function fetchProducts() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('products')
    .select('*, product_categories(slug, name_cn)')
    .order('sort_order');
  return error ? [] : data || [];
}

export async function fetchProductBySlug(slug) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  return error ? null : data;
}

export async function fetchNews() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });
  return error ? [] : data || [];
}

export async function fetchNewsBySlug(slug) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();
  return error ? null : data;
}

export async function fetchSettings() {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase.from('site_settings').select('key,value');
  if (error || !data) return {};
  const obj = {};
  data.forEach((r) => (obj[r.key] = r.value));
  return obj;
}

export async function fetchCompanyInfo() {
  if (!isSupabaseConfigured) return {};
  const { data, error } = await supabase.from('company_info').select('key,value');
  if (error || !data) return {};
  const obj = {};
  data.forEach((r) => (obj[r.key] = r.value));
  return obj;
}

export async function fetchBusinessServices() {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('business_services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return error ? [] : data || [];
}
