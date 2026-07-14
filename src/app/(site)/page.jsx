import Link from 'next/link';
import Image from 'next/image';
import { getSettings, getCategories, getFeaturedProducts, getSolutions, getNews, getCompanyInfo } from '@/lib/data';
import AnimatedSection from '@/components/AnimatedSection';
import HeroSection from '@/components/HeroSection';
import HomeStats from '@/components/HomeStats';
import HomeCategories from '@/components/HomeCategories';
import HomeFeaturedProducts from '@/components/HomeFeaturedProducts';
import HomeNews from '@/components/HomeNews';
import HomeCTA from '@/components/HomeCTA';

const serviceAdvantages = [
  { title: '快速响应', desc: '7×24 小时客户服务，需求及时响应' },
  { title: '现场勘测', desc: '工程师上门勘测，精准掌握现场条件' },
  { title: '提供方案', desc: '根据需求定制选型与解决方案' },
  { title: '快速交付', desc: '现货充足，物流高效，快速到货' },
  { title: '现场安装', desc: '专业安装团队，规范施工交付' },
  { title: '技术支持', desc: '全周期技术支持，售后无忧' },
];

export default async function HomePage() {
  const [settings, categories, featured, solutions, news, info] = await Promise.all([
    getSettings(),
    getCategories(),
    getFeaturedProducts(),
    getSolutions(),
    getNews(),
    getCompanyInfo(),
  ]);

  return (
    <>
      {/* Hero */}
      <HeroSection settings={settings} info={info} />

      {/* 核心数据 */}
      <HomeStats initialSettings={settings} />

      {/* 产品中心 */}
      <HomeCategories initial={categories} />

      {/* 解决方案 */}
      <section className="bg-ink-100 section">
        <div className="container">
          <AnimatedSection className="text-center mb-10 lg:mb-12" direction="up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-3 text-ink-900">解决方案</h2>
            <p className="text-ink-500">从选型到交付的全流程标准化服务</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {solutions.map((sol, i) => (
              <AnimatedSection key={sol.slug} delay={i * 0.1} direction="up">
                <Link href="/solutions" className="card p-6 lg:p-8 group block hover:-translate-y-1 transition-transform duration-300">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-3 group-hover:text-brand-primary text-ink-900">{sol.title}</h3>
                  <p className="text-ink-500 mb-5">{sol.summary}</p>
                  {sol.process_steps && sol.process_steps.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sol.process_steps.map((s) => (
                        <span key={s.step} className="tag-brand">{s.step}. {s.title}</span>
                      ))}
                    </div>
                  )}
                  {sol.components && sol.components.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {sol.components.slice(0, 6).map((c, i) => (
                        <span key={i} className="tag-brand">{c}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 服务优势 */}
      <section className="section">
        <div className="container">
          <AnimatedSection className="text-center mb-10 lg:mb-12" direction="up">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl mb-3 text-ink-900">服务优势</h2>
            <p className="text-ink-500">快速响应 → 现场勘测 → 提供方案 → 快速交付 → 现场安装 → 技术支持 → 售后服务</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceAdvantages.map((a, i) => (
              <AnimatedSection key={i} delay={i * 0.06} direction="up">
                <div className="text-center p-4 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-light/15 flex items-center justify-center text-brand-primary font-bold mb-3">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold mb-1 text-sm lg:text-base text-ink-900">{a.title}</h3>
                  <p className="text-xs text-ink-500 hidden lg:block">{a.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 推荐产品 */}
      <HomeFeaturedProducts initial={featured} />

      {/* 新闻动态 */}
      <HomeNews initial={news} />

      {/* CTA */}
      <HomeCTA initialSettings={settings} initialInfo={info} />
    </>
  );
}
