import crypto from 'crypto'
import { redis } from '@/lib/redis'

type RevocationEntry = {
  expiresAt: number
}

const memoryRevocations = new Map<string, RevocationEntry>()

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function cleanupExpiredTokens(now: number) {
  for (const [key, entry] of memoryRevocations.entries()) {
    if (entry.expiresAt <= now) {
      memoryRevocations.delete(key)
    }
  }
}

export async function revokeToken(token: string, expiresAtSeconds?: number) {
  const nowMs = Date.now()
  const ttlSeconds = expiresAtSeconds
    ? Math.max(expiresAtSeconds - Math.floor(nowMs / 1000), 0)
    : 60 * 60 * 8

  if (ttlSeconds <= 0) {
    return
  }

  const hashed = hashToken(token)
  const expiresAt = nowMs + ttlSeconds * 1000
  memoryRevocations.set(hashed, { expiresAt })

  if (redis) {
    await redis.setex(`revoked:token:${hashed}`, ttlSeconds, '1')
  }
}

export async function isTokenRevoked(token: string): Promise<boolean> {
  const hashed = hashToken(token)
  const now = Date.now()

  cleanupExpiredTokens(now)

  const entry = memoryRevocations.get(hashed)
  if (entry && entry.expiresAt > now) {
    return true
  }

  if (redis) {
    const result = await redis.get(`revoked:token:${hashed}`)
    return Boolean(result)
  }

  return false
}
