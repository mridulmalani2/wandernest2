// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  getVerificationData,
  incrementVerificationAttempts,
  deleteVerificationCode,
} from '@/lib/redis'
import { randomBytes } from 'crypto'

// Validation schema for the verify request
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = verifySchema.parse(body)

    // In development mode, allow a simple dev code
    const isDevelopment = process.env.NODE_ENV === 'development'
    const DEV_CODE = '000000'

    if (isDevelopment && validatedData.code === DEV_CODE) {
      // Development mode: bypass verification
      // Code will be verified below with the dev code
    } else {
      // Production mode or non-dev code: verify with Redis
      const storedData = await getVerificationData(validatedData.email)

      if (!storedData) {
        return NextResponse.json(
          {
            success: false,
            error: 'Verification code expired or not found',
            action: 'regenerate',
          },
          { status: 400 }
        )
      }

      // Check if max attempts exceeded (3 attempts)
      if (storedData.attempts >= 3) {
        await deleteVerificationCode(validatedData.email)
        return NextResponse.json(
          {
            success: false,
            error: 'Maximum verification attempts exceeded',
            action: 'regenerate',
          },
          { status: 400 }
        )
      }

      // Verify the code
      if (storedData.code !== validatedData.code) {
        // Increment attempts
        const newAttempts = await incrementVerificationAttempts(validatedData.email)

        return NextResponse.json(
          {
            success: false,
            error: 'Invalid verification code',
            attemptsRemaining: 3 - newAttempts,
          },
          { status: 400 }
        )
      }
    }

    // Code is valid - find or create student record
    let student = await prisma.student.findUnique({
      where: { email: validatedData.email },
    })

    if (!student) {
      // Create a new student record with minimal data
      student = await prisma.student.create({
        data: {
          email: validatedData.email,
          emailVerified: true,
        },
      })
    } else if (!student.emailVerified) {
      // Update existing student to mark email as verified
      student = await prisma.student.update({
        where: { id: student.id },
        data: { emailVerified: true },
      })
    }

    // Create a session token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Session expires in 30 days

    // Create StudentSession
    const session = await prisma.studentSession.create({
      data: {
        email: validatedData.email,
        studentId: student.id,
        token,
        isVerified: true,
        expiresAt,
      },
    })

    // Delete verification code from Redis
    await deleteVerificationCode(validatedData.email)

    // Check if student has completed onboarding
    const hasCompletedOnboarding = !!(
      student.name &&
      student.city &&
      student.institute &&
      student.nationality &&
      student.gender &&
      student.coverLetter
    )

    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully',
        token: session.token,
        studentId: student.id,
        hasCompletedOnboarding,
        redirectTo: hasCompletedOnboarding ? '/student/dashboard' : '/student/onboarding',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Error verifying student auth:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify code',
      },
      { status: 500 }
    )
  }
}
