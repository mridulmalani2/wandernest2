# WanderNest2 Complete Codebase Memory

**Project Name:** WanderNest2 (also called TourWiseCo)
**Repository:** `/home/user/wandernest2/`
**Version:** 0.1.0
**Last Updated:** November 2025

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [Configuration](#configuration)
6. [Core Features & Workflows](#core-features--workflows)
7. [API Endpoints](#api-endpoints)
8. [Key Algorithms](#key-algorithms)
9. [Frontend Components](#frontend-components)
10. [Authentication System](#authentication-system)
11. [Deployment & Infrastructure](#deployment--infrastructure)
12. [Important Code Snippets](#important-code-snippets)

---

## 📖 PROJECT OVERVIEW

### What is WanderNest2?

WanderNest2 is a **dual-sided marketplace platform** built with Next.js 14 that connects:

- **Tourists**: Travelers seeking authentic local experiences and personalized guidance
- **Students**: International students earning income by offering guided tours and local expertise

### Platform Flow

1. **Tourist books a request** → Fills out booking form with trip details and preferences
2. **Email verification** → Verifies email with 6-digit code (stored in Redis)
3. **Matching algorithm** → Finds top 4 matching student guides based on sophisticated scoring
4. **Guide selection** → Tourist selects their preferred guide
5. **Connection** → Both parties are connected (email notifications sent)
6. **Post-trip review** → Tourist reviews the student guide

### Key Statistics

| Metric | Count |
|--------|-------|
| API Routes | 33 |
| Database Models | 14 |
| React Components | 50+ |
| Page Routes | 19 |
| Supported Cities | Paris, London |
| Supported Languages | 15+ |
| Universities Listed | 150+ |

---

## 🛠 TECHNOLOGY STACK

### Frontend
- **Framework:** Next.js 14 (App Router, Server Components, RSC)
- **Language:** TypeScript 5 (strict mode)
- **UI Library:** React 18.3.1
- **Styling:** Tailwind CSS 3.3 with custom design tokens
- **Component Library:** Radix UI (unstyled, accessible primitives)
- **Icons:** Lucide React (294 icons)
- **Animations:** Framer Motion 12 (scroll effects, page transitions)
- **Forms:** React Hook Form 7.49 + Zod 3.22 validation
- **State Management:** React Context + NextAuth sessions

### Backend
- **Runtime:** Node.js (Vercel Serverless Functions)
- **Database:** PostgreSQL with Prisma ORM 6.19
- **Caching:** Redis (ioredis 5.3) with in-memory fallback
- **Authentication:**
  - NextAuth.js 4.24 (Google OAuth for students/tourists)
  - JWT (jsonwebtoken 9.0.2 for admin)
- **Email:** Nodemailer 7.0 (Gmail SMTP)
- **File Storage:** Vercel Blob 0.23
- **Password Hashing:** bcryptjs 2.4

### Infrastructure
- **Hosting:** Vercel (serverless edge functions)
- **Database:** PostgreSQL (Vercel Postgres or self-hosted)
- **Caching:** Redis (Vercel KV or Upstash)
- **CDN:** Vercel CDN + Unsplash/Pexels image CDN
- **Monitoring:** Vercel Analytics + Speed Insights

### Development Tools
- **Build:** Next.js compiler
- **Linting:** ESLint
- **Bundle Analysis:** @next/bundle-analyzer
- **CSS Optimization:** Critters (critical CSS), cssnano
- **Type Checking:** TypeScript strict mode

---

## 📁 DIRECTORY STRUCTURE

```
/home/user/wandernest2/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Main landing page
│   │   ├── layout.tsx                # Root layout with metadata
│   │   ├── globals.css               # Global styles
│   │   ├── critical.css              # Critical path CSS
│   │   ├── providers.tsx             # React context providers
│   │   │
│   │   ├── booking/                  # Tourist booking flow
│   │   │   ├── page.tsx              # Multi-step booking form
│   │   │   ├── pending/page.tsx      # Email verification pending
│   │   │   ├── select-guide/page.tsx # Guide selection page
│   │   │   └── success/page.tsx      # Booking confirmation
│   │   │
│   │   ├── tourist/                  # Tourist pages
│   │   │   ├── page.tsx              # Tourist landing page
│   │   │   ├── signin/page.tsx       # Google OAuth sign-in
│   │   │   ├── layout.tsx            # Tourist layout
│   │   │   └── dashboard/page.tsx    # Tourist dashboard
│   │   │
│   │   ├── student/                  # Student pages
│   │   │   ├── page.tsx              # Student landing page
│   │   │   ├── signin/page.tsx       # Email verification sign-in
│   │   │   ├── layout.tsx            # Student layout
│   │   │   ├── onboarding/           # 7-step profile wizard
│   │   │   │   ├── page.tsx          # Onboarding form
│   │   │   │   └── success/page.tsx  # Completion confirmation
│   │   │   └── dashboard/page.tsx    # Student dashboard
│   │   │
│   │   ├── matches/[requestId]/      # Matched guides display
│   │   │   └── page.tsx
│   │   │
│   │   ├── admin/                    # Admin portal
│   │   │   ├── login/page.tsx        # JWT admin auth
│   │   │   ├── approvals/page.tsx    # Student approvals queue
│   │   │   ├── students/page.tsx     # Manage students
│   │   │   ├── reports/page.tsx      # Handle reports/disputes
│   │   │   └── analytics/page.tsx    # Platform metrics
│   │   │
│   │   └── api/                      # 33 API routes
│   │       ├── auth/[...nextauth]/   # NextAuth OAuth
│   │       ├── health/               # Health check
│   │       ├── cities/               # Available cities
│   │       ├── contact/              # Contact form
│   │       ├── tourist/              # Tourist endpoints (8 routes)
│   │       ├── student/              # Student endpoints (7 routes)
│   │       ├── reviews/              # Review management (3 routes)
│   │       ├── matches/              # Matching system (2 routes)
│   │       └── admin/                # Admin endpoints (7 routes)
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # Radix UI wrappers (20+ components)
│   │   ├── booking/                  # Booking flow components (5)
│   │   ├── student/                  # Student components (9)
│   │   ├── tourist/                  # Tourist components
│   │   ├── admin/                    # Admin components (2)
│   │   ├── shared/                   # Shared components (FAQs, progress)
│   │   ├── ContactModal/             # Contact modal system
│   │   ├── transitions/              # Animation components
│   │   ├── Navigation.tsx            # Main navigation
│   │   ├── Footer.tsx                # Global footer
│   │   └── ErrorBoundary.tsx         # Error boundary wrapper
│   │
│   ├── lib/                          # Server utilities & logic
│   │   ├── config.ts                 # Environment validation
│   │   ├── constants.ts              # Static data (cities, languages)
│   │   ├── utils.ts                  # Utility functions
│   │   ├── auth.ts                   # Auth helpers
│   │   ├── auth-options.ts           # NextAuth config
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   ├── cache.ts                  # Redis + in-memory cache
│   │   ├── redis.ts                  # Redis client
│   │   ├── email.ts                  # Nodemailer integration
│   │   ├── matching/algorithm.ts     # Matching algorithm
│   │   ├── reviews/                  # Review system (3 files)
│   │   ├── error-handler.ts          # Centralized error handling
│   │   ├── sanitization.ts           # Input sanitization
│   │   ├── middleware.ts             # Request processing
│   │   ├── structuredData.ts         # JSON-LD schema
│   │   ├── use-auth.ts               # Custom auth hook
│   │   └── faq/data.ts               # FAQ content
│   │
│   ├── config/                       # Configuration data
│   │   ├── languages.ts              # Language list
│   │   └── universityOptions.ts      # 150+ universities
│   │
│   ├── types/                        # TypeScript definitions
│   │   ├── index.ts                  # Anonymous guide types
│   │   └── next-auth.d.ts            # NextAuth session extensions
│   │
│   └── prisma/                       # Database
│       ├── schema.prisma             # 14 models + migrations
│       └── migrations/               # Version-controlled migrations
│
├── public/                           # Static assets
│   ├── logo.svg                      # Brand logo
│   ├── favicon.ico                   # Favicon
│   └── [images]                      # Static images
│
├── docs/                             # Documentation
│
├── package.json                      # Dependencies & scripts
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Design system
├── next.config.js                    # Next.js optimization
├── middleware.ts                     # Route protection
├── vercel.json                       # Deployment config
└── .env.example                      # Environment template
```

---

## 🗄 DATABASE SCHEMA

### Overview
- **14 Prisma Models** (PostgreSQL)
- **87 fields** in Student model alone
- **Comprehensive indexes** for performance optimization
- **3 authentication systems**: NextAuth (OAuth), custom JWT, email verification

### Core Enums

```prisma
enum StudentStatus {
  PENDING_APPROVAL
  APPROVED
  SUSPENDED
}

enum RequestStatus {
  PENDING      // Initial request created
  MATCHED      // Guides matched and shown to tourist
  ACCEPTED     // Tourist selected a guide
  EXPIRED      // Request expired (time-based)
  CANCELLED    // Manually cancelled
}

enum AdminRole {
  SUPER_ADMIN
  MODERATOR
  SUPPORT
}
```

### Key Models

#### 1. Student (87 fields)
The most complex model handling student guide profiles.

**Personal Details:**
- `email`, `emailVerified`, `googleId`, `name`
- `dateOfBirth`, `gender`, `nationality`, `phoneNumber`
- `city`, `campus`

**Academic Details:**
- `institute` (university name)
- `programDegree` (e.g., "MSc Computer Science")
- `yearOfStudy` (e.g., "2nd year Undergrad")
- `expectedGraduation` (e.g., "June 2026")

**Identity Verification:**
- `studentIdUrl`, `studentIdExpiry`
- `governmentIdUrl`, `governmentIdExpiry`
- `selfieUrl` (for verification)
- `profilePhotoUrl` (public photo)
- `verificationConsent`, `documentsOwnedConfirmation`

**Profile Information:**
- `bio` (Text field for introduction)
- `skills` (String array)
- `preferredGuideStyle` (friendly, structured, energetic)
- `coverLetter` (Text field)
- `languages` (String array)
- `interests` (String array)

**Service Preferences:**
- `servicesOffered` (walk-around, itinerary, cultural)
- `hourlyRate` (Float)
- `onlineServicesAvailable` (Boolean)

**Availability & Scheduling:**
- `timezone` (e.g., "Europe/Paris")
- `preferredDurations` (String array)
- `unavailableDates` (JSON)

**Safety & Compliance:**
- `termsAccepted`, `safetyGuidelinesAccepted`
- `independentGuideAcknowledged`
- `emergencyContactName`, `emergencyContactPhone`

**System Fields:**
- `status` (PENDING_APPROVAL, APPROVED, SUSPENDED)
- `profileCompleteness` (0-100%)

**Metrics:**
- `tripsHosted` (Int, default 0)
- `averageRating` (Float, nullable)
- `noShowCount` (Int, default 0)
- `acceptanceRate` (Float, nullable)
- `reliabilityBadge` (bronze, silver, gold)

**Relations:**
- `availability` (StudentAvailability[])
- `unavailabilityExceptions` (UnavailabilityException[])
- `requestSelections` (RequestSelection[])
- `reviews` (Review[])
- `reports` (Report[])

**Indexes:**
```prisma
@@index([city])
@@index([nationality])
@@index([status])
@@index([email])
@@index([city, status])
@@index([status, averageRating])
@@index([email, status])
```

#### 2. StudentAvailability
Weekly recurring availability schedule.

```prisma
model StudentAvailability {
  id          String   @id @default(cuid())
  studentId   String
  dayOfWeek   Int      // 0-6 (Sunday=0, Saturday=6)
  startTime   String   // "09:00"
  endTime     String   // "17:00"
  note        String?  // "Not available during exams"

  student     Student  @relation(fields: [studentId], references: [id])

  @@index([studentId])
}
```

#### 3. UnavailabilityException
Specific dates when student is unavailable.

```prisma
model UnavailabilityException {
  id          String   @id @default(cuid())
  studentId   String
  date        DateTime // Specific date unavailable
  reason      String?  // Optional reason

  student     Student  @relation(fields: [studentId], references: [id])

  @@index([studentId])
  @@index([date])
}
```

#### 4. Tourist
Authenticated tourist users.

```prisma
model Tourist {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String?
  image             String?  // Google profile picture
  googleId          String?  @unique

  requests          TouristRequest[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([email])
  @@index([googleId])
}
```

#### 5. TouristRequest (Main Booking Model)
Central model for tourist booking requests.

**Trip Details:**
- `city`, `dates` (JSON), `preferredTime`
- `numberOfGuests`, `groupType`, `accessibilityNeeds`

**Matching Criteria:**
- `preferredNationality`, `preferredLanguages` (String[])
- `preferredGender`, `serviceType`, `interests` (String[])
- `budget` (Float)

**Contact:**
- `phone`, `whatsapp`, `contactMethod`
- `meetingPreference`, `tripNotes`

**Status & Relations:**
- `status` (RequestStatus enum)
- `selections` (RequestSelection[]) - Multiple matched guides
- `review` (Review?) - Single review after trip

**Indexes:**
```prisma
@@index([city])
@@index([status])
@@index([email])
@@index([touristId])
@@index([city, status])
@@index([status, createdAt])
```

#### 6. RequestSelection (Matching Junction Table)
Tracks which guides were presented to tourists and their responses.

```prisma
model RequestSelection {
  id                String         @id @default(cuid())
  requestId         String
  studentId         String
  status            String         // pending, accepted, rejected
  message           String?        @db.Text
  pricePaid         Float?         // Actual price paid

  request           TouristRequest @relation(fields: [requestId], references: [id])
  student           Student        @relation(fields: [studentId], references: [id])

  createdAt         DateTime       @default(now())
  acceptedAt        DateTime?      // For response time analytics

  @@index([requestId])
  @@index([studentId])
  @@index([status])
  @@index([requestId, status])
  @@index([studentId, status])
}
```

#### 7. Review
Post-trip reviews and ratings.

```prisma
model Review {
  id                String         @id @default(cuid())
  requestId         String         @unique  // One review per request
  studentId         String
  rating            Int            // 1-5 (required)
  text              String?        @db.Text // max 500 chars (app-enforced)
  attributes        String[]       // predefined attributes
  noShow            Boolean        @default(false)
  pricePaid         Float?
  isAnonymous       Boolean        @default(false)

  request           TouristRequest @relation(fields: [requestId], references: [id])
  student           Student        @relation(fields: [studentId], references: [id])

  createdAt         DateTime       @default(now())

  @@index([studentId])
  @@index([createdAt])
}
```

#### 8. Report
User reports and safety incidents.

```prisma
model Report {
  id                String   @id @default(cuid())
  studentId         String
  reason            String
  description       String   @db.Text
  status            String   // pending, reviewed, resolved

  student           Student  @relation(fields: [studentId], references: [id])

  createdAt         DateTime @default(now())

  @@index([studentId])
  @@index([status])
}
```

#### 9. Admin
Admin user accounts.

```prisma
model Admin {
  id                String   @id @default(cuid())
  email             String   @unique
  passwordHash      String   // bcrypt hashed
  name              String
  role              AdminRole @default(MODERATOR)
  isActive          Boolean  @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([email])
  @@index([role])
}
```

#### 10-14. NextAuth Models
Standard NextAuth models for OAuth:
- `User` - NextAuth user (links to Tourist)
- `Account` - OAuth provider details
- `Session` - Active sessions
- `VerificationToken` - Email verification
- `ContactMessage` - Contact form submissions

---

## ⚙️ CONFIGURATION

### Environment Variables (.env.example)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tourwiseco"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Primary authentication for both students & tourists)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email (Optional - for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"

# Redis (Optional - falls back to in-memory)
REDIS_URL="redis://localhost:6379"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

### Configuration Validation (src/lib/config.ts)

The config system validates all environment variables at startup:

- **Critical Errors** (app won't start in production):
  - Missing Google OAuth credentials
  - Missing NEXTAUTH_SECRET in production
  - Invalid DATABASE_URL format

- **Warnings** (app works with degraded functionality):
  - Missing email configuration → emails won't send
  - Missing Redis → uses in-memory cache
  - Missing JWT_SECRET → admin auth won't work

**Config Summary Available at:** `GET /api/health`

---

## 🎯 CORE FEATURES & WORKFLOWS

### 1. Tourist Booking Flow

**Step 1: Initiate Request** (`POST /api/tourist/request/initiate`)
```typescript
// Input: Trip details, preferences, contact info
// Process:
// 1. Generate 6-digit verification code
// 2. Store in Redis (10-minute TTL)
// 3. Send verification email
// Output: { success: true, email: "tourist@example.com" }
```

**Step 2: Verify Email** (`POST /api/tourist/request/verify`)
```typescript
// Input: Email + verification code
// Process:
// 1. Validate code from Redis (max 3 attempts)
// 2. Create TouristRequest in database
// 3. Trigger matching algorithm
// 4. Return request ID
// Output: { success: true, requestId: "abc123" }
```

**Step 3: View Matches** (`GET /matches/[requestId]`)
```typescript
// Process:
// 1. Fetch TouristRequest
// 2. Run matching algorithm (if not cached)
// 3. Display top 4 matches with:
//    - Anonymized ID (Guide #A73F)
//    - Match reasons (language, interests, etc.)
//    - Rating, experience, reliability badge
//    - Skills extracted from bio
//    - Suggested price range
```

**Step 4: Select Guide** (`POST /api/matches/select`)
```typescript
// Input: requestId + studentId
// Process:
// 1. Create RequestSelection (status: accepted)
// 2. Update TouristRequest status to ACCEPTED
// 3. Send notifications to both parties
// Output: { success: true }
```

**Step 5: Post-Trip Review** (`POST /api/reviews`)
```typescript
// Input: requestId, studentId, rating (1-5), text, attributes
// Process:
// 1. Create Review record
// 2. Update student metrics (averageRating, tripsHosted, etc.)
// 3. Calculate reliability badge
// Output: { success: true, review: {...} }
```

### 2. Student Onboarding Flow

**7-Step Profile Wizard** (`/student/onboarding`)

1. **Basic Profile**
   - Personal: name, DOB, gender, nationality, phone
   - Academic: institute, program, year, graduation

2. **Identity Verification**
   - Upload 4 images to Vercel Blob:
     - Student ID card
     - Government ID (passport/national ID)
     - Selfie for verification
     - Profile photo
   - Verification consent checkboxes

3. **Cover Letter**
   - Bio (max 500 chars)
   - Cover letter explaining why they'd be a great guide

4. **Availability**
   - Weekly schedule (7 days × start/end times)
   - Timezone selection
   - Unavailable dates

5. **Service Preferences**
   - Services offered (walk-around, itinerary, cultural)
   - Hourly rate (€/hr)
   - Preferred durations
   - Online availability

6. **Safety & Compliance**
   - Terms acceptance
   - Safety guidelines
   - Independent guide acknowledgment
   - Emergency contacts

7. **Review & Submit**
   - Final review of all sections
   - Submit for admin approval
   - Status: PENDING_APPROVAL

**Approval Process:**
- Admin reviews profile at `/admin/approvals`
- Verifies documents (ID cards, selfie)
- Approves or rejects
- Approved students: Status → APPROVED (can receive requests)

### 3. Matching Algorithm

**Location:** `src/lib/matching/algorithm.ts`

**Algorithm Flow:**
```typescript
function findMatches(request: TouristRequest): Promise<StudentWithScore[]> {
  // 1. Fetch approved students in city (cached 15 min)
  const candidates = await getApprovedStudentsByCity(request.city)

  // 2. Filter by preferences (in-memory)
  if (request.preferredNationality) {
    candidates = candidates.filter(s => s.nationality === request.preferredNationality)
  }

  if (request.preferredLanguages.length > 0) {
    candidates = candidates.filter(s =>
      request.preferredLanguages.some(lang => s.languages.includes(lang))
    )
  }

  if (request.preferredGender !== 'no_preference') {
    candidates = candidates.filter(s => s.gender === request.preferredGender)
  }

  // 3. Score each candidate (100-point scale)
  const scored = candidates.map(student => ({
    ...student,
    score: calculateScore(student, request)
  }))

  // 4. Sort by score descending, return top 4
  return scored.sort((a, b) => b.score - a.score).slice(0, 4)
}
```

**Scoring System (100 points total):**

```typescript
function calculateScore(student, request): number {
  let score = 0

  // 1. Availability match (40 points)
  if (checkAvailability(student, request.dates)) {
    score += 40
  }

  // 2. Rating (20 points max)
  const rating = student.averageRating || 3.0  // Default 3.0 if no reviews
  score += rating * 4  // 5-star rating × 4 = 20 max

  // 3. Reliability (20 points)
  if (student.noShowCount === 0) {
    score += 20
  } else {
    score += Math.max(0, 20 - (student.noShowCount * 5))  // -5 per no-show
  }

  // 4. Interest overlap (20 points)
  const overlap = request.interests.filter(i => student.interests.includes(i)).length
  score += (overlap / request.interests.length) * 20

  return Math.round(score * 10) / 10  // Round to 1 decimal
}
```

**Availability Checking:**
```typescript
function checkAvailability(student, requestedDates): boolean {
  // Parse dates (single date or range)
  const checkDates = parseDates(requestedDates)

  // Check if guide is available for ALL requested dates
  return checkDates.every(date => {
    const dayOfWeek = date.getDay()  // 0=Sunday, 6=Saturday
    return student.availability.some(avail => avail.dayOfWeek === dayOfWeek)
  })
}
```

### 4. Review & Rating System

**Location:** `src/lib/reviews/service.ts`

**Create Review:**
```typescript
async function createReview(data: {
  requestId: string
  studentId: string
  rating: 1-5  // Required
  text?: string  // Optional, max 500 chars
  attributes: string[]  // ["knowledgeable", "friendly", "punctual"]
  noShow: boolean
  pricePaid?: number
  isAnonymous: boolean
}) {
  // 1. Create review record
  const review = await prisma.review.create({ data })

  // 2. Update student metrics
  await updateStudentMetrics(studentId)

  return review
}
```

**Update Student Metrics:**
```typescript
async function updateStudentMetrics(studentId: string) {
  // Fetch all reviews for student
  const reviews = await prisma.review.findMany({ where: { studentId } })

  // Calculate average rating
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  // Calculate no-show count
  const noShowCount = reviews.filter(r => r.noShow).length

  // Calculate reliability badge
  const reliabilityBadge = calculateReliabilityBadge(reviews.length, averageRating, noShowCount)

  // Update student record
  await prisma.student.update({
    where: { id: studentId },
    data: {
      averageRating,
      noShowCount,
      tripsHosted: reviews.length,
      reliabilityBadge
    }
  })
}
```

**Reliability Badge:**
```typescript
function calculateReliabilityBadge(tripsHosted, rating, noShows): string | null {
  if (tripsHosted < 5) return null  // Not enough trips
  if (noShows > 2) return null  // Too many no-shows

  if (rating >= 4.5 && tripsHosted >= 20) return 'gold'
  if (rating >= 4.0 && tripsHosted >= 10) return 'silver'
  if (rating >= 3.5) return 'bronze'

  return null
}
```

---

## 🔌 API ENDPOINTS

### Tourist Routes (8 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/tourist/request/initiate` | Start booking, send verification code | None |
| POST | `/api/tourist/request/verify` | Verify email with code | None |
| POST | `/api/tourist/request/create` | Create request (legacy) | None |
| POST | `/api/tourist/request/match` | Get matching guides | None |
| POST | `/api/tourist/request/select` | Select guide | None |
| GET | `/api/tourist/request/status` | Check request status | None |
| GET | `/api/tourist/bookings` | Booking history | NextAuth |
| GET | `/api/tourist/dashboard` | Dashboard data | NextAuth |

### Student Routes (7 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/student/onboarding` | Submit profile | NextAuth |
| POST | `/api/student/upload` | Upload documents | NextAuth |
| GET | `/api/student/dashboard` | Dashboard + metrics | NextAuth |
| POST | `/api/student/requests/accept` | Accept booking | NextAuth |
| POST | `/api/student/requests/reject` | Reject booking | NextAuth |
| POST | `/api/student/requests/[id]/accept` | Accept by ID | NextAuth |
| POST | `/api/student/requests/[id]/reject` | Reject by ID | NextAuth |

### Review Routes (3 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reviews` | Create review | None |
| GET | `/api/reviews` | List reviews | None |
| GET | `/api/reviews/student/[studentId]` | Student reviews | None |

### Matching Routes (2 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/matches` | Find matches (internal) | None |
| POST | `/api/matches/select` | Confirm selection | None |

### Admin Routes (7 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/admin/login` | Admin login (JWT) | None |
| GET | `/api/admin/students/pending` | Pending approvals | JWT |
| POST | `/api/admin/students/approve` | Approve single | JWT |
| POST | `/api/admin/students/bulk-approve` | Batch approve | JWT |
| GET | `/api/admin/students` | List all students | JWT |
| GET | `/api/admin/analytics` | Platform analytics | JWT |
| GET | `/api/admin/reports` | List reports | JWT |

### Utility Routes (3 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/health` | Health check + config | None |
| GET | `/api/cities` | Available cities | None |
| POST | `/api/contact` | Contact form | None |

---

## 🔐 AUTHENTICATION SYSTEM

### Dual Authentication Architecture

**1. NextAuth (Google OAuth) - Primary**
- **Tourists:** Any Google email
- **Students:** Academic emails only (@.edu, @.edu.in, @.ac.uk, etc.)
- Session strategy: Database
- Session duration: 30 days
- Auto user type detection based on email domain

**Location:** `src/lib/auth-options.ts`

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Detect user type from email domain
      const email = user.email || ''
      const isStudent = isStudentEmail(email)

      if (isStudent) {
        // Create/update Student record
        await prisma.student.upsert({
          where: { email },
          create: { email, googleId: account.providerAccountId },
          update: { googleId: account.providerAccountId }
        })
      } else {
        // Create/update Tourist record
        await prisma.tourist.upsert({
          where: { email },
          create: { email, googleId: account.providerAccountId, name: user.name },
          update: { googleId: account.providerAccountId }
        })
      }

      return true
    },
    async session({ session, user }) {
      // Add userType to session
      session.user.userType = await getUserType(user.email)
      return session
    }
  }
}
```

**Student Email Detection:**
```typescript
function isStudentEmail(email: string): boolean {
  const studentDomains = [
    '.edu',         // US universities
    '.edu.in',      // Indian universities
    '.ac.uk',       // UK universities
    '.edu.au',      // Australian universities
    '.edu.sg',      // Singapore universities
    // ... more patterns
  ]

  return studentDomains.some(domain => email.toLowerCase().endsWith(domain))
}
```

**2. Custom JWT (Admin Only)**

**Location:** `src/app/api/admin/login/route.ts`

```typescript
POST /api/admin/login
{
  "email": "admin@tourwiseco.com",
  "password": "secure-password"
}

// Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": "abc123",
    "email": "admin@tourwiseco.com",
    "name": "Admin User",
    "role": "SUPER_ADMIN"
  }
}

// Token payload:
{
  "adminId": "abc123",
  "email": "admin@tourwiseco.com",
  "role": "SUPER_ADMIN",
  "exp": 1234567890  // 8 hours from issue
}
```

### Route Protection (middleware.ts)

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes - JWT validation
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!)
    } catch {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Student routes - NextAuth + onboarding check
  if (pathname.startsWith('/student/dashboard')) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'student') {
      return NextResponse.redirect(new URL('/student/signin', request.url))
    }

    // Check if onboarding completed
    const student = await prisma.student.findUnique({
      where: { email: session.user.email }
    })

    if (student?.status === 'PENDING_APPROVAL' && student.profileCompleteness < 100) {
      return NextResponse.redirect(new URL('/student/onboarding', request.url))
    }
  }

  // Tourist routes - NextAuth
  if (pathname.startsWith('/tourist/dashboard')) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== 'tourist') {
      return NextResponse.redirect(new URL('/tourist/signin', request.url))
    }
  }

  return NextResponse.next()
}
```

---

## 🎨 FRONTEND COMPONENTS

### Key Component Categories

#### 1. Booking Flow Components

**BookingForm.tsx** - Multi-step form orchestrator
```typescript
// 3 steps: Trip Details → Preferences → Contact
const [step, setStep] = useState(1)

return (
  <>
    {step === 1 && <TripDetailsStep data={formData} onNext={handleNext} />}
    {step === 2 && <PreferencesStep data={formData} onNext={handleNext} />}
    {step === 3 && <ContactStep data={formData} onSubmit={handleSubmit} />}
  </>
)
```

**TripDetailsStep.tsx** - Location, dates, group
```typescript
// Fields:
// - City (select)
// - Dates (date picker - single or range)
// - Preferred time (morning/afternoon/evening)
// - Number of guests
// - Group type (family/friends/solo/business)
// - Accessibility needs
```

**PreferencesStep.tsx** - Guide preferences
```typescript
// Fields:
// - Preferred nationality (select)
// - Languages (multi-select)
// - Gender preference (male/female/no preference)
// - Service type (itinerary help / guided experience)
// - Interests (multi-select tags)
// - Budget (slider)
```

**ContactStep.tsx** - Contact information
```typescript
// Fields:
// - Email (verified via code)
// - Phone (optional)
// - WhatsApp (optional)
// - Preferred contact method (radio)
// - Meeting preference (hotel pickup / public place / virtual)
// - Additional notes (textarea)
```

#### 2. Student Onboarding Components

**OnboardingWizard.tsx** - 7-step profile builder
```typescript
const steps = [
  { id: 1, title: 'Basic Profile', component: BasicProfileStep },
  { id: 2, title: 'Verification', component: StudentVerificationStep },
  { id: 3, title: 'Cover Letter', component: CoverLetterStep },
  { id: 4, title: 'Availability', component: AvailabilityStep },
  { id: 5, title: 'Services', component: ServicePreferencesStep },
  { id: 6, title: 'Safety', component: SafetyComplianceStep },
  { id: 7, title: 'Review', component: ReviewSubmitStep }
]
```

**AvailabilityStep.tsx** - Weekly schedule builder
```typescript
// Features:
// - 7-day weekly schedule (Sunday-Saturday)
// - Start/end time pickers for each day
// - Toggle for each day (available/unavailable)
// - Timezone selector
// - Unavailable dates picker (calendar)
```

**ServicePreferencesStep.tsx** - Service configuration
```typescript
// Fields:
// - Services offered (multi-select)
//   - Walk-around tours
//   - Itinerary planning
//   - Cultural experiences
//   - Local recommendations
// - Hourly rate (number input with currency)
// - Preferred durations (multi-select: 1h, 2h, 3-4h, half-day, full-day)
// - Online services available (toggle)
```

#### 3. UI Components (Radix UI Wrappers)

All components use Radix UI primitives with Tailwind styling:

- `Button` - Variants: default, destructive, outline, ghost, link
- `Input` - Text input with error states
- `Select` - Dropdown select with search
- `Checkbox` - Accessible checkbox
- `RadioGroup` - Radio button group
- `Dialog` - Modal dialog
- `Slider` - Range slider (for budget)
- `Card` - Content container
- `Badge` - Status badge
- `Spinner` - Loading spinner
- `Alert` - Alert messages

**Location:** `src/components/ui/`

#### 4. Admin Components

**ApprovalQueue.tsx** - Student approval interface
```typescript
// Features:
// - List pending students (status: PENDING_APPROVAL)
// - Display profile details
// - View uploaded documents (ID, selfie, etc.)
// - Approve/Reject buttons
// - Bulk approve checkbox
// - Filtering by date, institute, city
```

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE

### Vercel Configuration (vercel.json)

**Function Configuration:**
```json
{
  "functions": {
    "src/app/api/health/route.ts": {
      "maxDuration": 5,
      "memory": 512
    },
    "src/app/api/matches/**/route.ts": {
      "maxDuration": 10,
      "memory": 1024
    },
    "src/app/api/admin/analytics/route.ts": {
      "maxDuration": 15,
      "memory": 1024
    },
    "src/app/api/**/route.ts": {
      "maxDuration": 8,
      "memory": 512
    }
  }
}
```

**Cache Headers:**
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Caching Strategy

**Database Query Caching** (Redis + In-Memory)

| Data Type | TTL | Cache Key |
|-----------|-----|-----------|
| Approved Students | 15 min | `students:approved:{city}` |
| Analytics | 10 min | `analytics:platform` |
| Student Metrics | 30 min | `student:metrics:{id}` |
| Matching Results | 5 min | `matches:{requestId}` |
| Dashboard Data | 3 min | `dashboard:{userType}:{userId}` |

**Implementation:**
```typescript
// src/lib/cache.ts
import Redis from 'ioredis'
import { LRUCache } from 'lru-cache'

const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null
const memoryCache = new LRUCache({ max: 500 })

export const cache = {
  async get(key: string) {
    if (redis) {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    }
    return memoryCache.get(key) || null
  },

  async set(key: string, value: any, ttl: number) {
    if (redis) {
      await redis.set(key, JSON.stringify(value), 'EX', ttl)
    } else {
      memoryCache.set(key, value, { ttl: ttl * 1000 })
    }
  },

  async cached<T>(key: string, fetcher: () => Promise<T>, options: { ttl: number }): Promise<T> {
    const cached = await this.get(key)
    if (cached) return cached

    const fresh = await fetcher()
    await this.set(key, fresh, options.ttl)
    return fresh
  }
}
```

### Build Process

**Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate --schema=./src/prisma/schema.prisma",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

**Build Steps:**
1. `prisma generate` - Generate Prisma Client
2. `prisma migrate deploy` - Run pending migrations
3. `next build` - Build Next.js app

**Optimizations:**
- Tree shaking for lucide-react, radix-ui, zod
- CSS optimization with cssnano + critters
- Image optimization (AVIF/WebP)
- Console log removal in production
- Source map generation disabled

---

## 💻 IMPORTANT CODE SNIPPETS

### Error Handling (src/lib/error-handler.ts)

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await handler()
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // Prisma errors
    if (error.code === 'P2002') {
      throw new AppError('Record already exists', 409, 'DUPLICATE_ENTRY')
    }

    // Zod validation errors
    if (error instanceof z.ZodError) {
      throw new AppError(
        `Validation error: ${error.errors[0].message}`,
        400,
        'VALIDATION_ERROR'
      )
    }

    // Generic error
    console.error(`[${context}] Error:`, error)
    throw new AppError('Internal server error', 500, 'INTERNAL_ERROR')
  }
}
```

### Email Service (src/lib/email.ts)

```typescript
import nodemailer from 'nodemailer'

const transporter = config.email.isConfigured
  ? nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    })
  : null

