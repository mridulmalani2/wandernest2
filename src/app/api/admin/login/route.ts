// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler'

async function adminLogin(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    throw new AppError(400, 'Email and password are required', 'MISSING_CREDENTIALS')
  }

  // Find admin by email
  const admin = await withDatabaseRetry(async () =>
    prisma.admin.findUnique({
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

  return NextResponse.json({
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  })
}

export const POST = withErrorHandler(adminLogin, 'POST /api/admin/login')
