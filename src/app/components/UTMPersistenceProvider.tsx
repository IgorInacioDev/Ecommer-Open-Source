'use client';

import { Suspense } from 'react';
import { useUTMPersistence } from '../hooks/useUTMPersistence';

/**
 * Componente interno que usa o hook UTM
 */
function UTMPersistenceHandler({ children }: { children: React.ReactNode }) {
  // Ativar o hook de persistência UTM
  useUTMPersistence();
  
  return <>{children}</>;
}

/**
 * Componente provider para aplicar persistência UTM globalmente
 * Deve ser usado no layout principal da aplicação
 */
export default function UTMPersistenceProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <UTMPersistenceHandler>{children}</UTMPersistenceHandler>
    </Suspense>
  );
}