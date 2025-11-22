import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Standardized error response format
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: unknown;
  code?: string;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Log error to console (server-side only)
 * In production, this could integrate with services like Sentry, DataDog, etc.
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '[ERROR]';

  console.error(`${prefix} ${timestamp}:`, error);

  // Additional error details for debugging
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Sanitize error message to prevent sensitive data exposure
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return 'Validation failed. Please check your input.';
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Don't expose database internals
    switch (error.code) {
      case 'P2002':
        return 'A record with this information already exists.';
      case 'P2025':
        return 'The requested resource was not found.';
      case 'P2003':
        return 'Invalid reference to related data.';
      case 'P2014':
        return 'The operation violates data constraints.';
      default:
        return 'A database error occurred. Please try again.';
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'Invalid data provided. Please check your input.';
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return 'Database connection error. Please try again later.';
  }

  // Generic fallback - never expose internal error details
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get appropriate HTTP status code from error
 */
function getStatusCode(error: unknown): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof ZodError) {
    return 400;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return 409;
      case 'P2025': // Record not found
        return 404;
      case 'P2003': // Foreign key constraint
      case 'P2014': // Relation violation
        return 400;
      default:
        return 500;
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return 400;
  }

  return 500;
}

/**
 * Build error response object
 */
function buildErrorResponse(error: unknown, includeDetails = false): ErrorResponse {
  const response: ErrorResponse = {
    success: false,
    error: sanitizeErrorMessage(error),
  };

  // Add error code if available
  if (error instanceof AppError && error.code) {
    response.code = error.code;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    response.code = error.code;
  }

  // Include validation details for ZodErrors (in development)
  if (includeDetails && error instanceof ZodError) {
    response.details = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }));
  }

  // Include custom error details if provided
  if (error instanceof AppError && error.details) {
    response.details = error.details;
  }

  return response;
}

/**
 * Main error handler for API routes
 * Catches all errors, logs them, and returns appropriate responses
 *
 * @param error - The error that occurred
 * @param context - Context information for logging (e.g., route name)
 * @returns NextResponse with appropriate error details
 */
export function handleApiError(
  error: unknown,
  context?: string
): NextResponse<ErrorResponse> {
  // Log the error server-side
  logError(error, context);

  // Get status code
  const statusCode = getStatusCode(error);

  // Build sanitized response
  const includeDetails = process.env.NODE_ENV === 'development';
  const response = buildErrorResponse(error, includeDetails);

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Async wrapper for API route handlers
 * Automatically catches errors and passes them to error handler
 *
 * @example
 * export const GET = withErrorHandler(async (req) => {
 *   // Your route logic here
 * }, 'GET /api/example');
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

/**
 * Database operation wrapper with retry logic for transient failures
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  retryDelay = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Only retry on transient errors
      const shouldRetry =
        error instanceof Prisma.PrismaClientInitializationError ||
        error instanceof Prisma.PrismaClientUnknownRequestError ||
        (error instanceof Error &&
         (error.message.includes('ECONNREFUSED') ||
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('ENOTFOUND')));

      if (!shouldRetry || attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));

      logError(
        `Database operation failed, retrying (${attempt}/${maxRetries})`,
        'DB_RETRY'
      );
    }
  }

  throw lastError;
}

/**
 * Validation helper that throws AppError on validation failure
 */
export function validateOrThrow<T>(
  schema: { parse: (data: unknown) => T },
  data: unknown,
  message = 'Validation failed'
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError(400, message, 'VALIDATION_ERROR', error.errors);
    }
    throw error;
  }
}
