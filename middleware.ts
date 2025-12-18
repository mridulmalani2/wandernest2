import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Explicitly set Edge runtime for Vercel deployment
// This middleware uses only Edge-compatible APIs:
// - next-auth/jwt (Edge-compatible)
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

  // Admin routes - check for admin token (separate from NextAuth)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '')

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
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
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

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
