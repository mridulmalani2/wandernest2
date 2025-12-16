// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { requireDatabase } from '@/lib/prisma';
import { getValidStudentSession, readStudentTokenFromRequest } from '@/lib/student-auth';
import { sendStudentWelcomeEmail } from '@/lib/transactional-email';
import { z } from 'zod';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';
import * as bcrypt from 'bcryptjs';

const GENERIC_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];

const onboardingSchema = z.object({
  // Authentication
  email: z.string().email().refine((email) => {
    // Allow any email in development
    if (process.env.NODE_ENV === 'development') return true;

    const domain = email.split('@')[1];
    return !GENERIC_DOMAINS.includes(domain.toLowerCase());
  }, { message: "Please use your university email address (e.g., .edu, .ac.uk). Generic providers like Gmail are not allowed." }),
  googleId: z.string().optional(),
  password: z.string().min(8),

  // Personal Details
  name: z.string().min(1).max(100),
  dateOfBirth: z.string().min(1).transform(str => new Date(str)).refine((date) => {
    const ageDifMs = Date.now() - date.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }, { message: "You must be at least 18 years old." }),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  nationality: z.string().min(1).max(100),
  phoneNumber: z.string().min(8, "Phone number too short").max(20, "Phone number too long").regex(/^\+?[0-9\s\-\(\)]+$/, "Invalid phone number format"),
  city: z.string().min(1).max(100),
  campus: z.string().min(1).max(100),

  // Academic Details
  institute: z.string().min(1).max(100),
  programDegree: z.string().min(1).max(100),
  yearOfStudy: z.string().min(1),
  // Fixed: expectedGraduation should be string in DB, so we refine the string instead of transforming
  expectedGraduation: z.string().min(1).refine((str) => {
    const d = new Date(str);
    return !isNaN(d.getTime()) && d.getFullYear() >= new Date().getFullYear();
  }, { message: "Graduation year cannot be in the past." }),
  languages: z.array(z.string()).min(1),

  // Identity Verification
  studentIdUrl: z.string().min(1),
  studentIdExpiry: z.string().min(1).regex(/^\d{2}\/\d{4}$/, "Format must be MM/YYYY").transform(str => {
    const [month, year] = str.split('/').map(Number);
    return new Date(year, month, 0); // Last day of the month
  }).refine((date) => date > new Date(), { message: "Student ID has expired." }),
  governmentIdUrl: z.string().optional(),
  governmentIdExpiry: z.string().optional().transform(str => str ? new Date(str) : undefined).refine((date) => !date || date > new Date(), { message: "Government ID has expired." }),
  selfieUrl: z.string().optional(),
  profilePhotoUrl: z.string().min(1),
  documentsOwnedConfirmation: z.boolean(),
  verificationConsent: z.boolean(),

  // Safety & Compliance
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  safetyGuidelinesAccepted: z.literal(true),
  independentGuideAcknowledged: z.literal(true),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().refine((val) => !val || /^\+?[0-9\s\-\(\)]+$/.test(val), { message: "Invalid emergency contact phone" }),
});

// Helper function to calculate profile completeness
function calculateProfileCompleteness(data: Record<string, unknown>): number {
  const requiredFields = [
    'name', 'dateOfBirth', 'gender', 'nationality', 'phoneNumber',
    'city', 'campus', 'institute', 'programDegree', 'yearOfStudy',
    'expectedGraduation', 'studentIdUrl', 'profilePhotoUrl'
  ];

  const arrayFields = ['languages'];
  const booleanFields = [
    'documentsOwnedConfirmation',
    'verificationConsent',
    'termsAccepted',
    'safetyGuidelinesAccepted',
    'independentGuideAcknowledged',
  ];

  let completed = 0;
  const total = requiredFields.length + arrayFields.length + booleanFields.length + 1; // +1 for availability

  requiredFields.forEach(field => { if (data[field]) completed++; });
  arrayFields.forEach(field => { if (Array.isArray(data[field]) && (data[field] as unknown[]).length > 0) completed++; });
  booleanFields.forEach(field => { if (data[field]) completed++; });

  return Math.round((completed / total) * 100);
}

async function submitOnboarding(req: NextRequest) {
  const body = await req.json();

  // Validate input
  const validatedData = onboardingSchema.parse(body);

  // Validate OTP-backed student session and ensure ownership
  const sessionToken = await readStudentTokenFromRequest(req);
  const session = await getValidStudentSession(sessionToken);

  if (!session || session.email !== validatedData.email) {
    throw new AppError(401, 'Unauthorized. Please sign in again.', 'UNAUTHORIZED');
  }

  const db = requireDatabase();


  // Check if student already exists
  const existingStudent = await withDatabaseRetry(async () =>
    db.student.findUnique({
      where: { email: validatedData.email },
    })
  );

  if (existingStudent) {
    throw new AppError(400, 'A profile with this email already exists', 'EMAIL_EXISTS');
  }

  if (session.studentId) {
    throw new AppError(400, 'Profile already linked to this session', 'ALREADY_ONBOARDED');
  }

  // Check if googleId is already used (only if provided)
  if (validatedData.googleId) {
    const existingGoogleId = await withDatabaseRetry(async () =>
      db.student.findUnique({
        where: { googleId: validatedData.googleId },
      })
    );

    if (existingGoogleId) {
      throw new AppError(400, 'This Google account is already registered', 'GOOGLE_ID_EXISTS');
    }
  }

  // Calculate profile completeness
  const completeness = calculateProfileCompleteness(validatedData);

  // Create student profile
  const passwordHash = validatedData.password
    ? await bcrypt.hash(validatedData.password, 10)
    : undefined;

  const student = await withDatabaseRetry(async () =>
    db.student.create({
      data: {
        // Authentication
        email: validatedData.email,
        googleId: validatedData.googleId,
        passwordHash,

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
        // bio: undefined
        // skills: [],
        // preferredGuideStyle: undefined,
        // coverLetter: undefined,
        // interests: [],

        // Availability
        // timezone: undefined,
        // preferredDurations: [],

        // Service Preferences
        // servicesOffered: [],
        // hourlyRate: undefined,
        // onlineServicesAvailable: false,

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
    })
  );

  await withDatabaseRetry(async () =>
    db.studentSession.update({
      where: { id: session.id },
      data: {
        studentId: student.id,
      },
    })
  );

  // Availability creation removed
  // Unavailability exceptions creation removed

  // Send email notification to student
  const emailResult = await sendStudentWelcomeEmail(student.email, student.name || 'Guide');
  if (!emailResult.success) {
    console.warn(`Failed to send welcome email to ${student.email}:`, emailResult.error);
    // Continue execution - do not fail onboarding for email delivery issues
  }

  // TODO: Send notification to admin team for review

  return NextResponse.json({
    success: true,
    studentId: student.id,
    profileCompleteness: completeness,
    message: 'Onboarding submitted successfully. Your profile is under review.',
  });
}

export const POST = withErrorHandler(submitOnboarding, 'POST /api/student/onboarding');
