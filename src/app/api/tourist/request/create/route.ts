// Optimized for Vercel serverless functions
export const dynamic = 'force-dynamic'
export const maxDuration = 10

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionWithDevBypass } from '@/lib/dev-auth-server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';

// Validation schema for authenticated booking request
const createBookingSchema = z.object({
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
  budget: z.number().positive().optional(),

  // Contact
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp']),
  tripNotes: z.string().optional(),
});

/**
 * POST /api/tourist/request/create
 * Create a new booking request for an authenticated tourist
 */
async function createTouristRequest(req: NextRequest) {
  // Get session (with dev bypass support in development)
  const session = await getSessionWithDevBypass(req);

  if (!session?.user?.email) {
    throw new AppError(401, 'Unauthorized. Please sign in.', 'UNAUTHORIZED');
  }

  // Verify user is a tourist
  if (session.user.userType !== 'tourist') {
    throw new AppError(403, 'Access denied. Tourist account required.', 'ACCESS_DENIED');
  }

  // Get tourist ID
  const touristId = session.user.touristId;

  if (!touristId) {
    throw new AppError(404, 'Tourist profile not found', 'TOURIST_NOT_FOUND');
  }

  // Parse and validate request body
  const body = await req.json();
  const validatedData = createBookingSchema.parse(body);

  // Create the TouristRequest in database
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const touristRequest = await withDatabaseRetry(async () =>
    prisma.touristRequest.create({
      data: {
        // Link to tourist
        touristId: touristId,
        email: session.user.email,
        emailVerified: true, // Already verified via Google OAuth

        // Trip Details
        city: validatedData.city,
        dates: validatedData.dates,
        preferredTime: validatedData.preferredTime,
        numberOfGuests: validatedData.numberOfGuests,
        groupType: validatedData.groupType,
        accessibilityNeeds: validatedData.accessibilityNeeds,

        // Preferences
        preferredNationality: validatedData.preferredNationality,
        preferredLanguages: validatedData.preferredLanguages,
        preferredGender: validatedData.preferredGender,
        serviceType: validatedData.serviceType,
        interests: validatedData.interests,
        budget: validatedData.budget,

        // Contact
        phone: validatedData.phone,
        whatsapp: validatedData.whatsapp,
        contactMethod: validatedData.contactMethod,
        meetingPreference: 'public_place', // Default value
        tripNotes: validatedData.tripNotes,

        status: 'PENDING',
        expiresAt,
      },
    })
  );

  // Send booking confirmation email
  await sendBookingConfirmation(session.user.email, touristRequest.id);

  return NextResponse.json(
    {
      success: true,
      message: 'Booking request created successfully',
      requestId: touristRequest.id,
      request: touristRequest,
    },
    { status: 201 }
  );
}

export const POST = withErrorHandler(createTouristRequest, 'POST /api/tourist/request/create');
