import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// Verification code operations
export async function storeVerificationCode(
  email: string,
  code: string,
  ttl: number = 600 // 10 minutes
): Promise<void> {
  const key = `verification:${email}`
  await redis.setex(key, ttl, JSON.stringify({ code, attempts: 0 }))
}

export async function getVerificationData(
  email: string
): Promise<{ code: string; attempts: number } | null> {
  const key = `verification:${email}`
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

export async function incrementVerificationAttempts(
  email: string
): Promise<number> {
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
}

export async function deleteVerificationCode(email: string): Promise<void> {
  const key = `verification:${email}`
  await redis.del(key)
}
