/**
 * Facebook Pixel Utilities
 * Complete utility functions for data processing, hashing, and helpers
 */

import { EnhancedMatchingData, UTMParameters, SessionData, Product, CartItem } from '../../types/facebook-pixel';
import { enhancedMatchingConfig } from '../../config/pixel.config';

/**
 * SHA-256 Hash Function
 * Converts string to SHA-256 hash in lowercase
 */
export const sha256Hash = async (data: string): Promise<string> => {
  if (!data || typeof data !== 'string') {
    return '';
  }

  try {
    // Normalize data before hashing
    const normalizedData = normalizeString(data);
    
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      // Browser environment
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(normalizedData);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Node.js environment (fallback)
      try {
        const crypto = await import('crypto');
        return crypto.createHash('sha256').update(normalizedData).digest('hex');
      } catch (error) {
        // Fallback for environments without crypto
        console.warn('Crypto module not available, returning empty hash');
        return '';
      }
    }
  } catch (error) {
    console.error('Error hashing data:', error);
    return '';
  }
};

/**
 * Normalize string for consistent hashing
 */
export const normalizeString = (str: string): string => {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .normalize('NFD') // Normalize unicode
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
};

/**
 * Normalize phone number with country code
 */
export const normalizePhoneNumber = (phone: string, defaultCountryCode: string = '55'): string => {
  if (!phone) return '';

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // Add country code if not present
  if (!cleaned.startsWith(defaultCountryCode) && cleaned.length <= 11) {
    cleaned = defaultCountryCode + cleaned;
  }

  return cleaned;
};

/**
 * Normalize email address
 */
export const normalizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const normalized = email.toLowerCase().trim();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    return '';
  }

  return normalized;
};

/**
 * Format date to YYYYMMDD for Facebook
 */
export const formatDateOfBirth = (date: string | Date): string => {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Validate and normalize currency code
 */
export const normalizeCurrency = (currency: string): string => {
  if (!currency || typeof currency !== 'string') {
    return 'BRL'; // Default to Brazilian Real
  }

  const normalized = currency.toUpperCase().trim();
  
  // List of valid ISO 4217 currency codes (most common ones)
  const validCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
    'MXN', 'SGD', 'HKD', 'NOK', 'TRY', 'ZAR', 'BRL', 'INR', 'KRW', 'PLN',
    'THB', 'IDR', 'HUF', 'CZK', 'ILS', 'CLP', 'PHP', 'AED', 'COP', 'SAR',
    'MYR', 'RON', 'BGN', 'HRK', 'RUB', 'UAH', 'ARS', 'PEN', 'UYU'
  ];

  return validCurrencies.includes(normalized) ? normalized : 'BRL';
};

/**
 * Format price value
 */
export const formatPrice = (price: number | string): number => {
  if (typeof price === 'number') {
    return Math.round(price * 100) / 100; // Round to 2 decimal places
  }

  if (typeof price === 'string') {
    const parsed = parseFloat(price.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
  }

  return 0;
};

/**
 * Generate unique event ID for deduplication
 */
export const generateEventId = (eventName: string, parameters?: Record<string, unknown>): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const paramHash = parameters ? btoa(JSON.stringify(parameters)).substring(0, 8) : '';
  
  return `${eventName}_${timestamp}_${random}_${paramHash}`;
};

/**
 * Generate session ID
 */
export const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
};

/**
 * Generate visitor ID (persistent across sessions)
 */
