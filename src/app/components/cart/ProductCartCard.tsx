
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { useCart } from "@/app/contexts/CartContext";
import Image from "next/image";
import { ProductType } from "@/app/types/Product";
import { cleanImageUrl } from "@/app/utils/cleanImageUrl";

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

interface SelectedVariation {
  variationName: string;
  selectedColor: {
    title: string;
    hex: string;
  };
}

export interface CartItem extends ProductType {
  quantity: number;
  selectedVariations?: SelectedVariation[];
  uniqueId: string;
}

export default function ProductCartCard({ product }: { product: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart();
  return (
    <div className="flex items-start space-x-4 mb-4">
      <Image
        src={getImageSrc(product)}
        alt={product.name}
        className="w-14 h-14 object-contain"
        width={56}
        height={56}
      />
      <div className="flex-1 font-barlow">
        <h3 className="text-sm text-zinc-700 max-w-2/3 mb-2">
          {product.name}
          {product.selectedVariations?.map((selectedVar, index) => (
            <div key={`${selectedVar.variationName}-${selectedVar.selectedColor.title}-${index}`} className="text-xs text-zinc-500 mt-1">
              {selectedVar.variationName}: {selectedVar.selectedColor.title}
            </div>
          ))}
        </h3>
        <div className="flex items-center justify-between mt-2">
          <div className="flex border text-zinc-600 border-zinc-200 px-3 items-center space-x-2">
            <button 
              onClick={() => updateQuantity(product.uniqueId, product.quantity - 1)}
              className="hover:text-red-500 transition-colors"
            >
              <IoMdRemove className="w-3 h-3" />
            </button>
            <span className="text-sm min-w-[20px] text-center">{product.quantity}</span>
            <button 
              onClick={() => updateQuantity(product.uniqueId, product.quantity + 1)}
              className="hover:text-green-500 transition-colors"
            >
              <IoMdAdd className="w-3 h-3" />
            </button>
          </div>
          <div className="text-right">
            <span className="text-sm text-zinc-800">
              R$ {(((product.sale_price || product.original_price) / 100) * product.quantity).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
            {product.quantity > 1 && (
              <div className="text-xs text-zinc-500">
                R$ {((product.sale_price || product.original_price) / 100).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} cada
              </div>
            )}
          </div>
        </div>
        
        {/* Botão para remover item */}
        <button 
          onClick={() => removeFromCart(product.uniqueId)}
          className="text-xs text-red-500 hover:text-red-700 mt-2 transition-colors"
        >
          Remover item
        </button>
      </div>
    </div>
  );
}
