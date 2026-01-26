// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { requireDatabase } from '@/lib/prisma';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';
import { rateLimitByIp } from '@/lib/rateLimit/rateLimit';

/**
 * GET /api/tourist/bookings
 * Fetch all bookings for the authenticated tourist
 */
async function getTouristBookings(request: NextRequest) {
  await rateLimitByIp(request, 60, 60, 'tourist-bookings');
  // Get session from NextAuth
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new AppError(401, 'Unauthorized. Please sign in to continue.');
  }

  const db = requireDatabase()
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit') ?? '50');
  const safeLimit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 50;

  // Find tourist by email
  const tourist = await withDatabaseRetry(async () =>
    db.tourist.findUnique({
      where: { email: session.user.email },
    })
  );

  if (!tourist) {
    // Tourist doesn't exist yet, return empty bookings
    return NextResponse.json({
      success: true,
      bookings: [],
    });
  }

  // Fetch all bookings for this tourist with retry logic
  const bookings = await withDatabaseRetry(async () =>
    db.touristRequest.findMany({
      where: {
        touristId: tourist.id,
      },
      select: {
        id: true,
        city: true,
        dates: true,
        numberOfGuests: true,
        serviceType: true,
        budget: true,
        status: true,
        createdAt: true,
        selections: {
          where: { status: 'accepted' },
          select: {
            student: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: safeLimit,
    })
  );

  const formattedBookings = bookings.map((booking) => ({
    ...booking,
    guideName: booking.selections[0]?.student?.name ?? undefined,
  }));

  return NextResponse.json({
    success: true,
    bookings: formattedBookings,
  });
}

export const GET = withErrorHandler(getTouristBookings, 'GET /api/tourist/bookings');
