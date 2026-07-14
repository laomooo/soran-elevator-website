import { getCategories, getProducts } from '@/lib/data';
import ProductExplorer from '@/components/ProductExplorer';

export const metadata = { title: '产品中心' };

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
        <div className="container py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">产品中心</h1>
          <p className="text-white/80 text-lg">八大产品分类，覆盖主流电梯品牌配件，一站式满足采购需求</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ProductExplorer categories={categories} products={products} />
        </div>
      </section>
    </>
  );
}
