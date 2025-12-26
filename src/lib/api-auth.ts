/**
 * API Route Authentication Helpers (Node.js Runtime ONLY)
 *
 * WARNING: These functions are NOT compatible with Edge Runtime!
 * They use:
 * - Prisma (requires Node.js runtime)
 * - jsonwebtoken (requires Node.js crypto)
 *
 * DO NOT import these functions into Next.js middleware (/middleware.ts)
 * Only use in API routes (app/api/*) which run in Node.js runtime
 *
 * For Edge-compatible authentication in middleware, use next-auth/jwt
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { requireDatabase } from './prisma'
import { logger } from './logger'
import { isTokenRevoked } from './token-revocation'

interface JWTPayload {
  adminId?: string
  email?: string
  role?: string
}

export interface AuthenticatedRequest extends NextRequest {
  admin?: {
    id: string
    email: string
    role: string
  }
  tourist?: {
    email: string
  }
}

// API route helper to verify admin authentication (Node.js runtime only)
/**
 * Verify that the request is from an authenticated admin
 * @param request - The incoming NextRequest
 * @returns Object containing authorization status and admin data or error
 */
export async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; admin?: { id: string; email: string; role: string; isActive: boolean }; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('admin-token')?.value

    // SECURITY FIX: Proper token extraction with explicit handling
    let token: string | null = null

    if (authHeader) {
      // SECURITY FIX: Case-insensitive Bearer token extraction
      // Handles: "Bearer TOKEN", "bearer TOKEN", "BEARER TOKEN"
      const match = authHeader.match(/^bearer\s+(.+)$/i)
      if (match) {
        token = match[1].trim()
      } else {
        // SECURITY FIX: If Authorization header is present but malformed,
        // reject the request rather than falling back to cookie.
        // This prevents attackers from manipulating which token is used.
        return { authorized: false, error: 'Authentication failed' }
      }
    } else if (cookieToken) {
      // Only use cookie token if no Authorization header was provided
      token = cookieToken
    }

    if (!token) {
      return { authorized: false, error: 'Authentication failed' }
    }

    if (await isTokenRevoked(token)) {
      return { authorized: false, error: 'Authentication failed' }
    }

    const decoded = verifyToken(token) as JWTPayload | string | null

    if (!decoded || typeof decoded === 'string' || !decoded.adminId) {
      return { authorized: false, error: 'Authentication failed' }
    }

    const prisma = requireDatabase()

    // Verify admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, role: true, isActive: true }
    })

    if (!admin || !admin.isActive) {
      return { authorized: false, error: 'Authentication failed' }
    }

    return { authorized: true, admin }
  } catch (error) {
    // SECURITY FIX: Use structured logger, don't log full error object
    logger.warn('Admin authentication failed', {
      errorType: error instanceof Error ? error.name : 'unknown',
    })
    return { authorized: false, error: 'Authentication failed' }
  }
}

// API route helper to verify tourist authentication (Node.js runtime only)
/**
 * Verify that the request is from an authenticated tourist
 * @param request - The incoming NextRequest
 * @returns Object containing authorization status and tourist data or error
 */
export async function verifyTourist(request: NextRequest): Promise<{ authorized: boolean; tourist?: { email: string }; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'No token provided' }
    }

    const token = authHeader.substring(7)

    const prisma = requireDatabase()

    // Verify token exists in TouristSession
    const session = await prisma.touristSession.findUnique({
      where: { token },
    })

    if (!session || !session.isVerified) {
      return { authorized: false, error: 'Invalid or unverified token' }
    }

    // Check if token is expired
    if (new Date() > session.expiresAt) {
      return { authorized: false, error: 'Token expired' }
    }

    return { authorized: true, tourist: { email: session.email } }
  } catch (error) {
    return { authorized: false, error: 'Authentication failed' }
  }
}

/**
 * Verify that the request is from an authenticated student
 * Checks both custom OTP session and NextAuth session
 * @param request - The incoming NextRequest
 * @returns Object containing authorization status and student data (email, id if available) or error
 */
export async function verifyStudent(request: NextRequest): Promise<{ authorized: boolean; student?: { email: string; id?: string | null }; error?: string }> {
  try {
    // Dynamic import to avoid circular dependencies if any, and ensure server-only
    const { getValidStudentSession, readStudentTokenFromRequest } = await import('@/lib/student-auth');
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth-options');

    let studentEmail: string | null = null;
    let studentId: string | null = null;

    // 1. Try Custom OTP Session
    const token = await readStudentTokenFromRequest(request);
    const otpSession = await getValidStudentSession(token);

    if (otpSession) {
      studentEmail = otpSession.email;
      studentId = otpSession.studentId;
    } else {
      // 2. Try NextAuth Session
      const nextAuthSession = await getServerSession(authOptions);
      if (nextAuthSession?.user?.userType === 'student' && nextAuthSession.user.email) {
        studentEmail = nextAuthSession.user.email;
      }
    }

    if (!studentEmail) {
      return { authorized: false, error: 'Unauthorized - Please sign in' };
    }

    return { authorized: true, student: { email: studentEmail, id: studentId } };
  } catch (error) {
    // SECURITY FIX: Use structured logger instead of console.error with full error object.
    // This prevents exposing tokens, PII, or stack traces in logs.
    logger.warn('Student authentication failed', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    return { authorized: false, error: 'Authentication failed' };
  }
}
