import 'server-only'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'

// Get JWT_SECRET with validation at runtime
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required but not set')
  }
  return secret
}

// Generate JWT token
export function generateToken(payload: object, expiresIn: string = '1h'): string {
  const JWT_SECRET = getJWTSecret()
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

// Verify JWT token
export function verifyToken(token: string): jwt.JwtPayload | string | null {
  try {
    const JWT_SECRET = getJWTSecret()
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10)
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}
