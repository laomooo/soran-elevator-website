'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';

const navItems = [
  { href: '/', label: '首页' },
  { href: '/about', label: '关于我们' },
  { href: '/products', label: '产品中心' },
  { href: '/solutions', label: '解决方案' },
  { href: '/news', label: '新闻动态' },
  { href: '/contact', label: '联系我们' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 始终使用浅色背景，确保 Logo、文字、菜单按钮在任何页面和滚动位置都清晰可见
  const isLight = true;

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isLight
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-ink-100/50'
          : 'bg-transparent border-b border-white/10'
      }`}
    >
      <nav className="container flex items-center justify-between h-16 lg:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <Logo size={40} />
          <span className="flex flex-col leading-tight">
            <span className={`font-bold text-base lg:text-lg transition-colors ${isLight ? 'text-ink-900' : 'text-white'}`}>
              SORAN
            </span>
            <span className={`text-[10px] lg:text-xs transition-colors ${isLight ? 'text-ink-500' : 'text-white/70'}`}>
              电梯配件专家
            </span>
          </span>
        </Link>

        {/* 桌面端导航 */}
        <ul className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? isLight
                      ? 'text-brand-primary bg-brand-light/10'
                      : 'text-white bg-white/15'
                    : isLight
                      ? 'text-ink-700 hover:text-brand-primary hover:bg-ink-100'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href="tel:020-84040443"
            className={`text-sm px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
              isLight
                ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-sm hover:shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            咨询热线
          </a>
        </div>

        {/* 移动端汉堡按钮 */}
        <button
          className="lg:hidden flex flex-col justify-center w-10 h-10 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="菜单"
        >
          <span className={`block h-0.5 w-6 transition-all ${isLight ? 'bg-ink-900' : 'bg-white'} ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`block h-0.5 w-6 my-1 transition-all ${isLight ? 'bg-ink-900' : 'bg-white'} ${open ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 transition-all ${isLight ? 'bg-ink-900' : 'bg-white'} ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </nav>

      {/* 移动端菜单 */}
      {open && (
        <div className="lg:hidden menu-enter border-t border-white/10 bg-white/98 backdrop-blur-md shadow-lg">
          <ul className="container py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium ${
                    isActive(item.href)
                      ? 'text-brand-primary bg-brand-light/10'
                      : 'text-ink-700 hover:bg-ink-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <a href="tel:020-84040443" className="btn-primary w-full">
                咨询热线 020-84040443
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
