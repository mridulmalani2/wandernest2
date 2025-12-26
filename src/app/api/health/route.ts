import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/prisma'
import { getConfigSummary } from '@/lib/config'
import { checkRedisHealth } from '@/lib/redis'

/**
 * Health check endpoint for monitoring
 *
 * GET /api/health
 *
 * Returns:
 * - Overall health status
 * - Individual component health
 * - Configuration summary
 * - Timestamp
 *
 * Use this endpoint to monitor the application in production.
 * Set up alerts if this endpoint returns a non-200 status or if
 * any critical components are unhealthy.
 */
export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    // Check database health
    const dbHealth = await checkDatabaseHealth()

    // Get configuration summary
    const configSummary = getConfigSummary()
    const redisHealth = await checkRedisHealth()

    // Determine overall health
    // System is healthy if:
    // - Database is either not configured (demo mode) OR is healthy
    // - No critical configuration errors
    const isHealthy = (
      (dbHealth.healthy || !dbHealth.available) &&
      configSummary.healthy
    )

    const status = isHealthy ? 'healthy' : 'unhealthy'
    const httpStatus = isHealthy ? 200 : 503

    const response = {
      status,
      timestamp,
      environment: configSummary.environment,
      components: {
        database: {
          status: dbHealth.healthy
            ? 'healthy'
            : dbHealth.available
              ? 'unhealthy'
              : 'not_configured',
          available: dbHealth.available,
          healthy: dbHealth.healthy,
        },
        email: {
          status: configSummary.integrations.email === 'configured'
            ? 'configured'
            : 'not_configured',
          configured: configSummary.integrations.email === 'configured',
        },
        googleAuth: {
          status: configSummary.integrations.googleAuth === 'configured'
            ? 'configured'
            : 'not_configured',
          configured: configSummary.integrations.googleAuth === 'configured',
        },
        redis: {
          status: configSummary.integrations.redis !== 'configured'
            ? 'not_configured'
            : redisHealth.healthy
              ? 'healthy'
              : 'unhealthy',
          configured: configSummary.integrations.redis === 'configured',
          available: redisHealth.available,
          healthy: redisHealth.healthy,
        },
      },
      warnings: configSummary.warnings.length > 0 ? ['Check server logs for warnings'] : [],
      errors: configSummary.errors.length > 0 ? ['Check server logs for errors'] : [],
    }

    return NextResponse.json(response, { status: httpStatus })
  } catch (error) {
    console.error('❌ Health check failed:', error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp,
        error: 'Health check failed',
      },
      { status: 503 }
    )
  }
}
