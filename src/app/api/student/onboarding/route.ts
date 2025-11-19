// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const onboardingSchema = z.object({
  // Authentication
  email: z.string().email(),
  googleId: z.string(),

  // Personal Details
  name: z.string().min(1),
  dateOfBirth: z.string().transform(str => new Date(str)),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  nationality: z.string().min(1),
  phoneNumber: z.string().min(1),
  city: z.string().min(1),
  campus: z.string().min(1),

  // Academic Details
  institute: z.string().min(1),
  programDegree: z.string().min(1),
  yearOfStudy: z.string().min(1),
  expectedGraduation: z.string().min(1),
  languages: z.array(z.string()).min(1),

  // Identity Verification
  studentIdUrl: z.string().min(1),
  studentIdExpiry: z.string().transform(str => new Date(str)),
  governmentIdUrl: z.string().min(1),
  governmentIdExpiry: z.string().transform(str => new Date(str)),
  selfieUrl: z.string().min(1),
  profilePhotoUrl: z.string().min(1),
  documentsOwnedConfirmation: z.boolean(),
  verificationConsent: z.boolean(),

  // Profile Information
  bio: z.string().min(50),
  skills: z.array(z.string()).min(1),
  preferredGuideStyle: z.string().optional(),
  coverLetter: z.string().min(200),
  interests: z.array(z.string()).min(1),

  // Availability
  timezone: z.string().min(1),
  preferredDurations: z.array(z.string()).min(1),
  unavailabilityExceptions: z.array(z.object({
    date: z.string().transform(str => new Date(str)),
    reason: z.string().optional(),
  })).optional(),
  availability: z.array(
    z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      note: z.string().optional(),
    })
  ).min(1),

  // Service Preferences
  servicesOffered: z.array(z.string()).min(1),
  hourlyRate: z.number().positive(),
  onlineServicesAvailable: z.boolean(),

  // Safety & Compliance
  termsAccepted: z.boolean(),
  safetyGuidelinesAccepted: z.boolean(),
  independentGuideAcknowledged: z.boolean(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(data: any): number {
  const requiredFields = [
    'name', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber',
    'city', 'campus', 'institute', 'programDegree', 'yearOfStudy',
    'expectedGraduation', 'studentIdUrl', 'governmentIdUrl', 'selfieUrl',
    'profilePhotoUrl', 'bio', 'coverLetter', 'hourlyRate', 'timezone'
  ];

  const arrayFields = ['languages', 'skills', 'interests', 'servicesOffered', 'preferredDurations'];
  const booleanFields = ['documentsOwnedConfirmation', 'verificationConsent', 'termsAccepted', 'safetyGuidelinesAccepted', 'independentGuideAcknowledged'];

  let completed = 0;
  const total = requiredFields.length + arrayFields.length + booleanFields.length + 1; // +1 for availability

  requiredFields.forEach(field => { if (data[field]) completed++; });
  arrayFields.forEach(field => { if (data[field]?.length > 0) completed++; });
  booleanFields.forEach(field => { if (data[field]) completed++; });
  if (data.availability?.length > 0) completed++;

  return Math.round((completed / total) * 100);
}

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

    // Calculate profile completeness
    const completeness = calculateProfileCompleteness(validatedData);

    // Create student profile
    const student = await prisma.student.create({
      data: {
        // Authentication
        email: validatedData.email,
        googleId: validatedData.googleId,
        emailVerified: true,

        // Personal Details
        name: validatedData.name,
        dateOfBirth: validatedData.dateOfBirth,
        gender: validatedData.gender,
        nationality: validatedData.nationality,
        phoneNumber: validatedData.phoneNumber,
        city: validatedData.city,
        campus: validatedData.campus,

        // Academic Details
        institute: validatedData.institute,
        programDegree: validatedData.programDegree,
        yearOfStudy: validatedData.yearOfStudy,
        expectedGraduation: validatedData.expectedGraduation,
        languages: validatedData.languages,

        // Identity Verification
        studentIdUrl: validatedData.studentIdUrl,
        studentIdExpiry: validatedData.studentIdExpiry,
        governmentIdUrl: validatedData.governmentIdUrl,
        governmentIdExpiry: validatedData.governmentIdExpiry,
        selfieUrl: validatedData.selfieUrl,
        profilePhotoUrl: validatedData.profilePhotoUrl,
        verificationConsent: validatedData.verificationConsent,
        documentsOwnedConfirmation: validatedData.documentsOwnedConfirmation,

        // Legacy field for backward compatibility
        idCardUrl: validatedData.studentIdUrl,

        // Profile Information
        bio: validatedData.bio,
        skills: validatedData.skills,
        preferredGuideStyle: validatedData.preferredGuideStyle,
        coverLetter: validatedData.coverLetter,
        interests: validatedData.interests,

        // Availability
        timezone: validatedData.timezone,
        preferredDurations: validatedData.preferredDurations,

        // Service Preferences
        servicesOffered: validatedData.servicesOffered,
        hourlyRate: validatedData.hourlyRate,
        onlineServicesAvailable: validatedData.onlineServicesAvailable,

        // Safety & Compliance
        termsAccepted: validatedData.termsAccepted,
        safetyGuidelinesAccepted: validatedData.safetyGuidelinesAccepted,
        independentGuideAcknowledged: validatedData.independentGuideAcknowledged,
        emergencyContactName: validatedData.emergencyContactName,
        emergencyContactPhone: validatedData.emergencyContactPhone,

        // System Fields
        status: 'PENDING_APPROVAL',
        profileCompleteness: completeness,
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

    // Create unavailability exceptions if provided
    if (validatedData.unavailabilityExceptions && validatedData.unavailabilityExceptions.length > 0) {
      await prisma.unavailabilityException.createMany({
        data: validatedData.unavailabilityExceptions.map((exception) => ({
          studentId: student.id,
          date: exception.date,
          reason: exception.reason,
        })),
      });
    }

    // TODO: Send email notification to student
    // TODO: Send notification to admin team for review

    return NextResponse.json({
      success: true,
      studentId: student.id,
      profileCompleteness: completeness,
      message: 'Onboarding submitted successfully. Your profile is under review.',
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
