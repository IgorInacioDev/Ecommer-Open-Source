'use client';

import React, { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUTMPersistence } from '@/app/hooks/useUTMPersistence';
import { InfoProps } from '../types/types';
import CollapsibleSectionCart from './cart/CollapsibleSectionCart';
import OrderBump from './cart/OrderBump';
import ProductCartCard from './cart/ProductCartCard';
import Button from './common/Button';
import { useCart } from '../contexts/CartContext';
import { useCheckout } from '../contexts/CheckoutContext';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
  selected: boolean;
}


// Moved info array inside component to access state

  const CartModalContent: React.FC = () => {
  const { items, isCartOpen, closeCart, getTotalPrice, getTotalItems } = useCart();
  const { 
    cep, setCep, 
    shippingOptions, setShippingOptions,
    selectedShipping, setSelectedShipping,
    shippingCalculated, setShippingCalculated,
    appliedCoupon, setAppliedCoupon,
    calculateFinalTotal
  } = useCheckout();
  const router = useRouter();
  const { buildURLWithUTM } = useUTMPersistence();
  
  // Local states
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  
  // CEP validation function
  const validateCEP = (cep: string): boolean => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep.replace(/\D/g, ''));
  };
  
  // Format CEP input
  const formatCEP = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };
  
  // Calculate shipping
  const calculateShipping = async () => {
    if (!validateCEP(cep)) {
      alert('Por favor, digite um CEP válido (formato: 12345-678)');
      return;
    }
    
    setIsCalculatingShipping(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const options: ShippingOption[] = [
        {
          id: 'pac',
          name: 'PAC - CORREIOS',
          price: 2987, // in cents
          days: '2-4 dias',
          selected: false
        },
        {
          id: 'jadlog',
          name: 'JADLOG GRÁTIS',
          price: 0,
          days: '5-8 dias',
          selected: true // Default selection
        }
      ];
      
      setShippingOptions(options);
      setSelectedShipping(options.find(opt => opt.selected) || options[0]);
      setShippingCalculated(true);
      setIsCalculatingShipping(false);
    }, 1500);
  };
  
  // Handle shipping option selection
  const selectShippingOption = (optionId: string) => {
    const updatedOptions = shippingOptions.map(opt => ({
      ...opt,
      selected: opt.id === optionId
    }));
    setShippingOptions(updatedOptions);
    setSelectedShipping(updatedOptions.find(opt => opt.selected) || null);
  };
  
  // Apply coupon with improved validation
  const applyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Digite um código de cupom válido');
      return;
    }
    
    // Check if coupon is already applied
    if (appliedCoupon && appliedCoupon.code === couponCode.toUpperCase()) {
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
    
    const couponData = validCoupons[couponCode.toUpperCase() as keyof typeof validCoupons];
    
    if (couponData) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: couponData.discount });
      setCouponCode(''); // Clear input after successful application
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
  
  // Get final total using checkout context
  const getFinalTotal = (): number => {
    return calculateFinalTotal(getTotalPrice());
  };
  
  const info: InfoProps[] = [
    {
      title: "SIMULAR FRETE E PRAZO",
      description: (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <input 
              type="text"
              value={cep}
              onChange={(e) => setCep(formatCEP(e.target.value))}
              className="flex-1 p-2 border border-gray-300 text-sm"
              placeholder="Digite seu CEP"
              maxLength={9}
            />
            <button 
              onClick={calculateShipping}
              disabled={isCalculatingShipping}
              className='px-3 py-2 text-[#212122] font-bold text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
            >
              {isCalculatingShipping ? 'Calculando...' : 'Calcular'}
            </button>
          </div>
          
          {shippingCalculated && shippingOptions.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs text-gray-600 font-medium'>Opções de entrega para {cep}:</p>
              {shippingOptions.map((option) => (
                <div 
                  key={option.id}
                  className={`p-2 border rounded cursor-pointer transition-colors ${
                    option.selected ? 'border-[#E7002A] bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => selectShippingOption(option.id)}
                >
                  <div className='flex items-center gap-2'>
                    <input 
                      type="radio" 
                      checked={option.selected} 
                      onChange={() => selectShippingOption(option.id)}
                      className='text-[#E7002A]'
                    />
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-800'>{option.name}</p>
                      <div className='flex justify-between items-center'>
                        <span className='text-xs text-gray-600'>{option.days}</span>
                        <span className='text-sm font-bold text-[#E7002A]'>
                          {option.price === 0 ? 'GRÁTIS' : `R$ ${(option.price / 100).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      title: "ADICIONAR CUPOM DE DESCONTO",
      description: (
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1 p-2 border border-gray-300 text-sm"
              placeholder="Digite seu cupom"
            />
            <button 
              onClick={applyCoupon}
              className='px-3 py-2 text-[#212122] font-bold text-sm bg-gray-100 hover:bg-gray-200'
            >
              Aplicar
            </button>
          </div>
          {appliedCoupon && (
            <div className='p-2 bg-green-50 border border-green-200 rounded'>
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
      )
    },
  ];
  
  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (items.length > 0) {
      try {
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
            const pixelProduct = {
              content_ids: items.map(item => item.Id.toString()),
              content_name: items.map(item => item.name).join(', '),
              content_type: 'product_group',
              value: items.reduce((total, item) => total + ((item.sale_price || item.original_price) / 100) * item.quantity, 0),
              currency: 'BRL',
              contents: items.map(item => ({
                id: item.Id.toString(),
                quantity: item.quantity,
                item_price: (item.sale_price || item.original_price) / 100
              }))
            };

          (window as Window & { fbq?: (action: string, event: string, data?: object) => void }).fbq?.('track', 'InitiateCheckout', pixelProduct);
          console.log('rastrear início do checkout:', pixelProduct);
        }
        
      } catch (error) {
        console.error('Erro ao rastrear início do checkout:', error);
      }
      
      closeCart();
      router.push(buildURLWithUTM('/checkout'));
    }
  };

  // Handle click outside cart
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-white/40 bg-opacity-50 z-50 flex justify-end"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full max-w-sm h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h2 className="text-lg tracking-wider text-[#333333] font-bold font-syne">Minha Sacola ({items.length})</h2>
          <button 
            onClick={closeCart}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Seu carrinho está vazio</p>
              <p className="text-sm mt-2">Adicione produtos para começar suas compras</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <ProductCartCard key={item.uniqueId} product={item} />
              ))}
            </div>
          )}
        </div>

        {/* Order Bump at the bottom */}
        <div className="mt-auto">
          <OrderBump />
        </div>
        <CollapsibleSectionCart info={info} id="Product-content-tab7655525941290"/>
        
        <div className='p-4 gap-4 font-barlow font-bold text-sm'>
          <div className='space-y-2 text-[#333333] mb-4'>
            <div className='flex justify-between'>
              <span>SUBTOTAL</span>
              <span>R$ {((getTotalPrice() / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }))}</span>
            </div>
            
            {selectedShipping && (
              <div className='flex justify-between text-sm'>
                <span>FRETE ({selectedShipping.name})</span>
                <span>{selectedShipping.price === 0 ? 'GRÁTIS' : `R$ ${(selectedShipping.price / 100).toFixed(2)}`}</span>
              </div>
            )}
            
            {appliedCoupon && (
              <div className='flex justify-between text-sm text-green-600'>
                <span>DESCONTO ({appliedCoupon.code})</span>
                <span>-{appliedCoupon.discount}%</span>
              </div>
            )}
            
            <hr className='border-gray-200' />
            
            <div className='flex justify-between text-lg'>
              <span>TOTAL</span>
              <span>R$ {((getFinalTotal() / 100).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }))}</span>
            </div>
          </div>
          
          <Button 
            title={items.length === 0 ? 'CARRINHO VAZIO' : 'FINALIZAR COMPRA'}
            onClick={items.length === 0 ? undefined : handleCheckout}
          />
        </div>
      </div>
    </div>
  );
};

const CartModal: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <CartModalContent />
    </Suspense>
  );
};

export default CartModal;