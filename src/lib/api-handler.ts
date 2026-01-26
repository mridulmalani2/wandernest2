/**
 * Unified API Handler
 *
 * A comprehensive wrapper for Next.js API routes that provides:
 * - Request body and query parameter validation via Zod schemas
 * - Structured logging with request context
 * - Automatic error handling with sanitized responses
 * - Rate limiting support (via configuration)
 * - Request timing and metrics
 *
 * This replaces scattered validation patterns with a single, consistent approach.
 *
 * @example
 * import { createApiHandler } from '@/lib/api-handler';
 * import { studentApprovalSchema } from '@/lib/schemas';
 *
 * export const POST = createApiHandler({
 *   schema: studentApprovalSchema,
 *   auth: 'admin',
 *   handler: async ({ body, auth }) => {
 *     // body is validated and typed
 *     return { success: true, data: result };
 *   },
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import { z, ZodObject } from 'zod';
import { verifyAdmin, verifyStudent, verifyTourist } from './api-auth';
import { requireDatabase } from './prisma';
import { AppError, handleApiError, isZodError } from './error-handler';
import { logger } from './logger';
import { sanitizeText } from './sanitization';

// ============================================
// TYPES
// ============================================

type AuthType = 'admin' | 'student' | 'tourist' | 'optional' | 'none';

interface AuthResult {
  authorized: boolean;
  /** True when auth is 'optional' and no identity was found */
  isAnonymous?: boolean;
  admin?: { id: string; email: string; role: string; isActive: boolean };
  student?: { email: string; id?: string | null };
  tourist?: { email: string };
  error?: string;
}

interface HandlerContext<TBody, TQuery> {
  req: NextRequest;
  body: TBody;
  query: TQuery;
  auth: AuthResult;
  /**
   * Database client. Non-null when requireDb: true (the default).
   * If you set requireDb: false, do not access this property - it will be null at runtime.
   */
  db: ReturnType<typeof requireDatabase>;
  params?: Record<string, string>;
}

interface ApiHandlerConfig<TBody, TQuery, TResponse> {
  /** Zod schema for request body validation */
  bodySchema?: z.ZodTypeAny;

  /** Zod schema for query parameter validation */
  querySchema?: z.ZodTypeAny;

  /** Authentication requirement */
  auth?: AuthType;

  /** Route identifier for logging (e.g., 'POST /api/admin/students/approve') */
  route?: string;

  /** Whether database is required for this route */
  requireDb?: boolean;

  /** The request handler function */
  handler: (ctx: HandlerContext<TBody, TQuery>) => Promise<TResponse>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: unknown;
}

// ============================================
// QUERY PARSING HELPER
// ============================================

/**
 * Parse query parameters from request, preserving multi-value parameters as arrays
 * SECURITY FIX: Original implementation dropped duplicate keys, only keeping the last value.
 * This fix properly handles multi-value query parameters (e.g., ?tag=a&tag=b -> {tag: ['a', 'b']})
 */
function parseQueryParams(req: NextRequest): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  req.nextUrl.searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing === undefined) {
      // First occurrence - store as string
      params[key] = value;
    } else if (Array.isArray(existing)) {
      // Already an array - append
      existing.push(value);
    } else {
      // Second occurrence - convert to array
      params[key] = [existing, value];
    }
  });

  return params;
}

// ============================================
// AUTHENTICATION HELPER
// ============================================

