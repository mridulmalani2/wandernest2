// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma and API auth helpers)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/api-auth'

// Get pending student approvals
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!authResult.admin || !['SUPER_ADMIN', 'MODERATOR'].includes(authResult.admin.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = requireDatabase()
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10)

    if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 })
    }

    const cappedLimit = Math.min(limit, 50)

    const students = await db.student.findMany({
      where: {
        status: 'PENDING_APPROVAL',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * cappedLimit,
      take: cappedLimit,
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
        languages: true,
        interests: true,
        bio: true,
        city: true,
        campus: true,
        priceRange: true,
        approvalReminderSentAt: true,
        createdAt: true,
      },
    })
    const redactedStudents = authResult.admin.role === 'SUPER_ADMIN'
      ? students
      : students.map((student) => ({
          ...student,
          idCardUrl: null,
          studentIdUrl: null,
          studentIdExpiry: null,
          governmentIdUrl: null,
          governmentIdExpiry: null,
          selfieUrl: null,
          profilePhotoUrl: null,
        }))

    const total = await db.student.count({
      where: { status: 'PENDING_APPROVAL' },
    })

    return NextResponse.json({
      students: redactedStudents,
      pagination: {
        total,
        page,
        limit: cappedLimit,
        totalPages: Math.ceil(total / cappedLimit),
      },
    })
  } catch (error) {
    console.error('Error fetching pending students:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
