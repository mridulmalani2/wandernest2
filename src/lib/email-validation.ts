/**
 * Email Domain Validation for Student Authentication
 *
 * This module provides validation for institutional/educational email addresses
 * used in the student authentication flow. Only emails from recognized
 * educational institutions are allowed for student sign-up and login.
 *
 * USAGE:
 * - Import `isStudentEmail()` to validate email domains (client and server-side)
 * - Import `getStudentEmailErrorMessage()` for user-friendly error messages
 * - Import `STUDENT_EMAIL_DOMAINS` to access the full list of valid domains
 *
 * CONFIGURATION:
 * - Default domains are defined in STUDENT_EMAIL_DOMAINS below
 * - Additional domains can be added via STUDENT_EMAIL_ALLOWED_DOMAINS env variable
 *   (comma-separated list, e.g., ".university.edu,.college.ac.uk")
 * - Individual email addresses can be allowlisted via STUDENT_EMAIL_ALLOWLIST
 *   (comma-separated list, e.g., "john@example.com,jane@company.org")
 *
 * TO ADD NEW DOMAINS:
 * 1. For permanent additions: Add to STUDENT_EMAIL_DOMAINS array below
 * 2. For temporary/testing: Set STUDENT_EMAIL_ALLOWED_DOMAINS environment variable
 * 3. For specific users: Set STUDENT_EMAIL_ALLOWLIST environment variable
 */

// ============================================================================
// VALID STUDENT EMAIL DOMAINS - Centralized Configuration
// ============================================================================
// This list covers major educational domain patterns worldwide.
// Additional domains can be configured via environment variables.
// ============================================================================
const BASE_STUDENT_EMAIL_DOMAINS = [
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
  '.edu.ca',    // Canadian educational institutions
  '.ac.ca',     // Canadian academic institutions
  '.edu.ng',    // Nigerian educational institutions
  '.ac.ng',     // Nigerian academic institutions
  '.edu.eg',    // Egyptian educational institutions
  '.ac.eg',     // Egyptian academic institutions
  '.edu.pk',    // Pakistani educational institutions
  '.ac.id',     // Indonesian academic institutions
  '.edu.bd',    // Bangladeshi educational institutions
];

// Load additional domains from environment variable
// Format: comma-separated list like ".university.edu,.college.ac.uk"
const envDomains = (process.env.STUDENT_EMAIL_ALLOWED_DOMAINS || '')
  .split(',')
  .map(d => d.trim().toLowerCase())
  .filter(d => d.startsWith('.') && d.length > 2);

// Load email allowlist from environment variable
// Format: comma-separated list like "john@example.com,jane@company.org"
const emailAllowlist = (process.env.STUDENT_EMAIL_ALLOWLIST || '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(e => e.includes('@'));

// Combine base domains with environment-configured domains
export const STUDENT_EMAIL_DOMAINS = [...new Set([...BASE_STUDENT_EMAIL_DOMAINS, ...envDomains])];

/**
 * Validates if an email address belongs to a recognized educational institution
 *
 * Checks:
 * 1. Email allowlist (STUDENT_EMAIL_ALLOWLIST env variable) - specific emails
 * 2. Domain patterns (STUDENT_EMAIL_DOMAINS + STUDENT_EMAIL_ALLOWED_DOMAINS)
 *
 * @param email - The email address to validate
 * @returns true if the email is allowed for student authentication
 */
export function isStudentEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const lowerEmail = email.toLowerCase().trim();

  // Validate email format
  if (!lowerEmail.includes('@') || lowerEmail.split('@').length !== 2) {
    return false;
  }

  // Check email allowlist first (for testing/special cases)
  if (emailAllowlist.length > 0 && emailAllowlist.includes(lowerEmail)) {
    return true;
  }

  // Check domain patterns
  return STUDENT_EMAIL_DOMAINS.some(domain => lowerEmail.endsWith(domain));
}

/**
 * Gets a user-friendly error message for invalid student email domains
 *
 * @param email - The email that failed validation
 * @returns A user-friendly error message with examples
 */
export function getStudentEmailErrorMessage(email?: string): string {
  if (!email) {
    return 'Please enter a valid university or institutional email address.';
  }

  const domain = getEmailDomain(email);
  const exampleDomains = ['.edu', '.ac.uk', '.edu.au', '.edu.in', '.ac.ca'];
  const examples = exampleDomains.slice(0, 3).join(', ');

  return `The email domain "${domain}" is not recognized as an educational institution. Please use your university email address (e.g., ${examples}). If you believe this is an error, contact support.`;
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
