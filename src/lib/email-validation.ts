/**
 * Email Domain Validation for Student Authentication
 *
 * This module provides validation for institutional/educational email addresses
 * used in the student authentication flow. Only emails from APPROVED
 * educational institutions are allowed for student sign-up and login.
 *
 * USAGE:
 * - Import `isStudentEmail()` to validate email domains
 * - Import `getStudentEmailErrorMessage()` for user-friendly error messages
 * - Import `ALLOWED_STUDENT_DOMAINS` to access the full list of valid domains
 *
 * TO ADD NEW DOMAINS:
 * Simply add the exact domain to the ALLOWED_STUDENT_DOMAINS array below.
 * Format: 'exact.domain' (e.g., 'hec.edu', 'ashoka.edu.in')
 * The validation is case-insensitive and matches the EXACT domain after @.
 */

// ============================================================================
// ALLOWED STUDENT EMAIL DOMAINS - Centralized Configuration
// ============================================================================
// IMPORTANT: This is an EXACT domain match (not suffix matching).
// Only emails from these specific domains are allowed for student authentication.
//
// Examples:
// - john@hec.edu ✅ (matches 'hec.edu')
// - jane@ashoka.edu.in ✅ (matches 'ashoka.edu.in')
// - bob@stanford.edu ❌ (not in the list)
// - alice@student.hec.edu ❌ (subdomain not allowed - must be exact match)
//
// To add a new university, add the exact domain (everything after @) to this list.
// ============================================================================
export const ALLOWED_STUDENT_DOMAINS = [
  // Specific partner universities
  'hec.edu',           // HEC Paris (US domain)
  'hec.fr',            // HEC Paris (France domain)
  'ashoka.edu.in',     // Ashoka University, India

  // Generic .edu domains for easy extension
  // Add specific universities below as partnerships are established
  'stanford.edu',      // Example: Stanford University
  'mit.edu',           // Example: MIT
  'berkeley.edu',      // Example: UC Berkeley
  'harvard.edu',       // Example: Harvard University
  'yale.edu',          // Example: Yale University
  'princeton.edu',     // Example: Princeton University
  'columbia.edu',      // Example: Columbia University
  'cornell.edu',       // Example: Cornell University
  'upenn.edu',         // Example: University of Pennsylvania
  'duke.edu',          // Example: Duke University

  // Add more specific university domains here as needed
  // Format: 'university.edu' or 'university.edu.country'
];

/**
 * Validates if an email address belongs to an approved educational institution
 *
 * @param email - The email address to validate
 * @returns true if the email domain is from an approved educational institution
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

  // Extract domain (everything after @)
  const domain = lowerEmail.split('@')[1];

  // Check if the domain is in the allowed list (exact match)
  return ALLOWED_STUDENT_DOMAINS.includes(domain);
}

/**
 * Gets a user-friendly error message for invalid student email domains
 *
 * @param email - The email that failed validation
 * @returns A user-friendly error message
 */
export function getStudentEmailErrorMessage(email?: string): string {
  if (!email) {
    return 'Please enter your university email address from an approved institution.';
  }

  const domain = email.includes('@') ? email.split('@')[1] : '';

  return `The email domain "${domain}" is not currently approved for student sign-in. TourWiseCo currently partners with specific universities (HEC Paris, Ashoka University, and select .edu institutions). If you believe your university should be added, please contact support.`;
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
