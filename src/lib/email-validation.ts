/**
 * Email Domain Validation for Student Authentication
 *
 * This module provides validation for institutional/educational email addresses
 * used in the student authentication flow. Only emails from recognized
 * educational institutions are allowed for student sign-up and login.
 *
 * SECURITY: All validation runs in ALL environments (no dev bypass)
 *
 * USAGE:
 * - Import `isStudentEmail()` to validate email domains
 * - Import `getStudentEmailErrorMessage()` for user-friendly error messages
 * - Import `STUDENT_EMAIL_DOMAINS` to access the full list of valid domains
 *
 * TO ADD NEW DOMAINS:
 * Simply add the domain suffix to the STUDENT_EMAIL_DOMAINS array below.
 * Format: '.suffix' (e.g., '.edu', '.ac.uk', '.edu.au')
 * The validation is case-insensitive and checks the end of the email domain.
 */

// ============================================================================
// VALID STUDENT EMAIL DOMAINS - Centralized Configuration
// ============================================================================
// Add new educational domain suffixes here to allow students from additional
// institutions to sign up. This list is used for both client-side and
// server-side validation.
// ============================================================================
export const STUDENT_EMAIL_DOMAINS = [
  '.edu',       // US educational institutions
  '.edu.in',    // Indian educational institutions
  '.ac.uk',     // UK academic institutions
  '.edu.au',    // Australian educational institutions
  '.edu.sg',    // Singapore educational institutions
  '.ac.in',     // Indian academic institutions
  '.edu.cn',    // Chinese educational institutions
  '.ac.jp',     // Japanese academic institutions
  '.edu.my',    // Malaysian educational institutions
  '.edu.pk',    // Pakistani educational institutions
  '.ac.nz',     // New Zealand academic institutions
  '.edu.ph',    // Philippine educational institutions
  '.ac.za',     // South African academic institutions
  '.edu.br',    // Brazilian educational institutions
  '.edu.mx',    // Mexican educational institutions
  '.ac.th',     // Thai academic institutions
  '.edu.vn',    // Vietnamese educational institutions
  '.ac.kr',     // Korean academic institutions
  '.edu.hk',    // Hong Kong educational institutions
  '.edu.tw',    // Taiwan educational institutions
  '.ac.ae',     // UAE academic institutions
  '.edu.sa',    // Saudi Arabian educational institutions
  '.ac.il',     // Israeli academic institutions
  '.edu.tr',    // Turkish educational institutions
  '.ac.fr',     // French academic institutions
  '.edu.fr',    // French educational institutions
  '.ac.be',     // Belgian academic institutions
  '.edu.ar',    // Argentine educational institutions
  '.edu.co',    // Colombian educational institutions
  '.edu.pe',    // Peruvian educational institutions
  '.edu.cl',    // Chilean educational institutions
  '.ac.gr',     // Greek academic institutions
  '.edu.it',    // Italian educational institutions
  '.ac.es',     // Spanish academic institutions
  '.edu.es',    // Spanish educational institutions
  '.ac.pt',     // Portuguese academic institutions
  '.edu.pt',    // Portuguese educational institutions
  '.ac.id',     // Indonesian academic institutions
  '.ac.at',     // Austrian academic institutions
  '.edu.eg',    // Egyptian educational institutions
  '.edu.ng',    // Nigerian educational institutions
  '.edu.pl',    // Polish educational institutions
  '.edu.ru',    // Russian educational institutions
  '.sch.uk',    // UK schools
  '.school',    // .school TLD
  '.university', // .university TLD
];

// RFC 5321 allows up to 254 characters for an email address
// RFC 5321 local-part max is 64 characters
export const MAX_EMAIL_LENGTH = 254;
export const MAX_LOCAL_PART_LENGTH = 64;
export const MAX_DOMAIN_LENGTH = 253;

// Additional regex patterns for more flexible matching
const STUDENT_EMAIL_PATTERNS = [
  /\.edu\.[a-z]{2}$/,                // International .edu (e.g., .edu.au, .edu.mx)
  /\.ac\.[a-z]{2}$/,                 // Academic domains (e.g., .ac.uk, .ac.jp)
  /\.edu\.[a-z]{2}\.[a-z]{2}$/,     // Some countries use this format
  /\.sch\.[a-z]{2}$/,                // Schools (e.g., .sch.uk)
  /\.student\./,                     // Contains 'student' subdomain
];

/**
 * Normalize email for consistent processing
 * SECURITY: Trims whitespace and converts to lowercase
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validates if an email address belongs to a recognized educational institution
 *
 * SECURITY: This function enforces validation in ALL environments
 * No development bypass - security must be consistent across all environments
 *
 * @param email - The email address to validate
 * @returns true if the email domain is from a recognized educational institution
 */
