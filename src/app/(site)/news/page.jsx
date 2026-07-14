import { getNews } from '@/lib/data';
import NewsList from '@/components/NewsList';

export const metadata = { title: '新闻动态' };

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      <section className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
        <div className="container py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">新闻动态</h1>
          <p className="text-white/80 text-lg">公司新闻、行业资讯、产品知识与技术文章</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <NewsList initial={news} />
        </div>
      </section>
    </>
  );
}
