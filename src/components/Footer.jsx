import Link from 'next/link';
import Logo from '@/components/Logo';
import { getCompanyInfo, getSettings } from '@/lib/data';

export default async function Footer() {
  const info = await getCompanyInfo();
  const settings = await getSettings();

  return (
    <footer className="bg-ink-900 text-ink-300">
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Logo size={40} />
              <div className="leading-tight">
                <div className="font-bold text-white text-lg">SORAN</div>
                <div className="text-xs text-ink-500">{info.full_name_en}</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4 max-w-md">
              {info.full_name}，创立于 {info.founded_year}，集研发、生产、销售与服务于一体的科技型创新企业，专注电梯配件供应与技术服务。
            </p>
            <p className="text-sm text-brand-light">{info.slogan}</p>
          </div>

          {/* 快速导航 */}
          <div>
            <h4 className="text-white font-semibold mb-4">快速导航</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">关于我们</Link></li>
              <li><Link href="/products" className="hover:text-white">产品中心</Link></li>
              <li><Link href="/solutions" className="hover:text-white">解决方案</Link></li>
              <li><Link href="/news" className="hover:text-white">新闻动态</Link></li>
              <li><Link href="/contact" className="hover:text-white">联系我们</Link></li>
            </ul>
          </div>

          {/* 联系方式 */}
          <div>
            <h4 className="text-white font-semibold mb-4">联系我们</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`tel:${info.hotline}`} className="hover:text-white block">
                  <span className="text-ink-500">热线：</span>{info.hotline}
                </a>
              </li>
              <li>
                <a href={`tel:${info.mobile}`} className="hover:text-white block">
                  <span className="text-ink-500">手机：</span>{info.mobile}（{info.contact_person}）
                </a>
              </li>
              <li>
                <a href={`mailto:${info.email}`} className="hover:text-white block break-all">
                  <span className="text-ink-500">邮箱：</span>{info.email}
                </a>
              </li>
              <li className="pt-1">
                <span className="text-ink-500">地址：</span>{info.address}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-ink-700">
        <div className="container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} {settings.footer_copyright} 版权所有</p>
          <p>粤ICP备XXXXXXXX号</p>
        </div>
      </div>
    </footer>
  );
}
