'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUpload from '@/components/ImageUpload';

const emptyService = {
  id: '',
  title: '',
  description: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('business_services')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      setMsg('加载失败：' + error.message);
    } else {
      setServices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (item) => {
    setMsg('保存中...');
    const payload = {
      title: item.title,
      description: item.description,
      image_url: item.image_url || '',
      sort_order: Number(item.sort_order) || 0,
      is_active: item.is_active,
    };

    if (item.id) {
      const { error } = await supabase.from('business_services').update(payload).eq('id', item.id);
      if (error) {
        setMsg('保存失败：' + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('business_services').insert([payload]);
      if (error) {
        setMsg('保存失败：' + error.message);
        return;
      }
    }
    setMsg('保存成功');
    setEditing(null);
    await load();
    setTimeout(() => setMsg(''), 2000);
  };

  const remove = async (id) => {
    if (!confirm('确定删除该主营业务？')) return;
    setMsg('删除中...');
    const { error } = await supabase.from('business_services').delete().eq('id', id);
    if (error) {
      setMsg('删除失败：' + error.message);
    } else {
      setMsg('删除成功');
      await load();
      setTimeout(() => setMsg(''), 2000);
    }
  };

  const handleEdit = (item) => setEditing({ ...item });
  const handleAdd = () => setEditing({ ...emptyService, sort_order: services.length + 1 });

  if (loading) return <p className="text-ink-500">加载中...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">主营业务管理</h1>
        <button onClick={handleAdd} className="btn-primary">新增业务</button>
      </div>
      {msg && <p className={`mb-4 text-sm ${msg.includes('失败') ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}

      {editing && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-4">{editing.id ? '编辑业务' : '新增业务'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">标题</label>
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none focus:border-brand-primary"
                placeholder="如：主流品牌零部件供应"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">描述</label>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-ink-300 outline-none focus:border-brand-primary min-h-[80px]"
                placeholder="请输入业务描述"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">排序</label>
              <input
                type="number"
                value={editing.sort_order}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                className="w-full h-11 px-3 rounded-lg border border-ink-300 outline-none focus:border-brand-primary"
              />
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input
                id="is_active"
                type="checkbox"
                checked={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-ink-300 text-brand-primary focus:ring-brand-primary"
              />
              <label htmlFor="is_active" className="text-sm">启用</label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">业务图片</label>
              <ImageUpload
                bucket="company-assets"
                folder="business-services"
                value={editing.image_url}
                onChange={(url) => setEditing({ ...editing, image_url: url })}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => save(editing)} className="btn-primary">保存</button>
            <button onClick={() => setEditing(null)} className="btn-outline">取消</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((s) => (
          <div key={s.id} className="card p-4 flex flex-col">
            <div className="aspect-[4/3] bg-ink-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
              {s.image_url ? (
                <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-brand-primary/30">★</span>
              )}
            </div>
            <h3 className="font-semibold mb-1">{s.title}</h3>
            <p className="text-sm text-ink-500 line-clamp-2 flex-1">{s.description}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
              <span className="text-xs text-ink-400">排序 {s.sort_order} · {s.is_active ? '启用' : '停用'}</span>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="text-sm text-brand-primary hover:underline">编辑</button>
                <button onClick={() => remove(s.id)} className="text-sm text-red-500 hover:underline">删除</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && !editing && (
        <p className="text-ink-500 text-center py-12">暂无主营业务，点击「新增业务」添加。</p>
      )}
    </div>
  );
}
