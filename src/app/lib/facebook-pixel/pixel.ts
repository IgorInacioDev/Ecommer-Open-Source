/**
 * Facebook Pixel Core Implementation
 * Complete pixel management with async loading, event queue, and retry logic
 */

import {
  FacebookPixel,
  StandardEvent,
  EventParameters,
  CustomEventParameters,
  EnhancedMatchingData,
  DebugInfo,
  PixelError,
  EventQueueItem,
  PixelContext,
} from '../../types/facebook-pixel';

// Define missing interfaces locally
 interface PixelConfig {
   pixel: {
     pixelId: string;
   };
   debug: {
     enabled: boolean;
     verbose: boolean;
     logLevel: string;
     logToConsole: boolean;
     logEvents: boolean;
     logErrors: boolean;
     logPerformance: boolean;
     showDebugPanel: boolean;
     highlightTrackedElements: boolean;
     validateEvents: boolean;
     strictValidation: boolean;
   };
   enhancedMatching: {
     enabled: boolean;
   };
   privacy: {
     requireConsent: boolean;
   };
 }

interface PixelInitOptions {
  pixelId?: string;
  debug?: boolean;
}

interface EventQueue {
  eventName: string;
  parameters?: EventParameters;
  enhancedMatching?: EnhancedMatchingData;
  timestamp: number;
}

interface PixelInstance {
  pixelId: string;
  isLoaded: boolean;
  config: PixelConfig;
  enhancedMatching?: EnhancedMatchingData;
}

interface ConsentStatus {
  granted: boolean;
  categories: {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
}
import pixelConfigDefault from '../../config/pixel.config';
export const getPixelConfig = () => pixelConfigDefault;
import { validateEventData, validatePixelId } from './validation';
import { sha256Hash, formatPrice, getDeviceType, autoCollectEnhancedMatching } from './utils';

/**
 * Global pixel instance
 */
let pixelInstance: PixelInstance | null = null;

/**
 * Event queue for events fired before pixel is loaded
 */
let eventQueue: EventQueue[] = [];

/**
 * Pixel loading state
 */
let isPixelLoaded = false;
let isPixelLoading = false;

/**
 * Consent status
 */
let consentStatus: ConsentStatus = {
  granted: false,
  categories: {
    analytics: false,
    marketing: false,
    functional: true,
  },
};

/**
 * Debug mode state
 */
let debugMode = false;
let debugInfo: DebugInfo = {
  events: [],
  errors: [],
  warnings: [],
  pixelId: '',
  isLoaded: false,
  queueSize: 0,
};

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 2,
};

/**
 * Debounce configuration for frequent events
 */
const DEBOUNCE_CONFIG = {
  scroll: 1000,
  mousemove: 500,
  resize: 1000,
};

/**
 * Event deduplication cache
 */
const eventCache = new Map<string, number>();
const DEDUPLICATION_WINDOW = 5000; // 5 seconds

/**
 * Enhanced matching data cache
 */
let enhancedMatchingCache: EnhancedMatchingData | null = null;

// Debug logging is now handled by eventLog function

/**
 * Log error information
 */
const errorLog = (message: string, error?: Error | string | unknown): void => {
  const timestamp = Date.now();
  const errorEntry = { message, timestamp, data: error };
  
  console.error(`[Facebook Pixel Error] ${message}`, error || '');
  // Add error to debug info
  debugInfo.errors.push(errorEntry);
  // Keep only last 50 errors
  if (debugInfo.errors.length > 50) {
    debugInfo.errors = debugInfo.errors.slice(-50);
  }
};

/**
 * Log warning information
 */
const warningLog = (message: string, data?: Record<string, unknown>): void => {
  const timestamp = Date.now();
  const warningEntry = { message, timestamp, data };
  
  console.warn(`[Facebook Pixel Warning] ${message}`, data || '');
  // Add warning to debug info
  debugInfo.warnings.push(warningEntry);
  // Keep only last 50 warnings
  if (debugInfo.warnings.length > 50) {
    debugInfo.warnings = debugInfo.warnings.slice(-50);
  }
};

/**
 * Log event information
 */
