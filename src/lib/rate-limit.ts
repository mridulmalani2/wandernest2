import crypto from 'crypto'
import { getConnectedRedisClient } from '@/lib/redis'

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

type MemoryEntry = {
  count: number
  resetAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

export function hashIdentifier(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  const client = await getConnectedRedisClient()
  if (client) {
    try {
      const count = await client.incr(key)
      if (count === 1) {
        await client.expire(key, windowSeconds)
      }

      const ttl = await client.ttl(key)
      const resetAt = now + (ttl > 0 ? ttl * 1000 : windowMs)
      const remaining = Math.max(limit - count, 0)

      return {
        allowed: count <= limit,
        remaining,
        resetAt,
      }
    } catch (error) {
      // Fall back to in-memory limit below
    }
  }

  const existing = memoryStore.get(key)
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    memoryStore.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
    }
  }

  existing.count += 1
  const remaining = Math.max(limit - existing.count, 0)
  return {
    allowed: existing.count <= limit,
    remaining,
    resetAt: existing.resetAt,
  }
}
