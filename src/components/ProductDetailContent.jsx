'use client';

import { useEffect, useState } from 'react';
import { fetchProductBySlug } from '@/lib/client-data';
import ProductGallery from './ProductGallery';

export default function ProductDetailContent({ initial }) {
  const [product, setProduct] = useState(initial || null);

  useEffect(() => {
    if (!initial?.slug) return;
    fetchProductBySlug(initial.slug).then((data) => {
      if (data) setProduct(data);
    });
  }, [initial?.slug]);

  if (!product) return null;

  return (
    <AnimatedSection direction="left">
      <ProductGallery images={product.images} alt={product.name_cn} />
    </AnimatedSection>
  );
}
