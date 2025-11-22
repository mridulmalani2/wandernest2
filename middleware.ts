import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/admin/:path*',
    '/student/dashboard/:path*',
    '/tourist/dashboard/:path*',
  ]
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes - check for admin token
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin-token')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '')

    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Student dashboard - check for student session
  if (pathname.startsWith('/student/dashboard')) {
    const studentToken = request.cookies.get('student-token')?.value ||
                         request.headers.get('authorization')?.replace('Bearer ', '')

    if (!studentToken) {
      return NextResponse.redirect(new URL('/student/signin', request.url))
    }
  }

  // Tourist dashboard - check for tourist session
  if (pathname.startsWith('/tourist/dashboard')) {
    const touristToken = request.cookies.get('tourist-token')?.value ||
                         request.headers.get('authorization')?.replace('Bearer ', '')

    if (!touristToken) {
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
