/**
 * Email Domain Validation for Student Authentication
 *
 * This module provides validation for institutional/educational email addresses
 * used in the student authentication flow. Only emails from recognized
 * educational institutions are allowed for student sign-up and login.
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

// Additional regex patterns for more flexible matching
const STUDENT_EMAIL_PATTERNS = [
  /\.edu\.[a-z]{2}$/,                // International .edu (e.g., .edu.au, .edu.mx)
  /\.ac\.[a-z]{2}$/,                 // Academic domains (e.g., .ac.uk, .ac.jp)
  /\.edu\.[a-z]{2}\.[a-z]{2}$/,     // Some countries use this format
  /\.sch\.[a-z]{2}$/,                // Schools (e.g., .sch.uk)
  /\.student\./,                     // Contains 'student' subdomain
];

/**
 * Validates if an email address belongs to a recognized educational institution
 *
 * @param email - The email address to validate
 * @returns true if the email domain is from a recognized educational institution
 */
export function isStudentEmail(email: string): boolean {
  if (process.env.NODE_ENV === "development") {
    // Optional: Keep this if you want to allow any email in dev, 
    // or remove it to enforce strict checking even in dev.
    // For now I will include it to match previous behavior but cleaner.
    return true;
  }

  if (!email || typeof email !== 'string') {
    return false;
  }

  // Use centralized format check
  if (!isValidEmailFormat(email)) {
    return false;
  }

  // Use centralized domain extraction
  const domain = getEmailDomain(email);
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
 * @param email - The email that failed validation
 * @returns A user-friendly error message
 */
export function getStudentEmailErrorMessage(email?: string): string {
  if (!email) {
    return 'Please enter a valid university or institutional email address.';
  }

  return `The email "${email}" does not appear to be from a recognized educational institution. Please use your university email address (e.g., .edu, .ac.uk, .edu.au).`;
}

/**
 * Validates email format (basic check)
 *
 * @param email - The email address to validate
 * @returns true if the email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Basic email regex - checks for format like xxx@yyy.zzz
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Gets the domain from an email address
 *
 * @param email - The email address
 * @returns The domain portion of the email (e.g., "university.edu")
 */
export function getEmailDomain(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const parts = email.toLowerCase().trim().split('@');
  return parts.length === 2 ? parts[1] : '';
}