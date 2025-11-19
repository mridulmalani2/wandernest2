import 'server-only'
import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined
}

// Lazy initialization - only create connection when actually used
// This prevents Redis from connecting during build time
function getRedisClient(): Redis | null {
  // Skip Redis if no URL is configured
  if (!process.env.REDIS_URL) {
    return null
  }

  if (globalForRedis.redis === undefined) {
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
        lazyConnect: true,
      })

      client.on('error', (err) => {
        console.error('Redis connection error:', err.message)
      })

      if (process.env.NODE_ENV !== 'production') {
        globalForRedis.redis = client
      }

      return client
    } catch (error) {
      console.error('Failed to create Redis client:', error)
      globalForRedis.redis = null
      return null
    }
  }

  return globalForRedis.redis
}

// Verification code operations - fallback to database if Redis unavailable
export async function storeVerificationCode(
  email: string,
  code: string,
  ttl: number = 600 // 10 minutes
): Promise<void> {
  const redis = getRedisClient()

  if (!redis) {
    console.warn('Redis unavailable - verification code storage skipped')
    return
  }

  try {
    await redis.connect()
    const key = `verification:${email}`
    await redis.setex(key, ttl, JSON.stringify({ code, attempts: 0 }))
  } catch (error) {
    console.error('Redis store error:', error)
  }
}

export async function getVerificationData(
  email: string
): Promise<{ code: string; attempts: number } | null> {
  const redis = getRedisClient()

  if (!redis) {
    return null
  }

  try {
    await redis.connect()
    const key = `verification:${email}`
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export async function incrementVerificationAttempts(
  email: string
): Promise<number> {
  const redis = getRedisClient()

  if (!redis) return 0

  try {
    await redis.connect()
    const key = `verification:${email}`
    const data = await getVerificationData(email)

    if (!data) return 0

    const newAttempts = data.attempts + 1
    const ttl = await redis.ttl(key)

    await redis.setex(
      key,
      ttl > 0 ? ttl : 600,
      JSON.stringify({ code: data.code, attempts: newAttempts })
    )

    return newAttempts
  } catch (error) {
    console.error('Redis increment error:', error)
    return 0
  }
}

export async function deleteVerificationCode(email: string): Promise<void> {
  const redis = getRedisClient()

  if (!redis) return

  try {
    await redis.connect()
    const key = `verification:${email}`
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}