export async function sendVerificationCode(email: string, code: string) {
  if (!transporter) {
    console.log('[EMAIL MOCK] Verification code:', code, 'for', email)
    return
  }

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Your TourWiseCo Verification Code',
    html: `
      <h2>Your verification code is: ${code}</h2>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  })
}
```

### Validation Schemas (Example)

```typescript
import { z } from 'zod'

export const TouristRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  city: z.string().min(1, 'City is required'),
  dates: z.object({
    start: z.string().datetime(),
    end: z.string().datetime().optional()
  }),
  preferredTime: z.enum(['morning', 'afternoon', 'evening']),
  numberOfGuests: z.number().int().min(1).max(20),
  groupType: z.enum(['family', 'friends', 'solo', 'business']),
  preferredLanguages: z.array(z.string()).default([]),
  serviceType: z.enum(['itinerary_help', 'guided_experience']),
  interests: z.array(z.string()).default([]),
  budget: z.number().positive().optional(),
  phone: z.string().optional(),
  contactMethod: z.enum(['email', 'phone', 'whatsapp'])
})
```

---

## 📊 KEY METRICS & ANALYTICS

### Platform Analytics (src/app/api/admin/analytics/route.ts)

```typescript
GET /api/admin/analytics

// Response:
{
  "users": {
    "students": {
      "total": 150,
      "pending": 25,
      "approved": 120,
      "suspended": 5
    },
    "tourists": {
      "total": 450,
      "withBookings": 280
    }
  },
  "requests": {
    "total": 380,
    "byStatus": {
      "PENDING": 15,
      "MATCHED": 45,
      "ACCEPTED": 280,
      "EXPIRED": 30,
      "CANCELLED": 10
    },
    "last30Days": 95
  },
  "revenue": {
    "total": 28500.00,
    "last30Days": 7200.00,
    "averageBookingValue": 75.00
  },
  "performance": {
    "averageMatchingTime": "2.3 seconds",
    "averageResponseTime": "4.5 hours",
    "completionRate": 0.87
  }
}
```

---

## 🎯 DESIGN SYSTEM (tailwind.config.ts)

### Color Palette

```typescript
colors: {
  primary: {
    50: '#eff6ff',   // Lightest blue
    100: '#dbeafe',
    500: '#3b82f6',  // Primary blue
    600: '#2563eb',
    900: '#1e3a8a'   // Darkest blue
  },
  secondary: {
    50: '#faf5ff',   // Lightest purple
    500: '#a855f7',  // Purple
    600: '#9333ea',
    900: '#581c87'
  },
  // ... more colors
}
```

### Typography Scale

```typescript
fontSize: {
  display: '4.5rem',     // 72px - Hero headlines
  h1: '3.75rem',         // 60px
  h2: '3rem',            // 48px
  h3: '2.25rem',         // 36px
  h4: '1.875rem',        // 30px
  h5: '1.5rem',          // 24px
  h6: '1.25rem',         // 20px
  body: '1rem',          // 16px
  small: '0.875rem',     // 14px
  caption: '0.75rem'     // 12px
}
```

### Shadows

```typescript
boxShadow: {
  soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
  premium: '0 8px 32px rgba(59, 130, 246, 0.15)',
  elevated: '0 12px 48px rgba(0, 0, 0, 0.12)',
  glow: '0 0 24px rgba(59, 130, 246, 0.4)'
}
```

---

## 🔍 SEARCH & DISCOVERY

### Cities Configuration (src/lib/constants.ts)

```typescript
export const SUPPORTED_CITIES = [
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    timezone: 'Europe/Paris',
    suggestedPriceRange: { min: 25, max: 75 }
  },
  {
    id: 'london',
    name: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    suggestedPriceRange: { min: 30, max: 80 }
  }
]
```

### Languages (src/config/languages.ts)

```typescript
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ru', name: 'Russian' }
  // ... more
]
```

---

## 📝 IMPORTANT NOTES

### Production Checklist

- [ ] Set all environment variables in Vercel
- [ ] Configure Google OAuth redirect URIs
- [ ] Set up PostgreSQL database (Vercel Postgres recommended)
- [ ] Configure Redis (Vercel KV or Upstash)
- [ ] Set up email SMTP (Gmail app password or SendGrid)
- [ ] Generate secure JWT_SECRET and NEXTAUTH_SECRET
- [ ] Configure Vercel Blob for file uploads
- [ ] Set up admin account (bcrypt hash password)
- [ ] Test matching algorithm with real data
- [ ] Configure CSP and security headers
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry optional)

