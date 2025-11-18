import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateVerificationCode } from '@/lib/utils'
import { storeVerificationCode } from '@/lib/redis'
import { sendVerificationEmail } from '@/lib/email'

// Validation schema for the initiate request
const initiateSchema = z.object({
  // Step 1: Trip Details
  city: z.string().min(1, 'City is required'),
  dates: z.object({
    start: z.string(),
    end: z.string().optional(),
  }),
  preferredTime: z.enum(['morning', 'afternoon', 'evening'], {
    required_error: 'Time preference is required',
  }),
  numberOfGuests: z.number().min(1).max(10),
  groupType: z.enum(['family', 'friends', 'solo', 'business'], {
    required_error: 'Group type is required',
  }),

  // Step 2: Preferences
  preferredNationality: z.string().optional(),
  preferredLanguages: z.array(z.string()).min(1, 'At least one language required'),
  preferredGender: z.enum(['male', 'female', 'no_preference']).optional(),
  serviceType: z.enum(['itinerary_help', 'guided_experience'], {
    required_error: 'Service type is required',
  }),
  interests: z.array(z.string()).min(1, 'At least one interest required'),
  budget: z.number().positive().optional(),

  // Step 3: Contact
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp'], {
    required_error: 'Contact method is required',
  }),
  tripNotes: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate request data
    const validatedData = initiateSchema.parse(body)

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

    // Return success with email (no requestId yet - will be created after verification)
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

    console.error('Error initiating request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate booking request',
      },
      { status: 500 }
    )
  }
}
