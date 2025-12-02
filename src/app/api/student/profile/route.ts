/**
 * Student Profile API
 *
 * GET: Fetch current student's profile
 * PUT: Update current student's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import {
  getValidStudentSession,
  readStudentTokenFromRequest,
  getStudentFromSession,
} from '@/lib/student-auth';

export const dynamic = 'force-dynamic';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * GET /api/student/profile
 *
 * Fetches the authenticated student's complete profile
 *
 * @returns Student profile data or 401/404 error
 */
export async function GET(request: NextRequest) {
  try {
    let studentEmail: string | null = null;
    let studentId: string | null = null;

    // 1. Try Custom OTP Session
    const token = readStudentTokenFromRequest(request);
    const otpSession = await getValidStudentSession(token);

    if (otpSession) {
      studentEmail = otpSession.email;
      studentId = otpSession.studentId;
    } else {
      // 2. Try NextAuth Session
      const nextAuthSession = await getServerSession(authOptions);
      if (nextAuthSession?.user?.userType === 'student' && nextAuthSession.user.email) {
        studentEmail = nextAuthSession.user.email;
      }
    }

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Fetch student profile
    const profile = await prisma.student.findUnique({
      where: studentId ? { id: studentId } : { email: studentEmail },
      select: {
        id: true,
        email: true,
        name: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        phoneNumber: true,
        city: true,
        campus: true,
        institute: true,
        programDegree: true,
        yearOfStudy: true,
        expectedGraduation: true,
        profilePhotoUrl: true,
        bio: true,
        skills: true,
        preferredGuideStyle: true,
        coverLetter: true,
        interests: true,
        servicesOffered: true,
        hourlyRate: true,
        onlineServicesAvailable: true,
        timezone: true,
        preferredDurations: true,
        availability: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            note: true,
          },
        },
        unavailabilityExceptions: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        status: true,
        profileCompleteness: true,
        tripsHosted: true,
        averageRating: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student: profile,
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/student/profile
 *
 * Updates the authenticated student's profile
 *
 * @body Partial student profile fields to update
 * @returns Updated student profile or error
 */
export async function PUT(request: NextRequest) {
  try {
    let studentEmail: string | null = null;

    // 1. Try Custom OTP Session
    const token = readStudentTokenFromRequest(request);
    const otpSession = await getValidStudentSession(token);

    if (otpSession) {
      studentEmail = otpSession.email;
    } else {
      // 2. Try NextAuth Session
      const nextAuthSession = await getServerSession(authOptions);
      if (nextAuthSession?.user?.userType === 'student' && nextAuthSession.user.email) {
        studentEmail = nextAuthSession.user.email;
      }
    }

    if (!studentEmail) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Get the current student
    const currentStudent = await prisma.student.findUnique({ where: { email: studentEmail } });
    if (!currentStudent) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Define allowed updatable fields (excluding relations and sensitive/system fields)
    const allowedFields = [
      'name',
      'dateOfBirth',
      'gender',
      'nationality',
      'phoneNumber',
      'city',
      'campus',
      'institute',
      'programDegree',
      'yearOfStudy',
      'expectedGraduation',
      'profilePhotoUrl',
      'bio',
      'skills',
      'preferredGuideStyle',
      'coverLetter',
      'interests',
      'servicesOffered',
      'hourlyRate',
      'onlineServicesAvailable',
      'timezone',
      'preferredDurations',
      'emergencyContactName',
      'emergencyContactPhone',
    ];

    // Filter out non-allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Handle availability separately (it's a relation, not a simple field)
    let availabilityUpdate = null;
    if (body.availability && Array.isArray(body.availability)) {
      // Convert UI format (DayAvailability[]) to database format
      availabilityUpdate = body.availability.flatMap((dayAvail: any) => {
        if (!dayAvail.available || !dayAvail.slots || dayAvail.slots.length === 0) {
          return [];
        }

        const dayIndex = DAYS_OF_WEEK.indexOf(dayAvail.day);
        // Convert our index (0=Mon) to database dayOfWeek (0=Sun, 1=Mon, etc.)
        const dayOfWeek = dayIndex === 6 ? 0 : dayIndex + 1;

        return dayAvail.slots.map((slot: any) => ({
          dayOfWeek,
          startTime: slot.start,
          endTime: slot.end,
        }));
      });
    }

    // Validate that there's something to update
    if (Object.keys(updateData).length === 0 && !availabilityUpdate) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the student profile
    const updatedStudent = await prisma.student.update({
      where: { email: studentEmail },
      data: {
        ...updateData,
        updatedAt: new Date(),
        // Update availability if provided
        ...(availabilityUpdate && {
          availability: {
            deleteMany: {}, // Remove all existing availability
            create: availabilityUpdate, // Add new availability
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        dateOfBirth: true,
        gender: true,
        nationality: true,
        phoneNumber: true,
        city: true,
        campus: true,
        institute: true,
        programDegree: true,
        yearOfStudy: true,
        expectedGraduation: true,
        profilePhotoUrl: true,
        bio: true,
        skills: true,
        preferredGuideStyle: true,
        coverLetter: true,
        interests: true,
        servicesOffered: true,
        hourlyRate: true,
        onlineServicesAvailable: true,
        timezone: true,
        preferredDurations: true,
        availability: {
          select: {
            id: true,
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            note: true,
          },
        },
        unavailabilityExceptions: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        status: true,
        profileCompleteness: true,
        tripsHosted: true,
        averageRating: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      student: updatedStudent,
    });
  } catch (error: any) {
    console.error('Error updating student profile:', error);

    // Handle Prisma not found error
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
