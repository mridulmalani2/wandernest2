# TourWiseCo Student Registration Implementation - Codebase Exploration

## Executive Summary

TourWiseCo is a Next.js 14 application that enables international students to become local tour guides. The student registration system is a multi-step onboarding wizard that collects personal information, verifies student status, gathers expertise, and sets availability schedules.

---

## 1. TECH STACK

### Frontend
- **Framework**: Next.js 14.0.4 (React 18.2)
- **Styling**: Tailwind CSS 3.3
- **UI Components**: Radix UI (Checkbox, Dialog, Label, Radio Groups, Select, Slider)
- **Form Management**: React Hook Form 7.49
- **Validation**: Zod 3.22 (schema validation)
- **Icons**: Lucide React 0.294
- **Date Utilities**: Date-fns 3.0
- **HTTP Client**: Native Fetch API

### Backend
- **Runtime**: Node.js (Next.js API Routes)
- **Database**: PostgreSQL (via Prisma)
- **ORM**: Prisma 6.19
- **Authentication**: Custom email/token-based system + NextAuth 4.24 (for legacy Google OAuth)
- **Session Management**: JWT tokens + custom StudentSession model
- **Caching**: Redis/ioredis 5.3.2 (for verification codes)
- **Email**: Nodemailer 7.0
- **Crypto**: bcrypt 6.0 for password hashing

### Infrastructure
- **Deployment**: Vercel (serverless functions)
- **Payment**: Razorpay 2.9.6
- **File Handling**: Base64 encoding for serverless compatibility

---

## 2. DATABASE SCHEMA (Prisma)

### Core Student Model
```
Student {
  id: String (CUID)
  email: String (unique)
  emailVerified: Boolean
  googleId: String? (unique, optional)
  
  // Profile Information
  name: String?
  gender: String? (male, female, prefer_not_to_say)
  nationality: String?
  institute: String?
  city: String?
  idCardUrl: String? (stored as base64 data URL)
  
  // Content
  coverLetter: String? (Text field, min 200 chars)
  languages: String[] (array of language codes)
  interests: String[] (array of interest tags)
  bio: String? (optional, Text field)
  
  // Status & Metrics
  status: StudentStatus (PENDING_APPROVAL, APPROVED, SUSPENDED)
  tripsHosted: Int
  averageRating: Float?
  noShowCount: Int
  acceptanceRate: Float?
  reliabilityBadge: String? (bronze, silver, gold)
  priceRange: Json? ({min, max})
  
  // Relations
  availability: StudentAvailability[]
  requestSelections: RequestSelection[]
  reviews: Review[]
  reports: Report[]
  
  createdAt: DateTime
  updatedAt: DateTime
  
  // Indexes
  @@index([city])
  @@index([nationality])
  @@index([status])
  @@index([email])
}

StudentAvailability {
  id: String
  studentId: String
  dayOfWeek: Int (0-6, Sunday-Saturday)
  startTime: String (HH:MM format, e.g., "09:00")
  endTime: String (HH:MM format)
  note: String? (e.g., "Not available during exams")
  student: Student
  
  @@index([studentId])
}

StudentStatus Enum {
  PENDING_APPROVAL
  APPROVED
  SUSPENDED
}
```

### Related Models Used in Registration
- **StudentSession**: Email verification tokens with 30-day expiration
- **RequestSelection**: Links students to tourist requests
- **Review**: Tourist reviews of student guides
- **Report**: Student incident reports

---

## 3. MODELS & SCHEMAS

### Student Registration Schema (Zod - API validation)
**File**: `/home/user/tourwiseco/app/api/student/onboarding/route.ts`

```typescript
const onboardingSchema = z.object({
  email: z.string().email(),
  googleId: z.string(),
  name: z.string().min(1),
  gender: z.enum(['male', 'female', 'prefer_not_to_say']),
  nationality: z.string().min(1),
  institute: z.string().min(1),
  city: z.string().min(1),
  idCardUrl: z.string().min(1),
  coverLetter: z.string().min(200), // Minimum 200 characters
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
```

### OnboardingFormData Type (Client-side)
**File**: `/home/user/tourwiseco/components/student/OnboardingWizard.tsx`

```typescript
type OnboardingFormData = {
  // Step 1: Basic Profile
  name: string;
  gender: 'male' | 'female' | 'prefer_not_to_say' | '';
  nationality: string;
  institute: string;
  city: string;

  // Step 2: Student Verification
  idCardFile: File | null;
  idCardPreview: string; // Data URL for preview
  studentConfirmation: boolean;

  // Step 3: Cover Letter
  coverLetter: string;
  languages: string[];
  interests: string[];
  bio?: string;

  // Step 4: Availability
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    note?: string;
  }>;
  unavailableNotes?: string;
};
```

