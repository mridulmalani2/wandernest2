// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { verifyStudent } from '@/lib/api-auth'
import { acceptRequest } from '../accept-request'
import { requireDatabase } from '@/lib/prisma'
import { AppError } from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    const db = requireDatabase()

    // CSRF Protection: Strict Origin Check
    const origin = req.headers.get('origin')
    const referer = req.headers.get('referer')
    const host = req.headers.get('host')
    const protocol = req.headers.get('x-forwarded-proto') || 'http'
    const expectedOrigin = `${protocol}://${host}`

    // Browsers send Origin for POST requests. If present, it must match.
    if (origin && origin !== expectedOrigin) {
      return NextResponse.json(
        { error: 'Forbidden: Invalid Origin' },
        { status: 403 }
      )
    }

    // If Origin is missing (rare in modern browsers for POST), check Referer
    if (!origin && referer && !referer.startsWith(expectedOrigin)) {
      return NextResponse.json(
        { error: 'Forbidden: Invalid Referer' },
        { status: 403 }
      )
    }

    const authResult = await verifyStudent(req)
    if (!authResult.authorized || !authResult.student) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const { email: studentEmail } = authResult.student

    const body = await req.json()
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Find student by email
    const student = await db.student.findUnique({
      where: { email: studentEmail },
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      )
    }

    const studentId = student.id

    // Call the acceptRequest helper
    const result = await acceptRequest(requestId, studentId)

    return NextResponse.json({
      success: true,
      message: 'Request accepted successfully',
      touristContact: {
        email: result.touristRequest.email,
        phone: result.touristRequest.phone,
        whatsapp: result.touristRequest.whatsapp,
        contactMethod: result.touristRequest.contactMethod,
      },
    })
  } catch (error: unknown) {
    console.error('Error accepting request:', error)

    const errorMessage = error instanceof Error ? error.message : 'Failed to accept request'

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      )
    }

    if (error instanceof Error && (error.message.includes('not found') || error.message.includes('No tourist request found'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    if (error instanceof Error && (error.message.includes('no longer available') || error.message.includes('expired') || error.message.includes('already accepted'))) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
