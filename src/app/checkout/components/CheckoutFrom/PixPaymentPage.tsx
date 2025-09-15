'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

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

type PixPaymentPageProps = {
  paymentData: PixPaymentData;
};

export default function PixPaymentPage({ paymentData }: PixPaymentPageProps) {
  const [copied, setCopied] = useState(false);
  const [orderStatus, setOrderStatus] = useState(paymentData.status);
  const [isChecking, setIsChecking] = useState(false);

  // Função para verificar o status do pedido
  const checkOrderStatus = async () => {
    if (isChecking || orderStatus === 'paid') return;
    
    try {
      setIsChecking(true);
      const response = await fetch(`/api/orders/status/${paymentData.externalRef}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.status && data.status !== orderStatus) {
          setOrderStatus(data.status);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status do pedido:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Verificar status periodicamente
  useEffect(() => {
    if (orderStatus === 'paid') return;
    
    const interval = setInterval(checkOrderStatus, 5000); // Verifica a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [orderStatus, isChecking]);

  const handlePrintReceipt = () => {
    // Extrair o ID da ordem do externalRef
    const orderId = paymentData.externalRef;
    
    // Definir o título da página temporariamente para o nome do PDF
    const originalTitle = document.title;
    document.title = `Comprovante_${orderId}`;
    
    // Imprimir
    window.print();
    
    // Restaurar o título original após um pequeno delay
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const copyPixCode = async () => {
    try {
      // Verifica se o navegador suporta a API Clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(paymentData.pix.qrcode);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = paymentData.pix.qrcode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        } catch (fallbackErr) {
          console.error('Erro ao copiar código PIX (fallback):', fallbackErr);
          // Mostra uma mensagem para o usuário copiar manualmente
          alert('Não foi possível copiar automaticamente. Por favor, selecione e copie o código PIX manualmente.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Erro ao copiar código PIX:', err);
      // Fallback adicional - mostra uma mensagem para copiar manualmente
      alert('Não foi possível copiar automaticamente. Por favor, selecione e copie o código PIX manualmente.');
    }
  };

  const generateQRCodeUrl = (pixCode: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-barlow">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-600">
            Pedido #{paymentData.id}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* PIX Payment Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Pagamento via PIX
            </h2>
            
            {/* QR Code */}
            <div className="text-center mb-6">
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={generateQRCodeUrl(paymentData.pix.qrcode)}
                  alt="QR Code PIX"
                  className="w-48 h-48 mx-auto"
                />
              </div>
            </div>

            {/* PIX Code */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código PIX (Copia e Cola)
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={paymentData.pix.qrcode}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm"
                />
                <button
                  onClick={copyPixCode}
                  className="px-4 py-2 bg-orange-500 text-[#F5F5F5] rounded-r-md hover:bg-orange-600 transition-colors flex items-center"
                >
                  <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Como pagar com PIX:
              </h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Abra o app do seu banco</li>
                <li>2. Escolha a opção PIX</li>
                <li>3. Escaneie o QR Code ou cole o código</li>
                <li>4. Confirme o pagamento</li>
              </ol>
            </div>

            {/* Payment Info */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Valor Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Vencimento:</span>
                <span>{formatExpirationDate(paymentData.pix.expirationDate + 'T23:59:59')}</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Resumo do Pedido
            </h2>

            {/* Customer Info */}
            <div className="mb-6 pb-4 border-b">
              <h3 className="font-semibold text-gray-900 mb-2">Dados do Cliente</h3>
              <p className="text-gray-600">{paymentData.customer.name}</p>
              <p className="text-gray-600">{paymentData.customer.email}</p>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h3>
              <div className="space-y-3">
                {paymentData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">Quantidade: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.unitPrice)} cada
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(paymentData.amount)}
                </span>
              </div>
            </div>

            {/* Status */}
            {orderStatus === 'paid' ? (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Pagamento Confirmado!</p>
                    <p className="text-sm text-green-700">
                      Seu pagamento foi processado com sucesso. Você receberá um e-mail de confirmação em breve.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
                  <div>
                    <p className="font-medium text-yellow-800">Aguardando Pagamento</p>
                    <p className="text-sm text-yellow-700">
                      Assim que o pagamento for confirmado, você receberá um e-mail de confirmação.
                      {isChecking && ' Verificando status...'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center gap-2 mt-8">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-500 text-[#F5F5F5] px-6 py-3 rounded-md hover:bg-gray-600 transition-colors mr-4"
          >
            Voltar à Loja
          </button>
          <button
            onClick={handlePrintReceipt}
            className="bg-orange-500 text-[#F5F5F5] px-6 py-3 rounded-md hover:bg-orange-600 transition-colors"
          >
            Imprimir Comprovante
          </button>
        </div>
      </div>
    </div>
  );
}