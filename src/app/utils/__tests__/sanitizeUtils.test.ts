import { sanitizeForJSON, sanitizeObject, canSafelyStringify } from '@/app/utils/sanitizeUtils';

describe('sanitizeUtils', () => {
  test('sanitizeForJSON removes circular references and DOM/functions', () => {
    const obj: any = { a: 1 };
    obj.self = obj; // circular
    obj.fn = () => {};
    // @ts-ignore
    obj.el = typeof document !== 'undefined' ? document.createElement('div') : { nodeType: 1 };

    const result = sanitizeForJSON(obj);
    expect(typeof result).toBe('string');
    const parsed = JSON.parse(result);
    expect(parsed.self).toBe('[Circular Reference]');
    expect(parsed.fn).toBe('[Removed]');
    expect(parsed.el).toBe('[Removed]');
  });

  test('sanitizeObject returns plain object with sanitization applied', () => {
    const obj: any = { a: 1 };
    obj.self = obj; // circular

    const sanitized = sanitizeObject(obj);
    expect(sanitized).toEqual({ a: 1, self: '[Circular Reference]' });
  });

  test('canSafelyStringify returns false for circular structures', () => {
    const obj: any = { };
    obj.self = obj;
    expect(canSafelyStringify(obj)).toBe(false);
  });

  test('canSafelyStringify returns true for simple objects', () => {
    expect(canSafelyStringify({ a: 1, b: 'x' })).toBe(true);
  });
});