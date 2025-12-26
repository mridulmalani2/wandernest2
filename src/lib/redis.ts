import 'server-only'
import Redis from 'ioredis'
import { prisma } from '@/lib/prisma'
import { config } from '@/lib/config'
import crypto from 'crypto'

export function hashVerificationCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

// Lightweight structural validation for verification payloads (no heavy dependencies)
interface VerificationPayload {
  code: string
  data: unknown
  attempts: number
}

/**
 * Validate parsed verification payload has required fields with correct types
 * Returns null if validation fails, logs a warning for debugging
 */
function validateVerificationPayload(parsed: unknown): VerificationPayload | null {
  if (parsed === null || typeof parsed !== 'object') {
    console.warn('Redis payload validation failed: not an object')
    return null
  }

  const obj = parsed as Record<string, unknown>

  // Validate required 'code' field is a string
  if (typeof obj.code !== 'string') {
    console.warn('Redis payload validation failed: missing or invalid "code" field')
    return null
  }

  // Validate 'attempts' is a number (default to 0 if missing for backwards compat)
  const attempts = typeof obj.attempts === 'number' ? obj.attempts : 0

  return {
    code: obj.code,
    data: obj.data, // data can be any type
    attempts,
  }
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined
}

// Get or create Redis client singleton
// Connection is lazy (deferred until first use) for better serverless performance
/**
 * Get or create the Redis client singleton
 * Uses a global variable to maintain the connection across hot reloads in development
 * and serverless function invocations where possible.
 * @returns Redis | null - The Redis client instance or null if REDIS_URL is not set
 */
function getRedisClient(): Redis | null {
  // Skip Redis if no URL is configured
  if (!process.env.REDIS_URL) {
    return null
  }

  // Return cached client if available
  if (globalForRedis.redis !== undefined) {
    return globalForRedis.redis
  }

  // Create new client with serverless-optimized settings
  try {
    const client = new Redis(process.env.REDIS_URL, {
      // Serverless optimizations
      lazyConnect: true, // Defer connection until first use (reduces cold start time)
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false, // Fail fast instead of queuing commands

      // Timeout settings for Vercel function limits
      connectTimeout: 5000, // 5 seconds to establish connection
      commandTimeout: 8000, // 8 seconds max for any command

      // Retry strategy with exponential backoff
      retryStrategy: (times) => {
        if (times > 3) {
          return null // Give up after 3 retries
        }
        return Math.min(times * 100, 3000) // Max 3 second delay
      },

      // Keep connection alive but with reasonable limits
      keepAlive: 30000, // 30 seconds
    })

    client.on('error', (err) => {
      if (config.app.isDevelopment) {
        console.error('Redis connection error:', err.message)
      }
    })

    client.on('connect', () => {
      if (config.app.isDevelopment) {
        console.log('✅ Redis connected successfully')
      }
    })

    client.on('close', () => {
      if (config.app.isDevelopment) {
        console.log('Redis connection closed')
      }
    })

    // Cache the client globally for reuse across serverless invocations
    globalForRedis.redis = client

    return client
  } catch (error) {
    if (config.app.isDevelopment) {
      console.error('Failed to create Redis client:', error)
    }
    globalForRedis.redis = null
    return null
  }
}

// Export the Redis client
export const redis = getRedisClient()

/**
 * Ensure Redis connection is established
 * Handles lazy connection gracefully with timeout
 * @param client - The Redis client instance
 * @returns Promise<boolean> - True if connected, false otherwise
 */
async function ensureRedisConnection(client: Redis): Promise<boolean> {
  try {
    // Check if already connected
    if (client.status === 'ready') {
      return true
    }

    // If lazy connection, connect now
    if (client.status === 'wait') {
      await client.connect()
      return true
    }

    // If connecting, wait a bit
    if (client.status === 'connecting') {
      return new Promise<boolean>((resolve) => {
        const timeoutMs = 3000;
        let timer: NodeJS.Timeout;

        const cleanup = () => {
          client.removeListener('ready', onReady);
          client.removeListener('error', onError);
          clearTimeout(timer);
        };

        const onReady = () => {
          cleanup();
          resolve(true);
        };

        const onError = () => {
          cleanup();
          resolve(false);
        };

        timer = setTimeout(() => {
          cleanup();
          resolve(false);
        }, timeoutMs);

        client.once('ready', onReady);
        client.once('error', onError);
      });
    }

    return false
  } catch (error) {
    if (config.app.isDevelopment) {
      console.warn('Failed to ensure Redis connection:', error)
    }
    return false
  }
}

