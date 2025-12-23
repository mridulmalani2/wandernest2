import 'server-only'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

/**
 * Token verification result types
 * SECURITY: Allows callers to distinguish between error types for proper handling
 */
export type TokenVerificationResult =
  | { valid: true; payload: jwt.JwtPayload | string }
  | { valid: false; error: 'expired' | 'invalid' | 'malformed' | 'config_error' }

/**
 * Check if JWT_SECRET is configured
 * SECURITY: Use this to fail fast during startup/health checks
 */
export function isJWTConfigured(): boolean {
  return !!process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
}

/**
 * Get JWT_SECRET with validation at runtime
 * SECURITY: Throws if not configured - callers must handle this
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set')
  }
  // SECURITY: Warn if secret is too short (vulnerable to brute force)
  if (secret.length < 32) {
    console.warn('SECURITY WARNING: JWT_SECRET should be at least 32 characters')
  }
  return secret
}

/**
 * Generate JWT token
 * SECURITY: Throws if JWT_SECRET is not configured (fail fast)
 */
export function generateToken(payload: object, expiresIn: string = '1h'): string {
  const JWT_SECRET = getJWTSecret()
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

/**
 * Verify JWT token with detailed error information
 * SECURITY FIXES:
 * - Does NOT catch configuration errors (fail fast on missing JWT_SECRET)
 * - Returns specific error types for proper handling
 * - Does NOT log sensitive error details
 */
export function verifyTokenDetailed(token: string): TokenVerificationResult {
  // SECURITY: Let configuration errors propagate - don't mask missing JWT_SECRET
  const JWT_SECRET = getJWTSecret()

  try {
    // SECURITY: Enforce algorithms to prevent downgrade attacks
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
    return { valid: true, payload }
  } catch (err: unknown) {
    // SECURITY: Categorize errors without logging sensitive details
    if (err instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'expired' }
    }
    if (err instanceof jwt.JsonWebTokenError) {
      // Includes invalid signature, malformed token, etc.
      if (err.message.includes('malformed')) {
        return { valid: false, error: 'malformed' }
      }
      return { valid: false, error: 'invalid' }
    }
    // Unknown error - treat as invalid
    return { valid: false, error: 'invalid' }
  }
}

/**
 * Verify JWT token (legacy API - returns payload or null)
 * SECURITY: Now properly propagates configuration errors instead of masking them
 *
 * @deprecated Use verifyTokenDetailed for better error handling
 */
export function verifyToken(token: string): jwt.JwtPayload | string | null {
  // SECURITY: Let configuration errors propagate - do NOT catch getJWTSecret errors
  const JWT_SECRET = getJWTSecret()

  try {
    // SECURITY: Enforce algorithms to prevent downgrade attacks
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })
  } catch (error) {
    // SECURITY: Do NOT log error details - could expose token information
    // Callers should use verifyTokenDetailed if they need error categorization
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}
