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
      console.error('Redis connection error:', err.message)
    })

    client.on('connect', () => {
      console.log('Redis connected successfully')
    })

    // Cache the client globally for reuse across serverless invocations
    globalForRedis.redis = client

    return client
  } catch (error) {
    console.error('Failed to create Redis client:', error)
    globalForRedis.redis = null
    return null
  }
}

// Store verification code in Redis with TTL
export async function storeVerificationCode(
  email: string,
  code: string,
  ttlSeconds: number = 600
): Promise<void> {
  const client = getRedisClient()
  if (!client) {
    console.warn('Redis not configured, skipping verification code storage')
    return
  }

  const key = `verification:${email}`
  const data = {
    code,
    attempts: 0,
    createdAt: Date.now(),
  }

  await client.setex(key, ttlSeconds, JSON.stringify(data))
}

// Get verification data from Redis
export async function getVerificationData(
  email: string
): Promise<{ code: string; attempts: number } | null> {
  const client = getRedisClient()
  if (!client) {
    console.warn('Redis not configured, cannot retrieve verification data')
    return null
  }

  const key = `verification:${email}`
  const data = await client.get(key)

  if (!data) {
    return null
  }

  const parsed = JSON.parse(data)
  return {
    code: parsed.code,
    attempts: parsed.attempts || 0,
  }
}

// Increment verification attempts
export async function incrementVerificationAttempts(email: string): Promise<number> {
  const client = getRedisClient()
  if (!client) {
    console.warn('Redis not configured, cannot increment attempts')
    return 0
  }

  const key = `verification:${email}`
  const data = await client.get(key)

  if (!data) {
    return 0
  }

  const parsed = JSON.parse(data)
  parsed.attempts = (parsed.attempts || 0) + 1

  // Get remaining TTL and preserve it
  const ttl = await client.ttl(key)
  if (ttl > 0) {
    await client.setex(key, ttl, JSON.stringify(parsed))
  }

  return parsed.attempts
}

// Delete verification code
export async function deleteVerificationCode(email: string): Promise<void> {
  const client = getRedisClient()
  if (!client) {
    console.warn('Redis not configured, cannot delete verification code')
    return
  }

  const key = `verification:${email}`
  await client.del(key)
}

