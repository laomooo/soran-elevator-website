import Link from 'next/link';
import { getSolutions } from '@/lib/data';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata = { title: '解决方案' };

export default async function SolutionsPage() {
  const solutions = await getSolutions();

  return (
    <>
      <section className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
        <div className="container py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">解决方案</h1>
          <p className="text-white/80 text-lg">从选型到交付的全流程标准化服务</p>
        </div>
      </section>

      <section className="section">
        <div className="container space-y-12 lg:space-y-16">
          {solutions.map((sol, idx) => (
            <AnimatedSection key={sol.slug} delay={idx * 0.1} direction="up">
              <div className="card p-6 lg:p-10 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                  <div className="lg:w-1/3">
                    <span className="text-5xl font-bold text-brand-light/40 mb-3 block">{String(idx + 1).padStart(2, '0')}</span>
                    <h2 className="text-2xl lg:text-3xl mb-3 text-ink-900">{sol.title}</h2>
                    <p className="text-ink-500 mb-5">{sol.summary}</p>
                    <Link href="/contact" className="btn-primary hover:scale-105 transition-transform">咨询方案</Link>
                  </div>

                  <div className="lg:w-2/3 space-y-6">
                    {/* 流程步骤 */}
                    {sol.process_steps && sol.process_steps.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4 text-brand-primary">服务流程</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {sol.process_steps.map((s) => (
                            <div key={s.step} className="text-center p-3 rounded-lg bg-ink-100 hover:bg-ink-200 transition-colors">
                              <div className="w-8 h-8 mx-auto rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold mb-2">
                                {s.step}
                              </div>
                              <div className="text-xs font-medium mb-1">{s.title}</div>
                              <div className="text-[10px] text-ink-500 hidden sm:block">{s.desc}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 系统构成 */}
                    {sol.components && sol.components.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-brand-primary">系统构成</h3>
                        <div className="flex flex-wrap gap-2">
                          {sol.components.map((c, i) => (
                            <span key={i} className="tag-brand">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 优势 */}
                    {sol.advantages && sol.advantages.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3 text-brand-primary">方案优势</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {sol.advantages.map((a, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <span className="text-brand-primary">✓</span>{a}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {sol.applicable_scenes && (
                      <p className="text-sm text-ink-500"><strong className="text-ink-700">适用场景：</strong>{sol.applicable_scenes}</p>
                    )}

                    {sol.content && (
                      <p className="text-sm text-ink-700 leading-relaxed">{sol.content}</p>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </>
  );
}
