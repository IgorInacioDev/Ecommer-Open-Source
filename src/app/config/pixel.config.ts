/**
 * Facebook Pixel Configuration
 * Complete configuration for different environments and features
 */

import { PixelConfig, EnvironmentConfig, Environment } from '../types/facebook-pixel';

// Environment detection
const getEnvironment = (): Environment => {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV as Environment || 'development';
  }
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('dev')) {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('test')) {
    return 'staging';
  }
  
  return 'production';
};

// Environment-specific configurations
const environmentConfigs: Record<Environment, EnvironmentConfig> = {
  development: {
    pixelId: process.env.FB_PIXEL_ID_DEV || 'YOUR_DEV_PIXEL_ID',
    enabled: process.env.FB_PIXEL_ENABLED !== 'false',
    debug: true,
    testMode: true,
    serverSideEnabled: false,
    conversionsApiUrl: process.env.FB_CONVERSIONS_API_URL_DEV,
    accessToken: process.env.FB_CONVERSIONS_API_TOKEN_DEV,
  },
  staging: {
    pixelId: process.env.FB_PIXEL_ID_STAGING || 'YOUR_STAGING_PIXEL_ID',
    enabled: process.env.FB_PIXEL_ENABLED !== 'false',
    debug: true,
    testMode: true,
    serverSideEnabled: true,
    conversionsApiUrl: process.env.FB_CONVERSIONS_API_URL_STAGING,
    accessToken: process.env.FB_CONVERSIONS_API_TOKEN_STAGING,
  },
  production: {
    pixelId: process.env.FB_PIXEL_ID || 'YOUR_PRODUCTION_PIXEL_ID',
    enabled: process.env.FB_PIXEL_ENABLED !== 'false',
    debug: false,
    testMode: false,
    serverSideEnabled: true,
    conversionsApiUrl: process.env.FB_CONVERSIONS_API_URL,
    accessToken: process.env.FB_CONVERSIONS_API_TOKEN,
  },
};

// Get current environment config
const currentEnvironment = getEnvironment();
const environmentConfig = environmentConfigs[currentEnvironment];

// Main pixel configuration
export const pixelConfig: PixelConfig = {
  autoPageView: true, // Add missing required property
  pixelId: environmentConfig.pixelId,
  enabled: environmentConfig.enabled,
  debug: environmentConfig.debug,
  testMode: environmentConfig.testMode,
  enhancedMatching: process.env.FB_ENHANCED_MATCHING !== 'false',
  serverSideEnabled: process.env.FB_SERVER_SIDE_ENABLED === 'true',
  
  // Data Processing Options for GDPR/CCPA compliance
  dataProcessingOptions: {
    method: [], // Empty array means no restrictions
    country: undefined,
    state: undefined,
  },
  
  // Custom data to be sent with all events
  customData: {
    source: 'website',
    version: '1.0.0',
    framework: 'nextjs',
  },
};

