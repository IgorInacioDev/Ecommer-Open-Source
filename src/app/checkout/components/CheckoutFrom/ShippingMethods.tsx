import { useState, useEffect } from "react";
import { useCheckout } from "@/app/contexts/CheckoutContext";

export default function ShippingMethods() {
  const { 
    cep, 
    shippingOptions, 
    selectedShipping, 
    setSelectedShipping,
    shippingCalculated 
  } = useCheckout();
  
  const [localSelectedShipping, setLocalSelectedShipping] = useState('jadlog');
  
  // Update local state when checkout context changes
  useEffect(() => {
    if (selectedShipping) {
      setLocalSelectedShipping(selectedShipping.id);
    }
  }, [selectedShipping]);
  
  // Handle shipping option selection
  const handleShippingChange = (optionId: string) => {
    setLocalSelectedShipping(optionId);
    const option = shippingOptions.find(opt => opt.id === optionId);
    if (option) {
      // Update all options to reflect new selection
      const updatedOptions = shippingOptions.map(opt => ({
        ...opt,
        selected: opt.id === optionId
      }));
      setSelectedShipping(option);
    }
  };
      
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Forma de frete</h2>
      
      {/* Show CEP if calculated */}
      {shippingCalculated && cep && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">CEP de entrega:</span> {cep}
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {shippingCalculated && shippingOptions.length > 0 ? (
          // Show calculated shipping options
          shippingOptions.map((option) => (
            <div 
              key={option.id}
              className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                localSelectedShipping === option.id 
                  ? 'border-red-100 bg-zinc-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={option.id}
                  name="shipping"
                  value={option.id}
                  checked={localSelectedShipping === option.id}
                  onChange={(e) => handleShippingChange(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div>
                  <label htmlFor={option.id} className="font-medium text-gray-900">
                    {option.name}
                  </label>
                  <p className="text-sm text-gray-600">{option.days}</p>
                </div>
              </div>
              <span className={`font-semibold ${
                option.price === 0 ? 'text-green-700' : 'text-gray-900'
              }`}>
                {option.price === 0 ? 'GRÁTIS' : `R$ ${(option.price / 100).toFixed(2)}`}
              </span>
            </div>
          ))
        ) : (
          // Show default options when shipping not calculated
          <>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="pac"
                  name="shipping"
                  value="pac"
                  checked={localSelectedShipping === 'pac'}
                  onChange={(e) => handleShippingChange(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div>
                  <label htmlFor="pac" className="font-medium text-gray-900">
                    PAC - CORREIOS
                  </label>
                  <p className="text-sm text-gray-600">2-4 dias úteis</p>
                </div>
              </div>
              <span className="font-semibold text-gray-900">R$ 29,87</span>
            </div>
            
            <div className={`flex items-center justify-between p-4 border rounded-lg ${
              localSelectedShipping === 'jadlog' 
                ? 'border-red-100 bg-zinc-50' 
                : 'border-gray-200'
            }`}>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="jadlog"
                  name="shipping"
                  value="jadlog"
                  checked={localSelectedShipping === 'jadlog'}
                  onChange={(e) => handleShippingChange(e.target.value)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <div>
                  <label htmlFor="jadlog" className="font-medium text-gray-900">
                    JADLOG GRÁTIS
                  </label>
                  <p className="text-sm text-gray-600">5-8 dias úteis</p>
                </div>
              </div>
              <span className="font-semibold text-green-700">GRÁTIS</span>
            </div>
          </>
        )}
      </div>
      
      {!shippingCalculated && (
        <div className="mt-4 p-3 bg-blue-50/20 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Dica:</strong> Calcule o frete no carrinho para ver opções personalizadas para seu CEP.
          </p>
        </div>
      )}
    </div>
  );
}