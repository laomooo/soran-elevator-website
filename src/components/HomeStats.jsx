// 首页核心数据：客户端获取最新站点设置，确保后台修改后前台刷新即更新
'use client';

import { useEffect, useState } from 'react';
import { fetchSettings } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';
import AnimatedCounter from './AnimatedCounter';

export default function HomeStats({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {});

  useEffect(() => {
    fetchSettings().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    });
  }, []);

  const stats = [
    { value: settings.stat_founded, label: '行业积淀' },
    { value: settings.stat_service, label: '服务交付' },
    { value: settings.stat_brands, label: '产品覆盖' },
    { value: settings.stat_factory, label: '研发生产' },
  ];

  return (
    <section className="bg-white border-b border-ink-100">
      <div className="container py-10 lg:py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <AnimatedSection key={i} delay={i * 0.08} direction="up" className="text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-primary mb-1">
                <AnimatedCounter value={s.value} />
              </div>
              <div className="text-sm text-ink-500">{s.label}</div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
