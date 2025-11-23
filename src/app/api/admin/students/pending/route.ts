// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/middleware'

// Get pending student approvals
export async function GET(request: NextRequest) {
  const prisma = requireDatabase()
  const authResult = await verifyAdmin(request)
  const prisma = requireDatabase()


  if (!authResult.authorized) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const db = requireDatabase()

    const students = await db.student.findMany({
      where: {
        status: 'PENDING_APPROVAL',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        nationality: true,
        institute: true,
        // Legacy field for backward compatibility
        idCardUrl: true,
        // New verification document URLs from Vercel Blob storage
        studentIdUrl: true,
        studentIdExpiry: true,
        governmentIdUrl: true,
        governmentIdExpiry: true,
        selfieUrl: true,
        profilePhotoUrl: true,
        coverLetter: true,
        languages: true,
        interests: true,
        bio: true,
        city: true,
        campus: true,
        phoneNumber: true,
        dateOfBirth: true,
        priceRange: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ students })
  } catch (error) {
    console.error('Error fetching pending students:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
