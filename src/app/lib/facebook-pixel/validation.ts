/**
 * Facebook Pixel Validation System
 * Complete validation for all events and parameters
 */

import {
  StandardEvent,
  EventParameters,
  ValidationResult,
  ValidationRule,
  EnhancedMatchingData,
  ViewContentParameters,
  SearchParameters,
  AddToCartParameters,
  AddToWishlistParameters,
  InitiateCheckoutParameters,
  AddPaymentInfoParameters,
  PurchaseParameters,
  LeadParameters,
  CompleteRegistrationParameters,
  PageViewParameters,
} from '../../types/facebook-pixel';
import { normalizeCurrency, normalizeEmail, normalizePhoneNumber } from './utils';

/**
 * Validation rules for each event type
 */
const eventValidationRules: Record<StandardEvent, ValidationRule[]> = {
  PageView: [
    { field: 'content_category', required: false, type: 'string' },
    { field: 'content_name', required: false, type: 'string' },
  ],
  
  ViewContent: [
    { field: 'content_ids', required: true, type: 'array', min: 1 },
    { field: 'content_type', required: true, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'content_name', required: false, type: 'string' },
    { field: 'content_category', required: false, type: 'string' },
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
  ],
  
  Search: [
    { field: 'search_string', required: true, type: 'string', min: 1 },
    { field: 'content_category', required: false, type: 'string' },
    { field: 'content_ids', required: false, type: 'array' },
  ],
  
  AddToCart: [
    { field: 'content_ids', required: true, type: 'array', min: 1 },
    { field: 'content_type', required: true, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'content_name', required: false, type: 'string' },
    { field: 'content_category', required: false, type: 'string' },
    { field: 'value', required: true, type: 'number', min: 0 },
    { field: 'currency', required: true, type: 'string', format: /^[A-Z]{3}$/ },
    { field: 'num_items', required: false, type: 'number', min: 1 },
  ],
  
  AddToWishlist: [
    { field: 'content_ids', required: true, type: 'array', min: 1 },
    { field: 'content_type', required: true, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'content_name', required: false, type: 'string' },
    { field: 'content_category', required: false, type: 'string' },
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
  ],
  
  InitiateCheckout: [
    { field: 'content_ids', required: true, type: 'array', min: 1 },
    { field: 'content_type', required: true, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'value', required: true, type: 'number', min: 0 },
    { field: 'currency', required: true, type: 'string', format: /^[A-Z]{3}$/ },
    { field: 'num_items', required: true, type: 'number', min: 1 },
  ],
  
  AddPaymentInfo: [
    { field: 'content_ids', required: true, type: 'array', min: 1 },
    { field: 'content_type', required: true, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'value', required: true, type: 'number', min: 0 },
    { field: 'currency', required: true, type: 'string', format: /^[A-Z]{3}$/ },
  ],
  
  Purchase: [
    { field: 'content_ids', required: true, type: 'array', min: 1 },
    { field: 'content_type', required: true, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'value', required: true, type: 'number', min: 0 },
    { field: 'currency', required: true, type: 'string', format: /^[A-Z]{3}$/ },
    { field: 'order_id', required: false, type: 'string' },
    { field: 'num_items', required: true, type: 'number', min: 1 },
  ],
  
  Lead: [
    { field: 'content_name', required: false, type: 'string' },
    { field: 'content_category', required: false, type: 'string' },
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
  ],
  
  CompleteRegistration: [
    { field: 'content_name', required: false, type: 'string' },
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
    { field: 'status', required: false, type: 'string' },
  ],
  
  Contact: [
    { field: 'content_category', required: false, type: 'string' },
  ],
  
  CustomizeProduct: [
    { field: 'content_ids', required: false, type: 'array' },
    { field: 'content_type', required: false, type: 'string', allowedValues: ['product', 'product_group'] },
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
  ],
  
  Donate: [
    { field: 'value', required: true, type: 'number', min: 0 },
    { field: 'currency', required: true, type: 'string', format: /^[A-Z]{3}$/ },
  ],
  
  FindLocation: [
    { field: 'content_category', required: false, type: 'string' },
  ],
  
  Schedule: [
    { field: 'content_category', required: false, type: 'string' },
  ],
  
  StartTrial: [
    { field: 'content_name', required: false, type: 'string' },
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
    { field: 'predicted_ltv', required: false, type: 'number', min: 0 },
  ],
  
  SubmitApplication: [
    { field: 'content_category', required: false, type: 'string' },
  ],
  
  Subscribe: [
    { field: 'value', required: false, type: 'number', min: 0 },
    { field: 'currency', required: false, type: 'string', format: /^[A-Z]{3}$/ },
    { field: 'predicted_ltv', required: false, type: 'number', min: 0 },
  ],
  
  AdImpression: [
    { field: 'content_ids', required: false, type: 'array' },
  ],
  
  AdClick: [
    { field: 'content_ids', required: false, type: 'array' },
  ],
};

