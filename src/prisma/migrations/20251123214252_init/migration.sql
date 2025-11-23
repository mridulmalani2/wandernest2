-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'MATCHED', 'ACCEPTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'MODERATOR', 'SUPPORT');

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "name" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "phoneNumber" TEXT,
    "city" TEXT,
    "campus" TEXT,
    "institute" TEXT,
    "programDegree" TEXT,
    "yearOfStudy" TEXT,
    "expectedGraduation" TEXT,
    "studentIdUrl" TEXT,
    "studentIdExpiry" TIMESTAMP(3),
    "governmentIdUrl" TEXT,
    "governmentIdExpiry" TIMESTAMP(3),
    "selfieUrl" TEXT,
    "profilePhotoUrl" TEXT,
    "verificationConsent" BOOLEAN NOT NULL DEFAULT false,
    "documentsOwnedConfirmation" BOOLEAN NOT NULL DEFAULT false,
    "bio" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredGuideStyle" TEXT,
    "idCardUrl" TEXT,
    "coverLetter" TEXT,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "servicesOffered" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hourlyRate" DOUBLE PRECISION,
    "onlineServicesAvailable" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT,
    "preferredDurations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "unavailableDates" JSONB,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "safetyGuidelinesAccepted" BOOLEAN NOT NULL DEFAULT false,
    "independentGuideAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "profileCompleteness" DOUBLE PRECISION,
    "priceRange" JSONB,
    "tripsHosted" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "noShowCount" INTEGER NOT NULL DEFAULT 0,
    "acceptanceRate" DOUBLE PRECISION,
    "reliabilityBadge" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAvailability" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "StudentAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnavailabilityException" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "UnavailabilityException_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tourist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tourist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TouristRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationCode" TEXT,
    "touristId" TEXT,
    "city" TEXT NOT NULL,
    "dates" JSONB NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "groupType" TEXT NOT NULL,
    "accessibilityNeeds" TEXT,
    "preferredNationality" TEXT,
    "preferredLanguages" TEXT[],
    "preferredGender" TEXT,
    "serviceType" TEXT NOT NULL,
    "interests" TEXT[],
    "budget" DOUBLE PRECISION,
    "phone" TEXT,
    "whatsapp" TEXT,
    "contactMethod" TEXT NOT NULL,
    "meetingPreference" TEXT NOT NULL,
    "tripNotes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "assignedStudentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TouristRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestSelection" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "pricePaid" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "RequestSelection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT,
    "attributes" TEXT[],
    "noShow" BOOLEAN NOT NULL DEFAULT false,
    "pricePaid" DOUBLE PRECISION,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'MODERATOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TouristSession" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "token" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TouristSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSession" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "studentId" TEXT,
    "token" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'tourist',
    "touristId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_googleId_key" ON "Student"("googleId");

-- CreateIndex
CREATE INDEX "Student_city_idx" ON "Student"("city");

-- CreateIndex
CREATE INDEX "Student_nationality_idx" ON "Student"("nationality");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_city_status_idx" ON "Student"("city", "status");

-- CreateIndex
CREATE INDEX "Student_status_averageRating_idx" ON "Student"("status", "averageRating");

-- CreateIndex
CREATE INDEX "Student_email_status_idx" ON "Student"("email", "status");

-- CreateIndex
CREATE INDEX "StudentAvailability_studentId_idx" ON "StudentAvailability"("studentId");

-- CreateIndex
CREATE INDEX "UnavailabilityException_studentId_idx" ON "UnavailabilityException"("studentId");

-- CreateIndex
CREATE INDEX "UnavailabilityException_date_idx" ON "UnavailabilityException"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_googleId_key" ON "Tourist"("googleId");

-- CreateIndex
CREATE INDEX "Tourist_email_idx" ON "Tourist"("email");

-- CreateIndex
CREATE INDEX "Tourist_googleId_idx" ON "Tourist"("googleId");

-- CreateIndex
CREATE INDEX "TouristRequest_city_idx" ON "TouristRequest"("city");

-- CreateIndex
CREATE INDEX "TouristRequest_status_idx" ON "TouristRequest"("status");

-- CreateIndex
CREATE INDEX "TouristRequest_email_idx" ON "TouristRequest"("email");

-- CreateIndex
CREATE INDEX "TouristRequest_touristId_idx" ON "TouristRequest"("touristId");

-- CreateIndex
CREATE INDEX "TouristRequest_city_status_idx" ON "TouristRequest"("city", "status");

-- CreateIndex
CREATE INDEX "TouristRequest_status_createdAt_idx" ON "TouristRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RequestSelection_requestId_idx" ON "RequestSelection"("requestId");

-- CreateIndex
CREATE INDEX "RequestSelection_studentId_idx" ON "RequestSelection"("studentId");

-- CreateIndex
CREATE INDEX "RequestSelection_status_idx" ON "RequestSelection"("status");

-- CreateIndex
CREATE INDEX "RequestSelection_requestId_status_idx" ON "RequestSelection"("requestId", "status");

-- CreateIndex
CREATE INDEX "RequestSelection_studentId_status_idx" ON "RequestSelection"("studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_requestId_key" ON "Review"("requestId");

-- CreateIndex
CREATE INDEX "Review_studentId_idx" ON "Review"("studentId");

-- CreateIndex
CREATE INDEX "Review_createdAt_idx" ON "Review"("createdAt");

-- CreateIndex
CREATE INDEX "Report_studentId_idx" ON "Report"("studentId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_role_idx" ON "Admin"("role");

-- CreateIndex
CREATE UNIQUE INDEX "TouristSession_token_key" ON "TouristSession"("token");

-- CreateIndex
CREATE INDEX "TouristSession_email_idx" ON "TouristSession"("email");

-- CreateIndex
CREATE INDEX "TouristSession_token_idx" ON "TouristSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSession_token_key" ON "StudentSession"("token");

-- CreateIndex
CREATE INDEX "StudentSession_email_idx" ON "StudentSession"("email");

-- CreateIndex
CREATE INDEX "StudentSession_token_idx" ON "StudentSession"("token");

-- CreateIndex
CREATE INDEX "StudentSession_studentId_idx" ON "StudentSession"("studentId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_touristId_idx" ON "User"("touristId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "ContactMessage_email_idx" ON "ContactMessage"("email");

-- CreateIndex
CREATE INDEX "ContactMessage_status_idx" ON "ContactMessage"("status");

-- CreateIndex
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

-- AddForeignKey
ALTER TABLE "StudentAvailability" ADD CONSTRAINT "StudentAvailability_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnavailabilityException" ADD CONSTRAINT "UnavailabilityException_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TouristRequest" ADD CONSTRAINT "TouristRequest_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSelection" ADD CONSTRAINT "RequestSelection_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TouristRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestSelection" ADD CONSTRAINT "RequestSelection_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "TouristRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
