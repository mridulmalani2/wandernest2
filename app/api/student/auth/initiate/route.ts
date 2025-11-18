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

    // Check if email is a valid student email
    if (!isStudentEmail(validatedData.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email domain',
          message: 'Please use a valid student email address ending in .edu, .edu.in, .ac.uk, or other institutional domains.',
        },
        { status: 400 }
      )
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode()

    // Store code in Redis with 10-minute TTL
    await storeVerificationCode(
      validatedData.email,
      verificationCode,
      parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600')
    )

    // Send verification email
    await sendVerificationEmail(validatedData.email, verificationCode)

    // Return success with email
    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email',
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
