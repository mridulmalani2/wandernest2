# TourWiseCo Student Registration - Quick Reference Guide

## Key File Locations

### Student Onboarding Components
- **Main Wizard**: `/home/user/tourwiseco/components/student/OnboardingWizard.tsx`
- **Step 1 - Basic Profile**: `/home/user/tourwiseco/components/student/BasicProfileStep.tsx`
- **Step 2 - Verification**: `/home/user/tourwiseco/components/student/StudentVerificationStep.tsx`
- **Step 3 - Cover Letter**: `/home/user/tourwiseco/components/student/CoverLetterStep.tsx`
- **Step 4 - Availability**: `/home/user/tourwiseco/components/student/AvailabilityStep.tsx`
- **Step 5 - Review**: `/home/user/tourwiseco/components/student/ReviewSubmitStep.tsx`

### Student Pages
- **Sign In**: `/home/user/tourwiseco/app/student/signin/page.tsx`
- **Onboarding**: `/home/user/tourwiseco/app/student/onboarding/page.tsx`
- **Onboarding Success**: `/home/user/tourwiseco/app/student/onboarding/success/page.tsx`
- **Dashboard**: `/home/user/tourwiseco/app/student/dashboard/page.tsx`

### API Routes
- **Auth Initiate**: `/home/user/tourwiseco/app/api/student/auth/initiate/route.ts`
- **Auth Verify**: `/home/user/tourwiseco/app/api/student/auth/verify/route.ts`
- **Auth Session**: `/home/user/tourwiseco/app/api/student/auth/session/route.ts`
- **File Upload**: `/home/user/tourwiseco/app/api/student/upload/route.ts`
- **Onboarding Submit**: `/home/user/tourwiseco/app/api/student/onboarding/route.ts`
- **Admin Pending**: `/home/user/tourwiseco/app/api/admin/students/pending/route.ts`
- **Admin Approve/Reject**: `/home/user/tourwiseco/app/api/admin/students/approve/route.ts`

### Database & Models
- **Prisma Schema**: `/home/user/tourwiseco/prisma/schema.prisma`
- **Prisma Client**: `/home/user/tourwiseco/lib/prisma.ts`

### Authentication & Utilities
- **Auth Utilities**: `/home/user/tourwiseco/lib/auth.ts`
- **Email Service**: `/home/user/tourwiseco/lib/email.ts`
- **Redis Cache**: `/home/user/tourwiseco/lib/redis.ts`
- **Utilities**: `/home/user/tourwiseco/lib/utils.ts`
- **Middleware**: `/home/user/tourwiseco/lib/middleware.ts`

### Configuration
- **Environment Variables**: `/home/user/tourwiseco/.env.example`
- **Package Dependencies**: `/home/user/tourwiseco/package.json`
- **Tailwind Config**: `/home/user/tourwiseco/tailwind.config.ts`
- **TypeScript Config**: `/home/user/tourwiseco/tsconfig.json`
- **Next.js Config**: `/home/user/tourwiseco/next.config.js`

---

## Critical Implementation Details

### Data Models
- **Student**: Core registration data with PENDING_APPROVAL/APPROVED/SUSPENDED status
- **StudentAvailability**: Weekly schedule with day/time and optional notes
- **StudentSession**: Email verification tokens (30-day expiration)
- **RequestSelection**: Links between students and tourist requests

### Validation
- **Frontend**: React state + manual validation in OnboardingWizard
- **Backend**: Zod schema validation in API routes
- **File Upload**: Type (JPG/PNG/WebP/PDF) + size (5MB max) validation

### File Storage
- **Method**: Base64 data URLs (no filesystem)
- **Field**: Student.idCardUrl
- **Why**: Vercel serverless read-only filesystem

### Email System
- **Provider**: Nodemailer (SMTP)
- **Mode**: Mock by default (logs to console)
- **Templates**: HTML with gradients and responsive design
- **Verification**: 6-digit code with 10-minute TTL

### Authentication
- **Method**: Email verification code
- **Domain**: Institutional emails only (.edu, .edu.in, .ac.uk, etc.)
- **Session**: Random 32-byte hex token
- **Expiration**: 30 days
- **Storage**: localStorage + cookies

### Availability Rules
- **Duration**: Minimum 3 hours per slot
- **Overlap**: No overlapping on same day
- **Format**: 24-hour time (HH:MM)
- **Weekly**: Repeating schedule

---

## Common Tasks

