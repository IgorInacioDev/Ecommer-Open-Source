'use client';

import { useState, useEffect } from 'react';
import Contact from './CheckoutFrom/Contact';
import { FormData } from '@/app/types/Datas';
import Shipping from './CheckoutFrom/Shipping';
import ShippingMethods from './CheckoutFrom/ShippingMethods';
import Payments from './CheckoutFrom/Payments';
import BillingAddress from './CheckoutFrom/BillingAddress';
import ResumeOrder from './ResumerOrder';
import { useCart } from '@/app/contexts/CartContext';
import { useCheckout } from '@/app/contexts/CheckoutContext';
import PixPaymentPage from './CheckoutFrom/PixPaymentPage';
import { TrackingData } from '@/app/types/Tracking';

type PixPaymentData = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  pix: {
    qrcode: string;
    expirationDate: string;
  };
  items: Array<{
    title: string;
    quantity: number;
    unitPrice: number;
  }>;
  customer: {
    name: string;
    email: string;
  };
  externalRef: number;
};
import { sanitizeObject } from '@/app/utils/sanitizeUtils';

import getClientIP from './CheckoutFrom/utils/getClientIP';
import generateFingerprint from './CheckoutFrom/utils/generateFingerprint';
import getUTMParameters from './CheckoutFrom/utils/getUTMParameters';
import getSessionData from './CheckoutFrom/utils/getSessionData';
import createBlackCatOrderd from './CheckoutFrom/utils/createBlackCatOrderd';
import updateNocoSession from './CheckoutFrom/utils/updateNocoSession';
import { formDataSchema } from '@/app/checkout/schemas/checkout';
import createHyperCashOrder from './CheckoutFrom/utils/createHyperCashOrderd';