/**
 * Enhanced Matching validation rules
 */
const enhancedMatchingRules: ValidationRule[] = [
  { field: 'em', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'ph', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'fn', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'ln', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'db', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'ge', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'ct', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'st', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'zp', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'country', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
  { field: 'external_id', required: false, type: 'string', format: /^[a-f0-9]{64}$/ }, // SHA-256 hash
];

/**
 * Validate a single field against a rule
 */
const validateField = (value: unknown, rule: ValidationRule): { isValid: boolean; error?: string } => {
  // Check if required field is missing
  if (rule.required && (value === undefined || value === null || value === '')) {
    return { isValid: false, error: `Field '${rule.field}' is required` };
  }

  // Skip validation if field is not provided and not required
  if (!rule.required && (value === undefined || value === null)) {
    return { isValid: true };
  }

  // Type validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        return { isValid: false, error: `Field '${rule.field}' must be a string` };
      }
      if (rule.min && value.length < rule.min) {
        return { isValid: false, error: `Field '${rule.field}' must be at least ${rule.min} characters` };
      }
      if (rule.max && value.length > rule.max) {
        return { isValid: false, error: `Field '${rule.field}' must be at most ${rule.max} characters` };
      }
      break;

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        return { isValid: false, error: `Field '${rule.field}' must be a valid number` };
      }
      if (rule.min !== undefined && value < rule.min) {
        return { isValid: false, error: `Field '${rule.field}' must be at least ${rule.min}` };
      }
      if (rule.max !== undefined && value > rule.max) {
        return { isValid: false, error: `Field '${rule.field}' must be at most ${rule.max}` };
      }
      break;

    case 'array':
      if (!Array.isArray(value)) {
        return { isValid: false, error: `Field '${rule.field}' must be an array` };
      }
      if (rule.min && value.length < rule.min) {
        return { isValid: false, error: `Field '${rule.field}' must have at least ${rule.min} items` };
      }
      if (rule.max && value.length > rule.max) {
        return { isValid: false, error: `Field '${rule.field}' must have at most ${rule.max} items` };
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        return { isValid: false, error: `Field '${rule.field}' must be a boolean` };
      }
      break;

    case 'object':
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { isValid: false, error: `Field '${rule.field}' must be an object` };
      }
      break;
  }

  // Format validation (regex)
  if (rule.format && typeof value === 'string' && !rule.format.test(value)) {
    return { isValid: false, error: `Field '${rule.field}' has invalid format` };
  }

  // Allowed values validation
  if (rule.allowedValues && !rule.allowedValues.includes(value)) {
    return { isValid: false, error: `Field '${rule.field}' must be one of: ${rule.allowedValues.join(', ')}` };
  }

  return { isValid: true };
};

/**
 * Validate event parameters
 */
