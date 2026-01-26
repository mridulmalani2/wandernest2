import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenDetailed } from '@/lib/auth'
import { revokeToken } from '@/lib/token-revocation'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { requireAuth } from '@/lib/auth/requireAuth'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })

    await rateLimitByIp(request, 30, 60, 'admin-logout')
    await requireAuth(request, 'admin')

    const token = request.cookies.get('admin-token')?.value
    if (token) {
      try {
        const verification = verifyTokenDetailed(token)
        if (verification.valid && typeof verification.payload !== 'string') {
          await revokeToken(token, verification.payload.exp)
        }
      } catch {
        // Ignore token verification failures on logout
      }
    }

    response.cookies.set('admin-token', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
