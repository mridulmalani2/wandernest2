/**
 * API Request/Response Schemas
 *
 * Zod schemas for validating API request bodies and query parameters.
 * These are used by the withValidation wrapper to ensure type safety
 * at all API boundaries.
 */

import { z } from 'zod';
import {
  emailSchema,
  uuidSchema,
  nonEmptyStringSchema,
  optionalStringSchema,
  phoneSchema,
  nameSchema,
  shortTextSchema,
  mediumTextSchema,
  longTextSchema,
  ratingSchema,
  positiveIntSchema,
  pageSchema,
  limitSchema,
  studentStatusSchema,
  requestStatusSchema,
  contactMethodSchema,
  genderSchema,
  stringArraySchema,
  uuidArraySchema,
  dateStringSchema,
} from './common';

// ============================================
// AUTHENTICATION SCHEMAS
// ============================================

export const sendOtpSchema = z.object({
  email: emailSchema,
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only digits'),
});

export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// STUDENT SCHEMAS
// ============================================

export const studentApprovalSchema = z.object({
  studentId: uuidSchema,
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be "approve" or "reject"' }),
  }),
});

export const bulkStudentApprovalSchema = z.object({
  studentIds: uuidArraySchema(100),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Action must be "approve" or "reject"' }),
  }),
});

export const studentProfileUpdateSchema = z.object({
  name: nameSchema.optional(),
  dateOfBirth: dateStringSchema.optional(),
  gender: genderSchema.optional(),
  nationality: shortTextSchema.optional(),
  languages: stringArraySchema(10).optional(),
  institute: shortTextSchema.optional(),
  studyProgram: shortTextSchema.optional(),
  studyYear: positiveIntSchema.optional(),
  city: shortTextSchema.optional(),
  bio: mediumTextSchema.optional(),
  coverLetter: longTextSchema.optional(),
  interests: stringArraySchema(20).optional(),
  skills: stringArraySchema(20).optional(),
  phoneNumber: phoneSchema.optional(),
  availability: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  })).max(21).optional(),
});

export const studentOnboardingSchema = z.object({
  // Personal info
  name: nameSchema,
  email: emailSchema,
  dateOfBirth: dateStringSchema,
  gender: genderSchema,
  nationality: nonEmptyStringSchema,
  languages: stringArraySchema(10).min(1, 'At least one language is required'),
  phoneNumber: phoneSchema,

  // Academic info
  institute: nonEmptyStringSchema,
  studyProgram: nonEmptyStringSchema,
  studyYear: positiveIntSchema,
  studentIdNumber: optionalStringSchema,

  // Location
  city: nonEmptyStringSchema,

  // Profile
  bio: mediumTextSchema.optional(),
  coverLetter: longTextSchema.optional(),
  interests: stringArraySchema(20).optional(),
  skills: stringArraySchema(20).optional(),

  // Documents
  studentIdUrl: optionalStringSchema,
  profilePhotoUrl: optionalStringSchema,

  // Availability
  availability: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  })).min(1, 'At least one availability slot is required'),

  // Services
  servicesOffered: stringArraySchema(10).optional(),
  hourlyRate: z.number().min(0).max(1000).optional(),
});

export const matchResponseSchema = z.object({
  action: z.enum(['accept', 'decline']),
  token: nonEmptyStringSchema,
  requestId: uuidSchema,
  studentId: uuidSchema,
});

// ============================================
// TOURIST REQUEST SCHEMAS
// ============================================

export const touristRequestCreateSchema = z.object({
  // Trip details
  city: nonEmptyStringSchema,
  dates: z.object({
    start: dateStringSchema,
    end: dateStringSchema.optional(),
    flexible: z.boolean().optional(),
  }),
  groupSize: positiveIntSchema.max(20, 'Group size cannot exceed 20'),
  groupType: z.enum(['solo', 'couple', 'family', 'friends', 'business']).optional(),

  // Preferences
  interests: stringArraySchema(20).optional(),
  preferredLanguages: stringArraySchema(10).optional(),
  preferredNationality: shortTextSchema.optional(),
  preferredGender: genderSchema.optional(),
  accessibilityNeeds: mediumTextSchema.optional(),
  dietaryRestrictions: stringArraySchema(10).optional(),
  budgetRange: z.enum(['budget', 'moderate', 'luxury']).optional(),
  timePreference: z.enum(['morning', 'afternoon', 'evening', 'flexible']).optional(),

  // Contact
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  preferredContactMethod: contactMethodSchema.optional(),
  additionalNotes: longTextSchema.optional(),
});

