import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'

export type RateLimitOptions = {
  key: string
  limit: number
  windowSeconds: number
}

function getClientIp(request: NextRequest): string {
  const candidates = [
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for'),
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const ip = candidate.split(',')[0]?.trim()
    if (ip) {
      return ip
    }
  }

  const userAgent = request.headers.get('user-agent')?.slice(0, 128) || 'unknown'
  return `unknown:${hashIdentifier(userAgent)}`
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
