import Image from "next/image";
import Link from "next/link";
import { ProductType } from "@/app/types/Product";

interface ServerProductCardProps {
  product: ProductType;
}

const ServerProductCard = ({ product }: ServerProductCardProps) => {
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
    <Link href={`/products/${product.Id}`} className="flex font-barlow flex-col h-full group cursor-pointer">
      <div className="relative mb-3 aspect-[2/3] max-h-[350px] overflow-hidden">
        {/* Container de desconto */}
        {product.sale_price && (
          <div className="absolute font-barlow top-2 left-2 bg-orange-600 text-[#F5F5F5] text-xs font-bold px-2 py-1 rounded z-10">
            -{Math.round(((product.original_price - product.sale_price) / product.original_price) * 100)}%
          </div>
        )}
        
        {/* Imagem principal */}
        <Image
          src={getImageSrc(product, 0)}
          alt={product.name}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Imagem hover se disponível */}
        {product.Images.length > 1 && (
          <Image
            src={getImageSrc(product, 1)}
            alt={product.name}
            fill
            className="object-contain p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}
      </div>

      {/* Informações do produto */}
      <div className="flex flex-col flex-grow">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Avaliações */}
        {product.reviewsCount && (
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-1">({product.reviewsCount})</span>
          </div>
        )}
        
        {/* Preços */}
        <div className="flex items-center gap-2 mt-auto">
          {product.sale_price ? (
            <>
              <span className="text-lg font-bold text-red-600">
                R$ {(product.sale_price / 100).toFixed(2).replace('.', ',')}
              </span>
              <span className="text-sm text-gray-500 line-through">
                R$ {(product.original_price / 100).toFixed(2).replace('.', ',')}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              R$ {(product.original_price / 100).toFixed(2).replace('.', ',')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ServerProductCard;