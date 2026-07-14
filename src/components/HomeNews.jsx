'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchNews } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';

export default function HomeNews({ initial }) {
  const [items, setItems] = useState(initial || []);

  useEffect(() => {
    fetchNews().then((data) => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="section">
      <div className="container">
        <AnimatedSection className="flex items-center justify-between mb-8 lg:mb-10" direction="up">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-ink-900">新闻动态</h2>
          <Link href="/news" className="text-brand-primary text-sm hover:underline">查看更多 →</Link>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.slice(0, 3).map((n, i) => (
            <AnimatedSection key={n.slug} delay={i * 0.1} direction="up">
              <Link href={`/news/${n.slug}`} className="card group flex flex-col block hover:-translate-y-1 transition-transform duration-300">
                <div className="aspect-[16/9] bg-gradient-to-br from-brand-primary/10 to-brand-light/10 flex items-center justify-center overflow-hidden">
                  {n.cover_image ? (
                    <Image src={n.cover_image} alt={n.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-3xl text-brand-primary/30">📰</span>
                  )}
                </div>
                <div className="p-5">
                  <span className="tag-brand mb-3">{n.category}</span>
                  <h3 className="font-semibold mb-2 group-hover:text-brand-primary line-clamp-2 text-ink-900">{n.title}</h3>
                  <p className="text-sm text-ink-500 line-clamp-2">{n.summary}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
