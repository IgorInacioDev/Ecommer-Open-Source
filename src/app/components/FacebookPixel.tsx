'use client';

/**
 * Facebook Pixel Component
 * Main component for Facebook Pixel initialization with GDPR/LGPD compliance
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  PixelInitOptions,
  ConsentStatus,
  DebugInfo,
  PixelConfig,
} from '../types/facebook-pixel';
import {
  initializePixel,
  setConsent,
  getPixelStatus,
  getDebugInfo,
  clearDebugInfo,
  setDebugMode,
  trackPageView,
  getPixelConfig,
} from '../lib/facebook-pixel/pixel';

/**
 * Props for FacebookPixel component
 */
interface FacebookPixelProps {
  /** Custom pixel ID (overrides config) */
  pixelId?: string;
  /** Enable debug mode */
  debug?: boolean;
  /** Auto track page views */
  autoTrackPageView?: boolean;
  /** Initial consent status */
  initialConsent?: Partial<ConsentStatus>;
  /** Consent manager integration */
  consentManager?: {
    onConsentChange?: (consent: ConsentStatus) => void;
    getConsent?: () => Promise<ConsentStatus>;
  };
  /** Custom initialization options */
  initOptions?: Partial<PixelInitOptions>;
  /** Show debug UI in development */
  showDebugUI?: boolean;
  /** Callback when pixel is loaded */
  onPixelLoaded?: () => void;
  /** Callback when pixel fails to load */
  onPixelError?: (error: Error) => void;
  /** Custom CSS class for debug UI */
  debugUIClassName?: string;
}

/**
 * Debug UI Component
 */