### Known Limitations

1. **Payment System:** Razorpay integration is being removed (references still exist)
2. **Cities:** Only Paris and London supported (easy to expand)
3. **Email Verification:** 10-minute expiry (Redis-dependent)
4. **File Uploads:** Limited to Vercel Blob (consider S3 for scale)
5. **Matching:** Top 4 matches only (could be configurable)
6. **Demo Mode:** Works without database for initial testing

### Performance Optimizations

1. **Database Indexes:** All common query patterns indexed
2. **Caching:** Redis + in-memory fallback for all expensive queries
3. **Image Optimization:** AVIF/WebP with CDN (Unsplash/Pexels)
4. **Bundle Splitting:** Dynamic imports for heavy components
5. **SSR:** Server components for initial page loads
6. **Prefetching:** Next.js automatic prefetching enabled

---

## 🚧 FUTURE ENHANCEMENTS

### Planned Features

1. **Real-time Chat:** WebSocket integration for tourist-student messaging
2. **Calendar Integration:** Google Calendar sync for availability
3. **Multi-city Tours:** Support for multi-destination trips
4. **Video Verification:** Video selfie for enhanced security
5. **In-app Payments:** Replace email coordination with integrated payments
6. **Mobile App:** React Native companion app
7. **AI Matching:** Machine learning for better match predictions
8. **Review Moderation:** Automated content moderation
9. **Availability Sync:** Import from external calendars
10. **Multi-language UI:** i18n for non-English users

