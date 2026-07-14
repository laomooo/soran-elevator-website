import './globals.css';

export const metadata = {
  title: {
    default: '广州索然电梯配件有限公司 | 一站式电梯配件供应与技术服务专家',
    template: '%s | 索然电梯配件',
  },
  description:
    '广州索然电梯配件有限公司（SORAN），创立于2011年，集研发、生产、销售与服务于一体，主营电梯光幕、电梯空调、钢丝绳、钢带、补偿链、扶手带、电梯电气大配套等全品类配件，累计服务300万+次。',
  keywords: [
    '电梯配件', '电梯光幕', '电梯空调', '电梯钢丝绳', '电梯钢带', '电梯补偿链',
    '扶梯扶手带', '电梯电气配套', '电梯升级改造', '广州索然', 'SORAN',
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1E3A8A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
