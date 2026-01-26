import crypto from 'crypto'
import { config } from '@/lib/config'

const MIN_OTP_SECRET_LENGTH = 32

function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET || config.auth.nextAuth.secret || config.auth.jwt.secret
  if (!secret) {
    throw new Error('OTP_SECRET or NEXTAUTH_SECRET environment variable is required but not set')
  }
  if (secret.length < MIN_OTP_SECRET_LENGTH) {
    throw new Error(`OTP_SECRET must be at least ${MIN_OTP_SECRET_LENGTH} characters (got ${secret.length})`)
  }
  return secret
}

export function generateOtpHmac(params: {
  scope: string
  identifier: string
  otp: string
  expiresAt: Date
}): string {
  const payload = `${params.scope}:${params.identifier}:${params.otp}:${params.expiresAt.toISOString()}`
  return crypto.createHmac('sha256', getOtpSecret()).update(payload).digest('hex')
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'hex')
  const bBuf = Buffer.from(b, 'hex')
  const maxLength = Math.max(aBuf.length, bBuf.length)
  const aPadded = aBuf.length === maxLength ? aBuf : Buffer.concat([aBuf, Buffer.alloc(maxLength - aBuf.length)])
  const bPadded = bBuf.length === maxLength ? bBuf : Buffer.concat([bBuf, Buffer.alloc(maxLength - bBuf.length)])
  const equal = crypto.timingSafeEqual(aPadded, bPadded)
  return equal && aBuf.length === bBuf.length
}
