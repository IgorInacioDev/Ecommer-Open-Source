import { useState } from "react";
import { FormData } from "@/app/types/Datas";

// Função para formatar CPF
const formatCPF = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a formatação
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }
};

type BillingAddressProps = {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  formData: FormData;
};

export default function BillingAddress({ handleInputChange, formData }: BillingAddressProps) {
  const [useSameAddress, setUseSameAddress] = useState<boolean>(true);

  // Função para lidar com a mudança do CPF
  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCPF(e.target.value);
    
    // Criar um evento sintético mais simples
    const syntheticEvent = {
      target: {
        name: 'cpf',
        value: formattedValue,
        type: 'text'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Endereço de faturamento</h2>

      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="same-address"
            name="billing-address"
            checked={useSameAddress}
            onChange={() => setUseSameAddress(true)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
          />
          <label htmlFor="same-address" className="font-medium text-gray-900">
            Usar o endereço de entrega
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="different-address"
            name="billing-address"
            checked={!useSameAddress}
            onChange={() => setUseSameAddress(false)}
            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
          />
          <label htmlFor="different-address" className="font-medium text-gray-900">
            Usar um endereço de faturamento diferente
          </label>
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
          CPF
        </label>
        <input
          type="text"
          id="cpf"
          name="cpf"
          value={formData.cpf}
          onChange={handleCPFChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="000.000.000-00"
          maxLength={14}
        />
      </div>
    </div>
  );
}