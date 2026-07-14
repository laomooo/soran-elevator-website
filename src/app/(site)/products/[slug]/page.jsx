import Link from 'next/link';
import { getProducts, getProductBySlug } from '@/lib/data';
import ProductDetailView from '@/components/ProductDetailView';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  return { title: product ? product.name_cn : '产品详情' };
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl mb-4">产品未找到</h1>
        <Link href="/products" className="btn-primary">返回产品中心</Link>
      </div>
    );
  }

  return (
    <>
      {/* 面包屑 */}
      <div className="bg-ink-100 border-b border-ink-100">
        <div className="container py-3 text-sm text-ink-500">
          <Link href="/" className="hover:text-brand-primary">首页</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-brand-primary">产品中心</Link>
          <span className="mx-2">/</span>
          <span className="text-ink-700">{product.name_cn}</span>
        </div>
      </div>

      <ProductDetailView initial={product} />
    </>
  );
}