export const generateVisitorId = (): string => {
  if (typeof window === 'undefined') {
    return `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Try to get existing visitor ID from localStorage
  const existingId = localStorage.getItem('fb_pixel_visitor_id');
  if (existingId) {
    return existingId;
  }

  // Generate new visitor ID
  const newId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('fb_pixel_visitor_id', newId);
  
  return newId;
};

/**
 * Get UTM parameters from URL
 */
export const getUTMParameters = (): UTMParameters => {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);
  
  return {
    source: urlParams.get('utm_source') || undefined,
    medium: urlParams.get('utm_medium') || undefined,
    campaign: urlParams.get('utm_campaign') || undefined,
    term: urlParams.get('utm_term') || undefined,
    content: urlParams.get('utm_content') || undefined,
  };
};

/**
 * Get session data
 */
export const getSessionData = (): SessionData => {
  if (typeof window === 'undefined') {
    return {
      timestamp: Date.now(),
      session_id: generateSessionId(),
      visitor_id: generateVisitorId(),
    };
  }

  return {
    page_title: document.title,
    page_url: window.location.href,
    referrer: document.referrer || undefined,
    user_agent: navigator.userAgent,
    timestamp: Date.now(),
    session_id: generateSessionId(),
    visitor_id: generateVisitorId(),
    device_type: getDeviceType(),
    browser: getBrowserName(),
    os: getOperatingSystem(),
  };
};

/**
 * Detect device type
 */
export const getDeviceType = (): 'desktop' | 'mobile' | 'tablet' => {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  
  return 'desktop';
};

/**
 * Get browser name
 */
export const getBrowserName = (): string => {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  if (userAgent.includes('Internet Explorer')) return 'Internet Explorer';
  
  return 'unknown';
};

/**
 * Get operating system
 */
export const getOperatingSystem = (): string => {
  if (typeof window === 'undefined') {
    return 'unknown';
  }

  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  
  return 'unknown';
};

/**
 * Auto-collect Enhanced Matching data from forms
 */
export const autoCollectEnhancedMatching = async (): Promise<Partial<EnhancedMatchingData>> => {
  if (typeof window === 'undefined' || !enhancedMatchingConfig.enabled) {
    return {};
  }

  const data: Partial<EnhancedMatchingData> = {};

  try {
    // Email
    if (enhancedMatchingConfig.autoCollect.email) {
      const emailElement = findFormField(enhancedMatchingConfig.fieldSelectors.email);
      if (emailElement && emailElement.value) {
        const normalizedEmail = normalizeEmail(emailElement.value);
        if (normalizedEmail) {
          data.em = await sha256Hash(normalizedEmail);
        }
      }
    }

    // Phone
    if (enhancedMatchingConfig.autoCollect.phone) {
      const phoneElement = findFormField(enhancedMatchingConfig.fieldSelectors.phone);
      if (phoneElement && phoneElement.value) {
        const normalizedPhone = normalizePhoneNumber(phoneElement.value);
        if (normalizedPhone) {
          data.ph = await sha256Hash(normalizedPhone);
        }
      }
    }

    // First Name
    if (enhancedMatchingConfig.autoCollect.firstName) {
      const firstNameElement = findFormField(enhancedMatchingConfig.fieldSelectors.firstName);
      if (firstNameElement && firstNameElement.value) {
        data.fn = await sha256Hash(normalizeString(firstNameElement.value));
      }
    }

    // Last Name
    if (enhancedMatchingConfig.autoCollect.lastName) {
      const lastNameElement = findFormField(enhancedMatchingConfig.fieldSelectors.lastName);
      if (lastNameElement && lastNameElement.value) {
        data.ln = await sha256Hash(normalizeString(lastNameElement.value));
      }
    }

    // City
    if (enhancedMatchingConfig.autoCollect.city) {
      const cityElement = findFormField(enhancedMatchingConfig.fieldSelectors.city);
      if (cityElement && cityElement.value) {
        data.ct = await sha256Hash(normalizeString(cityElement.value));
      }
    }

    // State
    if (enhancedMatchingConfig.autoCollect.state) {
      const stateElement = findFormField(enhancedMatchingConfig.fieldSelectors.state);
      if (stateElement && stateElement.value) {
        data.st = await sha256Hash(normalizeString(stateElement.value));
      }
    }

    // Zip Code
    if (enhancedMatchingConfig.autoCollect.zipCode) {
      const zipElement = findFormField(enhancedMatchingConfig.fieldSelectors.zipCode);
      if (zipElement && zipElement.value) {
        data.zp = await sha256Hash(zipElement.value.replace(/\D/g, ''));
      }
    }

    // Country
    if (enhancedMatchingConfig.autoCollect.country) {
      const countryElement = findFormField(enhancedMatchingConfig.fieldSelectors.country);
      if (countryElement && countryElement.value) {
        data.country = await sha256Hash(normalizeString(countryElement.value));
      }
    }

  } catch (error) {
    console.error('Error auto-collecting enhanced matching data:', error);
  }

  return data;
};

/**
 * Find form field by selectors
 */
const findFormField = (selectors: string[]): HTMLInputElement | HTMLSelectElement | null => {
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
    if (element) {
      return element;
    }
  }
  return null;
};

/**
 * Convert product to content item format
 */
export const productToContentItem = (product: Product, quantity: number = 1) => {
  return {
    id: product.id,
    quantity,
    item_price: formatPrice(product.price),
    title: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
  };
};

/**
 * Convert cart items to content items format
 */
export const cartToContentItems = (cartItems: CartItem[]) => {
  return cartItems.map(item => productToContentItem(item, item.quantity));
};

/**
 * Calculate total value from cart items
 */
export const calculateCartTotal = (cartItems: CartItem[]): number => {
  return cartItems.reduce((total, item) => total + item.total_price, 0);
};

/**
 * Get content IDs from products or cart items
 */
export const getContentIds = (items: Product[] | CartItem[]): string[] => {
  return items.map(item => item.id);
};

/**
 * Debounce function for frequent events
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

/**
 * Check if value is empty
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(json: string, defaultValue: T): T => {
  try {
    return JSON.parse(json);
  } catch (error) {
    return defaultValue;
  }
};

/**
 * Safe JSON stringify
 */
export const safeJsonStringify = (obj: unknown): string => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return '{}';
  }
};

/**
 * Wait for specified time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await wait(delay);
    }
  }
  
  throw lastError!;
};

/**
 * Check if code is running in browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Check if code is running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Log with timestamp (only in development)
 */
export const devLog = (message: string, ...args: unknown[]): void => {
  if (isDevelopment()) {
    const timestamp = new Date().toISOString();
    console.log(`[FB Pixel ${timestamp}] ${message}`, ...args);
  }
};

/**
 * Performance measurement
 */
export const measurePerformance = <T>(
  name: string,
  fn: () => T
): T => {
  if (!isDevelopment()) {
    return fn();
  }
  
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  devLog(`Performance: ${name} took ${(end - start).toFixed(2)}ms`);
  
  return result;
};

const pixelUtils = {
  sha256Hash,
  normalizeString,
  normalizePhoneNumber,
  normalizeEmail,
  formatDateOfBirth,
  normalizeCurrency,
  formatPrice,
  generateEventId,
  generateSessionId,
  generateVisitorId,
  getUTMParameters,
  getSessionData,
  getDeviceType,
  getBrowserName,
  getOperatingSystem,
  autoCollectEnhancedMatching,
  productToContentItem,
  cartToContentItems,
  calculateCartTotal,
  getContentIds,
  debounce,
  throttle,
  deepClone,
  isEmpty,
  safeJsonParse,
  safeJsonStringify,
  wait,
  retry,
  isBrowser,
  isDevelopment,
  devLog,
  measurePerformance,
};

export default pixelUtils;