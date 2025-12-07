/**
 * Validation Schemas Module
 *
 * Centralized Zod schemas for runtime validation at all system boundaries.
 * Import from this module to ensure consistent validation across the application.
 *
 * @example
 * import { studentApprovalSchema, type StudentApprovalInput } from '@/lib/schemas';
 *
 * const validated = studentApprovalSchema.parse(body);
 */

// Common/primitive schemas
export * from './common';

// API-specific schemas
export * from './api';

// Re-export Zod for convenience
export { z } from 'zod';
