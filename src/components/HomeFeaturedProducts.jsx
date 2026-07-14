'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchFeaturedProducts } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';

export default function HomeFeaturedProducts({ initial }) {
  const [items, setItems] = useState(initial || []);

  useEffect(() => {
    fetchFeaturedProducts().then((data) => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="bg-ink-100 section">
      <div className="container">
        <AnimatedSection className="text-center mb-10 lg:mb-12" direction="up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-3 text-ink-900">明星产品</h2>
          <p className="text-ink-500">精选热销配件，品质可靠</p>
        </AnimatedSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {items.slice(0, 4).map((p, i) => (
            <AnimatedSection key={p.slug} delay={i * 0.08} direction="up">
              <Link href={`/products/${p.slug}`} className="card group block hover:-translate-y-1 transition-transform duration-300">
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-light/20 to-ink-100 flex items-center justify-center overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <Image src={p.images[0]} alt={p.name_cn} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl text-brand-primary/40">🔧</span>
                  )}
                </div>
                <div className="p-4 lg:p-5">
                  <h3 className="font-semibold mb-1 group-hover:text-brand-primary line-clamp-1 text-ink-900">{p.name_cn}</h3>
                  <p className="text-xs text-ink-500 mb-2">型号：{p.model}</p>
                  <p className="text-sm text-ink-700 line-clamp-2">{p.one_line_selling}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
