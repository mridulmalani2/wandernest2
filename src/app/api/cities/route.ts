// Optimized for static generation with daily revalidation
export const dynamic = 'force-static'
export const revalidate = 86400 // 24 hours

import { NextRequest, NextResponse } from 'next/server'
import { CITIES, CACHE_TTL } from '@/lib/constants'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'

export async function GET(request: NextRequest) {
  try {
    await rateLimitByIp(request, 60, 60, 'cities')
    return NextResponse.json(
      { cities: CITIES },
      {
        headers: {
          'Cache-Control': `public, s-maxage=${CACHE_TTL.STATIC_DATA}, stale-while-revalidate=604800, immutable`,
        },
      }
    )
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    throw error
  }
}