### Authentication Schemas

**Student Email Verification** (`/api/student/auth/initiate`):
```typescript
const initiateSchema = z.object({
  email: z.string().email('Invalid email address'),
});
```

**Verification Code Submission** (`/api/student/auth/verify`):
```typescript
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});
```

### Validation Email Domains
Allowed: `.edu`, `.edu.in`, `.ac.uk`, `.edu.au`, `.edu.sg`, `.ac.in`

---

## 4. FILE UPLOAD HANDLING

### Upload API Route
**File**: `/home/user/tourwiseco/app/api/student/upload/route.ts`

#### Features:
- **Allowed Formats**: JPG, PNG, WebP, PDF
- **Max File Size**: 5MB
- **Storage Method**: Base64 encoding (no filesystem)
- **Returns**: Data URL (`data:mime/type;base64,<data>`)

#### Client-Side Upload (OnboardingWizard):
1. File selected in StudentVerificationStep
2. Client-side validation: type & size check
3. Preview created using URL.createObjectURL()
4. On form submit: FormData sent to `/api/student/upload`
5. Response contains data URL stored in idCardUrl field
6. Data URL sent to `/api/student/onboarding`

#### Why Base64?
- Vercel serverless: read-only filesystem
- Database storage: Direct storage as text field
- No external CDN/S3 configuration needed

---

## 5. STUDENT REGISTRATION PAGES & COMPONENTS

### Page Structure
```
/home/user/tourwiseco/app/student/
├── onboarding/
│   ├── page.tsx              # Main entry, session validation
│   └── success/
│       └── page.tsx          # Confirmation page
├── signin/
│   └── page.tsx              # Email verification flow
├── dashboard/
│   └── page.tsx              # Student dashboard (after approval)
└── page.tsx                  # Student home
```

### Onboarding Components
**File**: `/home/user/tourwiseco/components/student/`

1. **OnboardingWizard.tsx** (Main container)
   - 5-step wizard with progress indicator
   - Form data state management
   - Client-side validation per step
   - File upload orchestration
   - Final submission

2. **BasicProfileStep.tsx** (Step 1)
   - Name input
   - Gender radio group
   - Nationality text input
   - Educational institute text input
   - City dropdown (Paris, London)

3. **StudentVerificationStep.tsx** (Step 2)
   - File upload with drag-and-drop capability
   - File preview (image or PDF)
   - Upload requirements checklist
   - Student enrollment confirmation checkbox
   - Privacy notice

4. **CoverLetterStep.tsx** (Step 3)
   - Cover letter textarea (min 200 chars)
   - Language selection (predefined + custom)
   - Interest/expertise selection (predefined + custom)
   - Optional bio field
   - Character counter

5. **AvailabilityStep.tsx** (Step 4)
   - Day-of-week selector (Sunday-Saturday)
   - Time range selector (00:00-23:00)
   - Minimum 3-hour slot validation
   - Overlap detection
   - Optional notes for each slot
   - Weekly schedule display

6. **ReviewSubmitStep.tsx** (Step 5)
   - Read-only review of all data
   - Grouped display by section
   - File preview
   - Next steps explanation
   - Final confirmation statement

### Student Sign-in Page
**File**: `/home/user/tourwiseco/app/student/signin/page.tsx`
- Email input with institutional domain validation
- 6-digit verification code entry
- Verification attempt limiting (3 attempts max)
- Redirect to onboarding or dashboard based on completion status

### Student Onboarding Success Page
**File**: `/home/user/tourwiseco/app/student/onboarding/success/page.tsx`
- Congratulations message
- Timeline showing review process
- Expected approval timeframe
- Links to dashboard/FAQ
- Background imagery

---

## 6. VALIDATION LOGIC

### Client-Side Validation (OnboardingWizard.tsx)

**Step 1 - Basic Profile:**
- Name: Non-empty required
- Gender: Selection required
- Nationality: Non-empty required
- Institute: Non-empty required
- City: Selection required

**Step 2 - Student Verification:**
- ID Card: File must be uploaded
- Confirmation: Checkbox must be checked

**Step 3 - Cover Letter:**
- Cover Letter: Min 200 characters
- Languages: At least one required
- Interests: At least one required

