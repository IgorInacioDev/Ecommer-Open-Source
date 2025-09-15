'use client';

import { useEffect, useState } from 'react';

export default function TestSessionPage() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    addLog('Página de teste carregada');

    // Interceptar console.log para capturar logs do SessionStatusTracker
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('📱') || message.includes('🔍') || message.includes('✅') || message.includes('💓')) {
        addLog(message);
      }
      originalLog(...args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const simulateNavigation = () => {
    addLog('Simulando navegação...');
    window.history.pushState({}, '', '/test-session?page=2');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const simulateScroll = () => {
    addLog('Simulando scroll...');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const simulateBlur = () => {
    addLog('Simulando perda de foco...');
    window.dispatchEvent(new Event('blur'));
  };

  const simulateFocus = () => {
    addLog('Simulando ganho de foco...');
    window.dispatchEvent(new Event('focus'));
  };

  const simulateVisibilityChange = (hidden: boolean) => {
    addLog(`Simulando mudança de visibilidade (hidden: ${hidden})...`);
    Object.defineProperty(document, 'hidden', {
      value: hidden,
      writable: true
    });
    document.dispatchEvent(new Event('visibilitychange'));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Teste de Sessão - Status Tracker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Ações de Teste</h2>
          <div className="space-y-3">
            <button
              onClick={simulateNavigation}
              className="w-full bg-blue-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-blue-600"
            >
              🔄 Simular Navegação
            </button>
            
            <button
              onClick={simulateScroll}
              className="w-full bg-green-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-green-600"
            >
              📜 Simular Scroll
            </button>
            
            <button
              onClick={simulateBlur}
              className="w-full bg-yellow-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-yellow-600"
            >
              🔍 Simular Perda de Foco
            </button>
            
            <button
              onClick={simulateFocus}
              className="w-full bg-purple-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-purple-600"
            >
              🔍 Simular Ganho de Foco
            </button>
            
            <button
              onClick={() => simulateVisibilityChange(true)}
              className="w-full bg-red-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-red-600"
            >
              👁️ Simular Página Invisível
            </button>
            
            <button
              onClick={() => simulateVisibilityChange(false)}
              className="w-full bg-indigo-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-indigo-600"
            >
              👁️ Simular Página Visível
            </button>
            
            <button
              onClick={clearLogs}
              className="w-full bg-gray-500 text-[#F5F5F5] px-4 py-2 rounded hover:bg-gray-600"
            >
              🗑️ Limpar Logs
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Logs do Sistema</h2>
          <div className="bg-black text-green-400 p-4 rounded h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500">Nenhum log ainda...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Comportamento Esperado:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• ✅ Navegação e scroll NÃO devem marcar sessão como inativa</li>
          <li>• ✅ Perda de foco NÃO deve marcar sessão como inativa</li>
          <li>• ✅ Página invisível NÃO deve marcar sessão como inativa</li>
          <li>• ✅ Ganho de foco e página visível devem garantir sessão ativa</li>
          <li>• ✅ Heartbeat deve continuar atualizando lastActivity</li>
        </ul>
      </div>
    </div>
  );
}