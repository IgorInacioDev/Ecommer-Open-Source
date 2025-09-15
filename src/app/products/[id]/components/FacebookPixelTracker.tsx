'use client';

import { useEffect } from 'react';
import { ProductType } from '@/app/types/Product';

interface FacebookPixelTrackerProps {
  product: ProductType;
}

const FacebookPixelTracker = ({ product }: FacebookPixelTrackerProps) => {
  useEffect(() => {
    if (!product || typeof window === 'undefined' || typeof window.fbq !== 'function') return;

    try {
      const pixelProduct = {
        content_ids: [product.Id.toString()],
        content_name: product.name,
        content_type: 'product',
        value: (product.sale_price || product.original_price) / 100,
        currency: 'BRL',
        contents: [{
          id: product.Id.toString(),
          quantity: 1,
          item_price: (product.sale_price || product.original_price) / 100
        }]
      };
      
      (window as any).fbq('track', 'ViewContent', pixelProduct);
    } catch (error) {
      console.error('Error tracking ViewContent event:', error);
    }
  }, [product]);

  return null; // Este componente não renderiza nada
};

export default FacebookPixelTracker;