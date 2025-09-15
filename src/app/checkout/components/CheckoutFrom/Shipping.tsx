import { FormData } from "@/app/types/Datas";
import { Dispatch, SetStateAction, useState, useEffect, useCallback } from "react";

type ContactProps = {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void,
  formData: FormData,
  setFormData: Dispatch<SetStateAction<FormData>>;
}

// Interface para resposta da API ViaCEP
interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export default function Shipping({ handleInputChange, formData, setFormData }: ContactProps) {
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [cepError, setCepError] = useState('');
  const [addressFieldsEnabled, setAddressFieldsEnabled] = useState(false);

  // Função para buscar dados do CEP
  const fetchCEPData = useCallback(async (cep: string) => {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Verifica se o CEP tem 8 dígitos
    if (cleanCEP.length !== 8) {
      setCepError('CEP deve conter 8 dígitos');
      setAddressFieldsEnabled(false);
      return;
    }

    setIsLoadingCEP(true);
    setCepError('');
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data: ViaCEPResponse = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado');
        setAddressFieldsEnabled(false);
      } else {
        // Preenche os campos automaticamente
        setFormData(prev => ({
          ...prev,
          address: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
          complement: data.complemento || ''
        }));
        setAddressFieldsEnabled(true);
        setCepError('');
      }
    } catch (_) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
      setAddressFieldsEnabled(false);
    } finally {
      setIsLoadingCEP(false);
    }
  }, [setFormData]);

  // Busca automaticamente os dados do CEP quando o componente é carregado com CEP preenchido
  useEffect(() => {
    if (formData.zipCode) {
      const cleanCEP = formData.zipCode.replace(/\D/g, '');
      if (cleanCEP.length === 8 && !formData.address) {
        fetchCEPData(cleanCEP);
      }
    }
  }, [formData.zipCode, formData.address, fetchCEPData]);

  // Função para lidar com mudanças no CEP
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Formata o CEP (adiciona hífen)
    let formattedCEP = value.replace(/\D/g, '');
    if (formattedCEP.length > 5) {
      formattedCEP = formattedCEP.replace(/(\d{5})(\d{1,3})/, '$1-$2');
    }
    
    setFormData(prev => ({ ...prev, zipCode: formattedCEP }));
    
    // Se o CEP estiver completo, busca os dados
    const cleanCEP = value.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      fetchCEPData(cleanCEP);
    } else {
      setAddressFieldsEnabled(false);
      setCepError('');
      // Limpa os campos de endereço quando CEP é incompleto
      setFormData(prev => ({
        ...prev,
        address: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: ''
      }));
    }
  };

  
  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Entrega</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              País/Região <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Brasil">Brasil</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              CEP <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleCEPChange}
                placeholder="00000-000"
                maxLength={9}
                autoComplete="off"
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                  cepError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'
                }`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {isLoadingCEP ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>
            {cepError && <p className="mt-1 text-sm text-red-600">{cepError}</p>}
            {!addressFieldsEnabled && formData.zipCode.length > 0 && !cepError && (
              <p className="mt-1 text-sm text-gray-500">Digite um CEP válido para habilitar os campos de endereço</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                autoComplete="off"
                disabled={!addressFieldsEnabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !addressFieldsEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                Número <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                disabled={!addressFieldsEnabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !addressFieldsEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="complement" className="block text-sm font-medium text-gray-700 mb-1">
                Apto, bloco ou complemento
              </label>
              <input
                type="text"
                id="complement"
                name="complement"
                value={formData.complement}
                onChange={handleInputChange}
                disabled={!addressFieldsEnabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !addressFieldsEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleInputChange}
                disabled={!addressFieldsEnabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !addressFieldsEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                disabled={!addressFieldsEnabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !addressFieldsEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                disabled={!addressFieldsEnabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  !addressFieldsEnabled ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="saveInfo"
              name="saveInfo"
              checked={formData.saveInfo}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="saveInfo" className="text-sm text-gray-600">
              Salvar minhas informações para a próxima vez
            </label>
          </div>
        </div>
      </div>

      {/* Verificação de Endereço */}
      <div className="bg-blue-50/20 border border-blue-200 rounded-lg p-4 mt-4">
        <h3 className="font-semibold text-blue-900 mb-2">Verifique o endereço de entrega</h3>
        <p className="text-sm text-blue-800">
          Confira se o endereço está completo, com o número do local de entrega e complemento. Se não houver número, insira{' '}
          <strong>&quot;S/N&quot;</strong> e se não houver complemento.
        </p>
      </div>
    </div>
  );
}