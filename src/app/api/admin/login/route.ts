// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function adminLogin(request: NextRequest) {
  const db = requireDatabase()

  const { email, password } = await request.json()

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required', 'MISSING_CREDENTIALS')
  }

  // Ensure database is available
  const prisma = requireDatabase()

  // Find admin by email
  const admin = await withDatabaseRetry(async () =>
    db.admin.findUnique({
      where: { email },
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
    path: '/admin',
    maxAge: 60 * 60 * 8, // 8 hours
  })

  return response
}

export const POST = withErrorHandler(adminLogin, 'POST /api/admin/login')