export async function checkRedisHealth(): Promise<{ available: boolean; healthy: boolean }> {
  if (!redis) {
    return { available: false, healthy: false }
  }

  try {
    const connected = await ensureRedisConnection(redis)
    if (!connected) {
      return { available: true, healthy: false }
    }

    const pong = await redis.ping()
    return { available: true, healthy: pong === 'PONG' }
  } catch (error) {
    return { available: true, healthy: false }
  }
}

/**
 * Execute Redis operation with automatic fallback on failure
 * Ensures connection is established before operation
 */
async function withRedis<T>(
  operation: (client: Redis) => Promise<T>,
  fallback: () => Promise<T>
): Promise<T> {
  if (!redis) {
    return fallback()
  }

  try {
    // Ensure connection is ready
    const connected = await ensureRedisConnection(redis)
    if (!connected) {
      if (config.app.isDevelopment) {
        console.warn('Redis not connected, using fallback')
      }
      return fallback()
    }

    // Execute operation
    return await operation(redis)
  } catch (error) {
    if (config.app.isDevelopment) {
      console.warn('Redis operation failed, using fallback:', error)
    }
    return fallback()
  }
}

/**
 * Verification code storage with automatic Redis/Database fallback
 *
 * Uses Redis if available for best performance, otherwise falls back to database
 * using the TouristSession model which already supports verification codes
 */

/**
 * Store verification code with automatic Redis/Database fallback
 * @param email - The email address to associate with the code
 * @param code - The verification code to store
 * @param data - Additional data to store with the code
 * @returns Promise<void>
 */
export async function storeVerificationCode(email: string, code: string, data: any): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim()
  const hashedCode = hashVerificationCode(code)

  await withRedis(
    // Redis operation
    async (client) => {
      const key = `verification:${normalizedEmail}`
      await client.setex(
        key,
        config.verification.codeExpiry,
        JSON.stringify({ code: hashedCode, data, attempts: 0 })
      )
    },
    // Database fallback
    async () => {
      if (!prisma) return

      const expiresAt = new Date(Date.now() + config.verification.codeExpiry * 1000)

      // Use transaction to prevent race conditions
      await prisma.$transaction(async (tx) => {
        // Delete existing verification session for this email
        await tx.touristSession.deleteMany({
          where: { email: normalizedEmail, isVerified: false },
        })

        // Create new verification session
        await tx.touristSession.create({
          data: {
            email: normalizedEmail,
            verificationCode: hashedCode,
            isVerified: false,
            expiresAt,
          },
        })
      })
    }
  )
}

/**
 * Retrieve verification data for an email
 * @param email - The email address to retrieve data for
 * @returns Promise<any | null> - The stored data or null if not found/expired
 */
export async function getVerificationData(email: string): Promise<any | null> {
  const normalizedEmail = email.toLowerCase().trim()

  return await withRedis(
    // Redis operation
    async (client) => {
      const key = `verification:${normalizedEmail}`
      const data = await client.get(key)
      if (!data) return null
      try {
        const parsed = JSON.parse(data)
        // Structural validation: ensure required fields exist with correct types
        return validateVerificationPayload(parsed)
      } catch (e) {
        console.error('Failed to parse Redis data', e)
        return null
      }
    },
    // Database fallback
    async () => {
      if (!prisma) return null

      const session = await prisma.touristSession.findFirst({
        where: {
          email: normalizedEmail,
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
        attempts: 0, // Used for rate limiting, but DB doesn't track this yet so we assume 0
      }
    }
  )
}

/**
 * Delete verification code for an email
 * @param email - The email address to delete code for
 * @returns Promise<void>
 */
export async function deleteVerificationCode(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim()

  await withRedis(
    // Redis operation
    async (client) => {
      const key = `verification:${normalizedEmail}`
      await client.del(key)
    },
    // Database fallback
    async () => {
      if (!prisma) return

      await prisma.touristSession.deleteMany({
        where: { email: normalizedEmail, isVerified: false },
      })
    }
  )
}

/**
 * Increment the attempt counter for a verification code
 * @param email - The email address to increment attempts for
 * @returns Promise<number> - The new attempt count
 */
export async function incrementVerificationAttempts(email: string): Promise<number> {
  const normalizedEmail = email.toLowerCase().trim()

  return await withRedis(
    // Redis operation
    async (client) => {
      const key = `verification:${normalizedEmail}`
      const data = await client.get(key)
      if (!data) return 0

      try {
        const parsed = JSON.parse(data)
        // Structural validation: ensure payload is valid before incrementing
        const validated = validateVerificationPayload(parsed)
        if (!validated) return 0

        validated.attempts = validated.attempts + 1
        await client.setex(key, config.verification.codeExpiry, JSON.stringify(validated))
        return validated.attempts
      } catch (e) {
        return 0
      }
    },
    // Database fallback
    async () => {
      // Note: Attempts not tracked in DB version
      // This is acceptable as the code expires after 10 minutes anyway
      return 1
    }
  )
}
