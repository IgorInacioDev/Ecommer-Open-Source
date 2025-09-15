import { useState, useEffect } from 'react';
import { FaPix } from 'react-icons/fa6';
import { useCheckout } from '@/app/contexts/CheckoutContext';

interface PaymentsProps {
  onPaymentChange?: (paymentMethod: 'pix') => void;
  cpf?: string;
}

export default function Payments({ onPaymentChange, cpf }: PaymentsProps) {
  const { selectedPaymentMethod, setSelectedPaymentMethod } = useCheckout();
  const [selectedPayment, setSelectedPayment] = useState<'pix'>('pix');



  // Notificar mudanças para o componente pai
  const handlePaymentChange = (method: 'pix') => {
    setSelectedPayment(method);
    setSelectedPaymentMethod(method); // Update context
    if (onPaymentChange) {
      onPaymentChange(method);
    }
  };



  // Sync local state with context
  useEffect(() => {
    if (selectedPaymentMethod && selectedPaymentMethod !== selectedPayment) {
      setSelectedPayment('pix');
    }
  }, [selectedPaymentMethod, selectedPayment]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Pagamento</h2>
      
      <div className="space-y-3">
        {/* Cartão de Crédito - Funcionalidade não implementada */}
        <div className="border rounded-lg bg-gray-100 opacity-60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="credit-card"
                name="payment"
                value="credit-card"
                disabled
                className="h-4 w-4 text-gray-400 border-gray-300 cursor-not-allowed"
              />
              <label htmlFor="credit-card" className="font-medium text-gray-500 cursor-not-allowed">
                Cartão de crédito
              </label>
            </div>
            <span className="text-sm text-gray-500 italic">Em breve</span>
          </div>
        </div>
        
        {/* PIX */}
        <div 
          className={`border rounded-lg cursor-pointer transition-all duration-200 ${
            selectedPayment === 'pix' 
              ? 'border-2 border-red-100 bg-zinc-50' 
              : 'border border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => handlePaymentChange('pix')}
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="pix"
                name="payment"
                value="pix"
                checked={selectedPayment === 'pix'}
                onChange={(e) => handlePaymentChange('pix')}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
              />
              <label htmlFor="pix" className="font-medium text-gray-900">
                Pix
              </label>
            </div>
            <FaPix className='text-orange-600'/>
          </div>
          
          {selectedPayment === 'pix' && (
            <div className="px-4 pb-4">
              <div className="bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Pagamento via Pix com desconto de 5% no valor total. Após finalizar o pedido, você receberá o código Pix para pagamento.
                </p>
                <p className="text-xs text-gray-500">
                  Processado por Mercado Pago
                </p>
              </div>
            </div>
          )}
        </div>
      </div>



          {/* Aviso CPF */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <div>
                <p className="font-medium text-yellow-800">Insira apenas o CPF</p>
                <p className="text-sm text-yellow-700 mt-1">
                  O CPF será usado para acompanhar o status do pedido e não aceitamos pedidos com CNPJ feito pelo site.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
}