export const validateEventParameters = (
  eventName: StandardEvent,
  parameters?: EventParameters
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get validation rules for the event
  const rules = eventValidationRules[eventName];
  if (!rules) {
    warnings.push(`No validation rules found for event '${eventName}'`);
    return { isValid: true, errors, warnings };
  }

  // If no parameters provided, check if any are required
  if (!parameters) {
    const requiredFields = rules.filter(rule => rule.required);
    if (requiredFields.length > 0) {
      errors.push(`Event '${eventName}' requires parameters: ${requiredFields.map(r => r.field).join(', ')}`);
    }
    return { isValid: errors.length === 0, errors, warnings };
  }

  // Validate each rule
  for (const rule of rules) {
    const value = (parameters as Record<string, unknown>)[rule.field];
    const validation = validateField(value, rule);
    
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }

  // Additional validations
  if (parameters.currency) {
    const normalizedCurrency = normalizeCurrency(parameters.currency);
    if (normalizedCurrency !== parameters.currency) {
      warnings.push(`Currency '${parameters.currency}' was normalized to '${normalizedCurrency}'`);
    }
  }

  // Validate content_ids format
  if (parameters.content_ids) {
    for (const id of parameters.content_ids) {
      if (typeof id !== 'string' || id.trim() === '') {
        errors.push('All content_ids must be non-empty strings');
        break;
      }
    }
  }

  // Validate contents array if present
  if (parameters.contents) {
    for (let i = 0; i < parameters.contents.length; i++) {
      const content = parameters.contents[i];
      if (!content.id || typeof content.id !== 'string') {
        errors.push(`Content item at index ${i} must have a valid 'id' field`);
      }
      if (content.quantity !== undefined && (typeof content.quantity !== 'number' || content.quantity < 1)) {
        errors.push(`Content item at index ${i} must have a valid 'quantity' field (number >= 1)`);
      }
      if (content.item_price !== undefined && (typeof content.item_price !== 'number' || content.item_price < 0)) {
        errors.push(`Content item at index ${i} must have a valid 'item_price' field (number >= 0)`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate Enhanced Matching data
 */
export const validateEnhancedMatching = (data: EnhancedMatchingData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of enhancedMatchingRules) {
    const value = (data as Record<string, unknown>)[rule.field];
    const validation = validateField(value, rule);
    
    if (!validation.isValid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate pixel ID format
 */
export const validatePixelId = (pixelId: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!pixelId || typeof pixelId !== 'string') {
    errors.push('Pixel ID must be a non-empty string');
  } else if (!/^\d{15,16}$/.test(pixelId)) {
    errors.push('Pixel ID must be a 15-16 digit number');
  } else if (pixelId.includes('YOUR_')) {
    errors.push('Pixel ID appears to be a placeholder - please configure with your actual Facebook Pixel ID');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate email format (before hashing)
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    errors.push('Email format is invalid');
  } else if (normalizedEmail !== email.toLowerCase().trim()) {
    warnings.push(`Email was normalized from '${email}' to '${normalizedEmail}'`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate phone number format (before hashing)
 */
export const validatePhoneNumber = (phone: string, countryCode?: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!phone || typeof phone !== 'string') {
    errors.push('Phone number must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  const normalizedPhone = normalizePhoneNumber(phone, countryCode);
  if (!normalizedPhone) {
    errors.push('Phone number format is invalid');
  } else if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
    errors.push('Phone number must be between 10 and 15 digits');
  } else if (normalizedPhone !== phone.replace(/\D/g, '')) {
    warnings.push(`Phone number was normalized from '${phone}' to '${normalizedPhone}'`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate currency code
 */
export const validateCurrency = (currency: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!currency || typeof currency !== 'string') {
    errors.push('Currency must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  const normalizedCurrency = normalizeCurrency(currency);
  if (normalizedCurrency === 'BRL' && currency.toUpperCase() !== 'BRL') {
    warnings.push(`Currency '${currency}' was normalized to '${normalizedCurrency}' (default)`);
  } else if (normalizedCurrency !== currency.toUpperCase()) {
    warnings.push(`Currency '${currency}' was normalized to '${normalizedCurrency}'`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate custom event name
 */
export const validateCustomEventName = (eventName: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!eventName || typeof eventName !== 'string') {
    errors.push('Custom event name must be a non-empty string');
    return { isValid: false, errors, warnings };
  }

  // Check length
  if (eventName.length > 40) {
    errors.push('Custom event name must be 40 characters or less');
  }

  // Check format (alphanumeric and underscores only)
  if (!/^[a-zA-Z0-9_]+$/.test(eventName)) {
    errors.push('Custom event name can only contain letters, numbers, and underscores');
  }

  // Check if it conflicts with standard events
  const standardEvents = Object.keys(eventValidationRules);
  if (standardEvents.includes(eventName)) {
    errors.push(`Custom event name '${eventName}' conflicts with a standard Facebook event`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Comprehensive validation for all event data
 */
export const validateEventData = (
  eventName: StandardEvent | string,
  parameters?: EventParameters,
  enhancedMatching?: EnhancedMatchingData
): ValidationResult => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  // Validate event name
  if (Object.keys(eventValidationRules).includes(eventName)) {
    // Standard event
    const paramValidation = validateEventParameters(eventName as StandardEvent, parameters);
    allErrors.push(...paramValidation.errors);
    allWarnings.push(...paramValidation.warnings);
  } else {
    // Custom event
    const nameValidation = validateCustomEventName(eventName);
    allErrors.push(...nameValidation.errors);
    allWarnings.push(...nameValidation.warnings);
  }

  // Validate enhanced matching if provided
  if (enhancedMatching) {
    const emValidation = validateEnhancedMatching(enhancedMatching);
    allErrors.push(...emValidation.errors);
    allWarnings.push(...emValidation.warnings);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
};

/**
 * Quick validation for common scenarios
 */
export const quickValidate = {
  /**
   * Validate ViewContent event
   */
  viewContent: (params: ViewContentParameters): ValidationResult => {
    return validateEventParameters('ViewContent', params);
  },

  /**
   * Validate AddToCart event
   */
  addToCart: (params: AddToCartParameters): ValidationResult => {
    return validateEventParameters('AddToCart', params);
  },

  /**
   * Validate Purchase event
   */
  purchase: (params: PurchaseParameters): ValidationResult => {
    return validateEventParameters('Purchase', params);
  },

  /**
   * Validate Search event
   */
  search: (params: SearchParameters): ValidationResult => {
    return validateEventParameters('Search', params);
  },

  /**
   * Validate InitiateCheckout event
   */
  initiateCheckout: (params: InitiateCheckoutParameters): ValidationResult => {
    return validateEventParameters('InitiateCheckout', params);
  },
};

/**
 * Sanitize parameters by removing invalid fields
 */
export const sanitizeParameters = (
  eventName: StandardEvent,
  parameters: EventParameters
): EventParameters => {
  const rules = eventValidationRules[eventName];
  if (!rules) {
    return parameters;
  }

  const sanitized: Record<string, unknown> = {};
  const validFields = rules.map(rule => rule.field);

  // Copy only valid fields
  for (const [key, value] of Object.entries(parameters)) {
    if (validFields.includes(key) || key === 'custom_data') {
      sanitized[key] = value;
    }
  }

  // Normalize currency if present
  if (sanitized.currency && typeof sanitized.currency === 'string') {
    sanitized.currency = normalizeCurrency(sanitized.currency);
  }

  return sanitized;
};

/**
 * Get validation summary for debugging
 */
export const getValidationSummary = (
  eventName: StandardEvent | string,
  parameters?: EventParameters,
  enhancedMatching?: EnhancedMatchingData
): string => {
  const validation = validateEventData(eventName, parameters, enhancedMatching);
  
  let summary = `Validation for event '${eventName}': ${validation.isValid ? 'PASSED' : 'FAILED'}\n`;
  
  if (validation.errors.length > 0) {
    summary += `\nErrors (${validation.errors.length}):\n`;
    validation.errors.forEach((error, index) => {
      summary += `  ${index + 1}. ${error}\n`;
    });
  }
  
  if (validation.warnings.length > 0) {
    summary += `\nWarnings (${validation.warnings.length}):\n`;
    validation.warnings.forEach((warning, index) => {
      summary += `  ${index + 1}. ${warning}\n`;
    });
  }
  
  return summary;
};

const pixelValidation = {
  validateEventParameters,
  validateEnhancedMatching,
  validatePixelId,
  validateEmail,
  validatePhoneNumber,
  validateCurrency,
  validateCustomEventName,
  validateEventData,
  quickValidate,
  sanitizeParameters,
  getValidationSummary,
};

export default pixelValidation;