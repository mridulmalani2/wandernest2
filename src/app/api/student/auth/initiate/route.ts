// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateVerificationCode } from '@/lib/utils'
import { storeVerificationCode } from '@/lib/redis'
import { sendVerificationEmail } from '@/lib/email'

// Valid student email domains
const STUDENT_EMAIL_DOMAINS = [
  '.edu',
  '.edu.in',
  '.ac.uk',
  '.edu.au',
  '.edu.sg',
  '.ac.in',
  // Add more institution-specific domains as needed
]

function isStudentEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase()
  return STUDENT_EMAIL_DOMAINS.some(domain => lowerEmail.endsWith(domain))
}

// Validation schema for the initiate request
const initiateSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request data
    const validatedData = initiateSchema.parse(body)

    // In development mode, allow any email (for testing student pages)
    const isDevelopment = process.env.NODE_ENV === 'development'

    // Check if email is a valid student email (skip in development)
    if (!isDevelopment && !isStudentEmail(validatedData.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email domain',
          message: 'Please use a valid student email address ending in .edu, .edu.in, .ac.uk, or other institutional domains.',
        },
        { status: 400 }
      )
    }

    // In development mode, use a simple dev code; in production, generate random code
    const verificationCode = isDevelopment ? '000000' : generateVerificationCode()

    // Store code in Redis with 10-minute TTL
    await storeVerificationCode(
      validatedData.email,
      verificationCode,
      parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600')
    )

    // Only send email in production mode
    if (!isDevelopment) {
      await sendVerificationEmail(validatedData.email, verificationCode)
    }

    // Return success with message
    const message = isDevelopment
      ? 'Development mode: Use code 000000 to verify'
      : 'Verification code sent to your email'

    return NextResponse.json(
      {
        success: true,
        message,
        email: validatedData.email,
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

    console.error('Error initiating student auth:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send verification code',
      },
      { status: 500 }
    )
  }
}
