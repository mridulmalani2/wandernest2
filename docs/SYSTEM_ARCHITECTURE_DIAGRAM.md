# TourWiseCo - System Architecture & Spider Web Diagram

## Visual System Architecture (Spider Web View)

### Complete Platform Connectivity Map

```
                                    ┏━━━━━━━━━━━━━━━━━━┓
                                    ┃  EXTERNAL WORLD  ┃
                                    ┗━━━━━━━┳━━━━━━━━━┛
                                            │
                          ┌─────────────────┼─────────────────┐
                          │                 │                 │
                      ┌───▼───┐        ┌───▼───┐        ┌────▼────┐
                      │Google │        │ Email │        │  Redis  │
                      │ OAuth │        │Service│        │  Cache  │
                      └───┬───┘        └───┬───┘        └────┬────┘
                          │                │                 │
         ┌────────────────┼─────────┬──────┼─────────────────┼────────┐
         │                │         │      │                 │        │
         │        ┌───────▼────┐    │      │                 │        │
         │        │ NextAuth   │    │      │                 │        │
         │        │ Middleware │    │      │                 │        │
         │        └──────┬─────┘    │      │                 │        │
         │               │          │      │                 │        │
    ┌────▼────────────────▼──────────▼──────▼────────┐       │        │
    │                                                 │       │        │
    │         API REQUEST ROUTER LAYER              │       │        │
    │  (Next.js API Routes - Dynamic Routing)       │       │        │
    │                                                 │       │        │
    │  ┌──────────────────────────────────────────┐ │       │        │
    │  │  /api/*  - Main API Routing Handler      │ │       │        │
    │  │  - Route validation                      │ │       │        │
    │  │  - Middleware execution                  │ │       │        │
    │  │  - Error handling                        │ │       │        │
    │  └──────────────────────────────────────────┘ │       │        │
    │                                                 │       │        │
    └──┬───────────────────┬───────────────────┬─────┘       │        │
       │                   │                   │             │        │
       │                   │                   │             │        │
   ┌───▼──────────────┐ ┌──▼──────────────┐ ┌─▼─────────────┐         │
   │  ADMIN MODULE    │ │ STUDENT MODULE  │ │ TOURIST MODULE│         │
   └───┬──────────────┘ └──┬──────────────┘ └─┬─────────────┘         │
       │                  │                   │                       │
       │ ┌────────────────┴───────────────────┤                       │
       │ │                                    │                       │
   ┌───▼──────────────┐    ┌─────────────────▼──┐                    │
   │  AUTHENTICATION  │    │  SERVICE LAYER     │                    │
   │  SERVICES        │    │  (Business Logic)  │                    │
   └───┬──────────────┘    └─────────────────┬──┘                    │
       │                                      │                       │
       │                                      │                       │
   ┌───▼──────────────────────────────────────▼──────┐                │
   │                                                  │                │
   │  DATA ACCESS LAYER                             │                │
   │  ┌──────────────────────────────────────────┐  │                │
   │  │ Prisma ORM                               │  │                │
   │  │ - Student                                │  │                │
   │  │ - Tourist                                │  │                │
   │  │ - TouristRequest                         │  │                │
   │  │ - RequestSelection                       │  │                │
   │  │ - Admin                                  │  │                │
   │  │ - Review                                 │  │                │
   │  │ - StudentSession                         │  │                │
   │  │ - TouristSession                         │  │                │
   │  │ - and more...                            │  │                │
   │  └─────────────────────┬────────────────────┘  │                │
   └────────────────────────┼──────────────────────┘                │
                            │                                        │
                    ┌───────▼────────┐                              │
                    │  PostgreSQL    │◄─────────────────────────────┘
                    │  Database      │
                    └──────┬─────────┘
                           │
                   ┌───────▼────────┐
                   │ Persisted Data │
                   │  (All Models)  │
                   └────────────────┘
```

---