### Adding a New Form Field
1. Add to OnboardingFormData type in OnboardingWizard.tsx
2. Add to onboardingSchema in /api/student/onboarding/route.ts
3. Add input to appropriate step component
4. Add server-side handling in onboarding API route
5. Add database field to Student model in schema.prisma

### Modifying Validation Rules
- **Client**: Update validateStep() in OnboardingWizard.tsx
- **Server**: Update Zod schema in API route

### Changing File Upload Rules
- Modify validTypes array in StudentVerificationStep.tsx
- Modify validTypes array in /api/student/upload/route.ts
- Update maxSize constant in both files

### Updating Available Cities
- Modify CITIES constant in OnboardingWizard.tsx (line 53)
- Add to city dropdown in BasicProfileStep.tsx

### Changing Email Templates
- Edit templates in /lib/email.ts
- Each function handles a specific email type
- Mock mode: Change line 10 from `true` to `false` to actually send emails

### Adding Admin Features
- Create new route in /api/admin/
- Use verifyAdmin() middleware for auth
- Follow pattern in /api/admin/students/pending/route.ts

---

## Environment Variables (from .env.example)

```
# Database
DATABASE_URL=postgresql://...

# Redis (optional, for verification codes)
REDIS_URL=redis://...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@tourwiseco.com
MOCK_EMAIL=true

# Authentication
JWT_SECRET=your-secret-key-change-in-production
VERIFICATION_CODE_EXPIRY=600

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Razorpay (payment)
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Feature Flags
GOOGLE_AUTH_BYPASS=false
```

---

## Testing Checklist

### Authentication
- [ ] Email verification code email received (mock mode)
- [ ] Code validation with 3-attempt limit
- [ ] Session token creation and storage
- [ ] Session expiration (30 days)

### Form Validation
- [ ] All required fields enforced
- [ ] Cover letter minimum 200 chars
- [ ] Availability slot minimum 3 hours
- [ ] No overlapping availability slots
- [ ] Zod validation errors returned correctly

### File Upload
- [ ] File type validation (JPG/PNG/WebP/PDF only)
- [ ] File size validation (max 5MB)
- [ ] Base64 conversion works
- [ ] Data URL preview displays correctly

### Database
- [ ] Student record created with PENDING_APPROVAL status
- [ ] StudentAvailability records created correctly
- [ ] Email verification stored in StudentSession

### Admin
- [ ] Pending students list displays correctly
- [ ] Approve/reject functionality updates status
- [ ] Only approved students appear to tourists

---

## Performance Considerations

1. **Image Compression**: Consider compressing base64 images before storage
2. **Database Indexing**: Indexes on email, city, nationality, status already in schema
3. **Redis**: Optional but recommended for verification codes (improves performance)
4. **Email Throttling**: Consider rate limiting on verification email requests
5. **Session Cleanup**: Consider adding a cron job to delete expired sessions

---

## Security Notes

1. **Email Validation**: Institutional domains only (no free email providers)
2. **File Uploads**: Server-side type and size validation (don't trust client)
3. **Verification Code**: 10-minute expiration, 3 attempt limit
4. **Admin Auth**: Protected with verifyAdmin() middleware
5. **CORS**: Configure appropriately for production
6. **SQL Injection**: Protected by Prisma ORM
7. **XSS**: Prevented by React's default escaping + DOMPurify for user input

---

## Troubleshooting

### Verification Code Not Received
- Check MOCK_EMAIL is set to false in .env
- Check EMAIL_HOST, EMAIL_USER, EMAIL_PASS configured
- Check EMAIL_FROM configured with valid sender address
- Look in console if MOCK_EMAIL=true (code logged there)

### Session Validation Fails
- Check token stored in localStorage as `student_token`
- Check StudentSession record exists in database
- Check session hasn't expired (30 days)
- Verify email is marked as verified

### File Upload Fails
- Check file type is in validTypes array
- Check file size is under 5MB
- Check disk space (base64 is ~33% larger than binary)

### Availability Slot Not Saving
- Check slot duration >= 3 hours
- Check no overlaps with existing slots
- Check dayOfWeek is 0-6 (Sunday-Saturday)

---

## Future Enhancement Ideas

1. Profile picture upload (separate from student ID)
2. Multi-language support for UI
3. Student ID verification automation (OCR/ML)
4. Stripe/PayPal integration for student fees
5. Bulk student import/export for admins
6. Student status change notifications
7. Application withdrawal feature
8. Reapplication after rejection
9. Profile editing after approval
10. Availability bulk upload/import
