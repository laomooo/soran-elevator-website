'use client';

import { useEffect, useState, useRef, useMemo } from 'react';

/**
 * 数字滚动动画组件
 * 支持：
 *   - "2011 年成立" → 数字 2011 动画增长，文字保持不动
 *   - "300 万+ 次服务交付" → 数字 300 动画增长，保留 + 号
 *   - 纯文本无数字时直接显示文本
 */
export default function AnimatedCounter({ value, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [started, setStarted] = useState(false);

  const parts = useMemo(() => {
    const str = String(value || '');
    const match = str.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const num = parseFloat(match[1]);
      const idx = match.index;
      return {
        prefix: str.slice(0, idx),
        num,
        suffix: str.slice(idx + match[1].length),
      };
    }
    return { prefix: str, num: 0, suffix: '' };
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || parts.num === 0) return;
    const start = performance.now();
    let raf;
    const isFloat = parts.num % 1 !== 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parts.num * eased;
      setCount(isFloat ? Number(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, parts.num, duration]);

  return (
    <span ref={ref}>
      {parts.prefix}
      {parts.num !== 0 ? count : ''}
      {parts.suffix}
    </span>
  );
}