## Detailed Module Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE REQUEST FLOW MAP                        │
└─────────────────────────────────────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════╗
║ 1. STUDENT FLOW (Registration → Dashboard → Booking Handling)      ║
╚════════════════════════════════════════════════════════════════════╝

    STUDENT INITIATES SIGNUP
            │
            ▼
    ┌───────────────────────────────────┐
    │ POST /api/student/auth/initiate   │
    │ Validate .edu email domain        │
    │ Generate OTP in Redis             │
    │ Send verification email           │
    └──────────┬────────────────────────┘
               │ Email received
               ▼
    ┌───────────────────────────────────┐
    │ POST /api/student/auth/verify     │
    │ Match OTP from Redis              │
    │ Create StudentSession (30 days)   │
    │ Return JWT token                  │
    └──────────┬────────────────────────┘
               │ Session established
               ▼
    ┌───────────────────────────────────┐
    │ POST /api/student/onboarding      │
    │ • Upload ID doc                   │
    │ • POST /api/student/upload        │
    │ • Add bio, languages, interests   │
    │ • Set availability slots          │
    │ • Status: PENDING_APPROVAL        │
    └──────────┬────────────────────────┘
               │ Profile submitted
               ▼
    ┌───────────────────────────────────┐
    │ ADMIN REVIEWS SUBMISSION          │
    │ GET /api/admin/students/pending   │
    │ POST /api/admin/students/approve  │
    │ • Status: APPROVED                │
    │ • Send approval email             │
    └──────────┬────────────────────────┘
               │ Approved
               ▼
    ┌───────────────────────────────────┐
    │ STUDENT LOGS INTO DASHBOARD       │
    │ GET /api/student/auth/session     │
    │ GET /api/student/dashboard        │
    │ • View profile                    │
    │ • View pending requests           │
    │ • View accepted bookings          │
    │ • View reviews                    │
    └──────────┬────────────────────────┘
               │ Sees request
               ▼
    ┌───────────────────────────────────┐
    │ STUDENT ACCEPTS/REJECTS REQUEST   │
    │ POST /api/student/requests/accept │
    │ OR                                │
    │ POST /api/student/requests/reject │
    │ • Update RequestSelection status  │
    │ • Email tourist & other students  │
    │ • Request: MATCHED → ACCEPTED     │
    └──────────┬────────────────────────┘
               │
               ▼
    ┌───────────────────────────────────┐
    │ BOOKING CONFIRMED                 │
    │ • Tourist contact info revealed   │
    │ • Direct communication begins     │
    │ • Payment & booking details       │
    └───────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════╗
║ 2. TOURIST FLOW (Booking → Guide Selection → Confirmation)        ║
╚════════════════════════════════════════════════════════════════════╝

    TOURIST STARTS BOOKING REQUEST
            │
            ▼
    ┌──────────────────────────────────────┐
    │ POST /api/tourist/request/initiate   │
    │ • Select city, dates, preferences    │
    │ • Specify service type & interests   │
    │ • Send verification code to email    │
    │ • Store code in Redis (10 min)       │
    └──────────┬─────────────────────────┘
               │ Code received
               ▼
    ┌──────────────────────────────────────┐
    │ POST /api/tourist/request/verify     │
    │ • Verify code (max 3 attempts)       │
    │ • Create TouristRequest              │
    │ • Status: PENDING                    │
    │ • Expiry: 7 days                     │
    │ • Send confirmation email            │
    └──────────┬─────────────────────────┘
               │ Request created
               ▼
    ┌──────────────────────────────────────┐
    │ POST /api/tourist/request/match      │
    │                                      │
    │ MATCHING ALGORITHM:                  │
    │ • Query students in city             │
    │ • Score by 8 factors:                │
    │   1. Nationality match (50 pts)      │
    │   2. Language match (20 pts each)    │
    │   3. Interest overlap (10 pts each)  │
    │   4. Rating (10 pts per ⭐)          │
    │   5. Experience (5-30 pts)           │
    │   6. Reliability (20-25 pts)         │
    │   7. Availability match (dynamic)    │
    │   8. Response history (bonus)        │
    │ • Return top 3-4 matches             │
    │ • Suggest price range for city       │
    └──────────┬─────────────────────────┘
               │ Matches displayed
               ▼
    ┌──────────────────────────────────────┐
    │ Tourist reviews matched profiles     │
    │ • See partially masked names         │
    │ • View ratings & reviews             │
    │ • Check languages & interests        │
    └──────────┬─────────────────────────┘
               │ Makes selection
               ▼
    ┌──────────────────────────────────────┐
    │ POST /api/tourist/request/select     │
    │ • Select 1-4 preferred students      │
    │ • Create RequestSelection records    │
    │ • Update request: PENDING → MATCHED  │
    │ • Send notification emails to        │
    │   selected students                  │
    │ • Include request details & link     │
    └──────────┬─────────────────────────┘
               │ Notifications sent
               ▼
    ┌──────────────────────────────────────┐
    │ Tourist can check status anytime     │
    │ GET /api/tourist/request/status      │
    │ • Current status                     │
    │ • Selected student count             │
    │ • Awaiting acceptances               │
    └──────────┬─────────────────────────┘
               │ Waiting for response
               ▼
    ┌──────────────────────────────────────┐
    │ STUDENT ACCEPTS → BOOKING CONFIRMED  │
    │ • Tourist receives notification      │
    │ • Student contact info revealed      │
    │ • Can proceed with booking details   │
    └──────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════╗