async function authenticate(
  req: NextRequest,
  authType: AuthType
): Promise<AuthResult> {
  if (authType === 'none') {
    return { authorized: true };
  }

  if (authType === 'admin') {
    const result = await verifyAdmin(req);
    return {
      authorized: result.authorized,
      // SECURITY FIX: Include all admin fields (role, isActive) for proper RBAC checks
      admin: result.admin ? {
        id: result.admin.id,
        email: result.admin.email,
        role: result.admin.role,
        isActive: result.admin.isActive,
      } : undefined,
      error: result.error,
    };
  }

  if (authType === 'student') {
    const result = await verifyStudent(req);
    return {
      authorized: result.authorized,
      student: result.student,
      error: result.error,
    };
  }

  if (authType === 'tourist') {
    const result = await verifyTourist(req);
    return {
      authorized: result.authorized,
      tourist: result.tourist ? { email: result.tourist.email } : undefined,
      error: result.error,
    };
  }

  // Optional auth - try all methods, allow request even if none succeed
  if (authType === 'optional') {
    const adminResult = await verifyAdmin(req);
    if (adminResult.authorized && adminResult.admin) {
      return {
        authorized: true,
        admin: {
          id: adminResult.admin.id,
          email: adminResult.admin.email,
          role: adminResult.admin.role,
          isActive: adminResult.admin.isActive,
        },
      };
    }

    const studentResult = await verifyStudent(req);
    if (studentResult.authorized && studentResult.student) {
      return {
        authorized: true,
        student: studentResult.student,
      };
    }

    const touristResult = await verifyTourist(req);
    if (touristResult.authorized && touristResult.tourist) {
      return {
        authorized: true,
        tourist: { email: touristResult.tourist.email },
      };
    }

    // SECURITY FIX: Optional auth without identity should return authorized: false
    // but with isAnonymous: true so handlers know it's expected and can allow the request.
    // This prevents handlers from incorrectly assuming an authenticated user exists
    // when auth.authorized === true.
    return { authorized: false, isAnonymous: true };
  }

  return { authorized: false, error: 'Unknown auth type' };
}

// ============================================
// MAIN HANDLER FACTORY
// ============================================

/**
 * Creates a validated, authenticated API handler
 */
export function createApiHandler<
  TBody = unknown,
  TQuery = Record<string, string>,
  TResponse = unknown
>(config: ApiHandlerConfig<TBody, TQuery, TResponse>) {
  const {
    bodySchema,
    querySchema,
    auth = 'none',
    route = 'API',
    requireDb = true,
    handler,
  } = config;

  return async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID().slice(0, 8);

    try {
      // Log incoming request
      logger.info(`[${requestId}] ${route} - Request received`, {
        method: req.method,
        path: req.nextUrl.pathname,
      });

      // 1. Authenticate if required
      if (auth !== 'none') {
        const authResult = await authenticate(req, auth);

        // SECURITY FIX: For optional auth, allow anonymous access (isAnonymous: true)
        // For required auth types, reject if not authorized
        if (!authResult.authorized && !authResult.isAnonymous) {
          logger.warn(`[${requestId}] ${route} - Authentication failed`, {
            error: authResult.error,
          });
          throw new AppError(401, 'Unauthorized', 'AUTH_FAILED');
        }

        // Store auth result for handler
        (req as any).__auth = authResult;
      }

      // 2. Parse and validate query parameters
      let validatedQuery = {} as TQuery;
      if (querySchema) {
        const rawQuery = parseQueryParams(req);
        try {
          validatedQuery = querySchema.parse(rawQuery);
        } catch (error) {
          if (isZodError(error)) {
            logger.warn(`[${requestId}] ${route} - Query validation failed`, {
              errors: error.errors,
            });
            // SECURITY FIX: Sanitize error details to avoid leaking internal validation structure
            const sanitizedErrors = error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            }));
            throw new AppError(400, 'Invalid query parameters', 'VALIDATION_ERROR', sanitizedErrors);
          }
          throw error;
        }
      }

      // 3. Parse and validate request body
      let validatedBody = {} as TBody;
      if (bodySchema && ['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
        try {
          const rawBody = await req.json();
          const strictSchema = bodySchema instanceof ZodObject ? bodySchema.strict() : bodySchema;
          validatedBody = strictSchema.parse(rawBody);
        } catch (error) {
          if (isZodError(error)) {
            logger.warn(`[${requestId}] ${route} - Body validation failed`, {
              errors: error.errors,
            });
            // SECURITY FIX: Consistent ZodError handling - wrap in AppError like query validation
            // Sanitize error details to avoid leaking internal validation structure
            const sanitizedErrors = error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message,
            }));
            throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', sanitizedErrors);
          }
          if (error instanceof SyntaxError) {
            throw new AppError(400, 'Invalid JSON in request body', 'INVALID_JSON');
          }
          throw error;
        }
      }

      // 4. Get database if required
      let db: ReturnType<typeof requireDatabase> | null = null;
      if (requireDb) {
        db = requireDatabase();
      }

      // 5. Resolve route params if present
      const params = context?.params ? await context.params : undefined;

      // 6. Execute handler
      // Note: db! assertion is safe here because when requireDb is true (the default),
      // requireDatabase() throws if db is unavailable. If requireDb is false,
      // handlers should not access db (will be null at runtime despite the type).
      const result = await handler({
        req,
        body: validatedBody,
        query: validatedQuery,
        auth: (req as any).__auth || { authorized: true },
        db: db!,
        params,
      });

      // 7. Log success and return response
      const duration = Date.now() - startTime;
      logger.info(`[${requestId}] ${route} - Completed in ${duration}ms`);

      // If result is already a NextResponse, return it
      if (result instanceof NextResponse) {
        return result;
      }

      // Wrap result in standard response format
      return NextResponse.json({
        success: true,
        ...result,
      });
    } catch (error) {
      // Log error with context
      const duration = Date.now() - startTime;
      logger.error(`[${requestId}] ${route} - Failed after ${duration}ms`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Use centralized error handler
      return handleApiError(error, `[${requestId}] ${route}`);
    }
  };
}

