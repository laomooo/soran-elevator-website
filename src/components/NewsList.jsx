'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchNews } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';

export default function NewsList({ initial }) {
  const [items, setItems] = useState(initial || []);

  useEffect(() => {
    fetchNews().then((data) => {
      if (data && data.length > 0) setItems(data);
    });
  }, []);

  if (items.length === 0) {
    return <p className="text-center text-ink-500 py-16">暂无新闻</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((n, i) => (
        <AnimatedSection key={n.slug} delay={i * 0.08} direction="up">
          <Link href={`/news/${n.slug}`} className="card group flex flex-col block hover:-translate-y-1.5 transition-all duration-300">
            <div className="aspect-[16/9] bg-gradient-to-br from-brand-primary/10 to-brand-light/10 flex items-center justify-center overflow-hidden">
              {n.cover_image ? (
                <Image src={n.cover_image} alt={n.title} width={400} height={225} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-3xl text-brand-primary/30">📰</span>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="tag-brand mb-3 self-start">{n.category}</span>
              <h3 className="font-semibold mb-2 group-hover:text-brand-primary line-clamp-2 text-ink-900">{n.title}</h3>
              <p className="text-sm text-ink-500 line-clamp-3 mb-3 flex-1">{n.summary}</p>
              <div className="flex items-center justify-between text-xs text-ink-500">
                <span>{n.author || '索然'}</span>
                <span>{n.published_at ? new Date(n.published_at).toLocaleDateString('zh-CN') : ''}</span>
              </div>
            </div>
          </Link>
        </AnimatedSection>
      ))}
    </div>
  );
}
