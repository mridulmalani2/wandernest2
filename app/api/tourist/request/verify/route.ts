import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  getVerificationData,
  incrementVerificationAttempts,
  deleteVerificationCode,
} from '@/lib/redis'
import { sendBookingConfirmation } from '@/lib/email'

// Validation schema for the verify request
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
  // All the booking data
  city: z.string().min(1),
  dates: z.object({
    start: z.string(),
    end: z.string().optional(),
  }),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  numberOfGuests: z.number().min(1).max(10),
  groupType: z.enum(['family', 'friends', 'solo', 'business']),
  preferredNationality: z.string().optional(),
  preferredLanguages: z.array(z.string()).min(1),
  preferredGender: z.enum(['male', 'female', 'no_preference']).optional(),
  serviceType: z.enum(['itinerary_help', 'guided_experience']),
  interests: z.array(z.string()).min(1),
  budget: z.number().positive().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp']),
  tripNotes: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validatedData = verifySchema.parse(body)

    // Get stored verification data from Redis
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

    // Code is valid - create the TouristRequest in database
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const touristRequest = await prisma.touristRequest.create({
      data: {
        email: validatedData.email,
        emailVerified: true,
        city: validatedData.city,
        dates: validatedData.dates,
        preferredTime: validatedData.preferredTime,
        numberOfGuests: validatedData.numberOfGuests,
        groupType: validatedData.groupType,
        preferredNationality: validatedData.preferredNationality,
        preferredLanguages: validatedData.preferredLanguages,
        preferredGender: validatedData.preferredGender,
        serviceType: validatedData.serviceType,
        interests: validatedData.interests,
        budget: validatedData.budget,
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        contactMethod: validatedData.contactMethod,
        meetingPreference: 'public_place', // Default value
        tripNotes: validatedData.tripNotes,
        accessibilityNeeds: validatedData.accessibilityNeeds,
        status: 'PENDING',
        expiresAt,
      },
    })

    // Delete verification code from Redis
    await deleteVerificationCode(validatedData.email)

    // Send booking confirmation email
    await sendBookingConfirmation(validatedData.email, touristRequest.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request created successfully',
        requestId: touristRequest.id,
        request: touristRequest,
      },
      { status: 201 }
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

    console.error('Error verifying request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify and create booking request',
      },
      { status: 500 }
    )
  }
}
