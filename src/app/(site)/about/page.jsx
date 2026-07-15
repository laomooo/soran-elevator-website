import { getCompanyInfo } from '@/lib/data';
import AnimatedSection from '@/components/AnimatedSection';
import BusinessServices from '@/components/BusinessServices';

export const metadata = { title: '关于我们' };

export default async function AboutPage() {
  const info = await getCompanyInfo();

  const milestones = [
    { year: '2011', event: '广州索然电梯配件有限公司成立' },
    { year: '2014', event: '建立自有光幕与空调生产线' },
    { year: '2018', event: '成为多家龙头电梯部件企业核心代理商' },
    { year: '2021', event: '推出电梯升级改造整体解决方案' },
    { year: '至今', event: '累计服务交付突破 300 万+次' },
  ];

  return (
    <>
      {/* 页头 */}
      <section className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
        <div className="container py-14 lg:py-20">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">关于索然</h1>
          <p className="text-white/80 text-lg">{info.slogan}</p>
        </div>
      </section>

      {/* 公司简介 */}
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <AnimatedSection direction="up">
                <h2 className="text-2xl lg:text-3xl mb-6 text-ink-900">公司简介</h2>
                <div className="prose prose-lg max-w-none text-ink-700 leading-relaxed space-y-4">
                  <p>
                    <strong>{info.full_name}</strong>（{info.full_name_en}）创立于 {info.founded_year}，是一家集研发、生产、销售与服务于一体的科技型创新企业，专注于提供电梯部件及技术服务支持。
                  </p>
                  <p>
                    公司主营各大主流电梯品牌零部件，是行业内多家龙头电梯部件生产企业的核心代理商，一站式解决用户所有电梯部件采购需求；同时自主研发生产电梯空调、梯控系统等加装类产品。
                  </p>
                  <p>
                    迄今累计服务次数高达 <strong className="text-brand-primary">{info.service_count}</strong>，覆盖全国众多物业、维保与开发商客户。
                  </p>
                  <p>
                    <strong>企业使命：</strong>为用户提供优质、适配的电梯配件，帮助用户高效解决问题，让电梯安全、稳定、高效运行，让生活更加舒适便捷，促进社会和谐高效发展。
                  </p>
                </div>
              </AnimatedSection>
            </div>
            <div className="space-y-4">
              <AnimatedSection direction="left" delay={0.1}>
                <div className="card p-6 hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-3xl font-bold text-brand-primary mb-1">{info.founded_year}</div>
                  <div className="text-sm text-ink-500">年成立，行业深耕</div>
                </div>
              </AnimatedSection>
              <AnimatedSection direction="left" delay={0.15}>
                <div className="card p-6 hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-3xl font-bold text-brand-primary mb-1">{info.service_count}</div>
                  <div className="text-sm text-ink-500">累计服务交付</div>
                </div>
              </AnimatedSection>
              <AnimatedSection direction="left" delay={0.2}>
                <div className="card p-6 hover:-translate-y-1 transition-transform duration-300">
                  <div className="text-3xl font-bold text-brand-primary mb-1">8 大</div>
                  <div className="text-sm text-ink-500">产品分类全覆盖</div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* 发展历程 */}
      <section className="bg-ink-100 section">
        <div className="container">
          <AnimatedSection className="text-center mb-10" direction="up">
            <h2 className="text-2xl lg:text-3xl mb-10 text-ink-900">发展历程</h2>
          </AnimatedSection>
          <div className="max-w-3xl mx-auto">
            {milestones.map((m, i) => (
              <AnimatedSection key={i} delay={i * 0.08} direction="up">
                <div className="flex gap-4 lg:gap-6 pb-8 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-brand-primary mt-2" />
                    {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-ink-300 mt-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="text-brand-primary font-bold text-lg mb-1">{m.year}</div>
                    <div className="text-ink-700">{m.event}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 主营业务 */}
      <BusinessServices />
    </>
  );
}
