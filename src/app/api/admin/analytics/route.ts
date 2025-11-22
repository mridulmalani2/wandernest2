// Use ISR with 10-minute revalidation for analytics
export const dynamic = 'force-dynamic'
export const revalidate = 600 // 10 minutes

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/middleware'
import { cache } from '@/lib/cache'
import { CACHE_TTL } from '@/lib/constants'

// Get platform analytics
export async function GET(request: NextRequest) {
  const authResult = await verifyAdmin(request)

  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Use cache for expensive analytics queries
    const analyticsData = await cache.cached(
      'analytics:platform-metrics',
      async () => {
        // Demand-Supply Ratio by City
        const demandSupplyByCity = await prisma.$queryRaw<Array<{
          city: string
          supply: bigint
          demand: bigint
        }>>`
          SELECT
            COALESCE(s.city, tr.city) as city,
            COUNT(DISTINCT s.id) as supply,
            COUNT(DISTINCT tr.id) as demand
          FROM "Student" s
          FULL OUTER JOIN "TouristRequest" tr ON s.city = tr.city
          WHERE s.status = 'APPROVED' OR s.status IS NULL
          GROUP BY COALESCE(s.city, tr.city)
          ORDER BY demand DESC
        `

        // Response Time (average time from request creation to acceptance)
        const responseTimeData = await prisma.$queryRaw<Array<{
          avg_response_time: number | null
        }>>`
          SELECT
            AVG(EXTRACT(EPOCH FROM (rs."acceptedAt" - tr."createdAt"))) / 3600 as avg_response_time
          FROM "RequestSelection" rs
          JOIN "TouristRequest" tr ON rs."requestId" = tr.id
          WHERE rs.status = 'accepted' AND rs."acceptedAt" IS NOT NULL
        `

        // Match Success Rate
        const matchSuccessData = await prisma.$queryRaw<Array<{
          total_requests: bigint
          matched_requests: bigint
          success_rate: number
        }>>`
          SELECT
            COUNT(*) as total_requests,
            COUNT(CASE WHEN status IN ('MATCHED', 'ACCEPTED') THEN 1 END) as matched_requests,
            (COUNT(CASE WHEN status IN ('MATCHED', 'ACCEPTED') THEN 1 END)::float /
             NULLIF(COUNT(*), 0) * 100) as success_rate
          FROM "TouristRequest"
        `

        // Average Price by Service Type
        const avgPriceByService = await prisma.$queryRaw<Array<{
          service_type: string
          avg_price: number | null
          count: bigint
        }>>`
          SELECT
            tr."serviceType" as service_type,
            AVG(rs."pricePaid") as avg_price,
            COUNT(rs.id) as count
          FROM "RequestSelection" rs
          JOIN "TouristRequest" tr ON rs."requestId" = tr.id
          WHERE rs.status = 'accepted' AND rs."pricePaid" IS NOT NULL
          GROUP BY tr."serviceType"
          ORDER BY count DESC
        `

        // Overall Platform Metrics
        const [
          totalStudents,
          approvedStudents,
          pendingStudents,
          totalRequests,
          activeRequests,
          totalReviews,
        ] = await Promise.all([
          prisma.student.count(),
          prisma.student.count({ where: { status: 'APPROVED' } }),
          prisma.student.count({ where: { status: 'PENDING_APPROVAL' } }),
          prisma.touristRequest.count(),
          prisma.touristRequest.count({ where: { status: { in: ['PENDING', 'MATCHED'] } } }),
          prisma.review.count(),
        ])

        // Convert BigInt to Number for JSON serialization
        const formattedDemandSupply = demandSupplyByCity.map((item: { city: string; supply: bigint; demand: bigint }) => ({
          city: item.city,
          supply: Number(item.supply),
          demand: Number(item.demand),
          ratio: Number(item.demand) / (Number(item.supply) || 1),
        }))

        const formattedMatchSuccess = matchSuccessData[0] ? {
          totalRequests: Number(matchSuccessData[0].total_requests),
          matchedRequests: Number(matchSuccessData[0].matched_requests),
          successRate: matchSuccessData[0].success_rate,
        } : { totalRequests: 0, matchedRequests: 0, successRate: 0 }

        const formattedAvgPrice = avgPriceByService.map((item: { service_type: string; avg_price: number | null; count: bigint }) => ({
          serviceType: item.service_type,
          avgPrice: item.avg_price || 0,
          count: Number(item.count),
        }))

        return {
          demandSupplyRatio: formattedDemandSupply,
          responseTime: {
            avgHours: responseTimeData[0]?.avg_response_time || 0,
          },
          matchSuccess: formattedMatchSuccess,
          avgPriceByService: formattedAvgPrice,
          platformMetrics: {
            totalStudents,
            approvedStudents,
            pendingStudents,
            totalRequests,
            activeRequests,
            totalReviews,
          },
        }
      },
      { ttl: CACHE_TTL.ANALYTICS }
    )

    return NextResponse.json(analyticsData, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
