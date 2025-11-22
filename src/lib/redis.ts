import 'server-only'
import Redis from 'ioredis'

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

