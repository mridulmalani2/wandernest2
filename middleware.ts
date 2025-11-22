import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

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

  // Admin routes - check for admin token (separate from NextAuth)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin-token')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '')

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Student routes - check for NextAuth session with student userType
  if (pathname.startsWith('/student/dashboard') || pathname.startsWith('/student/onboarding')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token) {
      return NextResponse.redirect(new URL('/student/signin', request.url))
    }

    // Verify user is a student
    if (token.userType !== 'student') {
      return NextResponse.redirect(new URL('/student/signin', request.url))
    }

    // If accessing dashboard, ensure onboarding is complete
    if (pathname.startsWith('/student/dashboard')) {
      if (!token.hasCompletedOnboarding) {
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
