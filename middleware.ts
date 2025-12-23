import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import * as jose from 'jose'

// Explicitly set Edge runtime for Vercel deployment
// This middleware uses only Edge-compatible APIs:
// - next-auth/jwt (Edge-compatible)
// - jose (Edge-compatible JWT verification)
// - Web APIs (cookies, headers, URL)
// - No Node.js APIs, no Prisma, no filesystem access
export const runtime = 'edge'

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/dashboard/:path*',
    '/student/onboarding/:path*',
    '/student/signin',
    '/student/signup',
    '/tourist/dashboard/:path*',
  ]
}

/**
 * Extract Bearer token from Authorization header (case-insensitive)
 * Handles: "Bearer TOKEN", "bearer TOKEN", "BEARER TOKEN"
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  // Case-insensitive match for "Bearer " prefix with flexible spacing
  const match = authHeader.match(/^bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

/**
 * Verify admin JWT token using jose (Edge-compatible)
 * Returns the decoded payload if valid, null otherwise
 */
async function verifyAdminToken(token: string): Promise<jose.JWTPayload | null> {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    console.error('[Middleware] JWT_SECRET not configured')
    return null
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })

    // Verify the token has required admin claims
    if (!payload.adminId || typeof payload.adminId !== 'string') {
      console.warn('[Middleware] Admin token missing adminId claim')
      return null
    }

    return payload
  } catch (error) {
    // Token is invalid (expired, bad signature, malformed, etc.)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Middleware] Admin token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    }
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`[Middleware] Path: ${pathname}, Cookies: ${request.cookies.getAll().map(c => c.name).join(', ')}`);

  const host = request.headers.get('host')
  const adminHost = process.env.ADMIN_DASHBOARD_HOST

  // Force admin routes to live on the dedicated admin host when configured
  if (adminHost && pathname.startsWith('/admin') && host && host !== adminHost) {
    const adminUrl = new URL(request.url)
    adminUrl.hostname = adminHost

    return NextResponse.redirect(adminUrl)
  }

  // Admin routes - VALIDATE admin token (not just presence check)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Extract token from cookie or Authorization header (case-insensitive)
    const cookieToken = request.cookies.get('admin-token')?.value
    const headerToken = extractBearerToken(request.headers.get('authorization'))
    const adminToken = cookieToken || headerToken

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // SECURITY FIX: Verify token signature, expiry, and claims
    const payload = await verifyAdminToken(adminToken)
    if (!payload) {
      // Clear invalid cookie and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin-token')
      return response
    }
  }

  // Student routes - accept ONLY OTP-backed session cookie
  if (pathname.startsWith('/student/dashboard') || pathname.startsWith('/student/onboarding')) {
    const studentSessionToken = request.cookies.get('student_session_token')?.value

    if (!studentSessionToken) {
      return NextResponse.redirect(new URL('/student/signin', request.url))
    }

    // SECURITY: Validate token format (UUID pattern) to reject malformed tokens early.
    // Full validation (database check) happens in the API/Page via /api/student/auth/session-status.
    // REMOVED UUID check as tokens might be CUIDs check session-status for validity
    /* const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(studentSessionToken)) {
      return NextResponse.redirect(new URL('/student/signin', request.url))
    } */
  }

  // Redirect authenticated students away from auth pages
  if (pathname === '/student/signin' || pathname === '/student/signup') {
    const studentSessionToken = request.cookies.get('student_session_token')?.value;
    if (studentSessionToken) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url));
    }
  }

  // Tourist dashboard - check for NextAuth session with tourist userType
  if (pathname.startsWith('/tourist/dashboard')) {
    // SECURITY FIX: Wrap getToken in try-catch to handle missing/invalid NEXTAUTH_SECRET
    // or other runtime errors gracefully instead of crashing the middleware
    let token = null
    try {
      const nextAuthSecret = process.env.NEXTAUTH_SECRET
      if (!nextAuthSecret) {
        console.error('[Middleware] NEXTAUTH_SECRET not configured')
        return NextResponse.redirect(new URL('/booking', request.url))
      }

      token = await getToken({
        req: request,
        secret: nextAuthSecret
      })
    } catch (error) {
      // Log error but don't expose details to client
      console.error('[Middleware] getToken failed:', error instanceof Error ? error.message : 'Unknown error')
      return NextResponse.redirect(new URL('/booking', request.url))
    }

    if (!token) {
      return NextResponse.redirect(new URL('/booking', request.url))
    }

    // Verify user is a tourist
    if (token.userType !== 'tourist') {
      return NextResponse.redirect(new URL('/booking', request.url))
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-DNS-Prefetch-Control', 'on')

  return response
}
