// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';

/**
 * GET /api/tourist/bookings
 * Fetch all bookings for the authenticated tourist
 */
async function getTouristBookings(request: NextRequest) {
  // Get session from NextAuth
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new AppError(401, 'Unauthorized. Please sign in to continue.');
  }

  // Find tourist by email
  const tourist = await prisma.tourist.findUnique({
    where: { email: session.user.email },
  });

  if (!tourist) {
    // Tourist doesn't exist yet, return empty bookings
    return NextResponse.json({
      success: true,
      bookings: [],
    });
  }

  // Fetch all bookings for this tourist with retry logic
  const bookings = await withDatabaseRetry(async () =>
    prisma.touristRequest.findMany({
      where: {
        touristId: tourist.id,
      },
      include: {
        selections: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                averageRating: true,
                city: true,
              },
            },
          },
        },
        review: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  );

  return NextResponse.json({
    success: true,
    bookings,
  });
}

export const GET = withErrorHandler(getTouristBookings, 'GET /api/tourist/bookings');
