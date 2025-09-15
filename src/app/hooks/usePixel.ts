'use client';

import { useCallback, useEffect, useRef } from 'react';
import FacebookPixel from '../lib/facebook-pixel/pixel';
import { validateEventData } from '../lib/facebook-pixel/validation';
import { pixelConfig } from '../config/pixel.config';
import type {
  StandardEvent,
  EventParameters,
  CustomEventParameters,
  EnhancedMatchingData
} from '../types/facebook-pixel';

/**
 * Interface para configuração do hook usePixel
 */
interface UsePixelConfig {
  /** Habilitar logs detalhados em desenvolvimento */
  enableDebugLogs?: boolean;
  /** Timeout para retry de eventos (ms) */
  retryTimeout?: number;
  /** Número máximo de tentativas de retry */
  maxRetries?: number;
  /** Habilitar deduplicação automática */
  enableDeduplication?: boolean;
}

/**
 * Interface para resultado do tracking
 */
interface TrackingResult {
  success: boolean;
  eventId?: string;
  error?: string;
  retries?: number;
}

/**
 * Interface para estatísticas do pixel
 */
interface PixelStats {
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  queuedEvents: number;
  duplicateEvents: number;
}

/**
 * Hook principal para tracking de eventos do Facebook Pixel
 * Fornece interface simples com validação automática, queue e retry
 */
