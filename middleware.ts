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
    '/tourist/dashboard/:path*',
  ]
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
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

  // Student routes - accept either OTP-backed session cookie or legacy NextAuth token
  if (pathname.startsWith('/student/dashboard') || pathname.startsWith('/student/onboarding')) {
    const studentSessionToken = request.cookies.get('student_session_token')?.value

    // OTP session present → allow through (server routes will validate expiry/ownership)
    if (!studentSessionToken) {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
      })

      if (!token || token.userType !== 'student') {
        return NextResponse.redirect(new URL('/student/signin', request.url))
      }

      if (pathname.startsWith('/student/dashboard') && !token.hasCompletedOnboarding) {
        return NextResponse.redirect(new URL('/student/onboarding', request.url))
      }
    }
  }

  // Tourist dashboard - check for NextAuth session with tourist userType
  if (pathname.startsWith('/tourist/dashboard')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      return NextResponse.redirect(new URL('/tourist/signin', request.url))
    }

    // Verify user is a tourist
    if (token.userType !== 'tourist') {
      return NextResponse.redirect(new URL('/tourist/signin', request.url))
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
