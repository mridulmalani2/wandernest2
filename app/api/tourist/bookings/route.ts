import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

/**
 * GET /api/tourist/bookings
 * Fetch all bookings for the authenticated tourist
 */
export async function GET(request: NextRequest) {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a tourist
    if (session.user.userType !== 'tourist') {
      return NextResponse.json(
        { error: 'Access denied. Tourist account required.' },
        { status: 403 }
      );
    }

    // Get tourist ID
    const touristId = session.user.touristId;

    if (!touristId) {
      return NextResponse.json(
        { error: 'Tourist profile not found' },
        { status: 404 }
      );
    }

    // Fetch all bookings for this tourist
    const bookings = await prisma.touristRequest.findMany({
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
    });

    return NextResponse.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('Error fetching tourist bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
