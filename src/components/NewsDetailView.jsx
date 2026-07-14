'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchNewsBySlug } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';

export default function NewsDetailView({ initial }) {
  const [news, setNews] = useState(initial || null);

  useEffect(() => {
    if (!initial?.slug) return;
    fetchNewsBySlug(initial.slug).then((data) => {
      if (data) setNews(data);
    });
  }, [initial?.slug]);

  if (!news) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl mb-4">新闻未找到</h1>
        <Link href="/news" className="btn-primary">返回新闻列表</Link>
      </div>
    );
  }

  return (
    <article className="section">
      <div className="container max-w-3xl">
        <AnimatedSection direction="up">
          <span className="tag-brand mb-4">{news.category}</span>
          <h1 className="text-2xl lg:text-3xl mb-4 text-ink-900">{news.title}</h1>
          <div className="flex items-center gap-4 text-sm text-ink-500 mb-8 pb-6 border-b border-ink-100">
            <span>{news.author || '索然'}</span>
            <span>{news.published_at ? new Date(news.published_at).toLocaleDateString('zh-CN') : ''}</span>
          </div>
        </AnimatedSection>

        {news.cover_image && (
          <AnimatedSection direction="up" delay={0.1}>
            <div className="rounded-2xl overflow-hidden mb-8">
              <Image src={news.cover_image} alt={news.title} width={800} height={450} className="w-full object-cover" />
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection direction="up" delay={0.15}>
          {news.summary && <p className="text-lg text-ink-700 mb-6 leading-relaxed">{news.summary}</p>}
          <div className="prose prose-lg max-w-none text-ink-700 leading-relaxed whitespace-pre-line">
            {news.content}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-12 pt-6 border-t border-ink-100 text-center" direction="up" delay={0.2}>
          <Link href="/news" className="btn-ghost hover:scale-105 transition-transform">← 返回新闻列表</Link>
        </AnimatedSection>
      </div>
    </article>
  );
}