║ 3. ADMIN FLOW (Oversight → Analytics → Management)                ║
╚════════════════════════════════════════════════════════════════════╝

    ADMIN ACCESSES DASHBOARD
            │
            ▼
    ┌──────────────────────────────────────┐
    │ POST /api/admin/login                │
    │ • Email + Password authentication    │
    │ • Return JWT (8 hour validity)       │
    │ • Store token securely               │
    └──────────┬─────────────────────────┘
               │ Login successful
               ▼
    ┌──────────────────────────────────────┐
    │ ADMIN DASHBOARD OPTIONS              │
    │                                      │
    │ A. Student Management:               │
    │    GET /api/admin/students           │
    │    GET /api/admin/students/pending   │
    │    POST /api/admin/students/approve  │
    │    POST /api/admin/students/bulk-app │
    │                                      │
    │ B. Analytics & Reports:              │
    │    GET /api/admin/analytics          │
    │    GET /api/admin/reports            │
    │    PATCH /api/admin/reports          │
    └──────────┬─────────────────────────┘
               │
        ┌──────┴──────────────────┐
        │                         │
        ▼                         ▼
    ┌────────────────┐    ┌──────────────────┐
    │ APPROVALS      │    │ ANALYTICS        │
    ├────────────────┤    ├──────────────────┤
    │ Review pending │    │ • Demand-supply  │
    │ student list   │    │   ratio by city  │
    │ • View profile │    │ • Response times │
    │ • Verify docs  │    │ • Match rate     │
    │ • Check refs   │    │ • Pricing trends │
    │ • Approve/     │    │ • Platform stats │
    │   reject       │    │ • Student/Tourist│
    │ • Bulk ops     │    │   counts         │
    │ • Send emails  │    │ • Report issues  │
    └────────────────┘    └──────────────────┘
           │                      │
           ▼                      ▼
    Database Updates        Insights & Decisions
    Status: APPROVED              │
    or SUSPENDED                  ▼
           │              Generate reports
           │              Identify trends
           ▼              Make platform changes
    Approval email sent


╔════════════════════════════════════════════════════════════════════╗
║ 4. NEXTAUTH GOOGLE OAUTH FLOW                                     ║
╚════════════════════════════════════════════════════════════════════╝

    USER CLICKS "SIGN IN WITH GOOGLE"
            │
            ▼
    ┌──────────────────────────────────────┐
    │ GET /api/auth/signin                 │
    │ → Redirect to Google OAuth consent   │
    └──────────┬─────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────┐
    │ Google OAuth Login Page              │
    │ • User enters credentials            │
    │ • Grant permission to TourWiseCo     │
    └──────────┬─────────────────────────┘
               │ User grants access
               ▼
    ┌──────────────────────────────────────┐
    │ GET /api/auth/callback/google        │
    │ • Receive OAuth code from Google     │
    │ • Exchange code for access token     │
    │ • Fetch user info from Google        │
    │ • Check email domain:                │
    │   - .edu? → Tourist                  │
    │   - Other? → Tourist                 │
    │ • Create/Update User record          │
    │ • Create session cookie              │
    └──────────┬─────────────────────────┘
               │ OAuth complete
               ▼
    ┌──────────────────────────────────────┐
    │ NextAuth Session established         │
    │ • Browser cookie set                 │
    │ • user.userType = "tourist"          │
    │ • Redirect to app                    │
    └──────────┬─────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────────┐
    │ Can now access:                      │
    │ • GET /api/tourist/bookings          │
    │   (NextAuth authenticated)           │
    │ • POST /api/tourist/request/create   │
    │   (NextAuth authenticated)           │
    │ • Full user info from session        │
    └──────────────────────────────────────┘


