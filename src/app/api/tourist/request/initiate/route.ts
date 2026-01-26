// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateVerificationCode } from '@/lib/utils'
import { deleteVerificationCode, storeVerificationCode } from '@/lib/redis'
import { sendVerificationEmail } from '@/lib/email'
import { isZodError } from '@/lib/error-handler'
import { checkRateLimit, hashIdentifier } from '@/lib/rate-limit'
import { sanitizeEmail } from '@/lib/sanitization'
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit'
import { validateJson } from '@/lib/validation/validate'

const initiateSchema = z.object({
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
  preferredNationality: z.string().optional(),
  preferredLanguages: z.array(z.string()).min(1, 'At least one language required'),
  preferredGender: z.enum(['male', 'female', 'no_preference']).optional(),
  serviceType: z.enum(['itinerary_help', 'guided_experience'], {
    required_error: 'Service type is required',
  }),
  interests: z.array(z.string()).min(1, 'At least one interest required'),
  budget: z.number().positive().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp'], {
    required_error: 'Contact method is required',
  }),
  tripNotes: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
}).strict()

export async function POST(req: NextRequest) {
  try {
    await rateLimitByIp(req, 5, 60, 'tourist-request-initiate')
    await rateLimitByIp(req, 20, 60 * 60, 'tourist-request-initiate-hour')
    const validatedData = await validateJson<any>(req, initiateSchema)

    let normalizedEmail = ''
    try {
      normalizedEmail = sanitizeEmail(validatedData.email)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

    const emailKey = `tourist-initiate:email:${hashIdentifier(normalizedEmail)}`
    const ipKey = `tourist-initiate:ip:${hashIdentifier(ip)}`

    const [emailLimit, ipLimit] = await Promise.all([
      checkRateLimit(emailKey, 3, 60 * 10),
      checkRateLimit(ipKey, 10, 60 * 10),
    ])

    if (!emailLimit.allowed || !ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait before trying again.' },
        { status: 429 }
      )
    }

    const verificationCode = generateVerificationCode()

    await storeVerificationCode(
      normalizedEmail,
      verificationCode,
      parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600')
    )

    const emailResult = await sendVerificationEmail(normalizedEmail, verificationCode)

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      await deleteVerificationCode(normalizedEmail)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send verification email. Please try again.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Verification code sent to your email',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof NextResponse) {
      return error
    }
    if (isZodError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed. Please check your input.',
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