---

## 📚 REFERENCE LINKS

### Official Documentation
- Next.js 14: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- NextAuth.js: https://next-auth.js.org
- Radix UI: https://www.radix-ui.com
- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- Vercel: https://vercel.com/docs

### Third-party Services
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob
- Vercel KV (Redis): https://vercel.com/docs/storage/vercel-kv
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres

---

## 🆘 TROUBLESHOOTING

### Common Issues

**1. Database Connection Failed**
```bash
Error: P1001: Can't reach database server
Solution: Check DATABASE_URL in .env, verify PostgreSQL is running
```

**2. Google OAuth Not Working**
```bash
Error: Invalid client credentials
Solution: Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
Add correct redirect URIs in Google Console
```

**3. Email Not Sending**
```bash
Error: Invalid login: 535 Authentication failed
Solution: Use app-specific password for Gmail, not regular password
Enable 2FA and generate app password at myaccount.google.com
```

**4. Redis Connection Issues**
```bash
Warning: REDIS_URL not configured - using in-memory cache
Solution: This is fine for development, but set up Redis for production
```

**5. Matching Algorithm Returns Empty**
```bash
No matches found for request
Reasons:
- No approved students in that city
- Too restrictive preferences (nationality + language + gender)
- Students not available on requested dates
Solution: Relax preferences or approve more students
```