export function usePixel(config: UsePixelConfig = {}) {
  const {
    enableDebugLogs = pixelConfig.debug,
    retryTimeout = 3000,
    maxRetries = 3,
    enableDeduplication = true
  } = config;

  // Referências para controle interno
  const pixelRef = useRef<typeof FacebookPixel | null>(null);
  const statsRef = useRef<PixelStats>({
    totalEvents: 0,
    successfulEvents: 0,
    failedEvents: 0,
    queuedEvents: 0,
    duplicateEvents: 0
  });
  const eventHistoryRef = useRef<Set<string>>(new Set());

  // Inicialização do pixel
  useEffect(() => {
    if (!pixelRef.current) {
      pixelRef.current = FacebookPixel;
      
      if (enableDebugLogs) {
        console.log('[usePixel] Pixel instance initialized');
      }
    }
  }, [enableDebugLogs]);

  /**
   * Gera ID único para evento (para deduplicação)
   */
  const generateEventId = useCallback((eventName: string, eventData?: Record<string, unknown>): string => {
    const timestamp = Date.now();
    const dataHash = eventData ? JSON.stringify(eventData).slice(0, 50) : '';
    return `${eventName}_${dataHash}_${timestamp}`.replace(/[^a-zA-Z0-9_]/g, '_');
  }, []);

  /**
   * Verifica se evento é duplicado
   */
  const isDuplicateEvent = useCallback((eventId: string): boolean => {
    if (!enableDeduplication) return false;
    
    if (eventHistoryRef.current.has(eventId)) {
      statsRef.current.duplicateEvents++;
      return true;
    }
    
    eventHistoryRef.current.add(eventId);
    
    // Limpar histórico antigo (manter apenas últimos 1000 eventos)
    if (eventHistoryRef.current.size > 1000) {
      const entries = Array.from(eventHistoryRef.current);
      eventHistoryRef.current.clear();
      entries.slice(-500).forEach(id => eventHistoryRef.current.add(id));
    }
    
    return false;
  }, [enableDeduplication]);

  /**
   * Função principal para tracking de eventos
   */
  const trackEvent = useCallback(async (
    eventName: StandardEvent,
    eventData?: EventParameters,
    customData?: CustomEventParameters,
    enhancedMatching?: EnhancedMatchingData
  ): Promise<TrackingResult> => {
    try {
      if (!pixelRef.current) {
        throw new Error('Pixel not initialized');
      }

      // Gerar ID do evento
      const eventId = generateEventId(eventName, eventData as Record<string, unknown>);
      
      // Verificar duplicação
      if (isDuplicateEvent(eventId)) {
        if (enableDebugLogs) {
          console.warn(`[usePixel] Duplicate event blocked: ${eventName}`, { eventId });
        }
        return { success: false, error: 'Duplicate event', eventId };
      }

      // Validar dados do evento
      const validation = validateEventData(eventName, eventData);
      if (!validation.isValid) {
        const error = `Validation failed: ${validation.errors.join(', ')}`;
        if (enableDebugLogs) {
          console.error(`[usePixel] ${error}`, { eventName, eventData });
        }
        statsRef.current.failedEvents++;
        return { success: false, error, eventId };
      }

      // Incrementar contadores
      statsRef.current.totalEvents++;
      statsRef.current.queuedEvents++;

      // Executar tracking com retry
      let retries = 0;
      let lastError: Error | null = null;

      while (retries <= maxRetries) {
        try {
          await pixelRef.current.trackEvent(eventName, eventData, enhancedMatching);
          
          // Sucesso
          statsRef.current.successfulEvents++;
          statsRef.current.queuedEvents--;
          
          if (enableDebugLogs) {
            console.log(`[usePixel] Event tracked successfully: ${eventName}`, {
              eventId,
              retries,
              eventData,
              customData
            });
          }
          
          return { success: true, eventId, retries };
        } catch (error) {
          lastError = error as Error;
          retries++;
          
          if (retries <= maxRetries) {
            if (enableDebugLogs) {
              console.warn(`[usePixel] Retry ${retries}/${maxRetries} for event: ${eventName}`, {
                error: lastError.message,
                eventId
              });
            }
            
            // Aguardar antes do retry
            await new Promise(resolve => setTimeout(resolve, retryTimeout * retries));
          }
        }
      }

      // Falha após todas as tentativas
      statsRef.current.failedEvents++;
      statsRef.current.queuedEvents--;
      
      const error = `Failed after ${maxRetries} retries: ${lastError?.message || 'Unknown error'}`;
      if (enableDebugLogs) {
        console.error(`[usePixel] ${error}`, { eventName, eventId });
      }
      
      return { success: false, error, eventId, retries };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      statsRef.current.failedEvents++;
      
      if (enableDebugLogs) {
        console.error('[usePixel] Tracking error:', errorMessage);
      }
      
      return { success: false, error: errorMessage };
    }
  }, [enableDebugLogs, retryTimeout, maxRetries, generateEventId, isDuplicateEvent]);

  /**
   * Função simplificada para eventos sem dados
   */
  const trackSimpleEvent = useCallback(async (eventName: StandardEvent): Promise<TrackingResult> => {
    return trackEvent(eventName);
  }, [trackEvent]);

  /**
   * Função para tracking em lote
   */
  const trackBatchEvents = useCallback(async (
    events: Array<{
      eventName: StandardEvent;
      eventData?: EventParameters;
      customData?: CustomEventParameters;
      enhancedMatching?: EnhancedMatchingData;
    }>
  ): Promise<TrackingResult[]> => {
    const results: TrackingResult[] = [];
    
    for (const event of events) {
      const result = await trackEvent(
        event.eventName,
        event.eventData,
        event.customData,
        event.enhancedMatching
      );
      results.push(result);
      
      // Pequeno delay entre eventos para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }, [trackEvent]);

  /**
   * Obter estatísticas do pixel
   */
  const getStats = useCallback((): PixelStats => {
    return { ...statsRef.current };
  }, []);

  /**
   * Limpar estatísticas
   */
  const clearStats = useCallback((): void => {
    statsRef.current = {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      queuedEvents: 0,
      duplicateEvents: 0
    };
    eventHistoryRef.current.clear();
    
    if (enableDebugLogs) {
      console.log('[usePixel] Stats cleared');
    }
  }, [enableDebugLogs]);

  /**
   * Verificar se pixel está carregado
   */
  const isPixelLoaded = useCallback((): boolean => {
    return pixelRef.current?.getPixelStatus()?.isLoaded || false;
  }, []);

  /**
   * Obter configuração atual do pixel
   */
  const getPixelConfig = useCallback(() => {
    return null; // Config não está disponível no getPixelStatus
  }, []);

  /**
   * Forçar carregamento do pixel
   */
  const loadPixel = useCallback(async (): Promise<boolean> => {
    try {
      if (!pixelRef.current) {
        pixelRef.current = FacebookPixel;
      }
      
      await pixelRef.current.initializePixel();
      return true;
    } catch (error) {
      if (enableDebugLogs) {
        console.error('[usePixel] Failed to load pixel:', error);
      }
      return false;
    }
  }, [enableDebugLogs]);

  return {
    // Funções principais
    trackEvent,
    trackSimpleEvent,
    trackBatchEvents,
    
    // Utilitários
    getStats,
    clearStats,
    isPixelLoaded,
    getPixelConfig,
    loadPixel,
    
    // Estado
    stats: statsRef.current
  };
}

/**
 * Hook simplificado para casos básicos
 */
export function useSimplePixel() {
  const { trackEvent, trackSimpleEvent, isPixelLoaded } = usePixel({
    enableDebugLogs: false,
    enableDeduplication: true
  });
  
  return {
    track: trackEvent,
    trackSimple: trackSimpleEvent,
    isLoaded: isPixelLoaded
  };
}

/**
 * Hook para tracking com debug habilitado
 */
export function usePixelDebug() {
  return usePixel({
    enableDebugLogs: true,
    enableDeduplication: true,
    maxRetries: 1
  });
}

export default usePixel;