const eventLog = (message: string, data?: Record<string, unknown> | EnhancedMatchingData | ConsentStatus): void => {
  const timestamp = Date.now();
  const eventEntry = { message, timestamp, data };
  
  if (debugMode) {
    console.log(`[Facebook Pixel Event] ${message}`, data || '');
  }
  // Add event to debug info
  debugInfo.events.push(eventEntry);
  // Keep only last 50 events
  if (debugInfo.events.length > 50) {
    debugInfo.events = debugInfo.events.slice(-50);
  }
};

/**
 * Generate event cache key for deduplication
 */
const generateEventCacheKey = (
  eventName: string,
  parameters?: EventParameters
): string => {
  const paramString = parameters ? JSON.stringify(parameters) : '';
  return `${eventName}:${paramString}`;
};

/**
 * Check if event is duplicate
 */
const isDuplicateEvent = (
  eventName: string,
  parameters?: EventParameters
): boolean => {
  const cacheKey = generateEventCacheKey(eventName, parameters);
  const now = Date.now();
  const lastEventTime = eventCache.get(cacheKey);
  
  if (lastEventTime && (now - lastEventTime) < DEDUPLICATION_WINDOW) {
    return true;
  }
  
  eventCache.set(cacheKey, now);
  return false;
};

/**
 * Clean up old cache entries
 */
const cleanupEventCache = (): void => {
  const now = Date.now();
  for (const [key, timestamp] of eventCache.entries()) {
    if (now - timestamp > DEDUPLICATION_WINDOW) {
      eventCache.delete(key);
    }
  }
};

/**
 * Load Facebook Pixel script asynchronously
 */
const loadPixelScript = async (pixelId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Facebook Pixel can only be loaded in browser environment'));
      return;
    }

    // Check if script is already loaded
    if (typeof window.fbq === 'function') {
      eventLog('Facebook Pixel script already loaded');
      resolve();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    script.onload = () => {
      eventLog('Facebook Pixel script loaded successfully');
      resolve();
    };
    
    script.onerror = () => {
      const error = new Error('Failed to load Facebook Pixel script');
      errorLog('Script loading failed', error);
      reject(error);
    };

    // Initialize fbq function
    if (!window.fbq) {
      const fbq = function(command: string, ...args: unknown[]) {
        (fbq.queue = fbq.queue || []).push(args);
      } as FacebookPixel;
      
      fbq.queue = [];
      fbq.push = (args: unknown[]) => fbq.queue.push(args);
      fbq.loaded = true;
      fbq.version = '2.0';
      
      window.fbq = fbq;
      window._fbq = fbq;
    }

    // Add script to document
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  });
};

/**
 * Initialize Facebook Pixel
 */
export const initializePixel = async (options: PixelInitOptions = {}): Promise<void> => {
  try {
    const config = getPixelConfig();
    const pixelId = options.pixelId || config.pixel.pixelId;
    
    // Validate pixel ID
    const validation = validatePixelId(pixelId);
    if (!validation.isValid) {
      throw new Error(`Invalid pixel ID: ${validation.errors.join(', ')}`);
    }

    // Set debug mode
    debugMode = options.debug ?? config.debug.enabled;
    debugInfo.pixelId = pixelId;
    
    eventLog('Initializing Facebook Pixel', { pixelId, options });

    // Check if already initialized
    if (pixelInstance) {
      warningLog('Facebook Pixel already initialized');
      return;
    }

    // Set loading state
    isPixelLoading = true;

    // Load pixel script
    await loadPixelScript(pixelId);

    // Initialize pixel
    if (window.fbq) {
      // Set up enhanced matching if available
      let enhancedMatching: EnhancedMatchingData | undefined;
      
      if (config.enhancedMatching.enabled) {
        enhancedMatching = await autoCollectEnhancedMatching();
        enhancedMatchingCache = enhancedMatching;
        eventLog('Enhanced matching data collected', enhancedMatching);
      }

      // Initialize pixel with enhanced matching
      if (enhancedMatching && Object.keys(enhancedMatching).length > 0) {
        window.fbq('init', pixelId, enhancedMatching);
      } else {
        window.fbq('init', pixelId);
      }

      // Set consent if configured
      if (config.privacy.requireConsent) {
        window.fbq('consent', consentStatus.granted ? 'grant' : 'revoke');
      }

      // Create pixel instance
      pixelInstance = {
        pixelId,
        isLoaded: true,
        config: config,
        enhancedMatching,
      };

      isPixelLoaded = true;
      isPixelLoading = false;
      debugInfo.isLoaded = true;

      eventLog('Facebook Pixel initialized successfully');

      // Process queued events
      await processEventQueue();
    } else {
      throw new Error('Facebook Pixel script loaded but fbq function not available');
    }
  } catch (error) {
    isPixelLoading = false;
    errorLog('Failed to initialize Facebook Pixel', error);
    throw error;
  }
};