// Server-side configuration
export const serverSideConfig = {
  enabled: environmentConfig.serverSideEnabled,
  conversionsApiUrl: environmentConfig.conversionsApiUrl || 'https://graph.facebook.com/v18.0',
  accessToken: environmentConfig.accessToken,
  testEventCode: process.env.FB_TEST_EVENT_CODE,
  apiVersion: 'v18.0',
  timeout: 5000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Event configuration
export const eventConfig = {
  // Queue settings
  maxQueueSize: 100,
  queueTimeout: 5000,
  batchSize: 10,
  
  // Retry settings
  maxRetries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  
  // Debounce settings for frequent events
  debounceDelay: {
    scroll: 1000,
    resize: 500,
    mousemove: 2000,
    click: 100,
  },
  
  // Auto-tracking settings
  autoTrack: {
    pageViews: true,
    clicks: false,
    formSubmissions: true,
    scrollDepth: false,
    timeOnPage: false,
  },
};

// Enhanced Matching configuration
export const enhancedMatchingConfig = {
  enabled: pixelConfig.enhancedMatching,
  autoCollect: {
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
    dateOfBirth: false, // Usually not auto-collected for privacy
    gender: false, // Usually not auto-collected for privacy
    city: true,
    state: true,
    zipCode: true,
    country: true,
    externalId: true,
  },
  
  // Form field selectors for auto-collection
  fieldSelectors: {
    email: ['input[type="email"]', 'input[name*="email"]', '#email', '.email'],
    phone: ['input[type="tel"]', 'input[name*="phone"]', 'input[name*="telefone"]', '#phone', '.phone'],
    firstName: ['input[name*="first"]', 'input[name*="nome"]', '#firstName', '#first-name'],
    lastName: ['input[name*="last"]', 'input[name*="sobrenome"]', '#lastName', '#last-name'],
    city: ['input[name*="city"]', 'input[name*="cidade"]', '#city'],
    state: ['input[name*="state"]', 'input[name*="estado"]', '#state'],
    zipCode: ['input[name*="zip"]', 'input[name*="cep"]', '#zipCode', '#zip'],
    country: ['select[name*="country"]', 'select[name*="pais"]', '#country'],
  },
  
  // Hash settings
  hashAlgorithm: 'SHA-256',
  normalizeData: true,
};

// Privacy and compliance configuration
export const privacyConfig = {
  gdprCompliance: true,
  ccpaCompliance: true,
  lgpdCompliance: true,
  
  // Consent management
  requireConsent: process.env.FB_REQUIRE_CONSENT === 'true',
  consentCookieName: 'fb_pixel_consent',
  consentCookieExpiry: 365, // days
  
  // Data retention
  dataRetentionDays: 180,
  
  // Opt-out settings
  optOutCookieName: 'fb_pixel_opt_out',
  optOutUrl: '/privacy/opt-out',
  
  // Data processing restrictions
  restrictedCountries: [], // ISO country codes
  restrictedRegions: [], // State/region codes
};

// Performance configuration
export const performanceConfig = {
  // Script loading
  asyncLoading: true,
  deferLoading: false,
  preconnect: true,
  
  // Event batching
  batchEvents: true,
  batchDelay: 100,
  maxBatchSize: 10,
  
  // Caching
  cacheEvents: true,
  cacheExpiry: 300000, // 5 minutes
  
  // Performance monitoring
  measurePerformance: environmentConfig.debug,
  performanceThreshold: 100, // ms
};

// Debug configuration
export const debugConfig = {
  enabled: environmentConfig.debug,
  verbose: process.env.FB_DEBUG_VERBOSE === 'true',
  logLevel: (process.env.FB_LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
  
  // Console logging
  logToConsole: true,
  logEvents: true,
  logErrors: true,
  logPerformance: true,
  
  // Visual debugging
  showDebugPanel: environmentConfig.debug && process.env.FB_SHOW_DEBUG_PANEL === 'true',
  highlightTrackedElements: false,
  
  // Event validation
  validateEvents: true,
  strictValidation: environmentConfig.debug,
};

// Utility functions
export const getPixelId = (): string => {
  return pixelConfig.pixelId;
};

export const isPixelEnabled = (): boolean => {
  return pixelConfig.enabled && !!pixelConfig.pixelId && pixelConfig.pixelId !== 'YOUR_PRODUCTION_PIXEL_ID';
};

export const isDebugMode = (): boolean => {
  return debugConfig.enabled;
};

export const isTestMode = (): boolean => {
  return pixelConfig.testMode;
};

export const getCurrentEnvironment = (): Environment => {
  return currentEnvironment;
};

export const getEnvironmentConfig = (): EnvironmentConfig => {
  return environmentConfig;
};

// Validation function
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!pixelConfig.pixelId || pixelConfig.pixelId.includes('YOUR_')) {
    errors.push('Facebook Pixel ID is not configured properly');
  }
  
  if (serverSideConfig.enabled && !serverSideConfig.accessToken) {
    errors.push('Conversions API access token is required when server-side events are enabled');
  }
  
  if (privacyConfig.requireConsent && !privacyConfig.consentCookieName) {
    errors.push('Consent cookie name is required when consent is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Export all configurations
const pixelConfiguration = {
  pixel: pixelConfig,
  serverSide: serverSideConfig,
  events: eventConfig,
  enhancedMatching: enhancedMatchingConfig,
  privacy: privacyConfig,
  performance: performanceConfig,
  debug: debugConfig,
  environment: currentEnvironment,
  validation: validateConfig(),
};

export default pixelConfiguration;

// Type exports for external use
export type {
  PixelConfig,
  EnvironmentConfig,
  Environment,
} from '../types/facebook-pixel';