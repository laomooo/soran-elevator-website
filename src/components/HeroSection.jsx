'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSettings, fetchCompanyInfo } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';

export default function HeroSection({ settings: initialSettings, info: initialInfo }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [info, setInfo] = useState(initialInfo || {});

  useEffect(() => {
    fetchSettings().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    });
    fetchCompanyInfo().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setInfo((prev) => ({ ...prev, ...data }));
      }
    });
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center text-white overflow-hidden bg-gradient-to-br from-brand-primary via-brand-secondary to-ink-900">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(96,165,250,0.18),transparent_50%)]" />

      <div className="container relative z-10 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl">
          <AnimatedSection delay={0} direction="up">
            <p className="tag bg-white/15 text-white mb-5 backdrop-blur-sm">{info.slogan}</p>
          </AnimatedSection>
          <AnimatedSection delay={0.1} direction="up">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight tracking-tight text-white">
              {settings.hero_title}
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={0.2} direction="up">
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl">
              {settings.hero_subtitle}
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3} direction="up">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/products" className="btn bg-white text-brand-primary hover:bg-ink-100 hover:scale-105 transition-transform">
                查看产品方案
              </Link>
              <Link href="/contact" className="btn border border-white/40 text-white hover:bg-white/10 hover:scale-105 transition-transform">
                立即咨询
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
