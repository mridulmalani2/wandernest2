/**
 * Student Profile API
 *
 * GET: Fetch current student's profile
 * PUT: Update current student's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withStudent } from '@/lib/api-wrappers';
import { isValidTimeZone, normalizeTag, sanitizeText } from '@/lib/sanitization';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

import { calculateProfileCompleteness } from '@/lib/student-utils';

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
export const GET = withStudent(async (request, studentAuth) => {
  const { email: studentEmail, id: studentId } = studentAuth;

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
});

/**
 * PUT /api/student/profile
 *
 * Updates the authenticated student's profile
 *
 * @body Partial student profile fields to update
 * @returns Updated student profile or error
 */
export const PUT = withStudent(async (request, studentAuth) => {
  const { email: studentEmail } = studentAuth;

  try {
    // Parse request body
    const body = await request.json();

    const tagSchema = z
      .string()
      .transform((val) => normalizeTag(val, 50))
      .refine((val) => val.length > 0, { message: 'Invalid value' });

    const availabilitySchema = z
      .array(
        z.object({
          day: z.enum(DAYS_OF_WEEK as [string, ...string[]]),
          available: z.boolean(),
          slots: z
            .array(
              z.object({
                start: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
                end: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
              })
            )
            .max(10),
        })
      )
      .max(7);

    const updateSchema = z
      .object({
        name: z.string().min(1).max(100).transform((val) => sanitizeText(val, 100)).refine((val) => val.length > 0).optional(),
        dateOfBirth: z.string().optional(),
        gender: z.enum(['male', 'female', 'prefer_not_to_say']).optional(),
        nationality: z.string().min(1).max(100).transform((val) => sanitizeText(val, 100)).refine((val) => val.length > 0).optional(),
        phoneNumber: z.string().min(7).max(20).regex(/^\+?[0-9\s\-\(\)]+$/).optional(),
        city: z.string().min(1).max(100).transform((val) => sanitizeText(val, 100)).refine((val) => val.length > 0).optional(),
        campus: z.string().min(1).max(100).transform((val) => sanitizeText(val, 100)).refine((val) => val.length > 0).optional(),
        institute: z.string().min(1).max(100).transform((val) => sanitizeText(val, 100)).refine((val) => val.length > 0).optional(),
        programDegree: z.string().min(1).max(100).transform((val) => sanitizeText(val, 100)).refine((val) => val.length > 0).optional(),
        yearOfStudy: z.string().min(1).transform((val) => sanitizeText(val, 50)).refine((val) => val.length > 0).optional(),
        expectedGraduation: z.string().min(1).transform((val) => sanitizeText(val, 50)).refine((val) => val.length > 0).optional(),
        profilePhotoUrl: z.string().optional().refine((val) => !val || val.startsWith('/api/files/'), { message: 'Invalid profile photo URL' }),
        bio: z.string().max(2000).transform((val) => sanitizeText(val, 2000)).optional(),
        skills: z.array(tagSchema).max(20).optional(),
        preferredGuideStyle: z.string().max(200).transform((val) => sanitizeText(val, 200)).optional(),
        coverLetter: z.string().max(5000).transform((val) => sanitizeText(val, 5000)).optional(),
        interests: z.array(tagSchema).max(20).optional(),
        servicesOffered: z.array(tagSchema).max(10).optional(),
        hourlyRate: z.number().min(0).max(1000).optional(),
        onlineServicesAvailable: z.boolean().optional(),
        timezone: z.string().max(100).optional().refine((val) => !val || isValidTimeZone(val), { message: 'Invalid timezone' }),
        preferredDurations: z.array(z.string().max(50)).max(10).optional(),
        emergencyContactName: z.string().max(100).transform((val) => sanitizeText(val, 100)).optional(),
        emergencyContactPhone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/).optional(),
        availability: availabilitySchema.optional(),
      })
      .strict();

    const parsedBody = updateSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsedBody.error.errors },
        { status: 400 }
      );
    }

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
    ] as const;
    type AllowedField = (typeof allowedFields)[number];

    // Filter out non-allowed fields
    const updateData: any = {};
    for (const field of allowedFields) {
      const value = parsedBody.data[field as AllowedField];
      if (value !== undefined) {
        if (field === 'dateOfBirth' && value) {
          // Convert string date to Date object
          updateData[field] = new Date(value as string);
        } else {
          updateData[field] = value;
        }
      }
    }

    // Handle availability separately (it's a relation, not a simple field)
    let availabilityUpdate = null;
    if (parsedBody.data.availability && Array.isArray(parsedBody.data.availability)) {
      // Convert UI format (DayAvailability[]) to database format
      const availabilityInput = parsedBody.data.availability;
      for (const dayAvail of availabilityInput) {
        if (!dayAvail.available && dayAvail.slots.length > 0) {
          return NextResponse.json(
            { error: 'Invalid availability: unavailable days cannot include slots.' },
            { status: 400 }
          );
        }

        const seenSlots = new Set<string>();
        const slotsWithMinutes = dayAvail.slots.map((slot) => {
          const [startHours, startMinutes] = slot.start.split(':').map(Number);
          const [endHours, endMinutes] = slot.end.split(':').map(Number);
          const startTotal = startHours * 60 + startMinutes;
          const endTotal = endHours * 60 + endMinutes;
          if (!Number.isFinite(startTotal) || !Number.isFinite(endTotal) || startTotal >= endTotal) {
            return null;
          }
          const key = `${slot.start}-${slot.end}`;
          if (seenSlots.has(key)) {
            return null;
          }
          seenSlots.add(key);
          return { startTotal, endTotal };
        });

        if (slotsWithMinutes.some((slot) => slot === null)) {
          return NextResponse.json(
            { error: 'Invalid availability: slots must be unique and have start time before end time.' },
            { status: 400 }
          );
        }

        const sorted = (slotsWithMinutes as Array<{ startTotal: number; endTotal: number }>).sort(
          (a, b) => a.startTotal - b.startTotal
        );
        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i].startTotal < sorted[i - 1].endTotal) {
            return NextResponse.json(
              { error: 'Invalid availability: slots cannot overlap.' },
              { status: 400 }
            );
          }
        }
      }

      availabilityUpdate = availabilityInput.flatMap((dayAvail: any) => {
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

    // Recalculate profile completeness
    // Merge existing data with updates to calculate full picture
    const mergedDataForCalculation = {
      ...currentStudent,
      ...(updateData as any),
      // If availability is being updated, we could factor it in, but our helper currently 
      // doesn't heavily weigh specific availability slots, just the main profile fields.
      // If we wanted to, we could check if availability > 0.
    };

    const newCompleteness = calculateProfileCompleteness(mergedDataForCalculation);

    // Update the student profile
    const updatedStudent = await prisma.student.update({
      where: { email: studentEmail },
      data: {
        ...updateData,
        profileCompleteness: newCompleteness,
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

    throw error; // Let the wrapper handle other errors
  }
});
