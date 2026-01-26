export const MAX_FAILED_ATTEMPTS = 5
export const LOCKOUT_MINUTES = 15
export const MAX_OTP_ATTEMPTS = 5

export function isLockoutActive(lockoutUntil: Date | null | undefined, now: Date = new Date()): boolean {
  if (!lockoutUntil) return false
  return lockoutUntil.getTime() > now.getTime()
}

export function getLockoutUntil(now: Date = new Date()): Date {
  return new Date(now.getTime() + LOCKOUT_MINUTES * 60 * 1000)
}

export function shouldLockout(nextFailedAttempts: number): boolean {
  return nextFailedAttempts >= MAX_FAILED_ATTEMPTS
}

export function shouldInvalidateOtp(nextAttempts: number): boolean {
  return nextAttempts >= MAX_OTP_ATTEMPTS
}
