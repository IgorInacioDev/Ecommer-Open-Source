'use client'

import { useQuery } from "@tanstack/react-query"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import Image from "next/image"
import { fetcherProducts } from "@/app/api/products/fetcherProducts"
import { ProductsResponseType, ProductType } from "@/app/types/Product"
import Skeleton from "@/app/components/ui/Skeleton"
import { useCart } from "@/app/contexts/CartContext"

export default function OrderBump() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['order-bump-products'],
    queryFn: async () => fetcherProducts('/api/products?limit=200&shuffle=0&offset=0'),
    refetchInterval: 600000,
    refetchIntervalInBackground: true,
  })

  const { addToCart, openCart } = useCart()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const { list } = products as ProductsResponseType

  const getImageSrc = (product: ProductType, imageIndex: number = 0): string => {
    if (!product.Images?.length) {
      return '/logo.png'
    }

    const image = product.Images[imageIndex]
    if (!image) {
      return '/logo.png'
    }

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
  }

  return (
    <div className="relative font-barlow">
      <h4 className="text-xs tracking-wide text-[#333333] text-center font-bold mb-2">
        VOCÊ TAMBÉM PODE GOSTAR
      </h4>

      <Swiper
        modules={[Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        className="w-full"
      >
        {list.map((product: ProductType) => (
          <SwiperSlide key={product.Id}>
            <div className="flex items-center gap-3 space-x-3 p-6">
              <div className="relative w-[72px] h-[72px] flex items-center justify-center">
                <Image
                  src={getImageSrc(product)}
                  alt={product.name}
                  width={72}
                  height={72}
                  className="object-contain max-w-full max-h-full"
                  sizes="72px"
                />
              </div>

              <div>
                <p className="text-sm">
                  {product.name}
                </p>
                <button
                  className="bg-[#E7002A] w-full tracking-widest text-[#F5F5F5] px-3 py-1 text-xs rounded font-bold"
                  onClick={() => {
                    try {
                      addToCart(product, 1)
                      openCart()
                    } catch (e) {
                      console.error('Falha ao adicionar item ao carrinho:', e)
                    }
                  }}
                >
                  ADICIONAR | R$ {((product.sale_price || product.original_price) / 100).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}