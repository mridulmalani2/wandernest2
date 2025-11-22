// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';

/**
 * GET /api/tourist/bookings
 * Fetch all bookings for the authenticated tourist
 *
 * AUTH DISABLED FOR DEVELOPMENT - DATABASE_URL not configured
 */
async function getTouristBookings(request: NextRequest) {
  // // Get session from NextAuth
  // const session = await getServerSession(authOptions);

  // if (!session?.user?.email) {
  //   throw new AppError(401, 'Unauthorized. Please sign in to continue.');
  // }

  // // Verify user is a tourist
  // if (session.user.userType !== 'tourist') {
  //   throw new AppError(403, 'Access denied. Tourist account required.');
  // }

  // // Get tourist ID
  // const touristId = session.user.touristId;

  // if (!touristId) {
  //   throw new AppError(404, 'Tourist profile not found');
  // }

  // DEV MODE: Return empty array since we can't query DB without auth
  return NextResponse.json({
    success: true,
    bookings: [],
  });

  // Fetch all bookings for this tourist with retry logic
  /* const bookings = await withDatabaseRetry(async () =>
    prisma.touristRequest.findMany({
      where: {
        touristId: touristId,
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
  }); */
}

export const GET = withErrorHandler(getTouristBookings, 'GET /api/tourist/bookings');
