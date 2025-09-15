/**
 * Facebook Pixel TypeScript Definitions
 * Complete type definitions for Facebook Pixel events and parameters
 */

// Global Facebook Pixel interface
declare global {
  interface Window {
    fbq: FacebookPixel;
    _fbq: FacebookPixel;
  }
}

// Main Facebook Pixel interface
export interface FacebookPixel {
  (command: 'init', pixelId: string, userData?: EnhancedMatchingData): void;
  (command: 'track', eventName: StandardEvent, parameters?: EventParameters): void;
  (command: 'trackCustom', eventName: string, parameters?: CustomEventParameters): void;
  (command: 'trackSingle', pixelId: string, eventName: StandardEvent, parameters?: EventParameters): void;
  (command: 'trackSingleCustom', pixelId: string, eventName: string, parameters?: CustomEventParameters): void;
  (command: 'consent', action: 'grant' | 'revoke'): void;
  (command: 'dataProcessingOptions', options: string[], country?: number, state?: number): void;
  queue: Array<unknown>;
  push: (args: unknown[]) => void;
  loaded: boolean;
  version: string;
}

// Enhanced Matching Data (all 11 parameters)
export interface EnhancedMatchingData {
  em?: string; // Email hash (SHA-256)
  ph?: string; // Phone hash (SHA-256)
  fn?: string; // First name hash (SHA-256)
  ln?: string; // Last name hash (SHA-256)
  db?: string; // Date of birth hash (SHA-256) - YYYYMMDD
  ge?: string; // Gender hash (SHA-256) - 'm' or 'f'
  ct?: string; // City hash (SHA-256)
  st?: string; // State hash (SHA-256)
  zp?: string; // Zip code hash (SHA-256)
  country?: string; // Country hash (SHA-256) - ISO 2-letter code
  external_id?: string; // External ID hash (SHA-256)
}

// Standard Facebook Events
export type StandardEvent =
  | 'PageView'
  | 'ViewContent'
  | 'Search'
  | 'AddToCart'
  | 'AddToWishlist'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase'
  | 'Lead'
  | 'CompleteRegistration'
  | 'Contact'
  | 'CustomizeProduct'
  | 'Donate'
  | 'FindLocation'
  | 'Schedule'
  | 'StartTrial'
  | 'SubmitApplication'
  | 'Subscribe'
  | 'AdImpression'
  | 'AdClick';

// Custom Events
export type CustomEvent = 
  | 'ViewCategory'
  | 'ProductRecommendation'
  | 'NewsletterSignup'
  | 'AccountCreated'
  | 'ProfileUpdated'
  | 'WishlistViewed'
  | 'CartViewed'
  | 'CheckoutStarted'
  | 'PaymentMethodSelected'
  | 'OrderConfirmed'
  | 'ProductReviewed'
  | 'SupportTicketCreated';

// Base Event Parameters
export interface BaseEventParameters {
  value?: number;
  currency?: string; // ISO 4217 currency code
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  contents?: ContentItem[];
  num_items?: number;
  predicted_ltv?: number;
  status?: string;
  search_string?: string;
  custom_data?: Record<string, unknown>;
}

// Content Item for products
export interface ContentItem {
  id: string;
  quantity?: number;
  item_price?: number;
  title?: string;
  description?: string;
  category?: string;
  brand?: string;
}

// Specific Event Parameters
export interface ViewContentParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}

export interface SearchParameters extends BaseEventParameters {
  search_string: string;
  content_category?: string;
  content_ids?: string[];
}

export interface AddToCartParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  value: number;
  currency: string;
  num_items?: number;
}

export interface AddToWishlistParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}

export interface InitiateCheckoutParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  value: number;
  currency: string;
  num_items: number;
}

export interface AddPaymentInfoParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  value: number;
  currency: string;
}

export interface PurchaseParameters extends BaseEventParameters {
  content_ids: string[];
  content_type: 'product' | 'product_group';
  value: number;
  currency: string;
  order_id?: string;
  num_items: number;
}

export interface LeadParameters extends BaseEventParameters {
  content_name?: string;
  content_category?: string;
  value?: number;
  currency?: string;
}

export interface CompleteRegistrationParameters extends BaseEventParameters {
  content_name?: string;
  value?: number;
  currency?: string;
  status?: string;
}

export interface PageViewParameters extends BaseEventParameters {
  content_category?: string;
  content_name?: string;
}

// Union type for all event parameters
export type EventParameters = 
  | ViewContentParameters
  | SearchParameters
  | AddToCartParameters
  | AddToWishlistParameters
  | InitiateCheckoutParameters
  | AddPaymentInfoParameters
  | PurchaseParameters
  | LeadParameters
  | CompleteRegistrationParameters
  | PageViewParameters
  | BaseEventParameters;

// Custom Event Parameters
export interface CustomEventParameters extends BaseEventParameters {
  [key: string]: unknown;
}

// UTM Parameters
export interface UTMParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// Session Data
export interface SessionData {
  page_title?: string;
  page_url?: string;
  referrer?: string;
  user_agent?: string;
  timestamp?: number;
  session_id?: string;
  visitor_id?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
}

