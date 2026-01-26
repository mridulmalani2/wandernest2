-- Add persistent lockout tracking for Student
ALTER TABLE "Student"
ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockoutUntil" TIMESTAMP(3),
ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3);

-- Add persistent lockout tracking for Admin
ALTER TABLE "Admin"
ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lockoutUntil" TIMESTAMP(3),
ADD COLUMN "lastFailedLoginAt" TIMESTAMP(3);

-- Replace plaintext OTP with HMAC storage and attempts tracking
ALTER TABLE "StudentOtp"
ADD COLUMN "otpHmac" TEXT NOT NULL DEFAULT '',
ADD COLUMN "otpAttempts" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "StudentOtp"
DROP COLUMN "code";
