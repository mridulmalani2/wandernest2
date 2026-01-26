import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'

export type RateLimitOptions = {
  key: string
  limit: number
  windowSeconds: number
}

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function rateLimit(request: NextRequest, options: RateLimitOptions) {
  const result = await checkRateLimit(options.key, options.limit, options.windowSeconds)

  if (!result.allowed) {
    const retryAfter = Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1)
    throw NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
        },
      }
    )
  }
}

export async function rateLimitByIp(request: NextRequest, limit: number, windowSeconds: number, prefix: string) {
  const ip = getClientIp(request)
  const key = `${prefix}:ip:${hashIdentifier(ip)}`
  return rateLimit(request, { key, limit, windowSeconds })
}

export async function rateLimitByIdentity(
  request: NextRequest,
  identity: string,
  limit: number,
  windowSeconds: number,
  prefix: string
) {
  const key = `${prefix}:id:${hashIdentifier(identity)}`
  return rateLimit(request, { key, limit, windowSeconds })
}

export function getRequestIp(request: NextRequest): string {
  return getClientIp(request)
}
