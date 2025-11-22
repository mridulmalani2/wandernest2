/**
 * DEMO API ROUTE - Tourist Request Creation
 * This is a simplified endpoint for the local demo that doesn't require database or authentication.
 *
 * To replace with production:
 * 1. Use /api/tourist/request/create instead
 * 2. Add authentication with NextAuth
 * 3. Save to database with Prisma
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema (same as production but simplified)
const demoRequestSchema = z.object({
  // Trip Details
  city: z.string().min(1, 'City is required'),
  dates: z.object({
    start: z.string(),
    end: z.string().optional(),
  }),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  numberOfGuests: z.number().min(1).max(10),
  groupType: z.enum(['family', 'friends', 'solo', 'business']),
  accessibilityNeeds: z.string().optional(),

  // Preferences
  preferredNationality: z.string().optional(),
  preferredLanguages: z.array(z.string()).min(1, 'At least one language required'),
  preferredGender: z.enum(['male', 'female', 'no_preference']).optional(),
  serviceType: z.enum(['itinerary_help', 'guided_experience']),
  interests: z.array(z.string()).min(1, 'At least one interest required'),
  totalBudget: z.number().positive().optional(),

  // Contact
  email: z.string().email(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp', 'sms']),
  tripNotes: z.string().optional(),
})

// In-memory storage for demo (will be lost on server restart, but that's fine for demo)
const demoRequests = new Map<string, any>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate the request data
    const validatedData = demoRequestSchema.parse(body)

    // Generate a unique request ID
    const requestId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Store the request in memory
    demoRequests.set(requestId, {
      id: requestId,
      ...validatedData,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Demo request created successfully',
        requestId: requestId,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('Error creating demo request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create demo request',
      },
      { status: 500 }
    )
  }
}

// Also export GET to retrieve a request by ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const requestId = searchParams.get('requestId')

  if (!requestId) {
    return NextResponse.json(
      { success: false, error: 'Request ID is required' },
      { status: 400 }
    )
  }

  const request = demoRequests.get(requestId)

  if (!request) {
    return NextResponse.json(
      { success: false, error: 'Request not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    request,
  })
}
