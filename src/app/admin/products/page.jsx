'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

const emptyForm = {
  id: null,
  category_id: '',
  slug: '',
  name_cn: '',
  model: '',
  brand: '',
  one_line_selling: '',
  description: '',
  specsText: '',
  applicable_scenes: '',
  advantages: '',
  installation_notes: '',
  images: [],
  is_featured: false,
  sort_order: 0,
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: ps }, { data: cs }] = await Promise.all([
      supabase.from('products').select('*').order('sort_order'),
      supabase.from('product_categories').select('*').order('sort_order'),
    ]);
    setItems(ps || []);
    setCats(cs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditing('new');
  };

  const openEdit = (p) => {
    const specs = Array.isArray(p.specs) ? p.specs : (typeof p.specs === 'string' ? JSON.parse(p.specs || '[]') : []);
    setForm({
      ...p,
      images: Array.isArray(p.images) ? p.images : [],
      specsText: specs.map((s) => `${s.label}|${s.value}`).join('\n'),
    });
    setEditing(p.id);
  };

  const close = () => { setEditing(null); setMsg(''); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const specs = form.specsText
      .split('\n')
      .filter((l) => l.trim() && l.includes('|'))
      .map((l) => {
        const [label, ...rest] = l.split('|');
        return { label: label.trim(), value: rest.join('|').trim() };
      });

    const payload = {
      category_id: form.category_id || null,
      slug: form.slug,
      name_cn: form.name_cn,
      model: form.model,
      brand: form.brand,
      one_line_selling: form.one_line_selling,
      description: form.description,
      specs,
      applicable_scenes: form.applicable_scenes,
      advantages: form.advantages,
      installation_notes: form.installation_notes,
      images: Array.isArray(form.images) ? form.images : [],
      is_featured: form.is_featured,
      sort_order: Number(form.sort_order) || 0,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from('products').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('products').insert(payload));
    }
    if (error) {
      setMsg('保存失败：' + error.message);
    } else {
      setMsg('保存成功');
      await load();
      setTimeout(close, 800);
    }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('确定删除该产品？')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) { alert('删除失败：' + error.message); return; }
    load();
  };

  const catName = (id) => (cats.find((c) => c.id === id) || {}).name_cn || '—';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">产品管理</h1>
        <button onClick={openNew} className="btn-primary">+ 新增产品</button>
      </div>

      {loading ? (
        <p className="text-ink-500">加载中...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-100 text-ink-700">
              <tr>
                <th className="text-left p-3">名称</th>
                <th className="text-left p-3 hidden sm:table-cell">分类</th>
                <th className="text-left p-3 hidden md:table-cell">型号</th>
                <th className="text-left p-3 hidden md:table-cell">推荐</th>
                <th className="text-left p-3">排序</th>
                <th className="text-right p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-ink-100">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      {p.images && p.images.length > 0 && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-ink-100 shrink-0">
                          <Image src={p.images[0]} alt={p.name_cn} fill className="object-cover" />
                        </div>
                      )}
                      <span>{p.name_cn}</span>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell">{catName(p.category_id)}</td>
                  <td className="p-3 hidden md:table-cell">{p.model}</td>
                  <td className="p-3 hidden md:table-cell">{p.is_featured ? '★' : '—'}</td>
                  <td className="p-3">{p.sort_order}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-brand-primary hover:underline mr-3">编辑</button>
                    <button onClick={() => remove(p.id)} className="text-red-500 hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-ink-500">暂无产品，点击右上角新增</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 编辑抽屉 */}
      {editing !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative bg-white w-full max-w-2xl h-full overflow-y-auto p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{form.id ? '编辑产品' : '新增产品'}</h2>
              <button onClick={close} className="text-2xl text-ink-500">×</button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">分类</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none bg-white">
                    <option value="">未分类</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name_cn}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL标识(slug) *</label>
                  <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" placeholder="如 sr-t03" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">产品名称 *</label>
                <input required value={form.name_cn} onChange={(e) => setForm({ ...form, name_cn: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">型号</label>
                  <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">适用品牌</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">产品图片</label>
                <ImageUpload
                  bucket="product-images"
                  folder={form.slug || 'default'}
                  multiple
                  value={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">一句话卖点</label>
                <input value={form.one_line_selling} onChange={(e) => setForm({ ...form, one_line_selling: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">产品介绍</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">技术参数（每行一条，格式：标签|值）</label>
                <textarea value={form.specsText} onChange={(e) => setForm({ ...form, specsText: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none resize-none font-mono text-xs" placeholder="型号|G1A1-609AB&#10;防护等级|IP54" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">适用场景</label>
                  <input value={form.applicable_scenes} onChange={(e) => setForm({ ...form, applicable_scenes: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">排序</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">性能优势</label>
                <textarea value={form.advantages} onChange={(e) => setForm({ ...form, advantages: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">安装说明</label>
                <textarea value={form.installation_notes} onChange={(e) => setForm({ ...form, installation_notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none resize-none" />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">设为首页推荐产品</span>
              </label>
              {msg && <p className={`text-sm ${msg.includes('失败') ? 'text-red-500' : 'text-green-600'}`}>{msg}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
                <button type="button" onClick={close} className="btn-ghost">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
