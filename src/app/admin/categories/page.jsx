'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

const emptyForm = {
  id: null,
  slug: '',
  name_cn: '',
  name_en: '',
  sort_order: 0,
  short_desc: '',
  image_url: '',
};

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('product_categories').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setForm(emptyForm); setEditing('new'); };
  const openEdit = (c) => { setForm({ ...c }); setEditing(c.id); };
  const close = () => { setEditing(null); setMsg(''); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    const payload = {
      slug: form.slug,
      name_cn: form.name_cn,
      name_en: form.name_en || null,
      sort_order: Number(form.sort_order) || 0,
      short_desc: form.short_desc || null,
      image_url: form.image_url || null,
    };
    let error;
    if (form.id) ({ error } = await supabase.from('product_categories').update(payload).eq('id', form.id));
    else ({ error } = await supabase.from('product_categories').insert(payload));
    if (error) setMsg('保存失败：' + error.message);
    else { setMsg('保存成功'); await load(); setTimeout(close, 800); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('确定删除该分类？该分类下的产品将变为未分类。')) return;
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    if (error) { alert('删除失败：' + error.message); return; }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <button onClick={openNew} className="btn-primary">+ 新增分类</button>
      </div>

      {loading ? (
        <p className="text-ink-500">加载中...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-100 text-ink-700">
              <tr>
                <th className="text-left p-3">分类</th>
                <th className="text-left p-3 hidden sm:table-cell">URL标识</th>
                <th className="text-left p-3">排序</th>
                <th className="text-right p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-ink-100">
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-3">
                      {c.image_url ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-ink-100 shrink-0">
                          <Image src={c.image_url} alt={c.name_cn} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-light/15 flex items-center justify-center text-brand-primary text-lg shrink-0">◆</div>
                      )}
                      <div>
                        <div>{c.name_cn}</div>
                        <div className="text-xs text-ink-500 line-clamp-1">{c.short_desc}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell text-ink-500">{c.slug}</td>
                  <td className="p-3">{c.sort_order}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-brand-primary hover:underline mr-3">编辑</button>
                    <button onClick={() => remove(c.id)} className="text-red-500 hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-ink-500">暂无分类</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative bg-white w-full max-w-2xl h-full overflow-y-auto p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{form.id ? '编辑分类' : '新增分类'}</h2>
              <button onClick={close} className="text-2xl text-ink-500">×</button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL标识(slug) *</label>
                  <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" placeholder="如 elevator-light-curtain" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">排序</label>
                  <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">分类名称 *</label>
                  <input required value={form.name_cn} onChange={(e) => setForm({ ...form, name_cn: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">英文名称</label>
                  <input value={form.name_en || ''} onChange={(e) => setForm({ ...form, name_en: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">分类图片</label>
                <ImageUpload
                  bucket="product-images"
                  folder={`categories/${form.slug || 'default'}`}
                  value={form.image_url}
                  onChange={(image_url) => setForm({ ...form, image_url })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">简短描述</label>
                <input value={form.short_desc || ''} onChange={(e) => setForm({ ...form, short_desc: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
              </div>
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
