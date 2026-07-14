// 首页 CTA：客户端获取最新公司信息，确保电话、标题等后台修改后刷新即更新
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchSettings, fetchCompanyInfo } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';

export default function HomeCTA({ initialSettings, initialInfo }) {
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
    <section className="bg-brand-primary text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(96,165,250,0.2),transparent_50%)]" />
      <div className="container relative py-14 lg:py-20 text-center">
        <AnimatedSection direction="up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-4 text-white">{settings.cta_title}</h2>
        </AnimatedSection>
        <AnimatedSection direction="up" delay={0.1}>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">专业团队快速响应，提供适配方案与报价</p>
        </AnimatedSection>
        <AnimatedSection direction="up" delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={`tel:${info.hotline}`} className="btn bg-white text-brand-primary hover:bg-ink-100 hover:scale-105 transition-transform">
              电话咨询 {info.hotline}
            </a>
            <Link href="/contact" className="btn border border-white/40 text-white hover:bg-white/10 hover:scale-105 transition-transform">
              在线留言
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
