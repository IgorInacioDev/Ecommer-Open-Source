import { useState, ChangeEvent } from "react";
import { useCart } from "@/app/contexts/CartContext";
import { useCheckout } from "@/app/contexts/CheckoutContext";
import Image from "next/image";

export default function ResumeOrder() {
  const { items, getTotalPrice } = useCart();
  const { appliedCoupon, setAppliedCoupon, calculateFinalTotal, selectedShipping, selectedPaymentMethod } = useCheckout();

  // Estado local para o código de desconto
  const [discountCode, setDiscountCode] = useState<string>("");

  // Manipulador de mudança do input de desconto
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDiscountCode(e.target.value.toUpperCase());
  };

  // Função para aplicar o desconto
  const applyDiscount = () => {
    if (!discountCode.trim()) {
      alert('Digite um código de cupom válido');
      return;
    }
    
    // Check if coupon is already applied
    if (appliedCoupon && appliedCoupon.code === discountCode.toUpperCase()) {
      alert('Este cupom já está aplicado!');
      return;
    }
    
    // Enhanced coupon validation with more options
    const validCoupons = {
      'DESCONTO10': { discount: 10, description: 'Desconto de 10%' },
      'FRETE15': { discount: 15, description: 'Desconto de 15%' },
      'BEMVINDO5': { discount: 5, description: 'Desconto de boas-vindas 5%' },
      'SAVE20': { discount: 20, description: 'Super desconto de 20%' },
      'PRIMEIRA': { discount: 12, description: 'Primeira compra 12%' },
      'CLIENTE10': { discount: 10, description: 'Cliente fiel 10%' }
    };
    
    const couponData = validCoupons[discountCode.toUpperCase() as keyof typeof validCoupons];
    
    if (couponData) {
      setAppliedCoupon({ code: discountCode.toUpperCase(), discount: couponData.discount });
      setDiscountCode(''); // Clear input after successful application
      alert(`✅ Cupom aplicado com sucesso!\n${couponData.description}`);
    } else {
      alert('❌ Cupom inválido ou expirado\nVerifique o código e tente novamente.');
    }
  };
  
  // Remove applied coupon
  const removeCoupon = () => {
    setAppliedCoupon(null);
    alert('Cupom removido com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm sticky top-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revise os itens antes de finalizar
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Após a finalização, não será possível solicitar ou fazer alterações no pedido.
        </p>
        {/* Itens do Pedido */}
        <div className="space-y-4 mb-6">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum item no carrinho</p>
              <p className="text-sm mt-2">Adicione produtos para continuar</p>
            </div>
          ) : (
            items.map((item) => {
              const getImageSrc = (product: { Images: Array<{ url?: string; path?: string }> }, imageIndex: number = 0) => {
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
                <div key={item.uniqueId} className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
                      <Image
                        src={getImageSrc(item)}
                        alt={item.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-product.jpg";
                        }}
                        width={60}
                        height={60}
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-gray-600 text-[#F5F5F5] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.selectedVariations && Object.keys(item.selectedVariations).length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Object.entries(item.selectedVariations).map(([key, value]) => (
                          <span key={key} className="inline-block mr-2">
                            {value.variationName}: {value.selectedColor.title}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      R$ {(((item.sale_price || item.original_price) * item.quantity) / 100).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    {item.quantity > 1 && (
                      <p className="text-xs text-gray-500">
                        R$ {((item.sale_price || item.original_price) / 100).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        cada
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Código de Desconto */}
        <div className="mb-6">
          <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
            Código de desconto
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="discountCode"
              name="discountCode"
              value={discountCode}
              onChange={handleInputChange}
              placeholder="Código de desconto"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={applyDiscount}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Aplicar
            </button>
          </div>
          
          {/* Show applied coupon */}
          {appliedCoupon && (
            <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded'>
              <div className='flex items-center justify-between'>
                <p className='text-xs text-green-700'>
                  ✓ Cupom {appliedCoupon.code} aplicado - {appliedCoupon.discount}% de desconto
                </p>
                <button 
                  onClick={removeCoupon}
                  className='text-xs text-red-600 hover:text-red-800 font-medium'
                  title='Remover cupom'
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumo de Valores */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">
              R$ {(getTotalPrice() / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          
          {/* Show shipping if selected */}
          {selectedShipping && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frete ({selectedShipping.name})</span>
              <span className="text-gray-900">
                {selectedShipping.price === 0 ? 'GRÁTIS' : `R$ ${(selectedShipping.price / 100).toFixed(2)}`}
              </span>
            </div>
          )}
          
          {/* Show PIX discount if selected */}
          {selectedPaymentMethod === 'pix' && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Desconto PIX</span>
              <span className="text-green-600">
                -5%
              </span>
            </div>
          )}
          
          {/* Show discount if applied */}
          {appliedCoupon && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Desconto ({appliedCoupon.code})</span>
              <span className="text-green-600">
                -{appliedCoupon.discount}%
              </span>
            </div>
          )}
          
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">Total</span>
              <div className="text-right">
                <span className="text-xs text-gray-500">BRL</span>
                <span className="text-lg text-gray-900 ml-1">
                  R$ {(calculateFinalTotal(getTotalPrice()) / 100).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}