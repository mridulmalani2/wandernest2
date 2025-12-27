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
export function stripHtml(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove script and style tags with their content
  let sanitized = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "");
  // Remove other tags
  return sanitized.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize text input by removing dangerous characters and HTML
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  const raw = typeof input === 'string' ? input : '';
  const bounded = raw.length > maxLength * 4 ? raw.slice(0, maxLength * 4) : raw;

  // Remove HTML tags
  let sanitized = stripHtml(bounded);

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length using Unicode-safe truncation (prevents splitting surrogate pairs)
  sanitized = truncateUnicodeSafe(sanitized, maxLength);

  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new Error('Invalid email format');
  }

  const sanitized = email.trim().toLowerCase();

  if (!sanitized || sanitized.length > 254) {
    throw new Error('Invalid email format');
  }

  if (/[\u0000-\u001F\u007F\s]/.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  const parts = sanitized.split('@');
  if (parts.length !== 2) {
    throw new Error('Invalid email format');
  }

  const [local, domain] = parts;

  if (!local || !domain || local.length > 64) {
    throw new Error('Invalid email format');
  }

  if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    throw new Error('Invalid email format');
  }

  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    throw new Error('Invalid email format');
  }

  if (!domain.includes('.')) {
    throw new Error('Invalid email format');
  }

  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) {
    throw new Error('Invalid email format');
  }

  if (!/^[a-z0-9.-]+$/i.test(domain)) {
    throw new Error('Invalid email format');
  }

  const labels = domain.split('.');
  for (const label of labels) {
    if (!label || label.length > 63) {
      throw new Error('Invalid email format');
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      throw new Error('Invalid email format');
    }
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
export function sanitizeUrl(url: unknown): string {
  if (typeof url !== 'string') {
    throw new Error('Invalid URL');
  }

  if (!url.trim()) return '';
  const trimmed = url.trim();

  if (/[\u0000-\u001F\u007F]/.test(trimmed)) {
    throw new Error('Invalid URL');
  }

  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    throw new Error('Invalid URL');
  }

  if (/[\u0000-\u001F\u007F]/.test(decoded)) {
    throw new Error('Invalid URL');
  }

  const lowerDecoded = decoded.trim().toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  for (const protocol of dangerousProtocols) {
    if (lowerDecoded.startsWith(protocol)) {
      throw new Error('Invalid URL protocol');
    }
  }

  const protocolMatch = /^[a-z][a-z0-9+.-]*:/i.exec(trimmed);
  if (protocolMatch && !trimmed.toLowerCase().startsWith('http://') && !trimmed.toLowerCase().startsWith('https://')) {
    throw new Error('Invalid URL protocol');
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
  const blockedKeys = new Set(['__proto__', 'prototype', 'constructor']);

  for (const field of fieldsToSanitize) {
    if (blockedKeys.has(String(field))) {
      continue;
    }
    if (!Object.prototype.hasOwnProperty.call(sanitized, field)) {
      continue;
    }
    const value = sanitized[field];
    const isStringObject = Object.prototype.toString.call(value) === '[object String]';
    if (typeof value === 'string' || isStringObject) {
      sanitized[field] = sanitizeText(String(value), maxLength) as T[keyof T];
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
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value) || !Number.isSafeInteger(value)) {
      throw new Error('Invalid integer value');
    }

    if (min !== undefined && value < min) {
      throw new Error(`Value must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
      throw new Error(`Value must be at most ${max}`);
    }

    return value;
  }

  if (typeof value !== 'string') {
    throw new Error('Invalid integer format');
  }

  const trimmed = value.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) {
    throw new Error('Invalid integer format');
  }

  const parsed = Number(trimmed);

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
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 20) {
    throw new Error('Invalid decimals value');
  }

  let parsed: number;

  if (typeof value === 'number') {
    parsed = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!/^[+-]?(?:\d+|\d*\.\d+)$/.test(trimmed)) {
      throw new Error('Invalid number value');
    }
    parsed = Number(trimmed);
  } else {
    throw new Error('Invalid number value');
  }

  if (!Number.isFinite(parsed)) {
    throw new Error('Invalid number value');
  }

  // Round to specified decimal places
  const rounded = Number(parsed.toFixed(decimals));

  if (min !== undefined && rounded < min) {
    throw new Error(`Value must be at least ${min}`);
  }

  if (max !== undefined && rounded > max) {
    throw new Error(`Value must be at most ${max}`);
  }

  return rounded;
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
