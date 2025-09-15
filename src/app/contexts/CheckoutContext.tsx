'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
  selected: boolean;
}

interface CheckoutContextType {
  // Shipping data
  cep: string;
  setCep: (cep: string) => void;
  shippingOptions: ShippingOption[];
  setShippingOptions: (options: ShippingOption[]) => void;
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (option: ShippingOption | null) => void;
  shippingCalculated: boolean;
  setShippingCalculated: (calculated: boolean) => void;
  
  // Payment data
  selectedPaymentMethod: 'pix' | null;
  setSelectedPaymentMethod: (method: 'pix' | null) => void;
  
  // Coupon data
  appliedCoupon: {code: string, discount: number} | null;
  setAppliedCoupon: (coupon: {code: string, discount: number} | null) => void;
  
  // Helper functions
  clearShippingData: () => void;
  calculateFinalTotal: (baseTotal: number) => number;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cep, setCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | null>('pix');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);

  const clearShippingData = () => {
    setCep('');
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingCalculated(false);
    setSelectedPaymentMethod('pix');
    setAppliedCoupon(null);
  };

  const calculateFinalTotal = (baseTotal: number): number => {
    let total = baseTotal;
    
    // Add shipping cost
    if (selectedShipping) {
      total += selectedShipping.price;
    }
    
    // Apply PIX discount (5% off)
    if (selectedPaymentMethod === 'pix') {
      total = total * 0.95; // 5% discount
    }
    
    // Apply coupon discount
    if (appliedCoupon) {
      total = total * (1 - appliedCoupon.discount / 100);
    }
    
    return total;
  };

  const value: CheckoutContextType = {
    cep,
    setCep,
    shippingOptions,
    setShippingOptions,
    selectedShipping,
    setSelectedShipping,
    shippingCalculated,
    setShippingCalculated,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    appliedCoupon,
    setAppliedCoupon,
    clearShippingData,
    calculateFinalTotal,
  };

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout deve ser usado dentro de um CheckoutProvider');
  }
  return context;
};

export default CheckoutContext;