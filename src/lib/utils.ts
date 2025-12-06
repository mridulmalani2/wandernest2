import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateVerificationCode(): string {
  // Use crypto.randomInt for cryptographically secure random number generation
  return crypto.randomInt(100000, 999999).toString()
}
