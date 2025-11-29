// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyPassword, generateToken, hashPassword } from '@/lib/auth'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function ensureDefaultAdminSeeded() {
  const db = requireDatabase()

  const email = process.env.ADMIN_EMAIL || 'mridulmalani'
  const password = process.env.ADMIN_PASSWORD || 'travelbuddy16'
  const name = process.env.ADMIN_NAME || 'Mridul Malani'

  const passwordHash = await hashPassword(password)

  return withDatabaseRetry(() =>
    db.admin.upsert({
      where: { email },
      update: {
        passwordHash,
        name,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
      create: {
        email,
        passwordHash,
        name,
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    })
  )
}

async function adminLogin(request: NextRequest) {
  const db = requireDatabase()

  const { email: identifier, password } = await request.json()
  const normalizedIdentifier = identifier?.trim()

  if (!normalizedIdentifier || !password) {
    throw new AppError(400, 'Username/email and password are required', 'MISSING_CREDENTIALS')
  }

  // Ensure at least one admin account exists (helps on fresh installs)
  await ensureDefaultAdminSeeded()

  // Find admin by email
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
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return response
}

export const POST = withErrorHandler(adminLogin, 'POST /api/admin/login')