╔════════════════════════════════════════════════════════════════════╗
║ 5. OTP & VERIFICATION FLOW (Used by Students & Tourists)          ║
╚════════════════════════════════════════════════════════════════════╝

    USER REQUESTS VERIFICATION
            │
            ▼
    ┌──────────────────────────────────┐
    │ Generate 6-digit code:           │
    │ Math.random() → 000000-999999    │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │ Store in Redis with metadata:    │
    │ Key: otp:<email>:<type>          │
    │ Value: { code, attempts, time }  │
    │ TTL: 10 minutes (tourist)        │
    │     or 15 minutes (student)      │
    └──────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │ Send email via Email Service     │
    │ Subject: "Your verification code"│
    │ Body: "Your code is: 123456"     │
    └──────────┬──────────────────────┘
               │ Code in user's inbox
               ▼
    ┌──────────────────────────────────┐
    │ User submits code                │
    │ POST /api/.../verify             │
    └──────────┬──────────────────────┘
               │
        ┌──────┴──────────┐
        │                 │
        ▼                 ▼
    Match?              No Match
    ├─ YES              ├─ Increment attempts
    │  ├─ Delete code   │  ├─ 3 attempts?
    │  │  from Redis    │  │  └─ Block temporarily
    │  │  ├─ Create     │  │  └─ User must retry
    │  │  │  session    │  │
    │  │  ├─ Return     │  └─ Return error
    │  │  │  token      │
    │  │  └─ Success    │
    │  │
    │  └─ User logged in
    │
    └─ Verified!
```

---

## Request Flow Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│              ALL ENDPOINTS & THEIR CONNECTIONS                 │
└─────────────────────────────────────────────────────────────────┘

                        ┏━━━━━━━━━━━━━━┓
                        ┃ USER REQUEST ┃
                        ┗━━━━━┳━━━━━━━━┛
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼┐    ┌───▼────┐  ┌▼─────────┐
            │ Admin  │    │Student │  │ Tourist  │
            │ Login  │    │Auth    │  │ Access   │
            └───┬────┘    └───┬────┘  └┬─────────┘
                │             │        │
        ┌───────▼──────┐  ┌───▼────┐  ┌▼────────────┐
        │ JWT 8h       │  │JWT 30d │  │JWT 1h / NH  │
        │ /admin/login │  │/student│  │/tourist/    │
        │              │  │/auth/* │  │dashboard/*  │
        └───┬──────────┘  └───┬────┘  └┬────────────┘
            │                 │        │
        ┌───▼──────────────┐  │  ┌─────▼──────────────┐
        │ ADMIN ENDPOINTS  │  │  │ TOURIST ENDPOINTS  │
        │ ├─ /students     │  │  │ ├─ /request/*      │
        │ ├─ /analytics    │  │  │ ├─ /bookings       │
        │ └─ /reports      │  │  │ └─ /dashboard/*    │
        └────┬─────────────┘  │  └─────┬──────────────┘
             │                 │        │
             │        ┌────────▼────┐  │
             │        │ STUDENT     │  │
             │        │ ENDPOINTS   │  │
             │        │ ├─ /dash    │  │
             │        │ ├─ /upload  │  │
             │        │ └─ /requests│  │
             │        └────────┬────┘  │
             │                 │        │
             └────────┬────────┼────────┘
                      │        │
              ┌───────▼────────▼──────┐
              │ SHARED DATABASE LAYER │
              │ ┌─────────────────┐  │
              │ │ All models:     │  │
              │ │ • Student       │  │
              │ │ • Tourist       │  │
              │ │ • Request       │  │
              │ │ • Selection     │  │
              │ │ • Review        │  │
              │ │ • Report        │  │
              │ └─────────────────┘  │
              └───────┬──────────────┘
                      │
              ┌───────▼──────────┐
              │ PostgreSQL DB    │
              │ (Persistent)     │
              └────────────────┘

              SHARED SERVICES:
              ├─ Redis (OTP, Cache)
              ├─ Email Service (Notifications)
              └─ NextAuth (OAuth)
```

---

## Key Connection Points

### Database Relationships

