'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, news: 0, inquiries: 0, pending: 0 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, n, i, pi] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('news').select('*', { count: 'exact', head: true }),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }),
          supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        ]);
        setStats({
          products: p.count || 0,
          news: n.count || 0,
          inquiries: i.count || 0,
          pending: pi.count || 0,
        });
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const cards = [
    { label: '产品总数', value: stats.products, href: '/admin/products', icon: '🔧', color: 'bg-blue-50 text-brand-primary' },
    { label: '新闻总数', value: stats.news, href: '/admin/news', icon: '📰', color: 'bg-green-50 text-green-600' },
    { label: '留言总数', value: stats.inquiries, href: '/admin/inquiries', icon: '💬', color: 'bg-purple-50 text-purple-600' },
    { label: '待处理留言', value: stats.pending, href: '/admin/inquiries', icon: '⏰', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>
      {!loaded ? (
        <p className="text-ink-500">加载中...</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <Link key={i} href={c.href} className="card p-5 hover:border-brand-primary">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-3 ${c.color}`}>{c.icon}</div>
              <div className="text-2xl font-bold mb-1">{c.value}</div>
              <div className="text-sm text-ink-500">{c.label}</div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 card p-6">
        <h2 className="font-semibold mb-3">快速操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products" className="btn-outline">管理产品</Link>
          <Link href="/admin/news" className="btn-outline">发布新闻</Link>
          <Link href="/admin/company" className="btn-outline">编辑公司信息</Link>
          <Link href="/" className="btn-ghost">查看前台</Link>
        </div>
      </div>
    </div>
  );
}
