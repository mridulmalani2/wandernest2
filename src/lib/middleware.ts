import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { prisma } from './prisma'

export interface AuthenticatedRequest extends NextRequest {
  admin?: {
    id: string
    email: string
    role: string
  }
  tourist?: {
    email: string
  }
}

// Middleware to verify admin authentication
export async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; admin?: { id: string; email: string; role: string; isActive: boolean }; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'No token provided' }
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || !decoded.adminId) {
      return { authorized: false, error: 'Invalid token' }
    }

    // Verify admin exists and is active
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, email: true, role: true, isActive: true }
    })

    if (!admin || !admin.isActive) {
      return { authorized: false, error: 'Admin not found or inactive' }
    }

    return { authorized: true, admin }
  } catch (error) {
    return { authorized: false, error: 'Authentication failed' }
  }
}

// Middleware to verify tourist authentication
export async function verifyTourist(request: NextRequest): Promise<{ authorized: boolean; tourist?: { email: string }; error?: string }> {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authorized: false, error: 'No token provided' }
    }

    const token = authHeader.substring(7)

    // Verify token exists in TouristSession
    const session = await prisma.touristSession.findUnique({
      where: { token },
    })

    if (!session || !session.isVerified) {
      return { authorized: false, error: 'Invalid or unverified token' }
    }

    // Check if token is expired
    if (new Date() > session.expiresAt) {
      return { authorized: false, error: 'Token expired' }
    }

    return { authorized: true, tourist: { email: session.email } }
  } catch (error) {
    return { authorized: false, error: 'Authentication failed' }
  }
}
