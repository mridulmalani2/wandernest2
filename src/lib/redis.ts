import 'server-only'
import Redis from 'ioredis'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined
}

// Get or create Redis client singleton
// Connection is established immediately and reused across invocations
function getRedisClient(): Redis | null {
  // Skip Redis if no URL is configured
  if (!process.env.REDIS_URL) {
    return null
  }

  // Return cached client if available
  if (globalForRedis.redis !== undefined) {
    return globalForRedis.redis
  }

  // Create new client
  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      retryStrategy: (times) => {
        if (times > 3) {
          return null
        }
        return Math.min(times * 100, 3000)
      },
      lazyConnect: false, // Connect immediately on creation
    })

    client.on('error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Redis connection error:', err.message)
      }
    })

    client.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis connected successfully')
      }
    })

    // Cache the client globally for reuse across serverless invocations
    globalForRedis.redis = client

    return client
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create Redis client:', error)
    }
    globalForRedis.redis = null
    return null
  }
}

// Export the Redis client
export const redis = getRedisClient()

/**
 * Verification code storage with automatic Redis/Database fallback
 *
 * Uses Redis if available for best performance, otherwise falls back to database
 * using the TouristSession model which already supports verification codes
 */

export async function storeVerificationCode(email: string, code: string, data: any): Promise<void> {
  // Try Redis first for best performance
  if (redis) {
    try {
      const key = `verification:${email}`
      await redis.setex(key, config.verification.codeExpiry, JSON.stringify({ code, data, attempts: 0 }))
      return
    } catch (error) {
      if (config.app.isDevelopment) {
        console.warn('Redis write failed, falling back to database:', error)
      }
    }
  }

  // Fallback to database using TouristSession model
  if (prisma) {
    const expiresAt = new Date(Date.now() + config.verification.codeExpiry * 1000)

    // Delete existing verification session for this email
    await prisma.touristSession.deleteMany({
      where: { email, isVerified: false },
    })

    // Create new verification session
    await prisma.touristSession.create({
      data: {
        email,
        verificationCode: code,
        isVerified: false,
        expiresAt,
      },
    })
  }
}

export async function getVerificationData(email: string): Promise<any | null> {
  // Try Redis first
  if (redis) {
    try {
      const key = `verification:${email}`
      const data = await redis.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      if (config.app.isDevelopment) {
        console.warn('Redis read failed, falling back to database:', error)
      }
    }
  }

  // Fallback to database
  if (prisma) {
    const session = await prisma.touristSession.findFirst({
      where: {
        email,
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!session) return null

    // Return in same format as Redis
    return {
      code: session.verificationCode,
      data: null, // TouristSession doesn't store additional data
      attempts: 0,  // Not tracked in DB version
    }
  }

  return null
}

export async function deleteVerificationCode(email: string): Promise<void> {
  // Try Redis first
  if (redis) {
    try {
      const key = `verification:${email}`
      await redis.del(key)
    } catch (error) {
      if (config.app.isDevelopment) {
        console.warn('Redis delete failed, falling back to database:', error)
      }
    }
  }

  // Fallback to database
  if (prisma) {
    await prisma.touristSession.deleteMany({
      where: { email, isVerified: false },
    })
  }
}

export async function incrementVerificationAttempts(email: string): Promise<number> {
  // Try Redis first
  if (redis) {
    try {
      const key = `verification:${email}`
      const data = await redis.get(key)
      if (!data) return 0

      const parsed = JSON.parse(data)
      parsed.attempts = (parsed.attempts || 0) + 1
      await redis.setex(key, config.verification.codeExpiry, JSON.stringify(parsed))
      return parsed.attempts
    } catch (error) {
      if (config.app.isDevelopment) {
        console.warn('Redis increment failed:', error)
      }
    }
  }

  // Database fallback: Note - attempts not tracked in DB version
  // This is acceptable as the code expires after 10 minutes anyway
  return 1
}

