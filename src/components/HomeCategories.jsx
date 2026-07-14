'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchCategories } from '@/lib/client-data';
import AnimatedSection from '@/components/AnimatedSection';

export default function HomeCategories({ initial = [] }) {
  const [categories, setCategories] = useState(initial || []);

  useEffect(() => {
    fetchCategories().then((data) => {
      if (data && data.length > 0) setCategories(data);
    });
  }, []);

  return (
    <section className="section">
      <div className="container">
        <AnimatedSection className="text-center mb-10 lg:mb-12" direction="up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-3 text-ink-900">产品中心</h2>
          <p className="text-ink-500 max-w-2xl mx-auto">八大产品分类，覆盖主流电梯品牌配件，一站式满足采购需求</p>
        </AnimatedSection>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <AnimatedSection key={cat.slug} delay={i * 0.06} direction="up">
              <Link
                href={`/products?cat=${cat.slug}`}
                className="card p-4 lg:p-5 group h-full block hover:-translate-y-1 transition-transform duration-300 overflow-hidden"
              >
                <div className="w-full aspect-[4/3] rounded-lg bg-gradient-to-br from-brand-light/15 to-ink-100 flex items-center justify-center overflow-hidden mb-4">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name_cn}
                      width={300}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-3xl text-brand-primary/40 group-hover:text-brand-primary/60 transition-colors">◆</span>
                  )}
                </div>
                <h3 className="text-base lg:text-lg font-semibold mb-1 text-ink-900">{cat.name_cn}</h3>
                <p className="text-xs lg:text-sm text-ink-500 line-clamp-2">{cat.short_desc}</p>
              </Link>
            </AnimatedSection>
          ))}
        </div>
        <AnimatedSection className="text-center mt-8" delay={0.2} direction="up">
          <Link href="/products" className="btn-outline hover:scale-105 transition-transform">查看全部产品</Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
