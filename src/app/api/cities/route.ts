// Optimized for static generation with daily revalidation
export const dynamic = 'force-static'
export const revalidate = 86400 // 24 hours

import { NextResponse } from 'next/server'
import { CITIES, CACHE_TTL } from '@/lib/constants'

export async function GET() {
  return NextResponse.json(
    { cities: CITIES },
    {
      headers: {
        'Cache-Control': `public, s-maxage=${CACHE_TTL.STATIC_DATA}, stale-while-revalidate=604800, immutable`,
      },
    }
  )
}