export function isStudentEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail.length === 0 || normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  // SECURITY: No development bypass - validation always enforced

  // Use centralized format check
  if (!isValidEmailFormat(normalizedEmail)) {
    return false;
  }

  // Use centralized domain extraction
  const domain = getEmailDomain(normalizedEmail);
  if (!domain) return false;

  // Check against exact domain matches
  const hasExactMatch = STUDENT_EMAIL_DOMAINS.some(suffix => domain.endsWith(suffix));
  if (hasExactMatch) {
    return true;
  }

  // Check against regex patterns
  const hasPatternMatch = STUDENT_EMAIL_PATTERNS.some(pattern => pattern.test(domain));
  return hasPatternMatch;
}

/**
 * Gets a user-friendly error message for invalid student email domains
 *
 * SECURITY: Does NOT include the email in the error message to prevent:
 * - PII exposure in logs/responses
 * - Reflected XSS attacks
 * - Log injection attacks
 *
 * @param _email - The email that failed validation (not used in message for security)
 * @returns A user-friendly error message
 */
export function getStudentEmailErrorMessage(_email?: string): string {
  // SECURITY: Never include user-supplied email in error messages
  // This prevents PII leakage, XSS, and log injection
  return 'Please use a valid university or institutional email address (e.g., .edu, .ac.uk, .edu.au).';
}

/**
 * Validates email format with improved regex and length checks
 *
 * SECURITY: More robust validation than basic regex alone
 *
 * @param email - The email address to validate
 * @returns true if the email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const normalizedEmail = normalizeEmail(email);

  // Length validation
  if (normalizedEmail.length === 0 || normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  // Split into local-part and domain
  const atIndex = normalizedEmail.lastIndexOf('@');
  if (atIndex === -1 || atIndex === 0 || atIndex === normalizedEmail.length - 1) {
    return false;
  }

  const localPart = normalizedEmail.substring(0, atIndex);
  const domain = normalizedEmail.substring(atIndex + 1);

  // Validate local-part length (RFC 5321: max 64 characters)
  if (localPart.length > MAX_LOCAL_PART_LENGTH) {
    return false;
  }

  // Validate domain length (RFC 5321: max 253 characters)
  if (domain.length > MAX_DOMAIN_LENGTH) {
    return false;
  }

  // Check for empty parts after splitting
  if (localPart.length === 0 || domain.length === 0) {
    return false;
  }

  // Improved local-part validation:
  // - Allow alphanumeric, dots, hyphens, underscores, plus signs
  // - Disallow leading/trailing dots
  // - Disallow consecutive dots
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }
  if (localPart.includes('..')) {
    return false;
  }

  // Local-part regex: alphanumeric plus common special chars
  // More permissive than RFC for practical compatibility, but rejects obvious bad patterns
  const localPartRegex = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/i;
  if (!localPartRegex.test(localPart)) {
    return false;
  }

  // Domain validation:
  // - Must have at least one dot
  // - Labels must be alphanumeric with optional hyphens (not leading/trailing)
  // - TLD must be at least 2 characters
  if (!domain.includes('.')) {
    return false;
  }

  // Check for leading/trailing dots and consecutive dots in domain
  if (domain.startsWith('.') || domain.endsWith('.') || domain.includes('..')) {
    return false;
  }

  // Validate domain labels
  const domainParts = domain.split('.');
  for (const part of domainParts) {
    if (part.length === 0 || part.length > 63) {
      return false;
    }
    // Labels can't start or end with hyphen
    if (part.startsWith('-') || part.endsWith('-')) {
      return false;
    }
    // Labels must be alphanumeric (with hyphens allowed in middle)
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(part) && !/^[a-z0-9]$/i.test(part)) {
      return false;
    }
  }

  // TLD must be at least 2 characters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) {
    return false;
  }

  return true;
}

/**
 * Gets the domain from an email address
 *
 * SECURITY: Handles edge cases including quoted local-parts with '@'
 *
 * @param email - The email address
 * @returns The domain portion of the email (e.g., "university.edu"), or empty string if invalid
 */
export function getEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const normalizedEmail = normalizeEmail(email);

  if (normalizedEmail.length === 0 || normalizedEmail.length > MAX_EMAIL_LENGTH) {
    return '';
  }

  // Handle quoted local-parts that may contain '@'
  // Use lastIndexOf to find the final '@' which separates local-part from domain
  const atIndex = normalizedEmail.lastIndexOf('@');

  if (atIndex === -1 || atIndex === 0 || atIndex === normalizedEmail.length - 1) {
    return '';
  }

  const domain = normalizedEmail.substring(atIndex + 1);

  // Validate domain has at least one dot and valid structure
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return '';
  }

  return domain;
}