/**
 * Process queued events
 */
const processEventQueue = async (): Promise<void> => {
  if (eventQueue.length === 0) return;

  eventLog(`Processing ${eventQueue.length} queued events`);

  const queueCopy = [...eventQueue];
  eventQueue = [];

  for (const queuedEvent of queueCopy) {
    try {
      await trackEventInternal(
        queuedEvent.eventName,
        queuedEvent.parameters,
        queuedEvent.enhancedMatching,
        false // Don't queue again
      );
    } catch (error) {
      errorLog(`Failed to process queued event: ${queuedEvent.eventName}`, error);
    }
  }

  debugInfo.queueSize = eventQueue.length;
};

/**
 * Internal event tracking with retry logic
 */
const trackEventInternal = async (
  eventName: StandardEvent | string,
  parameters?: EventParameters,
  enhancedMatching?: EnhancedMatchingData,
  allowQueue: boolean = true,
  retryCount: number = 0
): Promise<void> => {
  try {
    // Check consent
    if (!consentStatus.granted && !consentStatus.categories.marketing) {
      eventLog(`Event ${eventName} blocked by consent settings`);
      return;
    }

    // Check for duplicates
    if (isDuplicateEvent(eventName, parameters)) {
      eventLog(`Duplicate event ${eventName} detected, skipping`);
      return;
    }

    // Validate event data
    const validation = validateEventData(eventName, parameters, enhancedMatching);
    if (!validation.isValid) {
      throw new Error(`Event validation failed: ${validation.errors.join(', ')}`);
    }

    // Log warnings
    validation.warnings.forEach(warning => warningLog(warning));

    // Queue event if pixel not loaded
    if (!isPixelLoaded && allowQueue) {
      const queuedEvent: EventQueue = {
        eventName,
        parameters,
        enhancedMatching,
        timestamp: Date.now(),
      };
      
      eventQueue.push(queuedEvent);
      debugInfo.queueSize = eventQueue.length;
      eventLog(`Event ${eventName} queued (pixel not loaded)`);
      return;
    }

    // Check if pixel is available
    if (!window.fbq) {
      throw new Error('Facebook Pixel not available');
    }

    // Format parameters
    const formattedParams = parameters ? parameters : undefined;

    // Track event
    if (Object.keys(eventValidationRules).includes(eventName)) {
      // Standard event
      if (formattedParams) {
        window.fbq('track', eventName as StandardEvent, formattedParams);
      } else {
        window.fbq('track', eventName as StandardEvent);
      }
    } else {
      // Custom event
      const fbq = window.fbq as unknown as {
        (command: string, eventName: string, params?: EventParameters | Record<string, unknown>): void;
      };
      if (formattedParams) {
        fbq('trackCustom', eventName, formattedParams);
      } else {
        fbq('trackCustom', eventName);
      }
    }

    eventLog(`Event ${eventName} tracked successfully`, {
      parameters: formattedParams,
      enhancedMatching,
    });

  } catch (error) {
    errorLog(`Failed to track event ${eventName}`, error);

    // Retry logic
    if (retryCount < RETRY_CONFIG.maxRetries) {
      const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount);
      
      eventLog(`Retrying event ${eventName} in ${delay}ms (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      
      setTimeout(() => {
        trackEventInternal(eventName, parameters, enhancedMatching, false, retryCount + 1);
      }, delay);
    } else {
      errorLog(`Max retries exceeded for event ${eventName}`);
      throw error;
    }
  }
};

/**
 * Track event (public API)
 */
export const trackEvent = async (
  eventName: StandardEvent | string,
  parameters?: EventParameters,
  enhancedMatching?: EnhancedMatchingData
): Promise<void> => {
  return trackEventInternal(eventName, parameters, enhancedMatching);
};

/**
 * Track PageView event
 */
export const trackPageView = async (parameters?: EventParameters): Promise<void> => {
  return trackEvent('PageView', parameters);
};

/**
 * Set consent status
 */
export const setConsent = (status: Partial<ConsentStatus>): void => {
  consentStatus = { ...consentStatus, ...status };
  
  eventLog('Consent status updated', consentStatus);

  // Update pixel consent if loaded
  if (isPixelLoaded && window.fbq) {
    const config = getPixelConfig();
    if (config.privacy.requireConsent) {
      window.fbq('consent', consentStatus.granted ? 'grant' : 'revoke');
    }
  }
};

/**
 * Update enhanced matching data
 */
export const updateEnhancedMatching = async (data: Partial<EnhancedMatchingData>): Promise<void> => {
  if (!enhancedMatchingCache) {
    enhancedMatchingCache = {};
  }

  // Hash new data
  const hashedData: EnhancedMatchingData = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'string') {
      hashedData[key as keyof EnhancedMatchingData] = await sha256Hash(value.toLowerCase().trim());
    }
  }

  enhancedMatchingCache = { ...enhancedMatchingCache, ...hashedData };
  
  eventLog('Enhanced matching data updated', enhancedMatchingCache);

  // Update pixel if loaded
  if (pixelInstance) {
    pixelInstance.enhancedMatching = enhancedMatchingCache;
  }
};

/**
 * Get current pixel status
 */
export const getPixelStatus = (): {
  isLoaded: boolean;
  isLoading: boolean;
  pixelId?: string;
  queueSize: number;
  consentStatus: ConsentStatus;
} => {
  return {
    isLoaded: isPixelLoaded,
    isLoading: isPixelLoading,
    pixelId: pixelInstance?.pixelId,
    queueSize: eventQueue.length,
    consentStatus,
  };
};

/**
 * Get debug information
 */
export const getDebugInfo = (): DebugInfo => {
  return {
    ...debugInfo,
    queueSize: eventQueue.length,
  };
};

/**
 * Clear debug information
 */
export const clearDebugInfo = (): void => {
  debugInfo = {
    events: [],
    errors: [],
    warnings: [],
    pixelId: debugInfo.pixelId,
    isLoaded: debugInfo.isLoaded,
    queueSize: eventQueue.length,
  };
};

/**
 * Enable/disable debug mode
 */
export const setDebugMode = (enabled: boolean): void => {
  debugMode = enabled;
  eventLog(`Debug mode ${enabled ? 'enabled' : 'disabled'}`);
};

/**
 * Clear event queue
 */
export const clearEventQueue = (): void => {
  eventQueue = [];
  debugInfo.queueSize = 0;
  eventLog('Event queue cleared');
};

/**
 * Get pixel instance
 */
export const getPixelInstance = (): PixelInstance | null => {
  return pixelInstance;
};

/**
 * Cleanup function for unmounting
 */
export const cleanup = (): void => {
  // Clear timers
  cleanupEventCache();
  
  // Clear queues
  eventQueue = [];
  
  // Reset state
  isPixelLoaded = false;
  isPixelLoading = false;
  pixelInstance = null;
  enhancedMatchingCache = null;
  
  eventLog('Facebook Pixel cleanup completed');
};

/**
 * Initialize cleanup on page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', cleanup);
  
  // Cleanup event cache periodically
  setInterval(cleanupEventCache, 60000); // Every minute
}

// Import validation rules for internal use
const eventValidationRules = {
  PageView: true,
  ViewContent: true,
  Search: true,
  AddToCart: true,
  AddToWishlist: true,
  InitiateCheckout: true,
  AddPaymentInfo: true,
  Purchase: true,
  Lead: true,
  CompleteRegistration: true,
  Contact: true,
  CustomizeProduct: true,
  Donate: true,
  FindLocation: true,
  Schedule: true,
  StartTrial: true,
  SubmitApplication: true,
  Subscribe: true,
  AdImpression: true,
  AdClick: true,
};

const facebookPixel = {
  initializePixel,
  trackEvent,
  trackPageView,
  setConsent,
  updateEnhancedMatching,
  getPixelStatus,
  getDebugInfo,
  clearDebugInfo,
  setDebugMode,
  clearEventQueue,
  getPixelInstance,
  cleanup,
  getPixelConfig,
};

export default facebookPixel;