// ============================================
// SIMPLIFIED HANDLER FOR SIMPLE ROUTES
// ============================================

/**
 * Simple wrapper for routes that don't need body validation
 * Just provides error handling and logging
 */
export function withApiHandler(
  handler: (req: NextRequest, params?: { params?: Promise<Record<string, string>> }) => Promise<NextResponse>,
  route: string
) {
  return async (
    req: NextRequest,
    context?: { params?: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID().slice(0, 8);

    try {
      logger.info(`[${requestId}] ${route} - Request received`, {
        method: req.method,
        path: req.nextUrl.pathname,
      });

      const result = await handler(req, context);

      const duration = Date.now() - startTime;
      logger.info(`[${requestId}] ${route} - Completed in ${duration}ms`);

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`[${requestId}] ${route} - Failed after ${duration}ms`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return handleApiError(error, `[${requestId}] ${route}`);
    }
  };
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate data against a schema and throw AppError on failure
 */
export function validateBody<T>(schema: z.ZodType<T, any, any>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (isZodError(error)) {
      // SECURITY FIX: Sanitize error details to prevent exposing raw Zod validation
      // structure which could reveal internal schema details or input values
      const sanitizedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new AppError(400, 'Validation failed', 'VALIDATION_ERROR', sanitizedErrors);
    }
    throw error;
  }
}

/**
 * Safely parse query parameters with a schema
 */
export function parseQuery<T>(schema: z.ZodType<T, any, any>, req: NextRequest): T {
  const params = parseQueryParams(req);
  try {
    return schema.parse(params);
  } catch (error) {
    if (isZodError(error)) {
      // SECURITY FIX: Sanitize error details consistently
      const sanitizedErrors = error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      throw new AppError(400, 'Invalid query parameters', 'VALIDATION_ERROR', sanitizedErrors);
    }
    throw error;
  }
}

/**
 * Type-safe ID parameter extractor
 */
export function requireId(
  params: Record<string, string> | undefined,
  key: string = 'id'
): string {
  const id = params?.[key];
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new AppError(400, `Missing or invalid ${key} parameter`, 'MISSING_PARAM');
  }
  return id.trim();
}
