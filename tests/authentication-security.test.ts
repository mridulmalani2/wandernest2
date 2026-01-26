import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_MINUTES,
  MAX_OTP_ATTEMPTS,
  getLockoutUntil,
  isLockoutActive,
  shouldLockout,
  shouldInvalidateOtp,
} from '@/lib/auth/securityPolicy'
import { generateOtpHmac, timingSafeEqualHex } from '@/lib/auth/otp'

process.env.OTP_SECRET = process.env.OTP_SECRET || 'x'.repeat(64)

const fixedNow = new Date('2025-01-01T00:00:00.000Z')

test('lockout policy triggers after max failures', () => {
  assert.equal(shouldLockout(MAX_FAILED_ATTEMPTS - 1), false)
  assert.equal(shouldLockout(MAX_FAILED_ATTEMPTS), true)
  const lockoutUntil = getLockoutUntil(fixedNow)
  assert.equal(isLockoutActive(lockoutUntil, fixedNow), true)
  const afterLockout = new Date(fixedNow.getTime() + (LOCKOUT_MINUTES + 1) * 60 * 1000)
  assert.equal(isLockoutActive(lockoutUntil, afterLockout), false)
})

test('otp attempts invalidate after threshold', () => {
  assert.equal(shouldInvalidateOtp(MAX_OTP_ATTEMPTS - 1), false)
  assert.equal(shouldInvalidateOtp(MAX_OTP_ATTEMPTS), true)
})

test('otp hmac comparison is timing-safe and deterministic', () => {
  const expiresAt = new Date('2025-01-01T01:00:00.000Z')
  const hmacA = generateOtpHmac({
    scope: 'student-signup',
    identifier: 'student@example.com',
    otp: '123456',
    expiresAt,
  })
  const hmacB = generateOtpHmac({
    scope: 'student-signup',
    identifier: 'student@example.com',
    otp: '123456',
    expiresAt,
  })
  const hmacC = generateOtpHmac({
    scope: 'student-signup',
    identifier: 'student@example.com',
    otp: '999999',
    expiresAt,
  })

  assert.equal(timingSafeEqualHex(hmacA, hmacB), true)
  assert.equal(timingSafeEqualHex(hmacA, hmacC), false)
})
