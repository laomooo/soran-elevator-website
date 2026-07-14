'use client';

import { useState } from 'react';

/**
 * 统一 Logo 组件
 * 使用原生 img 标签，避免 Next.js Image 优化在静态导出/开发模式下的异常
 * 自带错误兜底，确保 logo 始终可见
 */
export default function Logo({ size = 40, className = '', bgClass = 'bg-white' }) {
  const [error, setError] = useState(false);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg overflow-hidden ring-1 ring-black/5 shadow-sm ${bgClass} ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {error ? (
        <span className="text-brand-primary font-bold text-xs">SR</span>
      ) : (
        <img
          src="/logo.png"
          alt="SORAN"
          width={size}
          height={size}
          className="w-full h-full object-contain"
          onError={() => setError(true)}
          style={{ display: 'block' }}
        />
      )}
    </span>
  );
}
