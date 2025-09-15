"use client"

import Image from "next/image";
import UTMLink from "@/app/components/common/UTMLink";
import { useState } from "react";
import { useCart } from "../../contexts/CartContext";
import { ProductType } from "@/app/types/Product";

const ProductCard = ({ product, showButton }: { product: ProductType, showButton: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const { addToCart, openCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    openCart();
  };

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

  return (
    <UTMLink href={`/products/${product.Id}`} className=" flex flex-col h-full group cursor-pointer">
      <div
        className="relative mb-3 aspect-[2/3] max-h-[350px] overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Container de desconto */}
        {product.sale_price && (
          <div className="absolute font-barlow top-2 left-2 bg-orange-600 text-[#F5F5F5] text-xs font-bold px-2 py-1 rounded z-10">
            -{Math.round(((product.original_price - product.sale_price) / product.original_price) * 100)}%
          </div>
        )}
        {/* Imagem principal */}
        {product.Images && product.Images.length > 0 ? (
          <Image
            src={getImageSrc(product)}
            alt={product.name}
            fill
            className={`object-contain p-4 transition-opacity duration-100 ${hovered ? "opacity-0" : "opacity-100"}`}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sem imagem</span>
          </div>
        )}

        {/* Segunda imagem (aparece no hover) */}
        {product.Images && product.Images.length > 1 && (
          <Image
            src={getImageSrc(product, 1)}
            alt={product.name}
            fill
            className={`object-contain p-4 transition-opacity duration-1000 ${hovered ? "opacity-100" : "opacity-0"}`}
            unoptimized
          />
        )}
      </div>

      <div className="flex mb-3 flex-col gap-2">
        <p className="text-md font-syne text-[#333333]">{product.name}</p>
        {product.sale_price ? (
          <div className="flex flex-col">
            <p className="text-sm font-barlow text-gray-500 line-through">
              R${(product.original_price / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
            <p className="text-md font-barlow font-bold text-red-600">
              R${(product.sale_price / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
        ) : (
          <p className="text-md font-barlow font-bold text-[#333333]">
            R${(product.original_price / 100).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        )}
      </div>

      {product.variations && product.variations.length < 2 && (
        <div className="flex items-center gap-3 mb-2">
          {product.variations[0].colors.map((color, colorIndex) => {
            return (
              <div key={colorIndex} className="w-5 h-5 rounded-xs cursor-pointer" style={{ backgroundColor: color.hex }}></div>
            )
          })}
        </div>
      )}
      
      {showButton && (
        <button 
          onClick={handleAddToCart}
          className="mt-auto w-full flex justify-center items-center text-sm font-extrabold tracking-widest font-barlow text-[#F5F5F5] bg-[#212122] py-2 group-hover:bg-red-600 transition-colors"
        >
          COMPRAR
        </button>
      )}
    </UTMLink>
  );
};

export default ProductCard;
