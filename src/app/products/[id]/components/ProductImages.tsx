'use client'

import { useState, useRef } from "react";
import Image from "next/image";
import { ProductType } from "@/app/types/Product";

export default function ProductImages({ product }: { product: ProductType }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const thumbnailsRef = useRef<HTMLDivElement>(null);
  const thumbnailHeight = 80; // altura de cada thumbnail + gap
  const maxVisibleThumbnails = 7; // máximo de thumbnails visíveis

  const getImageSrc = (product: ProductType, imageIndex: number = 0) => {
    const image = product.Images[imageIndex];
    const imagePath = image?.path || image?.url || '';
    
    // Se a URL contém tanto o domínio do banco quanto o da Ollie, remove o prefixo do banco
    if (imagePath.includes('https://white-nocodb.5zd9ii.easypanel.host') && imagePath.includes('https://meuollie.com.br/')) {
      return imagePath.replace('https://white-nocodb.5zd9ii.easypanel.host/', '');
    }
    
    // Se não tem URL completa, adiciona o prefixo do banco
    if (!imagePath.startsWith('http')) {
      return `https://white-nocodb.5zd9ii.easypanel.host/${imagePath}`;
    }
    
    return imagePath;
  };

  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (thumbnailsRef.current) {
      const scrollAmount = thumbnailHeight;
      const currentScroll = thumbnailsRef.current.scrollTop;
      const newScroll = direction === 'up' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      thumbnailsRef.current.scrollTo({
        top: newScroll,
        behavior: 'smooth'
      });
    }
  };

  const canScrollUp = () => {
    return thumbnailsRef.current ? thumbnailsRef.current.scrollTop > 0 : false;
  };

  const canScrollDown = () => {
    if (!thumbnailsRef.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = thumbnailsRef.current;
    return scrollTop < scrollHeight - clientHeight - 5;
  };

  return(
    <div className="max-w-[700px] max-h-[600px] w-full h-full">
      {/* Image Gallery */}
      <div className="flex flex-col lg:flex-row gap-4 h-full">
        {/* Main Image - Top on mobile, Right on desktop */}
        <div className="flex-1 relative overflow-hidden order-1 lg:order-2 min-h-[400px] lg:min-h-0">
          <Image
            src={getImageSrc(product, selectedImage)}
            alt={product.name}
            fill
            className="object-contain p-18"
            priority
          />
        </div>
        
        {/* Thumbnails Carousel - Bottom on mobile, Left on desktop */}
        {product.Images && product.Images.length > 1 && (
          <div className="flex lg:flex-col w-full lg:w-22 h-22 lg:h-full relative order-2 lg:order-1 flex-shrink-0">
            {/* Scroll Left/Up Button */}
            {product.Images.length > maxVisibleThumbnails && (
              <button
                onClick={() => scrollThumbnails('up')}
                className={`absolute lg:top-0 left-0 lg:left-0 lg:right-0 z-20  lg:w-auto h-full lg:h-8 bg-gradient-to-r lg:bg-gradient-to-b from-white to-transparent flex items-center justify-center transition-opacity ${
                  canScrollUp() ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'
                }`}
                disabled={!canScrollUp()}
              >
                <svg className="w-4 h-4 text-gray-600 rotate-270 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
            
            {/* Thumbnails Container */}
            <div 
              ref={thumbnailsRef}
              className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto flex-1 py-2 px-2 lg:px-0"
              style={{ 
                maxHeight: '100%',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {product.Images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`ml-2 relative aspect-square overflow-hidden transition-all flex-shrink-0 ${
                    selectedImage === index 
                      ? 'ring-2 ring-red-500 opacity-100' 
                      : 'ring-1 ring-gray-200 opacity-70 hover:opacity-100'
                  }`}
                  style={{ height: '72px', width: '72px' }}
                >
                  <Image
                    src={getImageSrc(product, index)}
                    alt={`${product.name} - ${index + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
            
            {/* Scroll Right/Down Button */}
            {product.Images.length > maxVisibleThumbnails && (
              <button
                onClick={() => scrollThumbnails('down')}
                className={`absolute lg:bottom-0 right-0 lg:left-0 lg:right-0 z-20 w-8 lg:w-auto h-full lg:h-8 bg-gradient-to-l lg:bg-gradient-to-t from-white to-transparent flex items-center justify-center transition-opacity ${
                  canScrollDown() ? 'opacity-100 hover:opacity-80' : 'opacity-30 cursor-not-allowed'
                }`}
                disabled={!canScrollDown()}
              >
                <svg className="w-4 h-4 text-gray-600 -rotate-90 lg:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
