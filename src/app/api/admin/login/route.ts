// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth, requireDatabase } from '@/lib/prisma'
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import { z } from 'zod'
import { emailSchema } from '@/lib/schemas/common'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'

const FALLBACK_ADMIN = {
  id: 'env-admin',
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  name: process.env.ADMIN_NAME || 'Admin',
  role: 'SUPER_ADMIN' as const,
}

async function ensureDefaultAdminSeeded() {
  if (!FALLBACK_ADMIN.email || !FALLBACK_ADMIN.password) {
    console.warn('Skipping default admin seeding: ADMIN_EMAIL or ADMIN_PASSWORD not set')
    return
  }

  const db = requireDatabase()

  return withDatabaseRetry(async () => {
    const existingAdmin = await db.admin.findUnique({
      where: { email: FALLBACK_ADMIN.email },
    })

    if (!existingAdmin) {
      const passwordHash = await hashPassword(FALLBACK_ADMIN.password!)
      await db.admin.create({
        data: {
          email: FALLBACK_ADMIN.email!,
          passwordHash,
          name: FALLBACK_ADMIN.name,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      })
      console.log('Seeded default admin account')
    }
  })
}

function createAdminResponse(admin: { id: string; email: string; name: string; role: string }) {
  const token = generateToken({ adminId: admin.id, email: admin.email, role: admin.role }, '8h')

  const response = NextResponse.json({
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  })

  response.cookies.set('admin-token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return response
}

const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
}).strict();

async function adminLogin(request: NextRequest) {
  await rateLimitByIp(request, 5, 60, 'admin-login')
  await rateLimitByIp(request, 20, 60 * 60, 'admin-login-hour')
  const { email, password } = await validateJson<{ email: string; password: string }>(request, adminLoginSchema)
  const normalizedIdentifier = email.toLowerCase().trim()
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  const [emailLimit, ipLimit] = await Promise.all([
    checkRateLimit(`admin-login:email:${hashIdentifier(normalizedIdentifier)}`, 5, 60 * 10),
    checkRateLimit(`admin-login:ip:${hashIdentifier(ip)}`, 20, 60 * 10),
  ])

  if (!emailLimit.allowed || !ipLimit.allowed) {
    throw new AppError(429, 'Too many login attempts. Please try again later.', 'RATE_LIMITED')
  }

  if (!normalizedIdentifier || !password) {
    throw new AppError(400, 'Username/email and password are required', 'MISSING_CREDENTIALS')
  }

  const dbHealth = await checkDatabaseHealth()
  const canUseDatabase = dbHealth.available && dbHealth.healthy

  // Allow a fallback path when the database is unreachable so the admin can still sign in
  if (!canUseDatabase) {
    if (!FALLBACK_ADMIN.email || !FALLBACK_ADMIN.password) {
      throw new AppError(503, 'Database unavailable and no fallback admin configured', 'SERVICE_UNAVAILABLE')
    }

    const isValidFallback =
      normalizedIdentifier.toLowerCase() === FALLBACK_ADMIN.email.toLowerCase() &&
      (await verifyPassword(password, await hashPassword(FALLBACK_ADMIN.password)))

    if (!isValidFallback) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
    }

    return createAdminResponse({
      id: FALLBACK_ADMIN.id,
      email: FALLBACK_ADMIN.email!,
      name: FALLBACK_ADMIN.name,
      role: FALLBACK_ADMIN.role,
    })
  }

  const db = requireDatabase()

  // Ensure at least one admin account exists (helps on fresh installs)
  await ensureDefaultAdminSeeded()

  // Find admin by email only (avoid ambiguous name matches)
  const admin = await withDatabaseRetry(async () =>
    db.admin.findUnique({
      where: { email: normalizedIdentifier.toLowerCase() },
    })
  )

  if (!admin || !admin.isActive) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
  }

  // Verify password
  const isValid = await verifyPassword(password, admin.passwordHash)

  if (!isValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
  }

  // Generate JWT token
  return createAdminResponse(admin)
}

export const POST = withErrorHandler(adminLogin, 'POST /api/admin/login')