// Pixel Configuration
export interface PixelConfig {
  pixelId: string;
  enabled: boolean;
  debug: boolean;
  testMode: boolean;
  autoPageView: boolean;
  enhancedMatching: boolean;
  dataProcessingOptions?: {
    method: string[];
    country?: number;
    state?: number;
  };
  customData?: Record<string, unknown>;
}

// Event Queue Item
export interface EventQueueItem {
  id: string;
  eventName: StandardEvent | string;
  parameters?: EventParameters | CustomEventParameters;
  timestamp: number;
  retryCount: number;
  pixelId?: string;
  isCustom?: boolean;
}

// Pixel Context
export interface PixelContext {
  isLoaded: boolean;
  isInitialized: boolean;
  config: PixelConfig;
  queue: EventQueueItem[];
  enhancedMatchingData?: EnhancedMatchingData;
  sessionData?: SessionData;
  utmParameters?: UTMParameters;
  consentGranted: boolean;
  debugMode: boolean;
}

// Hook Return Types
export interface UsePixelReturn {
  trackEvent: (eventName: StandardEvent, parameters?: EventParameters) => Promise<void>;
  trackCustomEvent: (eventName: string, parameters?: CustomEventParameters) => Promise<void>;
  isLoaded: boolean;
  isInitialized: boolean;
  setEnhancedMatching: (data: Partial<EnhancedMatchingData>) => void;
  grantConsent: () => void;
  revokeConsent: () => void;
  clearQueue: () => void;
  getQueueSize: () => number;
}

// E-commerce Data Types
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  brand?: string;
  description?: string;
  image_url?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  condition?: 'new' | 'refurbished' | 'used';
  custom_data?: Record<string, unknown>;
}

export interface CartItem extends Product {
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total_value: number;
  currency: string;
  shipping_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
  payment_method?: string;
  shipping_method?: string;
  customer_data?: Partial<EnhancedMatchingData>;
  custom_data?: Record<string, unknown>;
}

export interface LeadData {
  name?: string;
  category?: string;
  value?: number;
  currency?: string;
  source?: string;
  custom_data?: Record<string, unknown>;
}

export interface UserData {
  name?: string;
  email?: string;
  phone?: string;
  value?: number;
  currency?: string;
  status?: string;
  custom_data?: Record<string, unknown>;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'array' | 'object' | 'boolean';
  format?: RegExp;
  min?: number;
  max?: number;
  allowedValues?: unknown[];
}

// Error Types
export interface PixelError extends Error {
  code: string;
  eventName?: string;
  parameters?: unknown;
  pixelId?: string;
  timestamp: number;
}

// Debug Types
export interface DebugInfo {
  events: Array<{
    message: string;
    timestamp: number;
    data?: unknown;
  }>;
  errors: Array<{
    message: string;
    timestamp: number;
    data?: unknown;
  }>;
  warnings: Array<{
    message: string;
    timestamp: number;
    data?: unknown;
  }>;
  pixelId: string;
  isLoaded: boolean;
  queueSize: number;
}

// Pixel Initialization Options
export interface PixelInitOptions {
  pixelId: string;
  debug?: boolean;
  testMode?: boolean;
  enhancedMatching?: boolean;
  enhancedMatchingData?: Partial<EnhancedMatchingData>;
  dataProcessingOptions?: {
    method: string[];
    country?: number;
    state?: number;
  };
}

// Consent Status
export interface ConsentStatus {
  granted: boolean;
  categories: {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
}

// Pixel Configuration
export interface PixelConfig {
  pixelId: string;
  enabled: boolean;
  debug: boolean;
  testMode: boolean;
  enhancedMatching: boolean;
  serverSideEnabled: boolean;
  conversionsApiUrl?: string;
  accessToken?: string;
}

// Server-Side Events (Conversions API)
export interface ServerSideEventData {
  event_name: string;
  event_time: number;
  event_id?: string;
  event_source_url?: string;
  user_data?: EnhancedMatchingData;
  custom_data?: Record<string, unknown>;
  data_processing_options?: string[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
}

export interface ConversionsAPIResponse {
  events_received: number;
  messages: string[];
  fbtrace_id: string;
}

// Component Props
export interface FacebookPixelProps {
  pixelId: string;
  enabled?: boolean;
  debug?: boolean;
  testMode?: boolean;
  autoPageView?: boolean;
  enhancedMatching?: boolean;
  enhancedMatchingData?: Partial<EnhancedMatchingData>;
  dataProcessingOptions?: {
    method: string[];
    country?: number;
    state?: number;
  };
  onLoad?: () => void;
  onError?: (error: PixelError) => void;
  children?: React.ReactNode;
}

export interface PixelEventsProps {
  children: React.ReactNode;
  autoTrack?: boolean;
  trackPageViews?: boolean;
  trackClicks?: boolean;
  trackFormSubmissions?: boolean;
}

// Environment Types
export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  pixelId: string;
  enabled: boolean;
  debug: boolean;
  testMode: boolean;
  serverSideEnabled: boolean;
  conversionsApiUrl?: string;
  accessToken?: string;
}

// Export all types
export * from './facebook-pixel.d.ts';