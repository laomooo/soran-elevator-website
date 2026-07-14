'use client';

import { useEffect, useState } from 'react';
import { fetchBusinessServices } from '@/lib/client-data';
import AnimatedSection from '@/components/AnimatedSection';

const fallback = [
  { title: '主流品牌零部件供应', description: '多家龙头电梯部件企业核心代理商，一站式满足采购需求', image_url: '' },
  { title: '自主研发生产', description: '电梯空调、梯控系统等加装类产品，品质与交付可控', image_url: '' },
  { title: '技术服务支持', description: '从选型到交付的全流程标准化服务与技术支持', image_url: '' },
];

export default function BusinessServices() {
  const [services, setServices] = useState(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessServices().then((data) => {
      if (data && data.length > 0) setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <section className="section">
      <div className="container">
        <AnimatedSection className="text-center mb-8" direction="up">
          <h2 className="text-2xl lg:text-3xl mb-8 text-ink-900">主营业务</h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((b, i) => (
            <AnimatedSection key={b.id || i} delay={i * 0.1} direction="up">
              <div className="card p-6 lg:p-8 hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col">
                <div className="aspect-[4/3] rounded-lg bg-ink-100 flex items-center justify-center overflow-hidden mb-4">
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-brand-primary/30">★</span>
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-ink-900">{b.title}</h3>
                <p className="text-sm text-ink-500 flex-1">{b.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