**Step 4 - Availability:**
- At least one time slot required
- Each slot: min 3 hours duration
- No overlapping slots on same day

**Time Validation Logic:**
```typescript
// Duration calculation
const duration = (endMinutes) - (startMinutes);
// Must be >= 180 minutes (3 hours)

// Overlap detection
const overlapping = availability.some(slot => {
  if (slot.dayOfWeek !== selectedDay) return false;
  return (newStart >= slot.start && newStart < slot.end) ||
         (newEnd > slot.start && newEnd <= slot.end) ||
         (newStart <= slot.start && newEnd >= slot.end);
});
```

### Server-Side Validation (Zod)
- Email format validation
- Enum value validation for gender
- Array length validation (min 1 for languages/interests)
- String length validation (coverLetter min 200)
- Number range validation for dayOfWeek (0-6)

### File Upload Validation
```typescript
// Allowed types
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

// File size: max 5MB
const maxSize = 5 * 1024 * 1024;

// Name matching: enforced in UI, verified by admin
```

### Email Verification
- Domain-based validation on backend
- 6-digit code generation and storage in Redis
- 10-minute TTL on verification codes
- 3 verification attempt limit
- Case-insensitive email handling

---

## 7. API ROUTES & AUTHENTICATION

### Student Authentication Flow

**1. Initiate Auth** → `POST /api/student/auth/initiate`
```
Input: { email: string }
Process:
  - Validate student email domain (.edu, .edu.in, etc)
  - Generate 6-digit code
  - Store in Redis with 10-min TTL
  - Send verification email
Output: { success: true, email, message }
```

**2. Verify Email** → `POST /api/student/auth/verify`
```
Input: { email: string, code: string }
Process:
  - Validate code against Redis
  - Check attempt count (max 3)
  - Find or create Student record
  - Create StudentSession with 30-day expiration
  - Generate JWT-like token
Output: { 
  success: true, 
  token, 
  studentId, 
  hasCompletedOnboarding,
  redirectTo
}
```

**3. Validate Session** → `GET /api/student/auth/session`
```
Input: Authorization Bearer token
Process:
  - Find StudentSession by token
  - Check expiration
  - Verify email status
  - Calculate hasCompletedOnboarding based on profile fields
Output: { 
  success: true, 
  session, 
  student: {
    id, email, name, city, status, hasCompletedOnboarding
  }
}
```

### Student Onboarding Routes

**Submit Onboarding** → `POST /api/student/onboarding`
```
Input: Complete OnboardingFormData (validated with Zod)
Process:
  - Check email/googleId not already registered
  - Create Student record
  - Create StudentAvailability records
  - Set status to PENDING_APPROVAL
Output: { success: true, studentId, message }
```

**Upload File** → `POST /api/student/upload`
```
Input: FormData { file: File, type: string }
Process:
  - Validate file type and size
  - Convert to base64
  - Create data URL
Output: { success: true, url: dataUrl, filename }
```

### Admin Approval Routes

**Get Pending Students** → `GET /api/admin/students/pending`
```
Auth: Admin verification required
Output: Array of students with status PENDING_APPROVAL
```

**Approve/Reject Student** → `POST /api/admin/students/approve`
```
Input: { studentId: string, action: 'approve'|'reject' }
Process:
  - Update Student.status to APPROVED or SUSPENDED
  - Send notification email
Output: { success: true, student }
```

---

## 8. AUTHENTICATION & SESSION MANAGEMENT

### Session Storage
- **Database**: StudentSession model with 30-day expiration
- **Token Format**: Random hex string (32 bytes)
- **Client Storage**: localStorage (`student_token`) + cookie (`student_token`)
- **Transmission**: Authorization header (`Bearer <token>`) or cookie

### Session Validation Flow
1. Client stores token in localStorage on verification
2. OnboardingWizard retrieves token from localStorage/cookie
3. Validates with `/api/student/auth/session`
4. Checks expiration and email verification status
5. Determines onboarding completion status
6. Redirects accordingly

### JWT Tokens (Legacy/Passwords)
- **Location**: `/lib/auth.ts`
- **Functions**: generateToken, verifyToken, hashPassword, verifyPassword
- **Secret**: JWT_SECRET env var
- **Used for**: Admin authentication, password-based auth

---

## 9. EMAIL & NOTIFICATIONS

### Email Service
**File**: `/lib/email.ts` using Nodemailer

### Transactional Emails

1. **Student Verification Email**
   - Sent to: Student's institutional email
   - Content: 6-digit verification code
   - Expiration: 10 minutes
   - Template: Styled HTML with gradient header

