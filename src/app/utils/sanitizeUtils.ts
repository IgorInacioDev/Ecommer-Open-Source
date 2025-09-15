/**
 * Utility functions for sanitizing data and preventing circular structure errors
 */

/**
 * Sanitizes an object by removing circular references, DOM elements, and functions
 * @param obj - The object to sanitize
 * @returns A sanitized string representation of the object
 */
export const sanitizeForJSON = (obj: unknown): string => {
  if (typeof obj === 'string') return obj;
  
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    // Remove DOM elements and functions
    if (value instanceof Element || typeof value === 'function') {
      return '[Removed]';
    }
    return value;
  });
};

/**
 * Sanitizes an object and returns a clean object (not stringified)
 * @param obj - The object to sanitize
 * @returns A sanitized object
 */
export const sanitizeObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const seen = new WeakSet();
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    // Remove DOM elements and functions
    if (value instanceof Element || typeof value === 'function') {
      return '[Removed]';
    }
    return value;
  }));
};

/**
 * Tests if an object can be safely stringified without circular reference errors
 * @param obj - The object to test
 * @returns true if safe to stringify, false otherwise
 */
export const canSafelyStringify = (obj: unknown): boolean => {
  try {
    JSON.stringify(obj);
    return true;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('circular')) {
      return false;
    }
    throw error; // Re-throw if it's not a circular reference error
  }
};