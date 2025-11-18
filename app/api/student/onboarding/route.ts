import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const onboardingSchema = z.object({
  email: z.string().email(),
  googleId: z.string(),
  name: z.string().min(1),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  nationality: z.string().min(1),
  institute: z.string().min(1),
  city: z.string().min(1),
  idCardUrl: z.string().min(1),
  coverLetter: z.string().min(200),
  languages: z.array(z.string()).min(1),
  interests: z.array(z.string()).min(1),
  bio: z.string().optional(),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      note: z.string().optional(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = onboardingSchema.parse(body);

    // Check if student already exists
    const existingStudent = await prisma.student.findUnique({
      where: { email: validatedData.email },
    });

    if (existingStudent) {
      return NextResponse.json(
        { error: 'A profile with this email already exists' },
        { status: 400 }
      );
    }

    // Check if googleId is already used
    const existingGoogleId = await prisma.student.findUnique({
      where: { googleId: validatedData.googleId },
    });

    if (existingGoogleId) {
      return NextResponse.json(
        { error: 'This Google account is already registered' },
        { status: 400 }
      );
    }

    // Create student profile
    const student = await prisma.student.create({
      data: {
        email: validatedData.email,
        googleId: validatedData.googleId,
        name: validatedData.name,
        gender: validatedData.gender,
        nationality: validatedData.nationality,
        institute: validatedData.institute,
        city: validatedData.city,
        idCardUrl: validatedData.idCardUrl,
        coverLetter: validatedData.coverLetter,
        languages: validatedData.languages,
        interests: validatedData.interests,
        bio: validatedData.bio,
        status: 'PENDING_APPROVAL',
      },
    });

    // Create availability slots
    if (validatedData.availability.length > 0) {
      await prisma.studentAvailability.createMany({
        data: validatedData.availability.map((slot) => ({
          studentId: student.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          note: slot.note,
        })),
      });
    }

    // TODO: Send email notification to student
    // TODO: Send notification to admin team for review

    return NextResponse.json({
      success: true,
      studentId: student.id,
      message: 'Onboarding submitted successfully',
    });
  } catch (error) {
    console.error('Onboarding error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data provided', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit onboarding. Please try again.' },
      { status: 500 }
    );
  }
}