2. **Student Request Notification**
   - Sent when: Tourist selects student as potential guide
   - Content: Trip details, city, dates, tourist requirements
   - CTA: Accept/View dashboard button
   - Contains: Urgency note (first-come-first-served)

3. **Tourist Acceptance Notification**
   - Sent when: Student accepts tourist request
   - Content: Guide profile, contact details, next steps
   - Includes: Guide's contact info, meeting recommendations

4. **Student Confirmation Email**
   - Sent to: Student after accepting
   - Content: Tourist contact details, next steps checklist
   - Purpose: Provide tourist's contact info for direct communication

5. **Booking Confirmation**
   - Sent to: Tourist after request submission
   - Content: Request ID, matching timeline
   - Next steps: Guides will respond with proposals

### Mock Email Mode
- **Enabled by**: `MOCK_EMAIL=true` (default in dev)
- **Behavior**: Logs email content to console instead of sending
- **Verification Code**: Displayed in CLI for testing

---

## 10. REDIS CACHING

**File**: `/lib/redis.ts`

### Verification Code Storage
```
Key: verification:{email}
Value: { code: string, attempts: number }
TTL: 600 seconds (10 minutes)
```

### Operations
- `storeVerificationCode(email, code, ttl)`: Store with TTL
- `getVerificationData(email)`: Retrieve stored code and attempts
- `incrementVerificationAttempts(email)`: Track failed attempts
- `deleteVerificationCode(email)`: Remove after successful verification

### Fallback
- If Redis unavailable: Warning logged, functionality continues
- Verification codes not persisted without Redis

---

## 11. KEY FEATURES & WORKFLOWS

### Onboarding Workflow
```
1. Student visits /student/signin
2. Enters institutional email
3. Receives 6-digit code via email
4. Verifies code (3 attempts allowed)
5. Redirected to /student/onboarding
6. Completes 5-step wizard
7. File uploaded as base64
8. All data submitted to backend
9. Student marked PENDING_APPROVAL
10. Admin reviews application
11. Approved students become visible to tourists
```

### Student Status Flow
```
New Registration
        ↓
PENDING_APPROVAL (after onboarding submission)
        ↓
      ├─→ APPROVED (admin approves)
      │        ↓
      │   Can receive requests
      │   Can accept/reject requests
      │   Build reputation via reviews
      │
      └─→ SUSPENDED (admin rejects)
             ↓
          Cannot receive requests
```

### Availability Slot Rules
- **Duration**: Minimum 3 hours (aligned with typical tour duration)
- **Overlaps**: Prevented on same day
- **Format**: HH:MM time format (24-hour)
- **Notes**: Optional context (exams, holidays, etc.)
- **Weekly**: Repeating schedule that can be updated

### File Upload Rules
- **Student ID Card**: JPG/PNG/WebP/PDF only
- **Size**: Max 5MB
- **Verification**: Manual review by admin
- **Privacy**: Not shared with tourists
- **Storage**: Base64 in database (Vercel-compatible)

---

## 12. KEY CONFIGURATION & CONSTANTS

### Cities Available
- Paris
- London

### Languages (Predefined)
```
English, French, Spanish, German, Italian, Portuguese,
Chinese (Mandarin), Chinese (Cantonese), Japanese, Korean,
Arabic, Hindi, Bengali, Russian, Turkish
```
+ Custom language input allowed

### Interests/Expertise (Predefined)
```
Food & Dining, Museums & Art, Architecture, History, Shopping,
Nightlife, Parks & Nature, Photography, Local Markets, Music,
Street Art, Cafes & Coffee, Wine & Bars, Sports, Fashion
```
+ Custom interest input allowed

### Gender Options
- Male
- Female
- Prefer not to say

### Verification Attempt Limits
- **Max Attempts**: 3
- **Code Expiration**: 10 minutes
- **Session Duration**: 30 days

---

## 13. DIRECTORY STRUCTURE