```
STUDENT TABLE
    ↓ 1:N
    ├─→ StudentSession (auth sessions)
    ├─→ StudentLanguage (languages spoken)
    ├─→ StudentInterest (interests)
    ├─→ StudentAvailability (availability slots)
    ├─→ RequestSelection (selections from tourists)
    │   ↓ 1:N
    │   ├─→ TouristRequest (linked request)
    │   └─→ Review (reviews given to this selection)
    └─→ Review (reviews received)

TOURIST TABLE
    ↓ 1:N
    ├─→ TouristSession (auth sessions)
    └─→ TouristRequest (requests created by tourist)
        ↓ 1:N
        └─→ RequestSelection (selections for this request)
            ↓ N:1
            └─→ Student (selected student)

TOURIST_REQUEST TABLE
    ↓ 1:N
    └─→ RequestSelection
        ↓ N:1
        ├─→ Student (selected guide)
        └─→ Review (review of experience)

REQUEST_SELECTION TABLE
    ↓ N:1
    ├─→ TouristRequest (parent request)
    ├─→ Student (selected guide)
    └─→ Review (review written) [optional]

ADMIN TABLE
    ↓ 1:N
    └─→ Report (reports created/resolved)

REPORT TABLE
    ├─→ Student (reported student)
    └─→ TouristRequest (related request)
```

---

## Data Flow Diagram

```
USER INPUT
    │
    ├─→ Email validation (Zod)
    │
    ├─→ Business logic processing
    │   ├─ Session verification
    │   ├─ Database queries (Prisma)
    │   ├─ Calculation (matching algorithm)
    │   └─ State updates (database writes)
    │
    ├─→ Side effects
    │   ├─ Send emails (SMTP)
    │   ├─ Cache updates (Redis)
    │   ├─ File uploads (local storage)
    │   └─ Logging
    │
    └─→ API RESPONSE
        ├─ Success (200/201)
        ├─ Client Error (400/401/403/404)
        └─ Server Error (500)
```

---

## Authentication & Authorization Matrix

```
ENDPOINT                          ANON   JWT    NEXTAUTH  ADMIN
────────────────────────────────────────────────────────────────
/api/student/auth/initiate          ✅     ❌       ❌       ❌
/api/student/auth/verify            ✅     ❌       ❌       ❌
/api/student/auth/session           ❌     ✅       ❌       ❌
/api/student/onboarding             ✅     ❌       ❌       ❌
/api/student/upload                 ✅     ❌       ❌       ❌
/api/student/dashboard              ❌     ✅       ❌       ❌
/api/student/requests/*             ❌     ✅       ❌       ❌

/api/admin/login                    ✅     ❌       ❌       ❌
/api/admin/students                 ❌     ❌       ❌       ✅
/api/admin/students/pending         ❌     ❌       ❌       ✅
/api/admin/students/approve         ❌     ❌       ❌       ✅
/api/admin/analytics                ❌     ❌       ❌       ✅
/api/admin/reports                  ❌     ❌       ❌       ✅

/api/tourist/dashboard/access       ✅     ❌       ❌       ❌
/api/tourist/dashboard/verify       ✅     ❌       ❌       ❌
/api/tourist/dashboard/requests     ❌     ✅       ❌       ❌
/api/tourist/request/initiate       ✅     ❌       ❌       ❌
/api/tourist/request/verify         ✅     ❌       ❌       ❌
/api/tourist/request/create         ❌     ❌       ✅       ❌
/api/tourist/request/match          ✅     ❌       ❌       ❌
/api/tourist/request/select         ✅     ❌       ❌       ❌
/api/tourist/request/status         ✅     ❌       ❌       ❌
/api/tourist/bookings               ❌     ❌       ✅       ❌

/api/cities                         ✅     ❌       ❌       ❌
/api/auth/[...nextauth]             ✅     ❌       ❌       ❌

Legend: ✅ = Allowed, ❌ = Not Allowed
```

---

## State Transition Diagram

### Student Status Transitions

```
┌─────────────────────┐
│   User submits      │
│   profile form      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Status: PENDING_APPROVAL       │
│  Awaiting admin review          │
└──────────┬──────────────────────┘
           │
       ┌───┴────┐
       │        │
   APPROVE   REJECT
       │        │
       ▼        ▼
   ┌──────────────────────┐     ┌─────────────────┐
   │ Status: APPROVED     │     │Status: SUSPENDED│
   │ Can receive requests │     │ Cannot apply    │
   │ Active in system     │     │ Account blocked │
   └──────────┬───────────┘     └─────────────────┘
              │
              ├─→ [Can now be selected for bookings]
              │
              └─→ [Can accept/reject requests]
```

