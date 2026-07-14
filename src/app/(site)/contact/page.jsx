import ContactForm from '@/components/ContactForm';
import { getCompanyInfo } from '@/lib/data';
import AnimatedSection from '@/components/AnimatedSection';

export const metadata = { title: '联系我们' };

export default async function ContactPage() {
  const info = await getCompanyInfo();

  const contactItems = [
    { label: '服务热线', value: info.hotline, href: `tel:${info.hotline}`, icon: '☎' },
    { label: '手机', value: `${info.mobile}（${info.contact_person}）`, href: `tel:${info.mobile}`, icon: '📱' },
    { label: '邮箱', value: info.email, href: `mailto:${info.email}`, icon: '✉' },
    { label: 'QQ', value: info.qq, href: `mqqwpa://im/chat?chat_type=wpa&uin=${info.qq}`, icon: '💬' },
  ];

  return (
    <>
      <section className="bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
        <div className="container py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-white">联系我们</h1>
          <p className="text-white/80 text-lg">专业团队快速响应，提供适配方案与报价</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 联系信息 */}
            <AnimatedSection direction="left">
              <div>
                <h2 className="text-2xl mb-6 text-ink-900">联系方式</h2>
                <div className="space-y-4 mb-8">
                  {contactItems.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      className="card p-5 flex items-center gap-4 hover:border-brand-primary hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <div className="w-12 h-12 rounded-lg bg-brand-light/15 flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-sm text-ink-500">{item.label}</div>
                        <div className="font-semibold text-ink-900">{item.value}</div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="card p-5 hover:-translate-y-0.5 transition-transform duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-light/15 flex items-center justify-center text-xl shrink-0">📍</div>
                    <div>
                      <div className="text-sm text-ink-500 mb-1">公司地址</div>
                      <div className="font-medium mb-2 text-ink-900">{info.address}</div>
                      <div className="text-sm text-ink-500">工作时间：{info.work_hours}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl overflow-hidden border border-ink-100 h-48">
                  <iframe
                    title="公司位置"
                    src="https://map.baidu.com/?qt=poi&wd=广州市白云区嘉禾街新科科甲联兴路6号"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
              </div>
            </AnimatedSection>

            {/* 在线留言表单 */}
            <AnimatedSection direction="right" delay={0.1}>
              <div>
                <h2 className="text-2xl mb-6 text-ink-900">在线留言</h2>
                <ContactForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
