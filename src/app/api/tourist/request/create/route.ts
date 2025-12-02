// Optimized for Vercel serverless functions
export const dynamic = 'force-dynamic'
export const maxDuration = 10

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { requireDatabase } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/transactional-email';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';

// In-memory storage for demo mode (when database is unavailable)
const demoRequests = new Map<string, any>();

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
  serviceType: z.enum(['itinerary_help', 'guided_experience']),
  interests: z.array(z.string()).min(1, 'At least one interest required'),
  budget: z.number().positive().optional(),

  // Contact
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp']),
  tripNotes: z.string().optional(),
  referralEmail: z.string().email('Invalid referral email').optional().or(z.literal('')),
});

/**
 * POST /api/tourist/request/create
 * Create a new booking request for an authenticated tourist
 */
async function createTouristRequest(req: NextRequest) {
  const db = requireDatabase();
  // Get session from NextAuth
  const session = await getServerSession(authOptions);

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

  // Ensure database is available (throws clear error if not)
  const prisma = requireDatabase();

  // Create the TouristRequest
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  let touristRequest: any;

  if (db) {
    // Database is available - use Prisma
    touristRequest = await withDatabaseRetry(async () =>
      db.touristRequest.create({
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
          serviceType: validatedData.serviceType,
          interests: validatedData.interests,
          budget: validatedData.budget,

          // Contact
          phone: validatedData.phone,
          whatsapp: validatedData.whatsapp,
          contactMethod: validatedData.contactMethod,
          meetingPreference: 'public_place', // Default value
          tripNotes: validatedData.tripNotes,
          referralEmail: validatedData.referralEmail || null,

          status: 'PENDING',
          expiresAt,
        },
      })
    );

    // Send booking confirmation email to tourist
    // Matching will be handled separately via admin dashboard
    console.log(`[createTouristRequest] Sending booking confirmation email to ${session.user.email}`)
    const emailResult = await sendBookingConfirmation(
      session.user.email,
      touristRequest.id,
      { matchesFound: 0 } // No automatic matching - admin will handle matching later
    )

    if (emailResult.success) {
      console.log(`[createTouristRequest] ✅ Booking confirmation email sent successfully`)
    } else {
      console.warn('⚠️  Failed to send booking confirmation email:', emailResult.error)
      // Continue anyway - email failure should not block booking creation
    }
  } else {
    // Database not available - use in-memory storage for demo
    const requestId = `demo-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    touristRequest = {
      id: requestId,
      touristId: touristId,
      email: session.user.email,
      emailVerified: true,

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
      serviceType: validatedData.serviceType,
      interests: validatedData.interests,
      budget: validatedData.budget,

      // Contact
      phone: validatedData.phone,
      whatsapp: validatedData.whatsapp,
      contactMethod: validatedData.contactMethod,
      meetingPreference: 'public_place',
      tripNotes: validatedData.tripNotes,
      referralEmail: validatedData.referralEmail || null,

      status: 'PENDING',
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store in memory
    demoRequests.set(requestId, touristRequest);

    console.log(`[DEMO MODE] Created tourist request: ${requestId}`);
    console.log(`[DEMO MODE] Stored ${demoRequests.size} requests in memory`);
  }

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
