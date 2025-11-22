# TourWiseCo - Complete API & Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [User Flows](#user-flows)
4. [API Endpoints Summary](#api-endpoints-summary)
5. [Request-Response Cycle](#request-response-cycle)
6. [Authentication Flow](#authentication-flow)
7. [Data Models & Relationships](#data-models--relationships)
8. [Cross-Module Dependencies](#cross-module-dependencies)

---

## System Overview

TourWiseCo is a marketplace platform connecting international tourists with local student guides. The system comprises:

- **Admin Module**: Platform management and analytics
- **Student Module**: Local guide profiles and bookings
- **Tourist Module**: Booking requests and guide selection
- **Authentication Module**: Multi-method authentication (JWT, NextAuth)
- **Utility Module**: Shared resources and data

**Tech Stack**:
- Backend: Next.js (API Routes)
- Database: PostgreSQL (via Prisma ORM)
- Authentication: NextAuth.js v5 + JWT
- Email: Custom email service
- File Storage: Local file system (`/public/uploads/`)
- Caching: Redis (OTP codes)

---

## Architecture Diagram

### System-Level Spider Web

```
                          ┌─────────────────────────┐
                          │   External Services    │
                          └─────────────────────────┘
                                      │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                ┌─────────┐      ┌──────────────┐      ┌────────┐
                │  Google │      │  Email Svc   │      │ Redis  │
                │  OAuth  │      │  (SMTP)      │      │ Cache  │
                └────┬────┘      └──────┬───────┘      └───┬────┘
                     │                  │                   │
     ┌───────────────┴──────────────────┼───────────────────┴──────────┐
     │                                  │                              │
     │                          ╔═══════════════╗                      │
     │                          ║  NextAuth.js  ║                      │
     │                          ║   OAuth 2.0   ║                      │
     │                          ╚═══════════════╝                      │
     │                                  │                              │
     │                    ┌─────────────┼─────────────┐                │
     │                    │             │             │                │
     │            ┌──────────────┐  ┌──────────┐  ┌──────────┐       │
     │            │   /signin    │  │/callback │  │/session  │       │
     │            │  (Google)    │  │(Google)  │  │  check   │       │
     │            └──────────────┘  └──────────┘  └──────────┘       │
     │                    │                             │              │
     └────────┬───────────┼─────────────────────────────┼──────────┬──┘
              │           │                             │          │
         ┌────▼──────┐ ┌──▼──────────────────┐   ┌─────▼────┐ ┌─┴────────┐
         │  Database │ │ User Type Detection │   │ Redirect │ │  Verify  │
         │PostgreSQL │ │ (email domain check)│   │ Router   │ │  OTP     │
         └────┬──────┘ └──────────────────────┘   └─────┬────┘ └──┬───────┘
              │                                        │        │
     ┌────────┴──────────────────────────────────────┬┴────────┴┐
     │                                               │          │
 ┌───▼───────────────────────────┬──────────────────▼──┐  ┌────▼──────┐
 │                               │                     │  │  Redis OTP│
 │        API ROUTES LAYER       │                     │  │ (10 min)  │
 │                               │                     │  └────┬──────┘
 └───┬───────────────────────────┴──────────────────┬──┘       │
     │                                              │          │
 ┌───┴───────────────────────────────────────────────┴──────────┤
 │                                                              │
 │  ┌─────────────────────────────────────────────────────┐   │
 │  │              ADMIN MODULE (/api/admin)             │   │
 │  ├─────────────────────────────────────────────────────┤   │
 │  │ • /login - Admin authentication                    │   │
 │  │ • /students - List all students                    │   │
 │  │ • /students/pending - Pending approvals            │   │
 │  │ • /students/approve - Single approval              │   │
 │  │ • /students/bulk-approve - Bulk approval           │   │
 │  │ • /analytics - Platform metrics                    │   │
 │  │ • /reports - Manage reports                        │   │
 │  └──────┬──────────────────────────────────────────────┘   │
 │         │                                                  │
 │         └─────────────────┬────────────────────────────────┤
 │                           │                                │
 │  ┌─────────────────────────▼──────────────────────────┐   │
 │  │          STUDENT MODULE (/api/student)            │   │
 │  ├────────────────────────────────────────────────────┤   │
 │  │ AUTHENTICATION:                                    │   │
 │  │ • /auth/initiate - Send verification code         │   │
 │  │ • /auth/verify - Verify code & create session     │   │
 │  │ • /auth/session - Validate current session        │   │
 │  │                                                    │   │
 │  │ ONBOARDING:                                        │   │
 │  │ • /onboarding - Complete profile                  │   │
 │  │ • /upload - Upload ID document                    │   │
 │  │                                                    │   │
 │  │ DASHBOARD:                                         │   │
 │  │ • /dashboard - Get all dashboard data             │   │
 │  │                                                    │   │
 │  │ REQUEST MANAGEMENT:                               │   │
 │  │ • /requests/accept - Accept booking               │   │
 │  │ • /requests/reject - Reject booking               │   │
 │  │ • /requests/[id]/accept - Accept (alt)            │   │
 │  │ • /requests/[id]/reject - Reject (alt)            │   │
 │  └──────┬───────────────────────────────────────────┘   │
 │         │                                                 │
 │         └──────────────────┬────────────────────────────┤
 │                            │                             │
 │  ┌──────────────────────────▼─────────────────────────┐  │
 │  │       TOURIST MODULE (/api/tourist)               │  │
 │  ├──────────────────────────────────────────────────┤  │
 │  │ DASHBOARD ACCESS:                                │  │
 │  │ • /dashboard/access - Send verification code    │  │
 │  │ • /dashboard/verify - Verify & get JWT          │  │
 │  │ • /dashboard/requests - Get past requests       │  │
 │  │                                                  │  │
 │  │ REQUEST CREATION:                               │  │
 │  │ • /request/initiate - Start booking request     │  │
 │  │ • /request/verify - Verify & create request    │  │
 │  │ • /request/create - NextAuth authenticated      │  │
 │  │                                                  │  │
 │  │ GUIDE SELECTION:                                │  │
 │  │ • /request/match - Get matched guides           │  │
 │  │ • /request/select - Select students             │  │
 │  │                                                  │  │
 │  │ STATUS & BOOKINGS:                              │  │
 │  │ • /request/status - Check request status        │  │
 │  │ • /bookings - Get all bookings (NextAuth)       │  │
 │  └──────┬────────────────────────────────────────┘  │
 │         │                                             │
 │         └────────────┬──────────────────────────────┤
 │                      │                               │
 │  ┌───────────────────▼───────────────────────────┐  │
 │  │    UTILITY ENDPOINTS                          │  │
 │  ├───────────────────────────────────────────────┤  │
 │  │ • /cities - List available cities             │  │
 │  └───────────────────────────────────────────────┘  │
 │                                                      │
 └──────────────────────────────────────────────────────┘
```

---

## User Flows

### 1. Student User Journey (Request Acceptance Path)

```
STUDENT REGISTRATION & ONBOARDING
                │
                ├─▶ Email Verification
                │   └─▶ POST /api/student/auth/initiate
                │       ├─▶ Validate .edu email
                │       └─▶ Send 6-digit code (Redis)
                │
                ├─▶ Code Verification
                │   └─▶ POST /api/student/auth/verify
                │       └─▶ Create StudentSession (30 days)
                │
                └─▶ Profile Onboarding
                    └─▶ POST /api/student/onboarding
                        ├─▶ Upload ID (POST /api/student/upload)
                        ├─▶ Add preferences, languages, interests
                        ├─▶ Set availability
                        └─▶ Status: PENDING_APPROVAL
                            │
                            └─▶ ADMIN REVIEW
                                └─▶ POST /api/admin/students/approve
                                    └─▶ Status: APPROVED


STUDENT DASHBOARD & BOOKING ACCEPTANCE
                │
                ├─▶ Dashboard Access
                │   └─▶ GET /api/student/auth/session (validate)
                │       └─▶ GET /api/student/dashboard
                │           ├─▶ Profile info
                │           ├─▶ Statistics
                │           ├─▶ Pending requests
                │           ├─▶ Accepted bookings
                │           └─▶ Reviews
                │
                └─▶ Booking Decision
                    ├─▶ Accept Booking
                    │   └─▶ POST /api/student/requests/accept
                    │       ├─▶ Validate request status
                    │       ├─▶ Update to ACCEPTED
                    │       ├─▶ Remove other selections
                    │       └─▶ Send notification emails
                    │
                    └─▶ Reject Booking
                        └─▶ POST /api/student/requests/reject
                            └─▶ Mark selection as REJECTED
```

### 2. Tourist User Journey (Booking Path)

```
TOURIST BOOKING CREATION (Unregistered)
                │
                ├─▶ Request Initialization
                │   └─▶ POST /api/tourist/request/initiate
                │       ├─▶ Validate tourist email
                │       ├─▶ Collect trip details
                │       ├─▶ Send 6-digit verification code
                │       └─▶ Store in Redis (10 min TTL)
                │
                ├─▶ Request Verification & Creation
                │   └─▶ POST /api/tourist/request/verify
                │       ├─▶ Verify code (max 3 attempts)
                │       ├─▶ Create TouristRequest
                │       ├─▶ Status: PENDING
                │       ├─▶ Expiry: 7 days
                │       └─▶ Send confirmation email
                │
                └─▶ Guide Matching & Selection
                    ├─▶ Get Matches
                    │   └─▶ POST /api/tourist/request/match
                    │       ├─▶ Scoring algorithm:
                    │       │   ├─▶ Nationality match (50 pts)
                    │       │   ├─▶ Language match (20 pts each)
                    │       │   ├─▶ Interest overlap (10 pts each)
                    │       │   ├─▶ Rating (10 pts per ⭐)
                    │       │   ├─▶ Experience (5-30 pts)
                    │       │   └─▶ Reliability (20-25 pts)
                    │       └─▶ Return top 3-4 matches
                    │
                    └─▶ Select Students
                        └─▶ POST /api/tourist/request/select
                            ├─▶ Create RequestSelection records
                            ├─▶ Update request: PENDING → MATCHED
                            └─▶ Send notification emails to students


TOURIST DASHBOARD (NextAuth - Google OAuth)
                │
                ├─▶ Google OAuth Login
                │   └─▶ /api/auth/[...nextauth]
                │       ├─▶ /api/auth/signin (redirect to Google)
                │       ├─▶ /api/auth/callback/google (OAuth callback)
                │       └─▶ Detect user type (email domain)
                │
                ├─▶ Dashboard Access (NextAuth)
                │   └─▶ GET /api/tourist/bookings
                │       ├─▶ Validate NextAuth session
                │       ├─▶ Get all tourist requests
                │       ├─▶ Include selections & reviews
                │       └─▶ Return dashboard data
                │
                └─▶ Alternative: Dashboard Access (JWT)
                    ├─▶ POST /api/tourist/dashboard/access
                    │   └─▶ Send verification code
                    │
                    ├─▶ POST /api/tourist/dashboard/verify
                    │   └─▶ Return JWT (1 hour expiry)
                    │
                    └─▶ GET /api/tourist/dashboard/requests
                        └─▶ Get past requests (requires JWT)
```

### 3. Admin Review & Analytics Path

```
ADMIN AUTHENTICATION
                │
                └─▶ POST /api/admin/login
                    ├─▶ Validate credentials
                    └─▶ Return JWT (8 hour expiry)


STUDENT APPROVAL WORKFLOW
                │
                ├─▶ View Pending Students
                │   └─▶ GET /api/admin/students/pending
                │       └─▶ Return all PENDING_APPROVAL students
                │
                ├─▶ Individual Approval
                │   └─▶ POST /api/admin/students/approve
                │       ├─▶ Student ID
                │       ├─▶ Action: approve/reject
                │       └─▶ Update status
                │
                └─▶ Bulk Approval
                    └─▶ POST /api/admin/students/bulk-approve
                        ├─▶ Array of student IDs
                        ├─▶ Action: approve/reject
                        └─▶ Batch update


ANALYTICS & INSIGHTS
                │
                └─▶ GET /api/admin/analytics
                    ├─▶ Demand-supply ratio by city
                    ├─▶ Response time (avg hours)
                    ├─▶ Match success rate
                    ├─▶ Average price by service type
                    └─▶ Platform metrics


REPORT MANAGEMENT
                │
                ├─▶ View Reports
                │   └─▶ GET /api/admin/reports
                │       ├─▶ Filter by status
                │       └─▶ Pagination support
                │
                └─▶ Update Report Status
                    └─▶ PATCH /api/admin/reports
                        ├─▶ Mark as reviewed/resolved
                        └─▶ Update report record
```

---

## API Endpoints Summary

### Quick Reference Table

| Module | Endpoint | Method | Auth | Purpose |
|--------|----------|--------|------|---------|
| **Admin** | `/api/admin/login` | POST | ❌ | Admin authentication |
| | `/api/admin/students` | GET | ✅ JWT | List all students |
| | `/api/admin/students/pending` | GET | ✅ JWT | Get pending approvals |
| | `/api/admin/students/approve` | POST | ✅ JWT | Approve/reject single |
| | `/api/admin/students/bulk-approve` | POST | ✅ JWT | Bulk approvals |
| | `/api/admin/analytics` | GET | ✅ JWT | Platform metrics |
| | `/api/admin/reports` | GET | ✅ JWT | View reports |
| | `/api/admin/reports` | PATCH | ✅ JWT | Update report status |
| **Student** | `/api/student/auth/initiate` | POST | ❌ | Send verification code |
| | `/api/student/auth/verify` | POST | ❌ | Verify & create session |
| | `/api/student/auth/session` | GET | ✅ Token | Validate session |
| | `/api/student/onboarding` | POST | ❌ | Complete profile |
| | `/api/student/upload` | POST | ❌ | Upload ID document |
| | `/api/student/dashboard` | GET | ✅ Token | Dashboard data |
| | `/api/student/requests/accept` | POST | ✅ Token | Accept booking |
| | `/api/student/requests/reject` | POST | ✅ Token | Reject booking |
| | `/api/student/requests/[id]/accept` | POST | ✅ Token | Accept (alt) |
| | `/api/student/requests/[id]/reject` | POST | ✅ Token | Reject (alt) |
| **Tourist** | `/api/tourist/dashboard/access` | POST | ❌ | Send verification code |
| | `/api/tourist/dashboard/verify` | POST | ❌ | Get JWT token |
| | `/api/tourist/dashboard/requests` | GET | ✅ JWT | Get past requests |
| | `/api/tourist/request/initiate` | POST | ❌ | Start booking request |
| | `/api/tourist/request/verify` | POST | ❌ | Verify & create request |
| | `/api/tourist/request/create` | POST | ✅ NextAuth | Create (authenticated) |
| | `/api/tourist/request/match` | POST | ❌ | Get matched guides |
| | `/api/tourist/request/select` | POST | ❌ | Select students |
| | `/api/tourist/request/status` | GET | ❌ | Check request status |
| | `/api/tourist/bookings` | GET | ✅ NextAuth | Get bookings |
| **Utility** | `/api/cities` | GET | ❌ | List cities |

**Auth Legend**: ✅ = Required, ❌ = Not Required

---

## Request-Response Cycle

### Complete Booking Flow (Tourist → Student)

```
STEP 1: TOURIST INITIATES REQUEST
┌─────────────────────────────────────────┐
│ POST /api/tourist/request/initiate      │
├─────────────────────────────────────────┤
│ Input:                                  │
│ • email, city, dates                    │
│ • preferences (language, nationality)   │
│ • service type, interests               │
├─────────────────────────────────────────┤
│ Actions:                                │
│ • Validate email                        │
│ • Generate 6-digit code                 │
│ • Store in Redis (10 min TTL)           │
│ • Send email verification               │
├─────────────────────────────────────────┤
│ Output: 200 OK                          │
│ {                                       │
│   "message": "Code sent to email"       │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 2: TOURIST VERIFIES CODE
┌─────────────────────────────────────────┐
│ POST /api/tourist/request/verify        │
├─────────────────────────────────────────┤
│ Input:                                  │
│ • email, code (6 digits)                │
│ • all request details from Step 1       │
├─────────────────────────────────────────┤
│ Actions:                                │
│ • Verify code (max 3 attempts)          │
│ • Create TouristRequest record          │
│ • Set status = PENDING                  │
│ • Set expiry = now + 7 days             │
│ • Delete code from Redis                │
│ • Send confirmation email               │
├─────────────────────────────────────────┤
│ Output: 201 Created                     │
│ {                                       │
│   "requestId": "uuid",                  │
│   "status": "PENDING",                  │
│   "expiresAt": "2024-12-25T10:00:00Z"   │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 3: TOURIST GETS MATCHED GUIDES
┌─────────────────────────────────────────┐
│ POST /api/tourist/request/match         │
├─────────────────────────────────────────┤
│ Input:                                  │
│ • requestId                             │
├─────────────────────────────────────────┤
│ Actions:                                │
│ • Query all students in city            │
│ • Calculate match scores (8 factors)    │
│ • Sort by score descending              │
│ • Return top 3-4 matches                │
│ • Get pricing suggestion for city       │
├─────────────────────────────────────────┤
│ Output: 200 OK                          │
│ {                                       │
│   "matches": [                          │
│     {                                   │
│       "studentId": "uuid",              │
│       "score": 95,                      │
│       "name": "S***h",                  │
│       "rating": 4.8,                    │
│       "matchReasons": ["Language",...]  │
│     }                                   │
│   ],                                    │
│   "suggestedPrice": 50-80 USD           │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 4: TOURIST SELECTS STUDENTS
┌─────────────────────────────────────────┐
│ POST /api/tourist/request/select        │
├─────────────────────────────────────────┤
│ Input:                                  │
│ • requestId                             │
│ • selectedStudentIds (1-4)              │
├─────────────────────────────────────────┤
│ Actions:                                │
│ • Verify request exists                 │
│ • Create RequestSelection for each      │
│ • Update request status: MATCHED        │
│ • Send email notifications to students  │
├─────────────────────────────────────────┤
│ Output: 200 OK                          │
│ {                                       │
│   "message": "Selections created",      │
│   "selectionsCount": 3,                 │
│   "notificationsSent": true             │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 5: STUDENTS REVIEW REQUEST (in Dashboard)
┌─────────────────────────────────────────┐
│ GET /api/student/auth/session           │
│ GET /api/student/dashboard              │
├─────────────────────────────────────────┤
│ Actions:                                │
│ • Return student profile                │
│ • Include pending request selections    │
│ • Show request details                  │
│ • Display suggested price               │
├─────────────────────────────────────────┤
│ Output: 200 OK                          │
│ {                                       │
│   "pendingRequests": [                  │
│     {                                   │
│       "selectionId": "uuid",            │
│       "touristDetails": {...},          │
│       "tripDates": {...},               │
│       "preferences": {...}              │
│     }                                   │
│   ]                                     │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 6A: STUDENT ACCEPTS (or 6B: REJECTS)
┌─────────────────────────────────────────┐
│ POST /api/student/requests/[id]/accept  │
├─────────────────────────────────────────┤
│ Input:                                  │
│ • requestId                             │
│ • studentId (from session)              │
├─────────────────────────────────────────┤
│ Actions:                                │
│ • Begin transaction                     │
│ • Verify selection exists               │
│ • Update selection: ACCEPTED            │
│ • Update request: MATCHED → ACCEPTED    │
│ • Reject all other selections           │
│ • Send email to tourist (ACCEPTED)      │
│ • Send emails to rejected students      │
│ • Commit transaction                    │
├─────────────────────────────────────────┤
│ Output: 200 OK                          │
│ {                                       │
│   "message": "Booking accepted",        │
│   "touristContact": {                   │
│     "email": "tourist@example.com",     │
│     "phone": "+1234567890",             │
│     "whatsapp": "optional"              │
│   }                                     │
│ }                                       │
└─────────────────────────────────────────┘
                    ↓
STEP 7: BOOKING CONFIRMED
┌─────────────────────────────────────────┐
│ Booking Status: ACCEPTED                │
├─────────────────────────────────────────┤
│ Next Actions:                           │
│ • Student & Tourist communicate        │
│ • Complete booking details              │
│ • Payment processing (not in API)       │
│ • Guide meets tourist                   │
│ • Review exchange (future enhancement)  │
└─────────────────────────────────────────┘
```

---

## Authentication Flow

### Multi-Path Authentication System

```
┌──────────────────────────────────────────────────────────────┐
│               AUTHENTICATION ENTRY POINTS                    │
└──────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
         ┌──────▼──────┐ ┌───▼──────┐ ┌──▼──────────┐
         │  STUDENTS   │ │  ADMINS  │ │  TOURISTS   │
         └──────┬──────┘ └───┬──────┘ └──┬──────────┘
                │             │           │
         ┌──────▼──────┐  ┌───▼──────┐  ┌▼─────────────────────┐
         │ Email-based │  │ Email +  │  │ Email OR NextAuth    │
         │ OTP + JWT   │  │Password  │  │ (Google OAuth)       │
         │ (Custom)    │  │ JWT      │  │                      │
         └──────┬──────┘  └───┬──────┘  └─┬────────────────────┘
                │             │           │
         ┌──────▼──────┐  ┌───▼──────┐  ┌▼─────────────────────┐
         │ POST        │  │ POST     │  │ POST                 │
         │ /auth/      │  │ /admin/  │  │ /tourist/dashboard/  │
         │ initiate    │  │ login    │  │ access OR            │
         │             │  │          │  │ NextAuth signin      │
         │ Email       │  │ Email    │  │                      │
         │ Validation  │  │ Pass.    │  │ Email Validation     │
         │ .edu domain │  │ Match    │  │ (no restriction)     │
         │             │  │          │  │                      │
         └──────┬──────┘  └───┬──────┘  └─┬────────────────────┘
                │             │           │
         ┌──────▼──────────┐  │  ┌───────▼────────────────┐
         │ 6-digit code    │  │  │ NEXTAUTH OAUTH FLOW    │
         │ sent to email   │  │  ├────────────────────────┤
         │ Stored in Redis │  │  │ 1. User clicks signin  │
         │ (10 min TTL)    │  │  │ 2. Redirect to Google  │
         │                 │  │  │ 3. Google login        │
         │ Max 3 attempts  │  │  │ 4. OAuth callback      │
         │                 │  │  │ 5. Detect user type    │
         └──────┬──────────┘  │  │    (email domain)      │
                │             │  │ 6. Create/update User  │
         ┌──────▼──────────┐  │  │ 7. Set NextAuth cookie │
         │ POST            │  │  │ 8. Redirect to app     │
         │ /auth/verify    │  │  └────────┬─────────────┘
         │                 │  │           │
         │ Email + code    │  │  ┌────────▼──────────┐
         │ Verify match    │  │  │ NextAuth Session  │
         │ Delete code     │  │  │ in secure cookie  │
         │                 │  │  │ Contains:         │
         └──────┬──────────┘  │  │ • User ID         │
                │             │  │ • Email           │
         ┌──────▼──────────┐  │  │ • User type       │
         │ Create          │  │  │ • OAuth metadata  │
         │ StudentSession  │  │  │                   │
         │ Return JWT      │  │  │ Valid for         │
         │ (30 days)       │  │  │ browser session   │
         │                 │  │  │                   │
         └──────┬──────────┘  │  └────────┬──────────┘
                │             │           │
         ┌──────▼──────────┐  │  ┌────────▼──────────┐
         │ Token stored in:│  │  │ Access app as:    │
         │ • Cookie        │  │  │ • Authenticated   │
         │   (student_     │  │  │   tourist         │
         │   token)        │  │  │ • Can access:     │
         │ • Header        │  │  │   /tourist/       │
         │   (Bearer)      │  │  │   bookings        │
         │                 │  │  │ • Can create      │
         │ Used for:       │  │  │   authenticated   │
         │ • Session       │  │  │   requests        │
         │   validation    │  │  │                   │
         │ • Dashboard     │  │  └───────────────────┘
         │   access        │  │
         │                 │  │
         └──────┬──────────┘  │
                │             │
        ┌───────▼──────────┐  │ ┌────────────────────┐
        │ Middleware       │  │ │ JWT: 8 hour expiry │
        │ Validation on    │  │ └────────────────────┘
        │ Protected Routes │  │
        │                  │  │
        │ GET /dashboard   │  │
        │ GET /session     │  │
        │ POST /accept     │  │
        │ POST /reject     │  │
        └──────────────────┘  │
                               │
                    ┌──────────▼──────────┐
                    │ Authorized access   │
                    │ to protected APIs   │
                    └─────────────────────┘
```

### Token Structure

**JWT Student Token (30 days)**:
```json
{
  "studentId": "uuid",
  "email": "student@university.edu",
  "iat": 1700000000,
  "exp": 1702678000
}
```

**JWT Admin Token (8 hours)**:
```json
{
  "adminId": "uuid",
  "email": "admin@tourwiseco.com",
  "role": "admin",
  "iat": 1700000000,
  "exp": 1700028800
}
```

**JWT Tourist Token (1 hour)**:
```json
{
  "touristId": "uuid",
  "email": "tourist@example.com",
  "iat": 1700000000,
  "exp": 1700003600
}
```

**NextAuth Session (Browser Cookie)**:
```json
{
  "user": {
    "id": "uuid",
    "email": "tourist@example.com",
    "userType": "tourist",
    "image": "https://..."
  },
  "expires": "2024-12-25T10:00:00Z"
}
```

---

## Data Models & Relationships

### Database Schema Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      CORE ENTITIES                              │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│      STUDENT         │
├──────────────────────┤
│ id (PK)              │ ◄─────┐
│ email (unique)       │       │
│ name                 │       │
│ gender               │       │
│ nationality          │       │
│ institute            │       │
│ city                 │       │
│ idCardUrl            │       │
│ coverLetter          │       ├──┐
│ status               │       │  │
│ rating               │       │  │
│ reviewCount          │       │  │
│ createdAt            │       │  │
│ updatedAt            │       │  │
└──────────────────────┘       │  │
            │                  │  │
            │ 1:N              │  │
            ├──────────────────┤  │
            │                  │  │
        ┌───▼──────────────┐   │  │
        │ StudentLanguage  │   │  │
        ├──────────────────┤   │  │
        │ studentId (FK)   │───┘  │
        │ language         │      │
        └──────────────────┘      │
                                  │
        ┌──────────────────┐      │
        │ StudentInterest  │      │
        ├──────────────────┤      │
        │ studentId (FK)   │──────┤
        │ interest         │      │
        └──────────────────┘      │
                                  │
        ┌──────────────────────┐  │
        │ StudentAvailability  │  │
        ├──────────────────────┤  │
        │ id (PK)              │  │
        │ studentId (FK)       │◄─┘
        │ dayOfWeek (0-6)      │
        │ startTime            │
        │ endTime              │
        │ note (optional)      │
        └──────────────────────┘


┌──────────────────────┐
│      TOURIST         │
├──────────────────────┤
│ id (PK)              │ ◄─────┐
│ email (unique)       │       │
│ name (optional)      │       │
│ phone (optional)     │       │
│ image (optional)     │       │ 1:N
│ createdAt            │       │
│ updatedAt            │       ├────────────────┐
└──────────────────────┘       │                │
                               │                │
    ┌──────────────────────┐   │                │
    │  TOURIST_REQUEST     │   │                │
    ├──────────────────────┤   │                │
    │ id (PK)              │◄──┘                │
    │ touristId (FK)       │                   │
    │ city                 │                   │
    │ startDate            │                   │
    │ endDate              │                   │
    │ preferredTime        │    1:N            │
    │ numberOfGuests       │     │             │
    │ groupType            │     ├─────────────┤
    │ serviceType          │     │             │
    │ status               │     │             │
    │ (PENDING/MATCHED/    │     │             │
    │  ACCEPTED/EXPIRED)   │     │             │
    │ expiresAt            │     │             │
    │ createdAt            │     │             │
    └──────────────────────┘     │             │
            │                     │             │
            │ 1:N                 │             │
            │                     │             │
    ┌───────▼──────────────────┐  │             │
    │  REQUEST_SELECTION       │  │             │
    ├──────────────────────────┤  │             │
    │ id (PK)                  │  │             │
    │ requestId (FK)           │◄─┘             │
    │ studentId (FK)           │──────────────┐ │
    │ status                   │  1:N         │ │
    │ (PENDING/ACCEPTED/       │  (Review)    │ │
    │  REJECTED)               │              │ │
    │ createdAt                │              │ │
    └──────────────────────────┘              │ │
                                             │ │
        ┌────────────────────────────────────┘ │
        │                                      │
        │                    ┌─────────────────┘
        │                    │
    ┌───▼──────────────┐   ┌─▼────────────────┐
    │     REVIEW       │   │   REQUEST_       │
    ├──────────────────┤   │   SELECTION      │
    │ id (PK)          │   │   (see above)    │
    │ studentId (FK)   │   └──────────────────┘
    │ requestId (FK)   │
    │ rating (1-5)     │
    │ comment          │
    │ createdAt        │
    └──────────────────┘


┌──────────────────────┐
│       ADMIN          │
├──────────────────────┤
│ id (PK)              │
│ email (unique)       │
│ password (hashed)    │
│ role                 │
│ createdAt            │
│ updatedAt            │
└──────────────────────┘
         │
         │ 1:N
         │
    ┌────▼────────────────┐
    │  REPORT              │
    ├──────────────────────┤
    │ id (PK)              │
    │ studentId (FK)       │
    │ requestId (FK)       │
    │ reason               │
    │ description          │
    │ status               │
    │ (pending/reviewed/   │
    │  resolved)           │
    │ createdAt            │
    │ updatedAt            │
    └──────────────────────┘


┌──────────────────────────────────┐
│    AUTHENTICATION SESSIONS       │
├──────────────────────────────────┤
│  StudentSession                  │
│  ├─ id (PK)                      │
│  ├─ studentId (FK)               │
│  ├─ token                        │
│  ├─ expiresAt (30 days)           │
│  └─ createdAt                    │
│                                  │
│  TouristSession                  │
│  ├─ id (PK)                      │
│  ├─ touristId (FK)               │
│  ├─ token                        │
│  ├─ expiresAt (1 hour)            │
│  └─ createdAt                    │
│                                  │
│  NextAuth Tables                 │
│  ├─ User (NextAuth users)        │
│  ├─ Account (OAuth accounts)     │
│  ├─ Session (browser sessions)   │
│  └─ VerificationToken (email)    │
└──────────────────────────────────┘
```

---

## Cross-Module Dependencies

### Dependency Graph

```
┌────────────────────────────────────────────────────────────────┐
│              MODULE DEPENDENCY CHART                           │
└────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │ EXTERNAL SERVICES│
                    ├──────────────────┤
                    │ • Google OAuth   │
                    │ • Email Service  │
                    │ • Redis          │
                    │ • PostgreSQL     │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   NextAuth.js    │
                    │   OAuth Handler  │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼──────────┐ ┌──────▼──────┐ ┌───────────▼┐
    │ ADMIN MODULE │ │ STUDENT     │ │  TOURIST  │
    │              │ │ MODULE      │ │  MODULE   │
    ├──────────────┤ ├─────────────┤ ├───────────┤
    │ • Login      │ │ • Auth      │ │ • Auth    │
    │ • Students   │ │ • Onboard   │ │ • Request │
    │ • Analytics  │ │ • Dashboard │ │ • Match   │
    │ • Reports    │ │ • Requests  │ │ • Select  │
    └───┬──────────┘ └──────┬──────┘ └────┬──────┘
        │                   │              │
        │                   └──────────────┼─────────────────┐
        │                                  │                 │
        │                    ┌─────────────┘                 │
        │                    │                               │
        │              ┌─────▼─────────────┐         ┌────────────┐
        │              │ DATABASE SHARED   │         │ EMAIL      │
        │              │ MODELS            │         │ SERVICE    │
        │              ├───────────────────┤         ├────────────┤
        │              │ • Student         │         │ • Verify   │
        │              │ • Tourist         │         │ • Confirm  │
        │              │ • TouristRequest  │         │ • Notify   │
        │              │ • RequestSelection│◄────────┼─ • Remind  │
        │              │ • Review          │         │ • Alert    │
        │              │ • Report          │         └────────────┘
        │              │ • Session Models  │
        └──────────────┤ • NextAuth Models │
                       └─────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ REDIS CACHE        │
                    ├────────────────────┤
                    │ • OTP codes (10m)  │
                    │ • Rate limits      │
                    │ • Session cache    │
                    └────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ POSTGRESQL DB      │
                    │ (Persistent Data)  │
                    └────────────────────┘
```

### Feature Interdependencies

```
STUDENT APPROVAL WORKFLOW
┌─────────────────┐
│   Student Auth  │
│   (Initiate)    │
└────────┬────────┘
         │ Sends OTP via
         ▼ Email Service
┌─────────────────┐
│   Email Code    │
│  (Sent/Stored)  │
└────────┬────────┘
         │ User verifies
         ▼
┌─────────────────┐
│ Student Auth    │
│ (Verify)        │
└────────┬────────┘
         │ Creates session
         ▼
┌─────────────────┐
│ Student Session │
│ (Created)       │
└────────┬────────┘
         │ User submits profile
         ▼
┌─────────────────┐
│  Onboarding     │
│  (Complete)     │
└────────┬────────┘
         │ Sets status PENDING
         │ Sends notification
         ▼
┌─────────────────┐
│ Admin Review    │
│ (Pending list)  │
└────────┬────────┘
         │ Admin approves/rejects
         ▼
┌─────────────────┐
│ Student Status  │
│ (APPROVED)      │
└────────┬────────┘
         │ Can receive requests
         ▼
┌─────────────────┐
│ Dashboard       │
│ (View requests) │
└─────────────────┘


BOOKING LIFECYCLE
┌─────────────────────┐
│  Tourist Initiates  │
│   (Request)         │
└──────────┬──────────┘
           │ Sends OTP
           ▼
┌─────────────────────┐
│ Tourist Verifies    │
│ (Code check)        │
└──────────┬──────────┘
           │ Creates request
           ▼
┌─────────────────────┐
│  Tourist Matches    │
│  (Algorithm runs)   │
└──────────┬──────────┘
           │ Returns scores
           ▼
┌─────────────────────┐
│ Tourist Selects     │
│ (Choose students)   │
└──────────┬──────────┘
           │ Notify students
           │ Update status: MATCHED
           ▼
┌─────────────────────┐
│ Student Dashboard   │
│ (View request)      │
└──────────┬──────────┘
           │ Accept/Reject
           ▼
┌─────────────────────┐
│ Booking Accepted    │
│ (Status: ACCEPTED)  │
└──────────┬──────────┘
           │ Notify tourist
           │ Send contact info
           ▼
┌─────────────────────┐
│ Booking Complete    │
│ (Ready for review)  │
└─────────────────────┘
```

---

## Production Checklist

### Security
- [ ] All endpoints validate input (Zod schema)
- [ ] Authentication tokens properly signed
- [ ] HTTPS enforced (production)
- [ ] CORS properly configured
- [ ] Rate limiting on public endpoints
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF tokens on forms
- [ ] Passwords hashed (bcrypt)
- [ ] Sensitive data masked in responses

### Performance
- [ ] Database indexes on foreign keys
- [ ] Connection pooling configured
- [ ] Redis caching implemented
- [ ] API response times monitored
- [ ] Pagination implemented on list endpoints
- [ ] File uploads optimized (size limits)
- [ ] Database queries optimized

### Reliability
- [ ] Error handling on all endpoints
- [ ] Proper HTTP status codes
- [ ] Email service fallback
- [ ] Database transaction safety
- [ ] Session cleanup scheduled
- [ ] Expired requests cleanup
- [ ] Monitoring & alerting setup

### Deployment
- [ ] Environment variables secured
- [ ] Database migrations tested
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] CDN configured (if needed)
- [ ] API documentation updated
- [ ] Status page setup

---

## Quick Navigation

**API Endpoint Categories**:
- Admin Management: `/api/admin/*`
- Student Services: `/api/student/*`
- Tourist Booking: `/api/tourist/*`
- System Utilities: `/api/*`
- Authentication: `/api/auth/*`, `/api/student/auth/*`, `/api/tourist/dashboard/*`

**Common Flows**:
1. Student signup → approval → bookings
2. Tourist request → matching → selection → booking
3. Admin oversight → analytics

**Key Endpoints to Monitor**:
- `/api/tourist/request/verify` (high volume)
- `/api/student/requests/accept` (critical for business)
- `/api/tourist/request/match` (compute intensive)
- `/api/admin/analytics` (heavy queries)

---

**Last Updated**: 2025-11-18
**Document Version**: 1.0 (Production Ready)
