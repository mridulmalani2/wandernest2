/**
 * Input Sanitization Utilities
 *
 * These utilities help prevent XSS, injection attacks, and other security vulnerabilities
 * by sanitizing user input before processing or storing it.
 */

/**
 * Unicode-safe truncation that operates on code points, not UTF-16 code units.
 * Prevents splitting surrogate pairs (e.g., emoji characters).
 */
function truncateUnicodeSafe(str: string, maxCodePoints: number): string {
  // Spread operator correctly splits by code points, not code units
  const codePoints = [...str];
  if (codePoints.length <= maxCodePoints) {
    return str;
  }
  return codePoints.slice(0, maxCodePoints).join('');
}

/**
 * Remove HTML tags from a string to prevent XSS attacks
 */
export function stripHtml(input: string): string {
  // Remove script and style tags with their content
  let sanitized = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
  // Remove other tags
  return sanitized.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize text input by removing dangerous characters and HTML
 */
export function sanitizeText(input: string, maxLength = 1000): string {
  // Remove HTML tags
  let sanitized = stripHtml(input);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length using Unicode-safe truncation (prevents splitting surrogate pairs)
  sanitized = truncateUnicodeSafe(sanitized, maxLength);

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
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmed.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      throw new Error('Invalid URL protocol');
    }
  }

  // Allow absolute paths, relative paths, or protocol-relative
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  // Ensure URL starts with http:// or https://
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
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
      sanitized[field] = sanitizeText(sanitized[field] as string, maxLength) as T[keyof T];
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
  // Ensure strict integer parsing
  if (typeof value === 'string' && !/^-?\d+$/.test(value)) {
    throw new Error('Invalid integer format');
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || !Number.isSafeInteger(parsed)) {
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
  if (decimals < 0 || decimals > 20) {
    throw new Error('Invalid decimals value');
  }

  const parsed = parseFloat(value);

  if (!Number.isFinite(parsed)) {
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
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr
    .slice(0, maxLength)
    .filter(item => item != null)
    .map(item => String(item))
    .map(item => sanitizeText(item, itemMaxLength));
}

/**
 * Allowed characters for short "tag" inputs such as skills, interests, and languages.
 */
export const TAG_ALLOWED_PATTERN = /^[\p{L}\p{N}\s'().,&/+-]+$/u;

/**
 * Normalize and validate a short tag-like input.
 * Returns an empty string when invalid to allow callers to reject the value.
 */
export function normalizeTag(input: string, maxLength = 50): string {
  const sanitized = sanitizeText(input, maxLength).replace(/\s+/g, ' ').trim();
  if (!sanitized) {
    return '';
  }
  if (!TAG_ALLOWED_PATTERN.test(sanitized)) {
    return '';
  }
  return sanitized;
}

/**
 * Validate that a provided IANA time zone is supported by the runtime.
 */
export function isValidTimeZone(value: string): boolean {
  if (!value) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
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
  // Windows reserved names
  const reserved = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;

  // Remove path separators and dangerous characters
  const sanitized = truncateUnicodeSafe(
    filename
      .replace(/[\/\\]/g, '')
      .replace(/\.\./g, '')
      .replace(/[^a-zA-Z0-9._-]/g, '_'),
    255
  );

  if (sanitized.length === 0 || reserved.test(sanitized)) {
    return `file_${Date.now()}`;
  }

  return sanitized;
}
