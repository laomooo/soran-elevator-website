'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const menu = [
  { href: '/admin', label: '仪表盘', icon: '📊' },
  { href: '/admin/categories', label: '分类管理', icon: '📂' },
  { href: '/admin/products', label: '产品管理', icon: '🔧' },
  { href: '/admin/news', label: '新闻管理', icon: '📰' },
  { href: '/admin/services', label: '主营业务', icon: '🏭' },
  { href: '/admin/inquiries', label: '留言管理', icon: '💬' },
  { href: '/admin/company', label: '公司信息', icon: '🏢' },
];

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl mb-4">后台管理</h1>
        <div className="card p-8 max-w-md mx-auto text-left">
          <p className="text-ink-700 mb-3">⚠️ 尚未配置 Supabase 环境变量</p>
          <p className="text-sm text-ink-500 mb-2">请在项目根目录创建 <code className="bg-ink-100 px-1 rounded">.env.local</code> 文件，填入：</p>
          <pre className="bg-ink-900 text-white text-xs p-3 rounded overflow-x-auto mb-3">{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...`}</pre>
          <p className="text-sm text-ink-500">并执行 <code className="bg-ink-100 px-1 rounded">supabase/schema.sql</code> 创建数据表与策略。</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-20 text-center text-ink-500">加载中...</div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="card p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary text-white font-bold">索</span>
            <div>
              <h1 className="text-xl font-bold">索然后台管理</h1>
              <p className="text-xs text-ink-500">请登录管理账号</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary outline-none"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-lg border border-ink-300 focus:border-brand-primary outline-none"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="btn-primary w-full">登录</button>
            <p className="text-xs text-ink-500 text-center">
              在 Supabase &gt; Authentication &gt; Users 中创建管理员账号
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-100">
      <div className="flex">
        {/* 侧边栏 - 桌面 */}
        <aside className="hidden lg:flex flex-col w-60 bg-ink-900 text-ink-300 min-h-screen sticky top-0">
          <div className="p-5 border-b border-ink-700">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-primary text-white font-bold">索</span>
              <span className="font-bold text-white">索然后台</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {menu.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                  pathname === m.href ? 'bg-brand-primary text-white' : 'hover:bg-ink-700 hover:text-white'
                }`}
              >
                <span>{m.icon}</span>{m.label}
              </Link>
            ))}
          </nav>
          <div className="p-3 border-t border-ink-700">
            <Link href="/" className="block px-4 py-2 text-sm hover:text-white">← 返回前台</Link>
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:text-white">退出登录</button>
          </div>
        </aside>

        {/* 顶部移动端栏 */}
        <div className="flex-1 min-w-0">
          <header className="lg:hidden sticky top-0 z-30 bg-ink-900 text-white px-4 h-14 flex items-center justify-between">
            <span className="font-bold">索然后台</span>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="菜单" className="text-2xl">☰</button>
          </header>

          {/* 移动端抽屉菜单 */}
          {sidebarOpen && (
            <div className="lg:hidden bg-ink-900 text-ink-300 px-3 py-2 space-y-1">
              {menu.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm ${pathname === m.href ? 'bg-brand-primary text-white' : 'hover:bg-ink-700'}`}
                >
                  {m.icon} {m.label}
                </Link>
              ))}
              <Link href="/" className="block px-4 py-3 rounded-lg text-sm hover:bg-ink-700">← 返回前台</Link>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-lg text-sm hover:bg-ink-700">退出登录</button>
            </div>
          )}

          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
