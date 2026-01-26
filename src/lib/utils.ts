import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateVerificationCode(): string {
  // Use crypto.randomInt for cryptographically secure random number generation
  // SECURITY FIX: crypto.randomInt(min, max) uses exclusive max, so use 1000000
  // to include 999999 in the possible range (100000-999999 inclusive)
  return crypto.randomInt(100000, 1000000).toString()
}

export function maskEmail(email?: string | null): string {
  if (!email) return '[unknown]'
  const [localPart, domain] = email.split('@')
  if (!domain) return '[invalid-email]'
  const trimmedLocal = localPart.trim()
  if (trimmedLocal.length <= 1) {
    return `*@${domain}`
  }
  const firstChar = trimmedLocal[0]
  return `${firstChar}***@${domain}`
}
