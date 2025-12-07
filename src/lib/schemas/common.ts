/**
 * Common Validation Schemas
 *
 * Reusable Zod schemas for common data types used across the application.
 * These schemas ensure consistent validation at all system boundaries.
 */

import { z } from 'zod';

// ============================================
// PRIMITIVE SCHEMAS
// ============================================

/**
 * UUID v4 validation
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Email validation with normalization
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .transform((val) => val.toLowerCase().trim());

/**
 * Non-empty trimmed string
 */
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'This field is required')
  .transform((val) => val.trim());

/**
 * Optional trimmed string (can be empty)
 */
export const optionalStringSchema = z
  .string()
  .optional()
  .transform((val) => val?.trim() || undefined);

/**
 * Phone number validation (international format)
 */
export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format')
  .min(7, 'Phone number is too short')
  .max(20, 'Phone number is too long')
  .transform((val) => val.replace(/[^\d+]/g, ''));

/**
 * URL validation with protocol enforcement
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must use http or https protocol'
  );

/**
 * Optional URL schema
 */
export const optionalUrlSchema = z
  .string()
  .url('Invalid URL format')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val && val.length > 0 ? val : undefined));

// ============================================
// DATE SCHEMAS
// ============================================

/**
 * ISO date string validation
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((val) => !isNaN(Date.parse(val)), 'Invalid date');

/**
 * Date range validation
 */
export const dateRangeSchema = z.object({
  start: dateStringSchema,
  end: dateStringSchema,
}).refine(
  (data) => new Date(data.start) <= new Date(data.end),
  'End date must be after start date'
);

/**
 * Future date validation
 */
export const futureDateSchema = dateStringSchema.refine(
  (val) => new Date(val) > new Date(),
  'Date must be in the future'
);

// ============================================
// PAGINATION SCHEMAS
// ============================================

/**
 * Page number (1-indexed, max 1000)
 */
export const pageSchema = z.coerce
  .number()
  .int('Page must be an integer')
  .min(1, 'Page must be at least 1')
  .max(1000, 'Page cannot exceed 1000')
  .default(1);

/**
 * Items per page (1-100, default 20)
 */
export const limitSchema = z.coerce
  .number()
  .int('Limit must be an integer')
  .min(1, 'Limit must be at least 1')
  .max(100, 'Limit cannot exceed 100')
  .default(20);

/**
 * Pagination query parameters
 */
export const paginationSchema = z.object({
  page: pageSchema,
  limit: limitSchema,
});

// ============================================
// ARRAY SCHEMAS
// ============================================

/**
 * Non-empty string array with max items
 */
export const stringArraySchema = (maxItems = 50) =>
  z.array(z.string().min(1)).max(maxItems, `Cannot exceed ${maxItems} items`);

/**
 * UUID array with max items
 */
export const uuidArraySchema = (maxItems = 100) =>
  z.array(uuidSchema).max(maxItems, `Cannot exceed ${maxItems} items`);

// ============================================
// TEXT CONTENT SCHEMAS
// ============================================

/**
 * Short text (max 200 chars)
 */
export const shortTextSchema = z
  .string()
  .max(200, 'Text cannot exceed 200 characters')
  .transform((val) => val.trim());

/**
 * Medium text (max 1000 chars)
 */
export const mediumTextSchema = z
  .string()
  .max(1000, 'Text cannot exceed 1000 characters')
  .transform((val) => val.trim());

/**
 * Long text (max 5000 chars)
 */
export const longTextSchema = z
  .string()
  .max(5000, 'Text cannot exceed 5000 characters')
  .transform((val) => val.trim());

/**
 * Name field (2-100 chars, no numbers or special chars except spaces/hyphens)
 */
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters')
  .regex(/^[\p{L}\s\-']+$/u, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((val) => val.trim());

// ============================================
// NUMERIC SCHEMAS
// ============================================

/**
 * Rating (1-5 scale)
 */
export const ratingSchema = z.coerce
  .number()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating cannot exceed 5');

/**
 * Positive integer
 */
export const positiveIntSchema = z.coerce
  .number()
  .int('Must be a whole number')
  .positive('Must be a positive number');

/**
 * Non-negative integer
 */
export const nonNegativeIntSchema = z.coerce
  .number()
  .int('Must be a whole number')
  .min(0, 'Cannot be negative');

// ============================================
// ENUM SCHEMAS
// ============================================

/**
 * Student status enum
 */
export const studentStatusSchema = z.enum([
  'PENDING_APPROVAL',
  'APPROVED',
  'SUSPENDED',
  'INACTIVE',
]);

/**
 * Request status enum
 */
export const requestStatusSchema = z.enum([
  'PENDING',
  'MATCHED',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
]);

/**
 * Booking status enum
 */
export const bookingStatusSchema = z.enum([
  'PENDING',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

/**
 * Gender enum
 */
export const genderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

/**
 * Contact method preference
 */
export const contactMethodSchema = z.enum(['email', 'phone', 'whatsapp']);

// ============================================
// UTILITY TYPES
// ============================================

export type PaginationParams = z.infer<typeof paginationSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type StudentStatus = z.infer<typeof studentStatusSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