const DebugUI: React.FC<{
  debugInfo: DebugInfo;
  onClear: () => void;
  className?: string;
}> = ({ debugInfo, onClear, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'errors' | 'warnings'>('events');

  const tabData = useMemo(() => {
    switch (activeTab) {
      case 'events':
        return debugInfo.events.slice(-10); // Show last 10 events
      case 'errors':
        return debugInfo.errors.slice(-10);
      case 'warnings':
        return debugInfo.warnings.slice(-10);
      default:
        return [];
    }
  }, [debugInfo, activeTab]);

  if (!debugInfo.isLoaded && debugInfo.events.length === 0) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-gray-900 text-[#F5F5F5] rounded-lg shadow-lg z-50 ${className || ''}`}
      style={{
        minWidth: '300px',
        maxWidth: '500px',
        fontSize: '12px',
        fontFamily: 'monospace',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              debugInfo.isLoaded ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <span className="font-semibold">Facebook Pixel Debug</span>
          <span className="text-gray-400">({debugInfo.pixelId})</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">
            Queue: {debugInfo.queueSize}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="text-xs text-gray-400 hover:text-[#F5F5F5]"
          >
            Clear
          </button>
          <span className="text-gray-400">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-3">
          {/* Status */}
          <div className="mb-3 text-xs">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={debugInfo.isLoaded ? 'text-green-400' : 'text-red-400'}>
                {debugInfo.isLoaded ? 'Loaded' : 'Not Loaded'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Events:</span>
              <span className="text-blue-400">{debugInfo.events.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Errors:</span>
              <span className="text-red-400">{debugInfo.errors.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Warnings:</span>
              <span className="text-yellow-400">{debugInfo.warnings.length}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-2">
            {(['events', 'errors', 'warnings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-2 py-1 text-xs rounded ${
                  activeTab === tab
                    ? 'bg-blue-600 text-[#F5F5F5]'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'events' && ` (${debugInfo.events.length})`}
                {tab === 'errors' && ` (${debugInfo.errors.length})`}
                {tab === 'warnings' && ` (${debugInfo.warnings.length})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="max-h-40 overflow-y-auto">
            {tabData.length === 0 ? (
              <div className="text-gray-400 text-xs">No {activeTab} to display</div>
            ) : (
              <div className="space-y-1">
                {tabData.map((item: { message: string; timestamp: number; data?: unknown }, index) => (
                  <div key={index} className="text-xs border-b border-gray-700 pb-1">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-300 truncate flex-1">
                        {item.message}
                      </span>
                      <span className="text-gray-500 text-xs ml-2">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {Boolean(item.data) && (
                      <div className="text-gray-400 mt-1 text-xs">
                        {(() => {
                          const data = item.data;
                          if (typeof data === 'string') {
                            return data;
                          }
                          if (typeof data === 'object' && data !== null) {
                            return JSON.stringify(data, null, 2).slice(0, 100) + '...';
                          }
                          return String(data);
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main Facebook Pixel Component
 */
const FacebookPixel: React.FC<FacebookPixelProps> = ({
  pixelId,
  debug = false,
  autoTrackPageView = true,
  initialConsent,
  consentManager,
  initOptions = {},
  showDebugUI = false,
  onPixelLoaded,
  onPixelError,
  debugUIClassName,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [consent, setConsentState] = useState<ConsentStatus>({
    granted: false,
    categories: {
      analytics: false,
      marketing: false,
      functional: true,
    },
    ...initialConsent,
  });
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    events: [],
    errors: [],
    warnings: [],
    pixelId: '',
    isLoaded: false,
    queueSize: 0,
  });

  // Get config
  const config = useMemo(() => getPixelConfig(), []);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const shouldShowDebugUI = showDebugUI && isDevelopment && debug;

  /**
   * Initialize consent from consent manager
   */
  const initializeConsent = useCallback(async () => {
    if (consentManager?.getConsent) {
      try {
        const consentStatus = await consentManager.getConsent();
        setConsentState(consentStatus);
        setConsent(consentStatus);
      } catch (error) {
        console.warn('Failed to get consent from consent manager:', error);
      }
    } else if (initialConsent) {
      setConsent(initialConsent);
    }
  }, [consentManager, initialConsent]);

  /**
   * Handle consent changes
   */
  const handleConsentChange = useCallback(
    (newConsent: Partial<ConsentStatus>) => {
      const updatedConsent = { ...consent, ...newConsent };
      setConsentState(updatedConsent);
      setConsent(updatedConsent);
      consentManager?.onConsentChange?.(updatedConsent);
    },
    [consent, consentManager]
  );

  /**
   * Initialize Facebook Pixel
   */
  const initPixel = useCallback(async () => {
    try {
      setInitError(null);

      // Set debug mode
      if (debug || isDevelopment) {
        setDebugMode(true);
      }

      // Initialize pixel
      const options: PixelInitOptions = {
        pixelId: pixelId || config.pixel.pixelId,
        debug: debug || isDevelopment,
        ...initOptions,
      };

      await initializePixel(options);
      setIsInitialized(true);
      onPixelLoaded?.();

      // Auto track page view if enabled
      if (autoTrackPageView) {
        await trackPageView();
      }
    } catch (error) {
      const pixelError = error instanceof Error ? error : new Error('Unknown pixel initialization error');
      setInitError(pixelError);
      onPixelError?.(pixelError);
      console.error('Facebook Pixel initialization failed:', pixelError);
    }
  }, [pixelId, config.pixel.pixelId, debug, isDevelopment, initOptions, autoTrackPageView, onPixelLoaded, onPixelError]);

  /**
   * Update debug info periodically
   */
  const updateDebugInfo = useCallback(() => {
    if (debug || isDevelopment) {
      const info = getDebugInfo();
      setDebugInfo(info);
    }
  }, [debug, isDevelopment]);

  /**
   * Clear debug info
   */
  const handleClearDebugInfo = useCallback(() => {
    clearDebugInfo();
    updateDebugInfo();
  }, [updateDebugInfo]);

  // Initialize consent on mount
  useEffect(() => {
    initializeConsent();
  }, [initializeConsent]);

  // Initialize pixel when consent is granted
  useEffect(() => {
    if (!isInitialized && (consent.granted || consent.categories.marketing)) {
      initPixel();
    }
  }, [isInitialized, consent, initPixel]);

  // Update debug info periodically
  useEffect(() => {
    if (!shouldShowDebugUI) return;

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [shouldShowDebugUI, updateDebugInfo]);

  // Track page view on route changes
  useEffect(() => {
    if (!isInitialized || !autoTrackPageView) return;

    const handleRouteChange = () => {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        trackPageView().catch(console.error);
      }, 100);
    };

    // Listen for Next.js route changes
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
      
      // For Next.js App Router
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        handleRouteChange();
      };
      
      window.history.replaceState = function(...args) {
        originalReplaceState.apply(window.history, args);
        handleRouteChange();
      };

      return () => {
        window.removeEventListener('popstate', handleRouteChange);
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
      };
    }
  }, [isInitialized, autoTrackPageView]);

  // Expose consent handler to parent components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & { fbPixelConsent?: typeof handleConsentChange }).fbPixelConsent = handleConsentChange;
    }
  }, [handleConsentChange]);

  // Render debug UI if enabled
  if (shouldShowDebugUI) {
    return (
      <DebugUI
        debugInfo={debugInfo}
        onClear={handleClearDebugInfo}
        className={debugUIClassName}
      />
    );
  }

  // Component doesn't render anything visible in production
  return null;
};

/**
 * Consent Banner Component (optional)
 */
export const FacebookPixelConsentBanner: React.FC<{
  onAccept: () => void;
  onDecline: () => void;
  onCustomize?: () => void;
  className?: string;
  message?: string;
}> = ({
  onAccept,
  onDecline,
  onCustomize,
  className = '',
  message = 'We use cookies and tracking pixels to improve your experience and for marketing purposes.',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline();
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-gray-900 text-[#F5F5F5] p-4 z-50 ${className}`}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <div className="flex space-x-3">
          {onCustomize && (
            <button
              onClick={onCustomize}
              className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
            >
              Customize
            </button>
          )}
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for using Facebook Pixel consent
 */
export const useFacebookPixelConsent = () => {
  const [consent, setConsentState] = useState<ConsentStatus>({
    granted: false,
    categories: {
      analytics: false,
      marketing: false,
      functional: true,
    },
  });

  const updateConsent = useCallback((newConsent: Partial<ConsentStatus>) => {
    const updatedConsent = { ...consent, ...newConsent };
    setConsentState(updatedConsent);
    setConsent(updatedConsent);
  }, [consent]);

  const grantConsent = useCallback(() => {
    updateConsent({
      granted: true,
      categories: {
        analytics: true,
        marketing: true,
        functional: true,
      },
    });
  }, [updateConsent]);

  const revokeConsent = useCallback(() => {
    updateConsent({
      granted: false,
      categories: {
        analytics: false,
        marketing: false,
        functional: true,
      },
    });
  }, [updateConsent]);

  return {
    consent,
    updateConsent,
    grantConsent,
    revokeConsent,
  };
};

export default FacebookPixel;