### Tourist Request Status Transitions

```
┌─────────────┐
│ PENDING     │ (Just created, awaiting match)
└──────┬──────┘
       │ Tourist clicks "see matches"
       ▼
┌─────────────┐
│ MATCHED     │ (Selections sent to students)
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
ACCEPT   REJECT
   │     (tourist
   │      cancels)
   │        │
   ▼        ▼
┌────────────┐   ┌─────────────┐
│ ACCEPTED   │   │ CANCELLED   │
│ (Booking   │   │ (No longer  │
│  confirmed)│   │  available) │
└────────────┘   └─────────────┘
   ▲
   │ [7 day expiry]
   │ Auto-expire if
   └─ no acceptance
      ▼
   ┌─────────────┐
   │ EXPIRED     │
   │ (No longer  │
   │  valid)     │
   └─────────────┘
```

### Booking Selection Status Transitions

```
┌──────────────────┐
│ PENDING          │
│ (Awaiting student│
│  response)       │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
 ACCEPT    REJECT
    │        │
    ▼        ▼
┌──────────────┐  ┌──────────────┐
│ ACCEPTED     │  │ REJECTED     │
│ (Confirmed)  │  │ (Student    │
│ (Contact     │  │  declined)   │
│  info shown) │  └──────────────┘
└──────────────┘
```

---

## Error Handling Flow

```
REQUEST
    │
    ├─→ Input Validation (Zod)
    │   │
    │   ├─ FAIL → 400 Bad Request
    │   │   └─ Return validation errors
    │   │
    │   └─ PASS
    │       │
    │       ▼
    ├─→ Authentication Check
    │   │
    │   ├─ Missing token → 401 Unauthorized
    │   ├─ Invalid token → 401 Unauthorized
    │   │
    │   └─ Valid
    │       │
    │       ▼
    ├─→ Authorization Check
    │   │
    │   ├─ Insufficient permissions → 403 Forbidden
    │   │
    │   └─ Allowed
    │       │
    │       ▼
    ├─→ Business Logic
    │   │
    │   ├─ Resource not found → 404 Not Found
    │   ├─ Conflict (e.g., already accepted) → 409 Conflict
    │   ├─ Database error → 500 Internal Server Error
    │   │
    │   └─ Success
    │       │
    │       ▼
    ├─→ Execute Side Effects
    │   │
    │   ├─ Email send failure → 500 (logged)
    │   ├─ File upload failure → 500
    │   │
    │   └─ Success
    │       │
    │       ▼
    └─→ 200 OK or 201 Created (Success Response)
```

---

## Production Deployment Flow

```
CODE CHANGES
    │
    ├─→ Test Suite Execution
    │   ├─ Unit tests
    │   ├─ Integration tests
    │   └─ E2E tests
    │
    ├─→ Code Review & Approval
    │
    ├─→ Build Verification
    │   ├─ TypeScript compilation
    │   ├─ Next.js build
    │   └─ Bundle analysis
    │
    ├─→ Security Scan
    │   ├─ Dependency vulnerabilities
    │   └─ Code analysis
    │
    ├─→ Database Migration Check
    │   ├─ Prisma migration validation
    │   └─ Schema compatibility
    │
    ├─→ Staging Deployment
    │   ├─ Deploy to staging
    │   ├─ Smoke tests
    │   └─ Manual verification
    │
    ├─→ Production Deployment
    │   ├─ Zero-downtime deployment
    │   ├─ Health checks
    │   └─ Rollback capability
    │
    └─→ Monitoring & Alerts
        ├─ Error rate monitoring
        ├─ Performance metrics
        ├─ User feedback
        └─ Incident response
```

---

**This comprehensive spider web diagram shows:**
✅ All API endpoint connections
✅ Complete user journey flows
✅ Data model relationships
✅ Authentication & authorization paths
✅ State transitions
✅ Error handling
✅ Integration points between modules
✅ External service dependencies
✅ Database query flows
✅ Production deployment pipeline

**Use this as a reference when:**
- Adding new features
- Refactoring existing code
- Understanding data flow
- Planning scalability
- Debugging issues
- Onboarding new developers
