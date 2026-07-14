'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/lib/client-data';
import AnimatedSection from '@/components/AnimatedSection';

export default function ProductExplorer({ categories, products: initialProducts }) {
  const [activeCat, setActiveCat] = useState('all');
  const [products, setProducts] = useState(initialProducts || []);

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data && data.length > 0) setProducts(data);
    });
  }, []);

  const filtered = activeCat === 'all'
    ? products
    : products.filter((p) => {
        const catSlug = p.category_slug || (p.product_categories && p.product_categories.slug);
        return catSlug === activeCat;
      });

  return (
    <>
      {/* 分类筛选 */}
      <AnimatedSection className="flex flex-wrap gap-2 mb-8 justify-center" direction="up">
        <button
          onClick={() => setActiveCat('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            activeCat === 'all' ? 'bg-brand-primary text-white shadow-md' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
          }`}
        >
          全部产品
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCat(cat.slug)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeCat === cat.slug ? 'bg-brand-primary text-white shadow-md' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
            }`}
          >
            {cat.name_cn}
          </button>
        ))}
      </AnimatedSection>

      {/* 产品网格 */}
      {filtered.length === 0 ? (
        <p className="text-center text-ink-500 py-16">暂无该分类产品</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filtered.map((p, i) => (
            <AnimatedSection key={p.slug} delay={i * 0.05} direction="up">
              <Link href={`/products/${p.slug}`} className="card group block hover:-translate-y-1.5 transition-all duration-300">
                <div className="aspect-[4/3] bg-gradient-to-br from-brand-light/20 to-ink-100 flex items-center justify-center overflow-hidden">
                  {p.images && p.images.length > 0 ? (
                    <Image src={p.images[0]} alt={p.name_cn} width={400} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl text-brand-primary/40">🔧</span>
                  )}
                </div>
                <div className="p-4 lg:p-5">
                  <h3 className="font-semibold mb-1 group-hover:text-brand-primary line-clamp-1 text-ink-900">{p.name_cn}</h3>
                  <p className="text-xs text-ink-500 mb-2">型号：{p.model || '—'}</p>
                  <p className="text-sm text-ink-700 line-clamp-2">{p.one_line_selling}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      )}
    </>
  );
}
