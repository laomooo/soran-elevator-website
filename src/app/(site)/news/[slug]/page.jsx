import Link from 'next/link';
import { getNews, getNewsBySlug } from '@/lib/data';
import NewsDetailView from '@/components/NewsDetailView';

export async function generateStaticParams() {
  const news = await getNews();
  return news.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const news = await getNewsBySlug(params.slug);
  return { title: news ? news.title : '新闻详情' };
}

export default async function NewsDetailPage({ params }) {
  const news = await getNewsBySlug(params.slug);

  if (!news) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl mb-4">新闻未找到</h1>
        <Link href="/news" className="btn-primary">返回新闻列表</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-ink-100 border-b border-ink-100">
        <div className="container py-3 text-sm text-ink-500">
          <Link href="/" className="hover:text-brand-primary">首页</Link>
          <span className="mx-2">/</span>
          <Link href="/news" className="hover:text-brand-primary">新闻动态</Link>
          <span className="mx-2">/</span>
          <span className="text-ink-700 line-clamp-1">{news.title}</span>
        </div>
      </div>

      <NewsDetailView initial={news} />
    </>
  );
}