---

## 📄 FILE MANIFEST

**Critical Files to Never Delete:**

1. `src/prisma/schema.prisma` - Database schema (migrations depend on this)
2. `src/lib/auth-options.ts` - NextAuth configuration
3. `src/lib/matching/algorithm.ts` - Core matching logic
4. `src/middleware.ts` - Route protection
5. `package.json` - Dependencies
6. `.env` - Environment variables (never commit!)
7. `vercel.json` - Deployment configuration

**Safe to Modify:**

1. `tailwind.config.ts` - Design system
2. `src/components/` - All UI components
3. `src/app/page.tsx` - Landing page
4. `src/lib/constants.ts` - Cities, languages, etc.

**Legacy/Deprecated:**

1. Razorpay-related files (being removed)
2. `src/lib/payment/` (if exists)

---

## 📞 SUPPORT & CONTACT

For questions about this codebase, refer to:
- Project documentation in `/docs/`
- Code comments in key files
- This memory document

**Key Decision Points:**
- Authentication: NextAuth (Google OAuth) for simplicity
- Database: PostgreSQL (proven, scalable)
- Caching: Redis (with fallback for resilience)
- File Storage: Vercel Blob (integrated with hosting)
- Deployment: Vercel (serverless, auto-scaling)

---

## 🎓 LEARNING RESOURCES

If you're new to the stack:

1. **Next.js 14 App Router**: Start with the official tutorial
2. **Prisma ORM**: Complete the Prisma quickstart
3. **NextAuth.js**: Read the "Getting Started" guide
4. **TypeScript**: Basic understanding required
5. **Tailwind CSS**: Review utility-first CSS concepts

**Recommended Learning Path:**
1. Explore `/src/app/page.tsx` (landing page)
2. Read `/src/app/api/health/route.ts` (simple API)
3. Study `/src/app/api/tourist/request/initiate/route.ts` (full workflow)
4. Review `/src/lib/matching/algorithm.ts` (core business logic)
5. Understand `/src/components/booking/BookingForm.tsx` (complex UI)

---

**End of WanderNest2 Codebase Memory**

*This document contains the complete architecture, code patterns, and implementation details of the WanderNest2 platform. Refer to it when working in a normal Claude chat without access to the codebase.*

**Last Generated:** November 22, 2025
**Codebase Version:** 0.1.0
**Branch:** `claude/export-codebase-memory-016D1XmkaUs8Ghb2FCxrtM53`
