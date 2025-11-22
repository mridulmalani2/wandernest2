# TourWiseCo

A comprehensive platform connecting travelers with local student guides. TourWiseCo enables tourists to request personalized guided experiences while providing international students with opportunities to earn income by sharing their local knowledge.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Features & User Flows](#key-features--user-flows)
- [Data & Backend](#data--backend)
- [Authentication](#authentication)
- [Getting Started](#getting-started)
- [Development Commands](#development-commands)
- [Branching & Contribution Workflow](#branching--contribution-workflow)
- [Deployment](#deployment)

## Project Overview

TourWiseCo is a dual-sided marketplace platform built with Next.js 14 that connects:
- **Tourists**: Travelers looking for authentic local experiences and personalized guidance
- **Students**: International students seeking flexible income opportunities by offering guided tours and local expertise

The platform handles the complete journey from booking requests through matching, payment processing, and post-experience reviews.

## Tech Stack

### Core Framework
- **Next.js 14.2.15** - React framework with App Router and Server Components
- **TypeScript 5** - Type safety across the codebase
- **React 18.3.1** - UI library

### Database & ORM
- **PostgreSQL** - Primary database
- **Prisma 6.19.0** - Type-safe ORM with migrations
- **Redis (ioredis)** - Session caching and verification codes (optional)

### Authentication
- **NextAuth.js 4.24.13** - OAuth and session management
- **JWT (jsonwebtoken)** - Custom token-based auth for students
- **bcryptjs** - Password hashing for admin accounts

### UI Components
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled component primitives:
  - Dialog, Select, Checkbox, Radio Group, Slider, Label
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant styling
- **tailwind-merge & clsx** - Conditional class merging

### Forms & Validation
- **React Hook Form 7.49.2** - Form state management
- **Zod 3.22.4** - Schema validation

### Payment Processing
- **Razorpay 2.9.6** - Payment gateway integration

### Additional Tools
- **Nodemailer 7.0.10** - Email verification and notifications
- **Vercel Blob** - File uploads (student IDs, photos)
- **Vercel Analytics & Speed Insights** - Performance monitoring
- **date-fns 3.0** - Date manipulation

### Development Tools
- **ESLint** - Code linting
- **Bundle Analyzer** - Build optimization analysis
- **Critters & cssnano** - CSS optimization

## Project Structure

```
tourwiseco/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   │
│   │   ├── booking/                  # Tourist booking flow
│   │   │   ├── page.tsx              # Multi-step booking form
│   │   │   ├── pending/page.tsx      # Awaiting email verification
│   │   │   ├── select-guide/page.tsx # Guide selection from matches
│   │   │   └── success/page.tsx      # Booking confirmed
│   │   │
│   │   ├── tourist/                  # Tourist-specific pages
│   │   │   ├── page.tsx              # Tourist landing/info
│   │   │   ├── signin/page.tsx       # Google OAuth signin
│   │   │   └── dashboard/page.tsx    # View requests & bookings
│   │   │
│   │   ├── student/                  # Student-specific pages
│   │   │   ├── page.tsx              # Student landing/info
│   │   │   ├── signin/page.tsx       # Email verification signin
│   │   │   ├── onboarding/
│   │   │   │   ├── page.tsx          # Multi-step onboarding wizard
│   │   │   │   └── success/page.tsx  # Onboarding complete
│   │   │   └── dashboard/page.tsx    # View requests, bookings, earnings
│   │   │
│   │   ├── matches/
│   │   │   └── [requestId]/page.tsx  # View matched students for a request
│   │   │
│   │   ├── payment/                  # Payment pages
│   │   │   ├── discovery-fee/page.tsx # Discovery fee payment
│   │   │   ├── success/page.tsx      # Payment successful
│   │   │   └── failed/page.tsx       # Payment failed
│   │   │
│   │   ├── admin/                    # Admin portal
│   │   │   ├── login/page.tsx        # Admin login
│   │   │   ├── approvals/page.tsx    # Approve student profiles
│   │   │   ├── students/page.tsx     # Manage students
│   │   │   ├── reports/page.tsx      # Handle reports
│   │   │   └── analytics/page.tsx    # Platform analytics
│   │   │
│   │   └── api/                      # API routes
│   │       ├── auth/[...nextauth]/   # NextAuth handler
│   │       ├── cities/               # Get available cities
│   │       ├── matches/              # Matching algorithm
│   │       ├── reviews/              # Review CRUD
│   │       ├── payment/              # Razorpay integration
│   │       │   ├── create-order/
│   │       │   ├── verify/
│   │       │   └── status/
│   │       ├── tourist/              # Tourist APIs
│   │       │   ├── bookings/
│   │       │   ├── dashboard/
│   │       │   └── request/          # Request lifecycle
│   │       │       ├── initiate/     # Start booking, send verification
│   │       │       ├── verify/       # Verify email code
│   │       │       ├── create/       # Create request
│   │       │       ├── status/       # Check request status
│   │       │       ├── match/        # Get matches
│   │       │       └── select/       # Select guide
│   │       ├── student/              # Student APIs
│   │       │   ├── auth/             # Email verification auth
│   │       │   │   ├── initiate/
│   │       │   │   ├── verify/
│   │       │   │   └── session/
│   │       │   ├── onboarding/       # Complete profile
│   │       │   ├── dashboard/        # Dashboard data
│   │       │   ├── upload/           # File uploads
│   │       │   └── requests/         # Accept/reject requests
│   │       │       ├── accept/
│   │       │       └── reject/
│   │       └── admin/                # Admin APIs
│   │           ├── login/
│   │           ├── students/         # Student management
│   │           │   ├── pending/
│   │           │   ├── approve/
│   │           │   └── bulk-approve/
│   │           ├── reports/          # Report handling
│   │           └── analytics/        # Analytics data
│   │
│   ├── components/                   # React components
│   │   ├── Navigation.tsx            # Main navigation
│   │   ├── DynamicNavigation.tsx     # Context-aware nav
│   │   ├── ThemeProvider.tsx         # Dark mode support
│   │   ├── ThemeToggle.tsx
│   │   ├── GuideCard.tsx             # Student profile card
│   │   ├── GuideSelection.tsx        # Guide selection UI
│   │   │
│   │   ├── booking/                  # Booking flow components
│   │   │   ├── BookingForm.tsx       # Main form container
│   │   │   ├── TripDetailsStep.tsx   # Step 1: City, dates, guests
│   │   │   ├── PreferencesStep.tsx   # Step 2: Languages, interests
│   │   │   ├── ContactStep.tsx       # Step 3: Contact info
│   │   │   └── VerificationModal.tsx # Email verification modal
│   │   │
│   │   ├── student/                  # Student onboarding components
│   │   │   ├── OnboardingWizard.tsx  # Main wizard container
│   │   │   ├── BasicProfileStep.tsx  # Personal details
│   │   │   ├── StudentVerificationStep.tsx # ID uploads
│   │   │   ├── CoverLetterStep.tsx   # Bio and cover letter
│   │   │   ├── ServicePreferencesStep.tsx # Services offered
│   │   │   ├── AvailabilityStep.tsx  # Schedule & pricing
│   │   │   ├── SafetyComplianceStep.tsx # Terms & emergency contact
│   │   │   └── ReviewSubmitStep.tsx  # Review before submit
│   │   │
│   │   ├── tourist/                  # Tourist components
│   │   │   └── StudentProfileCard.tsx # Display student profiles
│   │   │
│   │   ├── admin/                    # Admin components
│   │   │   ├── AdminNav.tsx          # Admin navigation
│   │   │   └── ApprovalQueue.tsx     # Student approval queue
│   │   │
│   │   ├── cta/                      # Call-to-action components
│   │   │   ├── CTATileBase.tsx       # Base CTA component
│   │   │   ├── TouristCTA.tsx        # Tourist CTA
│   │   │   └── StudentCTA.tsx        # Student CTA
│   │   │
│   │   └── ui/                       # Reusable UI primitives
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── checkbox.tsx
│   │       ├── radio-group.tsx
│   │       ├── slider.tsx
│   │       ├── dialog.tsx
│   │       ├── textarea.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── alert.tsx
│   │       ├── skeleton.tsx
│   │       └── spinner.tsx
│   │
│   ├── lib/                          # Shared utilities & configs
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── redis.ts                  # Redis client
│   │   ├── auth.ts                   # JWT utilities
│   │   ├── auth-options.ts           # NextAuth configuration
│   │   ├── email.ts                  # Email sending
│   │   ├── utils.ts                  # General utilities (cn, etc.)
│   │   ├── constants.ts              # App constants
│   │   ├── middleware.ts             # Auth middleware
│   │   ├── structuredData.ts         # SEO structured data
│   │   ├── matching/
│   │   │   └── algorithm.ts          # Student-tourist matching logic
│   │   └── reviews/
│   │       ├── types.ts              # Review types
│   │       ├── service.ts            # Review business logic
│   │       └── constants.ts          # Review constants
│   │
│   ├── prisma/                       # Database
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # Migration history
│   │
│   └── types/                        # TypeScript type definitions
│       └── next-auth.d.ts            # NextAuth type extensions
│
├── .env.example                      # Environment variables template
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
├── vercel.json                       # Vercel deployment config
└── package.json                      # Dependencies & scripts
```

## Key Features & User Flows

### 1. Public Landing & Booking Flow

**Entry Point:** `/` (landing page)

**Key Pages:**
- `src/app/page.tsx` - Hero section with CTA tiles for tourists and students
- `src/app/booking/page.tsx` - Multi-step booking form

**User Journey:**
1. Visitor lands on homepage
2. Clicks "Book a Guide" CTA tile → `/booking`
3. **Step 1: Trip Details** - City, dates, time preference, guest count, group type
4. **Step 2: Preferences** - Languages, interests, service type, budget
5. **Step 3: Contact** - Email, phone, preferred contact method, trip notes
6. Email verification modal appears
7. Enters 6-digit code → Request created in database
8. Redirects to `/booking/pending` or `/booking/select-guide` if matches found

**Key Components:**
- `src/components/booking/BookingForm.tsx` - Form orchestration
- `src/components/booking/TripDetailsStep.tsx`
- `src/components/booking/PreferencesStep.tsx`
- `src/components/booking/ContactStep.tsx`
- `src/components/booking/VerificationModal.tsx`

**API Endpoints:**
- `POST /api/tourist/request/initiate` - Generate verification code
- `POST /api/tourist/request/verify` - Verify code & create request
- `POST /api/tourist/request/create` - Create tourist request
- `GET /api/cities` - Get available cities

### 2. Tourist Side

**Authentication:** Google OAuth via NextAuth.js

**Entry Point:** `/tourist`

**Key Pages:**
- `src/app/tourist/signin/page.tsx` - Google OAuth login
- `src/app/tourist/dashboard/page.tsx` - View all requests and bookings
- `src/app/matches/[requestId]/page.tsx` - View matched students
- `src/app/booking/select-guide/page.tsx` - Select a guide from matches

**User Journey:**
1. Tourist signs in with Google → `/tourist/signin`
2. Redirected to dashboard → `/tourist/dashboard`
3. Can view active/past requests
4. Receives email when matched with students
5. Views matched students → `/matches/[requestId]`
6. Selects preferred guide → Payment flow
7. Pays discovery fee → `/payment/discovery-fee`
8. Booking confirmed → Student notified

**Key Components:**
- `src/components/tourist/StudentProfileCard.tsx` - Display student profiles
- `src/components/GuideSelection.tsx` - Guide selection interface

**API Endpoints:**
- `GET /api/tourist/dashboard/access` - Check dashboard access
- `GET /api/tourist/dashboard/requests` - Get all tourist requests
- `POST /api/tourist/dashboard/verify` - Verify email access
- `GET /api/tourist/bookings` - Get tourist bookings
- `POST /api/tourist/request/select` - Select a student guide
- `GET /api/matches/route` - Get matched students for request

### 3. Student Side

**Authentication:** Email verification with JWT tokens (custom auth)

**Entry Point:** `/student`

**Key Pages:**
- `src/app/student/signin/page.tsx` - Email-based signin
- `src/app/student/onboarding/page.tsx` - Multi-step profile setup
- `src/app/student/dashboard/page.tsx` - View incoming requests and bookings

**User Journey (New Student):**
1. Student enters institutional email → `/student/signin`
2. Receives verification code via email
3. Enters code → Session created
4. First-time user → Redirected to onboarding → `/student/onboarding`
5. **Onboarding Steps:**
   - **Basic Profile:** Name, DOB, gender, nationality, phone, campus, institute
   - **Verification:** Upload student ID, government ID, selfie
   - **Cover Letter:** Bio, skills, interests
   - **Service Preferences:** Services offered, hourly rate, online availability
   - **Availability:** Weekly schedule, timezone, preferred durations
   - **Safety & Compliance:** Terms acceptance, emergency contact
   - **Review & Submit:** Review all info and submit
6. Submission sent to admin for approval → `/student/onboarding/success`
7. Status: `PENDING_APPROVAL`
8. Once approved → Can access dashboard

**User Journey (Returning Student):**
1. Signs in with email verification
2. Views dashboard → `/student/dashboard`
3. Sees incoming tourist requests that match their profile
4. Can accept or reject requests
5. Tracks accepted bookings
6. Views earnings and statistics

**Key Components:**
- `src/components/student/OnboardingWizard.tsx` - Multi-step wizard
- `src/components/student/BasicProfileStep.tsx`
- `src/components/student/StudentVerificationStep.tsx`
- `src/components/student/CoverLetterStep.tsx`
- `src/components/student/ServicePreferencesStep.tsx`
- `src/components/student/AvailabilityStep.tsx`
- `src/components/student/SafetyComplianceStep.tsx`
- `src/components/student/ReviewSubmitStep.tsx`

**API Endpoints:**
- `POST /api/student/auth/initiate` - Send verification code
- `POST /api/student/auth/verify` - Verify code and create session
- `GET /api/student/auth/session` - Check session validity
- `POST /api/student/onboarding` - Submit onboarding data
- `POST /api/student/upload` - Upload ID documents (Vercel Blob)
- `GET /api/student/dashboard` - Get dashboard data
- `POST /api/student/requests/accept` - Accept a tourist request
- `POST /api/student/requests/reject` - Reject a tourist request

### 4. Admin Side

**Authentication:** Username/password (bcrypt hashed)

**Entry Point:** `/admin/login`

**Key Pages:**
- `src/app/admin/login/page.tsx` - Admin login
- `src/app/admin/approvals/page.tsx` - Approve pending students
- `src/app/admin/students/page.tsx` - Manage all students
- `src/app/admin/reports/page.tsx` - Handle user reports
- `src/app/admin/analytics/page.tsx` - Platform metrics

**Admin Functions:**
1. Review and approve/reject student onboarding applications
2. View uploaded ID documents and verification materials
3. Manage student statuses (approve, suspend)
4. Bulk approve multiple students
5. View platform analytics:
   - Total students/tourists
   - Active requests
   - Completed bookings
   - Revenue metrics
   - Response times
6. Handle user reports and moderation

**Key Components:**
- `src/components/admin/AdminNav.tsx` - Admin navigation
- `src/components/admin/ApprovalQueue.tsx` - Student approval interface

**API Endpoints:**
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/students` - Get all students
- `GET /api/admin/students/pending` - Get pending approvals
- `POST /api/admin/students/approve` - Approve a student
- `POST /api/admin/students/bulk-approve` - Approve multiple students
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/reports` - Get user reports

### 5. Review System

**Key Pages:**
- Reviews are submitted after a completed booking

**API Endpoints:**
- `POST /api/reviews` - Submit a review
- `GET /api/reviews/student/[studentId]` - Get student reviews
- `GET /api/reviews/student/[studentId]/metrics` - Get review metrics

## Data & Backend

### Prisma Schema

**Location:** `src/prisma/schema.prisma`

**Database:** PostgreSQL

**Key Models:**

#### 1. Student
Represents student guides who offer services.

**Key Fields:**
- `id`, `email`, `name`, `emailVerified`
- **Personal:** `dateOfBirth`, `gender`, `nationality`, `phoneNumber`, `city`, `campus`
- **Academic:** `institute`, `programDegree`, `yearOfStudy`, `expectedGraduation`
- **Verification:** `studentIdUrl`, `governmentIdUrl`, `selfieUrl`, `profilePhotoUrl`
- **Profile:** `bio`, `skills`, `languages`, `interests`, `preferredGuideStyle`
- **Services:** `servicesOffered`, `hourlyRate`, `onlineServicesAvailable`
- **Availability:** `timezone`, `preferredDurations`, `unavailableDates`
- **System:** `status` (PENDING_APPROVAL, APPROVED, SUSPENDED)
- **Metrics:** `tripsHosted`, `averageRating`, `acceptanceRate`, `reliabilityBadge`

**Relations:**
- `availability` → StudentAvailability[]
- `unavailabilityExceptions` → UnavailabilityException[]
- `requestSelections` → RequestSelection[]
- `reviews` → Review[]

#### 2. Tourist
Represents tourists who book guides.

**Key Fields:**
- `id`, `email`, `name`, `image`, `googleId` (OAuth)

**Relations:**
- `requests` → TouristRequest[]
- `payments` → Payment[]

#### 3. TouristRequest
Represents a booking request from a tourist.

**Key Fields:**
- **Trip Details:** `city`, `dates`, `preferredTime`, `numberOfGuests`, `groupType`
- **Preferences:** `preferredNationality`, `preferredLanguages`, `preferredGender`, `serviceType`, `interests`, `budget`
- **Contact:** `email`, `phone`, `whatsapp`, `contactMethod`, `meetingPreference`
- **Status:** `status` (PENDING, MATCHED, ACCEPTED, EXPIRED, CANCELLED)
- `assignedStudentId` - Selected student

**Relations:**
- `tourist` → Tourist
- `selections` → RequestSelection[]
- `review` → Review
- `payments` → Payment[]

#### 4. RequestSelection
Represents a student's response to a tourist request.

**Key Fields:**
- `requestId`, `studentId`, `status` (pending, accepted, rejected)
- `message`, `pricePaid`

#### 5. Review
Reviews submitted by tourists for students.

**Key Fields:**
- `rating` (1-5), `text`, `attributes`, `noShow`, `pricePaid`, `isAnonymous`

#### 6. Payment
Payment records for bookings.

**Key Fields:**
- `amount`, `currency`, `status` (PENDING, SUCCESS, FAILED, REFUNDED)
- **Razorpay:** `razorpayOrderId`, `razorpayPaymentId`, `razorpaySignature`

#### 7. Admin
Admin user accounts.

**Key Fields:**
- `email`, `passwordHash`, `name`, `role` (SUPER_ADMIN, MODERATOR, SUPPORT)

#### 8. Sessions (StudentSession, TouristSession)
Custom session management for email-based auth.

#### 9. NextAuth Models (User, Account, Session, VerificationToken)
Used for OAuth (Google) authentication.

### Prisma Client

**Location:** `src/lib/prisma.ts`

A singleton Prisma client instance used throughout the application:

```typescript
import { prisma } from '@/lib/prisma'

// Example usage
const students = await prisma.student.findMany({
  where: { status: 'APPROVED', city: 'London' }
})
```

### API Route Organization

All API routes are under `src/app/api/`:

**Auth:**
- `/api/auth/[...nextauth]` - NextAuth.js handler (Google OAuth)

**Tourist:**
- `/api/tourist/request/*` - Booking request lifecycle
- `/api/tourist/dashboard/*` - Dashboard data
- `/api/tourist/bookings` - Get bookings

**Student:**
- `/api/student/auth/*` - Email verification auth
- `/api/student/onboarding` - Profile setup
- `/api/student/dashboard` - Dashboard data
- `/api/student/requests/*` - Accept/reject requests
- `/api/student/upload` - File uploads

**Admin:**
- `/api/admin/login` - Admin auth
- `/api/admin/students/*` - Student management
- `/api/admin/analytics` - Analytics
- `/api/admin/reports` - Reports

**Shared:**
- `/api/cities` - Available cities
- `/api/matches` - Matching algorithm
- `/api/reviews` - Review system
- `/api/payment/*` - Payment processing

### Matching Algorithm

**Location:** `src/lib/matching/algorithm.ts`

Matches tourist requests with suitable student guides based on:
- City match
- Language compatibility
- Interests overlap
- Availability
- Service type
- Gender preference
- Student rating and reliability

## Authentication

TourWiseCo uses a **dual authentication system**:

### 1. Tourist Authentication (Google OAuth via NextAuth.js)

**Configuration:** `src/lib/auth-options.ts`

**Flow:**
1. Tourist clicks "Sign in with Google"
2. NextAuth redirects to Google OAuth
3. After consent, Google returns user data
4. `signIn` callback checks email domain:
   - Non-educational domain → Creates/updates `Tourist` record
5. `session` callback adds `touristId` and `userType` to session
6. Session stored in database (strategy: "database")

**Protected Routes:** Use `getServerSession(authOptions)` in server components

**Providers:**
- Google OAuth (`GoogleProvider`)

**Session Data:**
```typescript
{
  user: {
    id: string
    email: string
    name: string
    image: string
    userType: "tourist"
    touristId: string
  }
}
```

### 2. Student Authentication (Custom Email Verification + JWT)

**Configuration:** `src/lib/auth.ts`

**Flow:**
1. Student enters institutional email (`.edu`, `.ac.uk`, etc.)
2. System generates 6-digit verification code
3. Code stored in Redis (10-min TTL) or database
4. Code sent via email (`src/lib/email.ts`)
5. Student enters code
6. System creates `StudentSession` with JWT token
7. Token stored in httpOnly cookie
8. On subsequent requests, token verified via `verifyToken()`

**JWT Functions:**
- `generateToken(payload, expiresIn)` - Create JWT
- `verifyToken(token)` - Validate JWT

**Protected Routes:** Use custom middleware to check `StudentSession`

**Email Domains Supported:**
- `.edu`, `.edu.in`, `.ac.uk`, `.edu.au`, `.edu.sg`, `.ac.in`

### 3. Admin Authentication (Username/Password)

**Configuration:** `src/lib/auth.ts`

**Flow:**
1. Admin enters email and password
2. Password hashed with bcryptjs (10 rounds)
3. Compared against `Admin.passwordHash`
4. JWT token issued on success
5. Token verified on protected admin routes

**Functions:**
- `hashPassword(password)` - Hash password
- `verifyPassword(password, hash)` - Verify password

### Protected Route Pattern

**Server Component:**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export default async function TouristDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/tourist/signin')
  // ...
}
```

**API Route:**
```typescript
import { verifyToken } from '@/lib/auth'

export async function GET(req: Request) {
  const token = req.cookies.get('student-token')?.value
  const payload = verifyToken(token)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 14+ database
- **Redis** (optional, for caching)
- **SMTP credentials** (for email verification)
- **Razorpay account** (for payments)
- **Google OAuth credentials** (for tourist login)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mridulmalani2/tourwiseco.git
   cd tourwiseco
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/tourwiseco?sslmode=require"

   # Authentication
   JWT_SECRET="your-super-secret-jwt-key"  # Generate: openssl rand -base64 32
   NEXTAUTH_SECRET="your-nextauth-secret"  # Generate: openssl rand -base64 32
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth (for tourists)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Email (for verification codes)
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-app-specific-password"
   EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"

   # Redis (optional)
   REDIS_URL="redis://localhost:6379"

   # Payment
   RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
   DISCOVERY_FEE_AMOUNT="99.00"

   # Base URL
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"

   # Environment
   NODE_ENV="development"
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma Client
   npx prisma generate --schema=./src/prisma/schema.prisma

   # Run migrations
   npx prisma migrate deploy --schema=./src/prisma/schema.prisma

   # (Optional) Open Prisma Studio to view data
   npx prisma studio --schema=./src/prisma/schema.prisma
   ```

5. **(Optional) Start Redis:**
   ```bash
   redis-server
   ```

   If Redis is not available, the app will fall back to database-only verification.

6. **Run the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Migrations

When making schema changes:

1. **Edit the schema:** `src/prisma/schema.prisma`

2. **Create a migration:**
   ```bash
   npx prisma migrate dev --name describe_your_change --schema=./src/prisma/schema.prisma
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate --schema=./src/prisma/schema.prisma
   ```
   (This also runs automatically on `npm install` via `postinstall` script)

## Development Commands

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Start production server (requires build first)
npm start

# Linting
npm run lint

# Prisma commands
npx prisma studio --schema=./src/prisma/schema.prisma  # Database GUI
npx prisma generate --schema=./src/prisma/schema.prisma  # Generate client
npx prisma migrate dev --schema=./src/prisma/schema.prisma  # Create migration
npx prisma migrate deploy --schema=./src/prisma/schema.prisma  # Apply migrations

# Bundle analysis (check build size)
ANALYZE=true npm run build
```

## Branching & Contribution Workflow

### Branch Model

**Main Branch:** `main`

This is the canonical, production-ready branch. All feature development should branch from and merge back into `main`.

**Feature Branches:**

For new features or bug fixes, create a branch with a descriptive name:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

**Claude Code Branches:**

This project uses Claude Code for AI-assisted development. Claude-generated branches follow the pattern:
```
claude/<task-description>-<session-id>
```

These are temporary feature branches that should be merged via PR after review.

### Contribution Steps

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/add-notification-system
   ```

2. **Make your changes:**
   - Write code following existing patterns
   - Ensure TypeScript types are correct
   - Test thoroughly in development mode

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add notification system for booking updates"
   ```

4. **Keep your branch up to date:**
   ```bash
   git fetch origin
   git rebase origin/main
   # Or merge if you prefer
   git merge origin/main
   ```

5. **Push your branch:**
   ```bash
   git push -u origin feature/add-notification-system
   ```

6. **Open a Pull Request:**
   - Go to GitHub repository
   - Click "Compare & pull request"
   - Describe your changes
   - Request review from maintainers

7. **After approval:**
   - Maintainer will merge into `main`
   - Delete your feature branch

### Code Review Guidelines

- Ensure all TypeScript types are correct (no `any` unless absolutely necessary)
- Follow existing component patterns (especially in `src/components/`)
- API routes should include proper error handling
- Test authentication flows if modifying auth code
- Check that Prisma queries are optimized (use indexes)

## Deployment

### Vercel Deployment

TourWiseCo is optimized for deployment on Vercel.

**Configuration:** `vercel.json`

**Key Settings:**
- **Framework:** Next.js
- **Build Command:** Custom Prisma generation + Next.js build
- **Region:** `iad1` (US East)
- **Function Memory:** 512MB-1024MB based on route
- **Function Max Duration:** 5-15 seconds based on route

**Environment Variables:**

In Vercel dashboard, add all variables from `.env.example`:
- `DATABASE_URL` - PostgreSQL connection string (use Vercel Postgres or external)
- `JWT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` - Your Vercel deployment URL
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `REDIS_URL` (use Vercel KV or Upstash)
- `NEXT_PUBLIC_BASE_URL`

**Deployment Steps:**

1. **Connect repository to Vercel:**
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Deploy:**
   ```bash
   git push origin main
   ```
   Vercel will automatically deploy on push to `main`

4. **Run migrations on production database:**
   ```bash
   # From local machine with production DATABASE_URL
   npx prisma migrate deploy --schema=./src/prisma/schema.prisma
   ```

### Database Hosting

**Recommended Options:**
- **Vercel Postgres** - Integrated with Vercel
- **Supabase** - Free tier available, good for PostgreSQL
- **Neon** - Serverless Postgres
- **Railway** - Easy PostgreSQL setup

### Redis Hosting (Optional)

**Recommended Options:**
- **Vercel KV** - Integrated Redis
- **Upstash** - Serverless Redis with free tier

### File Storage

Student ID uploads use **Vercel Blob** storage (configured in `src/app/api/student/upload/route.ts`).

---

## Project Highlights

### Performance Optimizations

- **Code Splitting:** Webpack configured for optimal chunk splitting (framework, auth, UI, lib)
- **Image Optimization:** Next.js Image with AVIF/WebP formats
- **CSS Optimization:** cssnano and Critters for critical CSS
- **Bundle Analysis:** `npm run build` with `ANALYZE=true` for size inspection
- **Console Removal:** Production builds remove console logs (except errors/warnings)

### Security Features

- **HTTP Headers:** Security headers configured in `vercel.json`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Password Hashing:** bcryptjs with 10 rounds
- **JWT Tokens:** Signed with strong secrets
- **Email Verification:** Time-limited codes with attempt tracking
- **SQL Injection Protection:** Prisma ORM with parameterized queries

### Key Algorithms

- **Matching Algorithm** (`src/lib/matching/algorithm.ts`): Matches tourists with students based on multiple criteria including location, languages, interests, and availability
- **Review System** (`src/lib/reviews/service.ts`): Calculates average ratings, tracks no-shows, updates student metrics

---

## Support & Resources

- **Documentation:** This README
- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **NextAuth Docs:** https://next-auth.js.org
- **Vercel Docs:** https://vercel.com/docs

For questions or issues, refer to the codebase structure above or inspect the relevant files directly.

---

**Built with ❤️ using Next.js, TypeScript, and Prisma**
