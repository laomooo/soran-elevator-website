'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

const categories = ['公司新闻', '行业资讯', '产品知识', '技术文章'];
const emptyForm = {
  id: null, slug: '', title: '', category: '公司新闻', summary: '',
  cover_image: '', content: '', author: '索然', published_at: '', is_published: false,
};

export default function AdminNews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setForm({ ...emptyForm, published_at: new Date().toISOString().slice(0, 10) }); setEditing('new'); };
  const openEdit = (n) => {
    setForm({ ...n, published_at: n.published_at ? new Date(n.published_at).toISOString().slice(0, 10) : '' });
    setEditing(n.id);
  };
  const close = () => { setEditing(null); setMsg(''); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    const payload = {
      slug: form.slug,
      title: form.title,
      category: form.category,
      summary: form.summary,
      cover_image: form.cover_image || null,
      content: form.content,
      author: form.author,
      is_published: form.is_published,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
    };
    let error;
    if (form.id) ({ error } = await supabase.from('news').update(payload).eq('id', form.id));
    else ({ error } = await supabase.from('news').insert(payload));
    if (error) setMsg('保存失败：' + error.message);
    else { setMsg('保存成功'); await load(); setTimeout(close, 800); }
    setSaving(false);
  };

  const remove = async (id) => {
    if (!confirm('确定删除该新闻？')) return;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) { alert('删除失败'); return; }
    load();
  };

  const togglePublish = async (n) => {
    await supabase.from('news').update({ is_published: !n.is_published }).eq('id', n.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">新闻管理</h1>
        <button onClick={openNew} className="btn-primary">+ 新增新闻</button>
      </div>

      {loading ? (
        <p className="text-ink-500">加载中...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-100 text-ink-700">
              <tr>
                <th className="text-left p-3">标题</th>
                <th className="text-left p-3 hidden sm:table-cell">分类</th>
                <th className="text-left p-3 hidden md:table-cell">发布日期</th>
                <th className="text-left p-3">状态</th>
                <th className="text-right p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className="border-t border-ink-100">
                  <td className="p-3 font-medium max-w-xs">
                    <div className="flex items-center gap-2">
                      {n.cover_image && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-ink-100 shrink-0">
                          <Image src={n.cover_image} alt={n.title} fill className="object-cover" />
                        </div>
                      )}
                      <span className="truncate">{n.title}</span>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell">{n.category}</td>
                  <td className="p-3 hidden md:table-cell">{n.published_at ? new Date(n.published_at).toLocaleDateString('zh-CN') : '—'}</td>
                  <td className="p-3">
                    <button onClick={() => togglePublish(n)} className={`tag ${n.is_published ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-500'}`}>
                      {n.is_published ? '已发布' : '草稿'}
                    </button>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(n)} className="text-brand-primary hover:underline mr-3">编辑</button>
                    <button onClick={() => remove(n.id)} className="text-red-500 hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-ink-500">暂无新闻</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={close} />
          <div className="relative bg-white w-full max-w-2xl h-full overflow-y-auto p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{form.id ? '编辑新闻' : '新增新闻'}</h2>
              <button onClick={close} className="text-2xl text-ink-500">×</button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL标识(slug) *</label>
                  <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">分类</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none bg-white">
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">标题 *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">封面图</label>
                <ImageUpload
                  bucket="news-images"
                  folder={form.slug || 'default'}
                  value={form.cover_image}
                  onChange={(cover_image) => setForm({ ...form, cover_image })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">摘要</label>
                <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">正文</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none resize-y font-mono text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">作者</label>
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">发布日期</label>
                  <input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none" />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4" />
                <span className="text-sm">立即发布</span>
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
