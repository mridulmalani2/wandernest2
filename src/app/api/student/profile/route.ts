/**
 * Student Profile API
 *
 * GET: Fetch current student's profile
 * PUT: Update current student's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/student/profile
 *
 * Fetches the authenticated student's complete profile
 *
 * @returns Student profile data or 401/404 error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Fetch student profile
    const student = await prisma.student.findUnique({
      where: { email: session.user.email },
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
        availability: true,
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

    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
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
    // Authenticate the request
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Define allowed updatable fields (excluding sensitive/system fields)
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
      'availability',
      'unavailabilityExceptions',
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

    // Validate that there's something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the student profile
    const updatedStudent = await prisma.student.update({
      where: { email: session.user.email },
      data: {
        ...updateData,
        updatedAt: new Date(),
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
        availability: true,
        unavailabilityExceptions: true,
        emergencyContactName: true,
        emergencyContactPhone: true,
        status: true,
        profileCompleteness: true,
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