```
/home/user/tourwiseco/
├── app/
│   ├── student/
│   │   ├── onboarding/
│   │   │   ├── page.tsx           # Onboarding page
│   │   │   └── success/
│   │   │       └── page.tsx       # Success confirmation
│   │   ├── signin/
│   │   │   └── page.tsx           # Email verification
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Student dashboard
│   │   └── page.tsx               # Student home
│   └── api/
│       ├── student/
│       │   ├── auth/
│       │   │   ├── initiate/route.ts   # Email verification initiation
│       │   │   ├── verify/route.ts     # Code verification
│       │   │   └── session/route.ts    # Session validation
│       │   ├── onboarding/route.ts     # Submit onboarding data
│       │   ├── upload/route.ts         # File upload endpoint
│       │   ├── dashboard/route.ts      # Fetch student dashboard
│       │   └── requests/                # Accept/reject tourist requests
│       └── admin/students/
│           ├── pending/route.ts        # Get pending approvals
│           └── approve/route.ts        # Approve/reject students
├── components/
│   ├── student/
│   │   ├── OnboardingWizard.tsx
│   │   ├── BasicProfileStep.tsx
│   │   ├── StudentVerificationStep.tsx
│   │   ├── CoverLetterStep.tsx
│   │   ├── AvailabilityStep.tsx
│   │   └── ReviewSubmitStep.tsx
│   ├── tourist/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── auth.ts              # JWT/password utilities
│   ├── auth-options.ts      # NextAuth config
│   ├── email.ts             # Email sending
│   ├── redis.ts             # Verification code storage
│   ├── prisma.ts            # Database client
│   ├── middleware.ts        # Auth middleware
│   └── utils.ts             # Helper functions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration files
├── types/
│   ├── index.ts             # TypeScript type definitions
│   └── next-auth.d.ts       # NextAuth types
├── public/
│   └── images/              # Static images
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 14. DEPENDENCIES SUMMARY

### Core Framework & UI
- next@14.0.4
- react@18.2.0
- react-dom@18.2.0
- tailwindcss@3.3.0
- radix-ui components (Checkbox, Dialog, Label, Radio, Select, Slider)

### Forms & Validation
- react-hook-form@7.49.2
- zod@3.22.4

### Authentication & Sessions
- next-auth@4.24.13
- @auth/prisma-adapter@2.11.1
- jsonwebtoken@9.0.2
- bcrypt@6.0.0

### Database & Caching
- @prisma/client@6.19.0
- prisma@6.19.0
- ioredis@5.3.2

### Email & External Services
- nodemailer@7.0.10
- razorpay@2.9.6

### Utilities
- date-fns@3.0.0
- lucide-react@0.294.0
- clsx@2.0.0
- tailwind-merge@2.1.0

---

## 15. IMPORTANT NOTES & GOTCHAS

### Vercel Serverless Constraints
- **File System**: Read-only
- **Solution**: Store files as base64 data URLs
- **Impact**: No traditional file storage; all uploads in database

### Session Checking
- **Onboarding Page**: Validates session before showing form
- **Redirect**: To sign-in if invalid; to dashboard if already completed
- **Storage**: token in localStorage + cookies

### Email Verification
- **Domain Validation**: Server-side only (client accepts any email format)
- **Institutional Domains**: .edu, .edu.in, .ac.uk, .edu.au, .edu.sg, .ac.in
- **Mock Mode**: Enabled by default in development (logs to console)

### Availability Slots
- **Duration**: Strictly >= 3 hours
- **Overlap Prevention**: Client-side validation only
- **Future Enhancement**: Backend overlap detection could be added

### Student Completion Status
- **Definition**: name AND city AND institute AND nationality AND gender AND coverLetter
- **Location**: Checked in frontend & multiple API routes
- **Redirect**: Different routes based on completion status

### File Upload Handling
- **Client Validation**: Type & size checked before upload
- **Server Validation**: Repeated for security
- **Data URL**: Returned from upload endpoint for immediate preview
- **Storage**: Sent as idCardUrl string in onboarding submission

### Error Handling
- **Client**: Displayed in error messages
- **Server**: Zod validation errors + custom business logic errors
- **Submission**: Error survives page navigation (shown in UI)

---

## 16. NEXT STEPS FOR DEVELOPMENT

### Potential Enhancements
1. Add student dashboard with availability management
2. Implement admin panel for reviewing pending applications
3. Add profile picture upload support
4. Implement email notifications for approval status
5. Add multi-city support configuration
6. Implement application withdrawal feature
7. Add profile editing after approval
8. Implement soft-delete for applications
9. Add file storage provider integration (S3, Cloudinary)
10. Implement student deactivation feature

### Testing Considerations
- Mock email mode for verification code testing
- Verification code TTL testing (10 min expiry)
- Attempt limiting (3 max attempts)
- Overlap detection in availability slots
- File upload size/type validation
- Zod schema validation edge cases
- Session expiration (30 days)
- Double-booking prevention
- Admin approval workflow

