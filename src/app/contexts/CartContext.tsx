'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProductType } from '../types/Product';

interface SelectedVariation {
  variationName: string;
  selectedColor: {
    title: string;
    hex: string;
  };
}

interface CartItem extends ProductType {
  quantity: number;
  selectedVariations?: SelectedVariation[];
  uniqueId: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: ProductType, quantity?: number, selectedVariations?: SelectedVariation[]) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce_cart';

// Função para gerar ID único baseado no produto e suas variações
const generateUniqueId = (productId: number, selectedVariations?: SelectedVariation[]): string => {
  let id = productId.toString();
  
  if (selectedVariations && selectedVariations.length > 0) {
    const variationsString = selectedVariations
      .map(variation => `${variation.variationName}:${variation.selectedColor.title}`)
      .sort()
      .join('|');
    id += `_${variationsString}`;
  }
  
  return id;
};

// Funções de cache do localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Erro ao salvar carrinho no localStorage:', error);
  }
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return [];
    
    const items = JSON.parse(savedCart);
    
    // Garantir compatibilidade com itens existentes sem uniqueId
    return items.map((item: any) => {
      if (!item.uniqueId) {
        item.uniqueId = generateUniqueId(item.Id, item.selectedVariations);
      }
      return item;
    });
  } catch (error) {
    console.error('Erro ao carregar carrinho do localStorage:', error);
    return [];
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Carregar itens do localStorage na inicialização
  useEffect(() => {
    const savedItems = loadCartFromStorage();
    setItems(savedItems);
  }, []);

  // Salvar no localStorage sempre que os itens mudarem
  useEffect(() => {
    saveCartToStorage(items);
  }, [items]);

  const addToCart = (product: ProductType, quantity: number = 1, selectedVariations?: SelectedVariation[]) => {
    const uniqueId = generateUniqueId(Number(product.Id), selectedVariations);
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.uniqueId === uniqueId);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity, selectedVariations, uniqueId }];
      }
    });

    // Track AddToCart event with Facebook Pixel
    try {
      // Convert product to pixel format and track
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        const pixelProduct = {
          content_ids: [product.Id.toString()],
          content_name: product.name,
          content_type: 'product',
          value: (product.sale_price || product.original_price) / 100,
          currency: 'BRL',
          contents: [{
            id: product.Id.toString(),
            quantity: quantity,
            item_price: (product.sale_price || product.original_price) / 100
          }]
        };
        
        (window as Window & { fbq?: (action: string, event: string, data?: object) => void }).fbq?.('track', 'AddToCart', pixelProduct);
      }
    } catch (error) {
      console.error('Error tracking AddToCart event:', error);
    }
  };

  const removeFromCart = (uniqueId: string) => {
    setItems(prevItems => prevItems.filter(item => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const effectivePrice = item.sale_price || item.original_price;
      const price = typeof effectivePrice === 'string' 
        ? parseFloat(String(effectivePrice).replace('R$', '').replace(',', '.'))
        : effectivePrice;
      return total + (price * item.quantity);
    }, 0);
  };

  const value: CartContextType = {
    items,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    getTotalItems,
    getTotalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

export default CartContext;