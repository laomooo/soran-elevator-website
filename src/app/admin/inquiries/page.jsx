'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const statusMap = {
  pending: { label: '待处理', color: 'bg-orange-100 text-orange-700' },
  handled: { label: '已处理', color: 'bg-green-100 text-green-700' },
  closed: { label: '已关闭', color: 'bg-ink-100 text-ink-500' },
};

export default function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from('inquiries').update({ status }).eq('id', id);
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));
    if (detail && detail.id === id) setDetail({ ...detail, status });
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">留言管理</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'pending', 'handled', 'closed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-brand-primary text-white' : 'bg-ink-100 text-ink-700'}`}
          >
            {f === 'all' ? '全部' : statusMap[f].label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink-500">加载中...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-100 text-ink-700">
              <tr>
                <th className="text-left p-3">姓名</th>
                <th className="text-left p-3 hidden sm:table-cell">电话</th>
                <th className="text-left p-3 hidden md:table-cell">类型</th>
                <th className="text-left p-3 hidden lg:table-cell">提交时间</th>
                <th className="text-left p-3">状态</th>
                <th className="text-right p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t border-ink-100">
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3 hidden sm:table-cell"><a href={`tel:${i.phone}`} className="text-brand-primary">{i.phone}</a></td>
                  <td className="p-3 hidden md:table-cell">{i.inquiry_type}</td>
                  <td className="p-3 hidden lg:table-cell">{new Date(i.created_at).toLocaleString('zh-CN')}</td>
                  <td className="p-3"><span className={`tag ${statusMap[i.status].color}`}>{statusMap[i.status].label}</span></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button onClick={() => setDetail(i)} className="text-brand-primary hover:underline mr-3">查看</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-ink-500">暂无留言</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* 详情抽屉 */}
      {detail && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative bg-white w-full max-w-lg h-full overflow-y-auto p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">留言详情</h2>
              <button onClick={() => setDetail(null)} className="text-2xl text-ink-500">×</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><div className="text-ink-500">姓名</div><div className="font-medium">{detail.name}</div></div>
                <div><div className="text-ink-500">公司</div><div className="font-medium">{detail.company || '—'}</div></div>
                <div><div className="text-ink-500">电话</div><div className="font-medium"><a href={`tel:${detail.phone}`} className="text-brand-primary">{detail.phone}</a></div></div>
                <div><div className="text-ink-500">邮箱</div><div className="font-medium break-all">{detail.email || '—'}</div></div>
                <div><div className="text-ink-500">咨询类型</div><div className="font-medium">{detail.inquiry_type}</div></div>
                <div><div className="text-ink-500">提交时间</div><div className="font-medium">{new Date(detail.created_at).toLocaleString('zh-CN')}</div></div>
              </div>
              <div>
                <div className="text-ink-500 text-sm mb-1">需求描述</div>
                <div className="card p-4 text-ink-700 whitespace-pre-line">{detail.message}</div>
              </div>
              <div>
                <div className="text-ink-500 text-sm mb-2">状态管理</div>
                <div className="flex gap-2">
                  {Object.entries(statusMap).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => updateStatus(detail.id, k)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${detail.status === k ? 'bg-brand-primary text-white' : 'bg-ink-100 text-ink-700'}`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4">
                <a href={`tel:${detail.phone}`} className="btn-primary w-full">立即回电</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
