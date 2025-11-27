// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function adminLogin(request: NextRequest) {
  const db = requireDatabase()

  const { email: identifier, password } = await request.json()
  const normalizedIdentifier = identifier?.trim()

  if (!normalizedIdentifier || !password) {
    throw new AppError(400, 'Username/email and password are required', 'MISSING_CREDENTIALS')
  }

  // Ensure database is available
  const prisma = requireDatabase()

  // If the admin table is empty, bootstrap the default admin to avoid
  // confusing "Invalid credentials" errors when the Neon database is
  // configured but not yet seeded.
  await withDatabaseRetry(async () => {
    const adminCount = await db.admin.count()

    if (adminCount === 0) {
      const fallbackEmail = process.env.ADMIN_EMAIL || 'mridulmalani'
      const fallbackName = process.env.ADMIN_NAME || 'mridulmalani'
      const fallbackPassword = process.env.ADMIN_PASSWORD || 'travelbuddy16'

      const passwordHash = await hashPassword(fallbackPassword)

      await db.admin.create({
        data: {
          email: fallbackEmail,
          name: fallbackName,
          passwordHash,
          role: 'SUPER_ADMIN',
          isActive: true,
        },
      })
    }
  })

  // Find admin by email
  let admin = await withDatabaseRetry(async () =>
  const admin = await withDatabaseRetry(async () =>
    db.admin.findFirst({
      where: {
        OR: [
          { email: { equals: normalizedIdentifier, mode: 'insensitive' } },
          { name: { equals: normalizedIdentifier, mode: 'insensitive' } },
        ],
      },
    })
  )

  // If the supplied credentials match the configured defaults, ensure the account
  // exists (and is updated) before failing the request. This mirrors the seeding
  // script but keeps the API self-healing when the database was never seeded.
  if (!admin) {
    const fallbackEmail = process.env.ADMIN_EMAIL || 'mridulmalani'
    const fallbackName = process.env.ADMIN_NAME || 'mridulmalani'

    if (
      normalizedIdentifier.toLowerCase() === fallbackEmail.toLowerCase() ||
      normalizedIdentifier.toLowerCase() === fallbackName.toLowerCase()
    ) {
      const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD || 'travelbuddy16')

      admin = await withDatabaseRetry(async () =>
        db.admin.upsert({
          where: { email: fallbackEmail },
          update: {
            passwordHash,
            name: fallbackName,
            role: 'SUPER_ADMIN',
            isActive: true,
          },
          create: {
            email: fallbackEmail,
            passwordHash,
            name: fallbackName,
            role: 'SUPER_ADMIN',
            isActive: true,
          },
        })
      )
    }
  }

  if (!admin || !admin.isActive) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
  }

  // Verify password
  const isValid = await verifyPassword(password, admin.passwordHash)

  if (!isValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS')
  }

  // Generate JWT token
  const token = generateToken({ adminId: admin.id, email: admin.email, role: admin.role }, '8h')

  const response = NextResponse.json({
    token,
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
    path: '/admin',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return response
}

export const POST = withErrorHandler(adminLogin, 'POST /api/admin/login')