export default function CheckoutForm() {
  const { items, getTotalPrice } = useCart();
  const { cep, appliedCoupon, calculateFinalTotal } = useCheckout();
  const [clientIP, setClientIP] = useState<string>('');
  const [trackingData, setTrackingData] = useState<TrackingData>({});
  const [paymentData, setPaymentData] = useState<PixPaymentData | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix'>('pix');
  
  const [formData, setFormData] = useState<FormData>({
    email: '',
    country: 'Brasil',
    firstName: '',
    lastName: '',
    zipCode: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    phone: '',
    saveInfo: false,
    discountCode: '',
    cpf: ''
  });

  // Pre-fill CEP from checkout context if available
  useEffect(() => {
    if (cep && !formData.zipCode) {
      setFormData(prev => ({
        ...prev,
        zipCode: cep
      }));
    }
  }, [cep, formData.zipCode]);


  useEffect(() => {
    // Obter IP real do cliente
    getClientIP().then(ip => setClientIP(ip));
    
    // Gerar dados de tracking
    const fingerprint = generateFingerprint();
   // fingerprint é assíncrono — será aplicado ao trackingData após ser resolvido
     const utmParams = getUTMParameters();
     const sessionData = getSessionData();
    
    // Atualizar contadores de visita
    let visitCount = 1;
    let pageViews = 1;
    
    try {
      visitCount = parseInt(localStorage.getItem('visitCount') || '0') + 1;
      localStorage.setItem('visitCount', visitCount.toString());
      localStorage.setItem('lastVisit', new Date().toISOString());
      if (!localStorage.getItem('firstVisit')) {
        localStorage.setItem('firstVisit', new Date().toISOString());
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    
    try {
      pageViews = parseInt(sessionStorage.getItem('pageViews') || '0') + 1;
      sessionStorage.setItem('pageViews', pageViews.toString());
      
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', `session_${Date.now()}`);
      }
    } catch (error) {
      console.warn('sessionStorage access failed:', error);
    }
    
    generateFingerprint().then((fingerprint) => {
      setTrackingData({
        fingerprint,
        utm: utmParams,
        session: {
          ...sessionData,
          visitCount,
          pageViews
        },
        performance: {
          loadTime: typeof performance !== 'undefined' ? performance.now() : 0,
          connectionType: (() => {
            try {
              return (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection?.effectiveType || 'unknown';
            } catch (e) {
              return 'unknown';
            }
          })(),
          downlink: (() => {
            try {
             return (navigator as Navigator & { connection?: { effectiveType?: string; downlink?: number } }).connection?.downlink || 0;
            } catch (e) {
              return 0;
            }
          })()
        }
      });
    });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    };
    setFormData(newFormData);

    // CPF handling - cartão de crédito removido
  };

  const handlePaymentChange = (paymentMethod: 'pix') => {
    setSelectedPaymentMethod(paymentMethod);
    // Cartão de crédito - Em breve
  };

  // Função duplicada (handlePaymentChangeFixed) removida: uso consolidado em handlePaymentChange

  const handleSubmit = async (formData: FormData) => {
    setIsProcessing(true);

    try {
      // Validação de runtime do formulário
      const parsedForm = formDataSchema.parse({
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
        phone: formData.phone.replace(/\D/g, '')
      });

      const { email, firstName, lastName, address, number, neighborhood, city, state, zipCode, complement, phone, cpf, discountCode, saveInfo } = parsedForm;
      const fullName = `${firstName} ${lastName}`.trim();
      const phoneDigits = phone;
      const cpfDigits = cpf;
      const totalAmount = Math.round(calculateFinalTotal(getTotalPrice()));
      const currency = 'BRL';

      // Cartão de crédito - Em breve
      // Apenas PIX está disponível no momento

      const orderItems = items.map(({ name, sale_price, original_price, quantity, Id }) => ({
        title: name,
        unitPrice: sale_price || original_price,
        quantity,
        tangible: true,
        externalRef: Id.toString()
      }));

      const { utm = {}, session = {} } = trackingData || {};
      const sessionId = (session?.sessionId) ?? `session_${Date.now()}`;

      const completeMetadata = sanitizeObject({
        order: { timestamp: new Date().toISOString(), source: 'checkout_form', version: '1.0' },
        customer: {
          formData: { email, name: fullName, phone, saveInfo },
          tracking: trackingData
        },
        technical: {
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          timestamp: Date.now(),
          locale: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        marketing: {
          discountCode: appliedCoupon?.code || discountCode,
          appliedDiscount: appliedCoupon ? {
            code: appliedCoupon.code,
            discount: appliedCoupon.discount,
            description: appliedCoupon.code
          } : null,
          ...(utm || {})
        }
      });

      const orderData = {
        amount: totalAmount,
        paymentMethod: 'pix',
        items: orderItems,
        shipping: {
          fee: 0,
          address: {
            street: address,
            streetNumber: number,
            neighborhood,
            city,
            state,
            zipCode: zipCode.replace(/\D/g, ''),
            country: 'BR',
            complement: complement || ''
          }
        },
        customer: {
          name: fullName,
          email,
          phone: phoneDigits,
          document: { number: cpfDigits, type: 'cpf' as const }
        },
        metadata: JSON.stringify(completeMetadata),
        externalRef: `order_${Date.now()}_${sessionId}`,
        ip: clientIP || '127.0.0.1',
        postbackUrl: `${window.location.origin}/api/postback`
      };

      // Processar pagamento PIX (cartão de crédito removido)
      {
        const response = await createBlackCatOrderd(orderData);
        console.log('Resposta do pedido via Pix:', response);

        // Para pagamentos PIX ou outros métodos bem-sucedidos
        if (response.success && response.blackCatData) {
          const orderId = response.blackCatData.externalRef.toString();
          
          // Disparar evento Purchase quando o pedido é criado com sucesso
          try {
              if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
                const pixelProduct = {
                  content_ids: items.map(item => item.Id.toString()),
                  content_name: items.map(item => item.name).join(', '),
                  content_type: 'product_group',
                  value: items.reduce((total, item) => total + ((item.sale_price || item.original_price) / 100) * item.quantity, 0),
                  currency: 'BRL',
                  num_items: items.length,
                  contents: items.map(item => ({
                    id: item.Id.toString(),
                    quantity: item.quantity,
                    item_price: (item.sale_price || item.original_price) / 100
                  }))
                };

              (window as Window & { fbq?: (action: string, event: string, data?: object) => void }).fbq?.('track', 'Purchase', pixelProduct);
              console.log('rastrear início do checkout:', pixelProduct);
            }
          } catch (error) {
            console.error('❌ Error tracking purchase:', error);
            // Continue execution even if tracking fails
          }
          
          // Disparar evento Lead quando o pedido é gerado
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
            console.error('❌ Error tracking lead:', error);
            // Continue execution even if tracking fails
          }
          
          await updateNocoSession({
            createOrder: true,
            ip: clientIP || '127.0.0.1'
          })
          // Armazenar dados do pagamento para exibir a página PIX
          setPaymentData({
            id: response.blackCatData.id.toString(),
            amount: response.blackCatData.amount,
            currency: response.blackCatData.currency,
            status: response.blackCatData.status,
            pix: {
              qrcode: response.blackCatData.pix.qrcode,
              expirationDate: response.blackCatData.pix.expirationDate
            },
            items: response.blackCatData.items,
            customer: {
              name: response.blackCatData.customer.name,
              email: response.blackCatData.customer.email
            },
            externalRef: Number(response.blackCatData.externalRef)
          });
        } else if (!response.success) {
          throw new Error('Falha no processamento do pagamento via Pix');
        }
      }
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      alert('Erro ao processar pedido. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Se temos dados de pagamento, mostrar a página PIX
  if (paymentData) {
    return <PixPaymentPage paymentData={paymentData} />;
  }

  return (
    <form autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <div className="grid lg:grid-cols-2 gap-8 font-barlow">
        {/* Formulário Principal */}
        <div className="space-y-8">
        {/* Seção de Contato */}
        <Contact email={formData.email} handleInputChange={handleInputChange} />

        {/* Seção de Entrega */}
        <Shipping handleInputChange={handleInputChange} formData={formData} setFormData={setFormData} />

        {/* Forma de Frete */}
        <ShippingMethods />

        {/* Pagamento */}
        <Payments onPaymentChange={handlePaymentChange} cpf={formData.cpf} />

        {/* Endereço de Faturamento */}
        <BillingAddress handleInputChange={handleInputChange} formData={formData} />

        {/* Botão Pagar Agora */}
        <button
          type="submit"
          disabled={isProcessing}
          className={`w-full font-semibold py-4 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
            isProcessing 
              ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-[#F5F5F5]'
          }`}
          onClick={() => handleSubmit(formData)}
        >
          {isProcessing ? 'Processando...' : 'Pagar agora'}
        </button>
      </div>

        {/* Resumo do Pedido */}
        <ResumeOrder />
      </div>
    </form>
  );
}