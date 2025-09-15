'use client';

import { useEffect } from 'react';

// Componente invisível que inicia o monitoramento automático
const AutoSessionMonitor = () => {
  useEffect(() => {
    // Função para iniciar o monitoramento automático
    const initializeMonitoring = async () => {
      try {
        console.log('🚀 Inicializando monitoramento automático de sessões...');
        
        // Chamar o endpoint para iniciar o scheduler
        const response = await fetch('/api/session/scheduler', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'start',
            interval: 120000 // 2 minutos
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Monitoramento automático iniciado:', result);
        } else {
          console.error('❌ Erro ao iniciar monitoramento automático:', await response.text());
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar monitoramento automático:', error);
      }
    };

    // Aguardar um pouco antes de iniciar para garantir que a aplicação carregou
    const timer = setTimeout(initializeMonitoring, 2000);

    // Cleanup
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Componente invisível - não renderiza nada
  return null;
};

export default AutoSessionMonitor;