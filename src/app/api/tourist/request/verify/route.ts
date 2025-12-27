// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
// Explicitly use Node.js runtime (required for Prisma)
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireDatabase } from '@/lib/prisma'
import {
  getVerificationData,
  incrementVerificationAttempts,
  deleteVerificationCode,
  hashVerificationCode,
} from '@/lib/redis'
import { sendBookingConfirmation } from '@/lib/email'
import { autoMatchAndInvite } from '@/lib/matching/autoMatch'
import { sanitizeEmail } from '@/lib/sanitization'

// Validation schema for the verify request
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
  // All the booking data
  city: z.string().min(1),
  dates: z.object({
    start: z.string(),
    end: z.string().optional(),
  }).refine((dates) => {
    if (!dates.start) return false
    if (!dates.end) return true
    return new Date(dates.start) <= new Date(dates.end)
  }, { message: 'End date must be after start date' }),
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
    const db = requireDatabase()
    const body = await req.json()
    const validatedData = verifySchema.parse(body)
    let normalizedEmail = ''
    try {
      normalizedEmail = sanitizeEmail(validatedData.email)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Get stored verification data from Redis
    const storedData = await getVerificationData(normalizedEmail)

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
      await deleteVerificationCode(normalizedEmail)
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
    if (storedData.code !== hashVerificationCode(validatedData.code)) {
      // Increment attempts
      const newAttempts = await incrementVerificationAttempts(normalizedEmail)

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

    const touristRequest = await db.touristRequest.create({
      data: {
        email: normalizedEmail,
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
    await deleteVerificationCode(normalizedEmail)

    // AUTOMATIC MATCHING: Find and invite candidate students (do this BEFORE sending email)
    console.log(`[verifyTouristRequest] Triggering automatic matching for request ${touristRequest.id}`)
    let matchResult = { success: false, candidatesFound: 0, invitationsSent: 0, errors: ['Auto-match failed'] }
    try {
      matchResult = await autoMatchAndInvite(touristRequest)
    } catch (error) {
      const safeError = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`[verifyTouristRequest] Auto-match error: ${safeError}`)
    }

    if (matchResult.success) {
      console.log(
        `[verifyTouristRequest] Auto-match successful: ${matchResult.candidatesFound} candidates found, ` +
        `${matchResult.invitationsSent} invitations sent`
      )
    } else {
      console.warn(`[verifyTouristRequest] Auto-match failed/warnings:`, matchResult.errors)
    }

    // Send booking confirmation email with match status (non-critical)
    try {
      const emailResult = await sendBookingConfirmation(
        normalizedEmail,
        touristRequest.id,
        touristRequest.city,
        { matchesFound: matchResult.candidatesFound }
      )
      if (!emailResult.success) {
        const safeError = typeof emailResult.error === 'string' ? emailResult.error : 'Unknown error'
        console.warn('⚠️  Failed to send booking confirmation email:', safeError)
      }
    } catch (error) {
      const safeError = error instanceof Error ? error.message : 'Unknown error'
      console.warn('⚠️  Failed to send booking confirmation email:', safeError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request created successfully',
        requestId: touristRequest.id,
        // sanitize PII from response as client already has the data
        status: touristRequest.status,
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

    const safeError = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error verifying request:', safeError)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify and create booking request',
      },
      { status: 500 }
    )
  }
}