export const touristRequestInitiateSchema = z.object({
  step: z.number().int().min(1).max(3),
  data: z.record(z.unknown()),
});

export const touristRequestSelectSchema = z.object({
  requestId: uuidSchema,
  selectedStudentTokens: z.array(z.string().min(1)).min(1, 'At least one student must be selected'),
});

export const touristRequestVerifySchema = z.object({
  email: emailSchema,
  code: z.string().length(6, 'Verification code must be 6 digits'),
  requestId: uuidSchema.optional(),
});

// ============================================
// BOOKING SCHEMAS
// ============================================

export const bookingAssignSchema = z.object({
  bookingId: uuidSchema,
  studentId: uuidSchema,
});

export const bookingStatusUpdateSchema = z.object({
  bookingId: uuidSchema,
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
  reason: mediumTextSchema.optional(),
});

// ============================================
// REVIEW SCHEMAS
// ============================================

/**
 * Schema for creating a review - aligned with CreateReviewInput from lib/reviews/types.ts
 */
export const reviewCreateSchema = z.object({
  requestId: uuidSchema,
  studentId: uuidSchema,
  rating: ratingSchema,
  text: z.string().max(500, 'Review text must not exceed 500 characters').transform(val => val.trim()).optional(),
  attributes: stringArraySchema(20),
  noShow: z.boolean(),
  pricePaid: z.number().positive().optional(),
  isAnonymous: z.boolean().optional().default(false),
});

// ============================================
// CONTACT SCHEMAS
// ============================================

export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message cannot exceed 5000 characters').transform(val => val.trim()),
  category: z.enum(['general', 'support', 'partnership', 'feedback']).optional(),
  fileUrl: optionalStringSchema,
  fileName: optionalStringSchema,
});

// ============================================
// MATCHING SCHEMAS
// ============================================

export const findMatchesSchema = z.object({
  requestId: uuidSchema,
});

export const selectMatchesSchema = z.object({
  requestId: uuidSchema,
  studentId: uuidSchema,
  action: z.enum(['select', 'deselect']),
});

// ============================================
// QUERY PARAMETER SCHEMAS
// ============================================

export const studentsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  status: studentStatusSchema.optional(),
  city: shortTextSchema.optional(),
  search: shortTextSchema.optional(),
});

export const bookingsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  studentId: uuidSchema.optional(),
  touristEmail: emailSchema.optional(),
});

export const requestsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  status: requestStatusSchema.optional(),
});

export const reportsQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']).optional(),
  type: z.enum(['abuse', 'spam', 'inappropriate', 'other']).optional(),
});

// ============================================
// FILE UPLOAD SCHEMAS
// ============================================

export const fileUploadMetadataSchema = z.object({
  filename: z.string().max(255, 'Filename too long'),
  contentType: z.enum([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
  ]),
  size: z.number().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type StudentApprovalInput = z.infer<typeof studentApprovalSchema>;
export type BulkStudentApprovalInput = z.infer<typeof bulkStudentApprovalSchema>;
export type StudentProfileUpdateInput = z.infer<typeof studentProfileUpdateSchema>;
export type StudentOnboardingInput = z.infer<typeof studentOnboardingSchema>;
export type MatchResponseInput = z.infer<typeof matchResponseSchema>;
export type TouristRequestCreateInput = z.infer<typeof touristRequestCreateSchema>;
export type TouristRequestSelectInput = z.infer<typeof touristRequestSelectSchema>;
export type ReviewCreateInput = z.output<typeof reviewCreateSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type FindMatchesInput = z.infer<typeof findMatchesSchema>;
export type StudentsQueryInput = z.infer<typeof studentsQuerySchema>;
export type BookingsQueryInput = z.infer<typeof bookingsQuerySchema>;
