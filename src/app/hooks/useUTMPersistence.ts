'use client';

import { useEffect } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';

/**
 * Hook para persistir parâmetros UTM durante a navegação
 * Armazena os parâmetros UTM no sessionStorage e os mantém na URL
 */
export const useUTMPersistence = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Lista de parâmetros UTM que devem ser persistidos
  const UTM_PARAMS = [
    'utm_source',
    'utm_medium', 
    'utm_campaign',
    'utm_term',
    'utm_content'
  ];

  useEffect(() => {
    // Verificar se está no ambiente do cliente
    if (typeof window === 'undefined') return;
    
    // Capturar parâmetros UTM atuais da URL
    const currentUTMParams: Record<string, string> = {};
    
    UTM_PARAMS.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        currentUTMParams[param] = value;
        // Armazenar no sessionStorage para persistência
        sessionStorage.setItem(param, value);
      }
    });

    // Se não há parâmetros UTM na URL atual, verificar se existem no sessionStorage
    if (Object.keys(currentUTMParams).length === 0) {
      const storedUTMParams: Record<string, string> = {};
      
      UTM_PARAMS.forEach(param => {
        const storedValue = sessionStorage.getItem(param);
        if (storedValue) {
          storedUTMParams[param] = storedValue;
        }
      });

      // Se existem parâmetros armazenados, adicionar à URL atual
      if (Object.keys(storedUTMParams).length > 0) {
        const currentUrl = new URL(window.location.href);
        
        Object.entries(storedUTMParams).forEach(([key, value]) => {
          currentUrl.searchParams.set(key, value);
        });

        // Atualizar a URL sem recarregar a página
        window.history.replaceState({}, '', currentUrl.toString());
      }
    }
  }, [searchParams, pathname]);

  // Função para obter todos os parâmetros UTM (da URL ou sessionStorage)
  const getUTMParams = (): Record<string, string> => {
    const utmParams: Record<string, string> = {};
    
    UTM_PARAMS.forEach(param => {
      // Primeiro tentar da URL
      let value = searchParams.get(param);
      
      // Se não estiver na URL, tentar do sessionStorage (apenas no cliente)
      if (!value && typeof window !== 'undefined') {
        value = sessionStorage.getItem(param);
      }
      
      if (value) {
        utmParams[param] = value;
      }
    });
    
    return utmParams;
  };

  // Função para construir URL com parâmetros UTM persistidos
  const buildURLWithUTM = (baseUrl: string, additionalParams?: Record<string, string>): string => {
    // Se não estiver no cliente, retornar URL relativa apenas com parâmetros adicionais
    if (typeof window === 'undefined') {
      if (additionalParams && Object.keys(additionalParams).length > 0) {
        const url = new URL(baseUrl, 'http://localhost');
        Object.entries(additionalParams).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
        return url.pathname + url.search;
      }
      return baseUrl;
    }
    
    const url = new URL(baseUrl, window.location.origin);
    const utmParams = getUTMParams();
    
    // Adicionar parâmetros UTM
    Object.entries(utmParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    // Adicionar parâmetros adicionais se fornecidos
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    // Retornar apenas pathname + search para manter consistência
    return url.pathname + url.search;
  };

  // Função para limpar parâmetros UTM (útil para logout ou nova sessão)
  const clearUTMParams = (): void => {
    // Verificar se está no ambiente do cliente
    if (typeof window === 'undefined') return;
    
    UTM_PARAMS.forEach(param => {
      sessionStorage.removeItem(param);
    });
    
    // Remover da URL atual também
    const currentUrl = new URL(window.location.href);
    UTM_PARAMS.forEach(param => {
      currentUrl.searchParams.delete(param);
    });
    
    window.history.replaceState({}, '', currentUrl.toString());
  };

  return {
    getUTMParams,
    buildURLWithUTM,
    clearUTMParams
  };
};