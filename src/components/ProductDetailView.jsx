'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchProductBySlug } from '@/lib/client-data';
import AnimatedSection from './AnimatedSection';
import ProductGallery from './ProductGallery';

export default function ProductDetailView({ initial }) {
  const [product, setProduct] = useState(initial || null);

  useEffect(() => {
    if (!initial?.slug) return;
    fetchProductBySlug(initial.slug).then((data) => {
      if (data) setProduct(data);
    });
  }, [initial?.slug]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl mb-4">产品未找到</h1>
        <Link href="/products" className="btn-primary">返回产品中心</Link>
      </div>
    );
  }

  const specs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs || [];

  return (
    <section className="section">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* 产品图 */}
          <AnimatedSection direction="left">
            <ProductGallery images={product.images} alt={product.name_cn} />
          </AnimatedSection>

          {/* 产品信息 */}
          <AnimatedSection direction="right" delay={0.1}>
            <div>
              <h1 className="text-2xl lg:text-3xl mb-3 text-ink-900">{product.name_cn}</h1>
              {product.model && <p className="text-ink-500 mb-4">型号：<span className="tag-brand">{product.model}</span></p>}
              <p className="text-lg text-ink-700 mb-6">{product.one_line_selling}</p>

              {product.brand && <p className="text-sm text-ink-500 mb-2">适用品牌：{product.brand}</p>}
              {product.applicable_scenes && <p className="text-sm text-ink-500 mb-6">适用场景：{product.applicable_scenes}</p>}

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link href="/contact" className="btn-primary hover:scale-105 transition-transform">获取报价</Link>
                <a href="tel:020-84040443" className="btn-outline hover:scale-105 transition-transform">电话咨询</a>
              </div>

              {product.advantages && (
                <div className="card p-5">
                  <h3 className="font-semibold mb-3">性能优势</h3>
                  <p className="text-sm text-ink-700">{product.advantages}</p>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>

        {/* 详细描述 */}
        {product.description && (
          <AnimatedSection className="mt-12 lg:mt-16" direction="up">
            <h2 className="text-xl lg:text-2xl mb-4 text-ink-900">产品介绍</h2>
            <p className="text-ink-700 leading-relaxed">{product.description}</p>
          </AnimatedSection>
        )}

        {/* 参数表 */}
        {specs.length > 0 && (
          <AnimatedSection className="mt-10" direction="up">
            <h2 className="text-xl lg:text-2xl mb-4 text-ink-900">技术参数</h2>
            <table className="spec-table">
              <tbody>
                {specs.map((s, i) => (
                  <tr key={i}>
                    <th>{s.label}</th>
                    <td>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AnimatedSection>
        )}

        {/* 安装说明 */}
        {product.installation_notes && (
          <AnimatedSection className="mt-10" direction="up">
            <h2 className="text-xl lg:text-2xl mb-4 text-ink-900">安装说明</h2>
            <p className="text-ink-700 leading-relaxed">{product.installation_notes}</p>
          </AnimatedSection>
        )}

        <AnimatedSection className="mt-12 text-center" direction="up">
          <Link href="/products" className="btn-ghost hover:scale-105 transition-transform">← 返回产品中心</Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
