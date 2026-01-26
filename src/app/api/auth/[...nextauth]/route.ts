// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { NextRequest } from 'next/server'

const handler = NextAuth(authOptions)

export async function GET(request: NextRequest) {
  await rateLimitByIp(request, 60, 60, 'auth-nextauth')
  return handler(request)
}

export async function POST(request: NextRequest) {
  await rateLimitByIp(request, 60, 60, 'auth-nextauth')
  return handler(request)
}
