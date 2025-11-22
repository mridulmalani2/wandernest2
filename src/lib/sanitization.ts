/**
 * Input Sanitization Utilities
 *
 * These utilities help prevent XSS, injection attacks, and other security vulnerabilities
 * by sanitizing user input before processing or storing it.
 */

/**
 * Remove HTML tags from a string to prevent XSS attacks
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize text input by removing dangerous characters and HTML
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  // Remove HTML tags
  let sanitized = stripHtml(input);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  // Convert to lowercase and trim
  const sanitized = email.toLowerCase().trim();

  // Basic email validation pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize phone number (removes non-numeric characters except +)
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all characters except digits, spaces, hyphens, parentheses, and plus
  return phone.replace(/[^\d\s\-+()]/g, '').trim();
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      throw new Error('Invalid URL protocol');
    }
  }

  // Ensure URL starts with http:// or https:// or is relative
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Sanitize object by applying sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldsToSanitize: (keyof T)[],
  maxLength = 1000
): T {
  const sanitized = { ...obj };

  for (const field of fieldsToSanitize) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeText(sanitized[field] as string, maxLength);
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize integer input
 */
export function sanitizeInteger(
  value: any,
  min?: number,
  max?: number
): number {
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new Error('Invalid integer value');
  }

  if (min !== undefined && parsed < min) {
    throw new Error(`Value must be at least ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new Error(`Value must be at most ${max}`);
  }

  return parsed;
}

/**
 * Validate and sanitize float input
 */
export function sanitizeFloat(
  value: any,
  min?: number,
  max?: number,
  decimals = 2
): number {
  const parsed = parseFloat(value);

  if (isNaN(parsed)) {
    throw new Error('Invalid number value');
  }

  if (min !== undefined && parsed < min) {
    throw new Error(`Value must be at least ${min}`);
  }

  if (max !== undefined && parsed > max) {
    throw new Error(`Value must be at most ${max}`);
  }

  // Round to specified decimal places
  return parseFloat(parsed.toFixed(decimals));
}

/**
 * Sanitize array by removing null/undefined values and sanitizing strings
 */
export function sanitizeArray(
  arr: any[],
  maxLength = 100,
  itemMaxLength = 1000
): string[] {
  return arr
    .filter(item => item != null)
    .map(item => String(item))
    .map(item => sanitizeText(item, itemMaxLength))
    .slice(0, maxLength);
}

/**
 * Escape special regex characters in a string
 * Useful when using user input in regex patterns
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitize filename to prevent directory traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  return filename
    .replace(/[\/\\]/g, '')
    .replace(/\.\./g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255);
}
