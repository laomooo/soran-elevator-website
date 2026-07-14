'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProductGallery({ images, alt }) {
  const [active, setActive] = useState(0);
  const list = Array.isArray(images) && images.length > 0 ? images : [];

  if (list.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-light/15 to-ink-100 flex items-center justify-center">
        <span className="text-6xl text-brand-primary/30">🔧</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-light/15 to-ink-100 flex items-center justify-center overflow-hidden">
        <Image
          src={list[active]}
          alt={alt}
          width={600}
          height={600}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
        />
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {list.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-brand-light/15 to-ink-100 border-2 transition-all ${
                active === i ? 'border-brand-primary ring-2 ring-brand-light/30' : 'border-transparent hover:border-ink-200'
              }`}
              aria-label={`查看第 ${i + 1} 张图片`}
            >
              <Image src={url} alt={`${alt} ${i + 1}`} width={150} height={150} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
