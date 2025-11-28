# 🔐 Authentication System - Complete Overhaul

## Overview

The authentication system has been completely overhauled to provide a **simple, robust, and immutable email-based role assignment** system. Users are automatically assigned to either Student or Tourist roles based on their email domain, and this assignment is permanent.

## Key Features

### ✅ 1. Immutable Email-Based Role Assignment

**How it works:**
- **Educational emails (.edu, .ac.uk, .edu.au, etc.) → Student** (permanent)
- **All other emails → Tourist** (permanent)

**Why immutable?**
- Prevents confusion from role-switching
- Ensures data integrity
- Simplifies the user experience
- Matches real-world use cases (students use university emails, tourists use personal emails)

### ✅ 2. Flexible Authentication Options

**Students have TWO sign-in methods:**
- **Google OAuth**: For university emails hosted on Google Workspace (e.g., Gmail-based .edu)
- **Magic Link**: For non-Google university emails (e.g., HEC, custom email systems)

**Tourists use:**
- **Google OAuth**: For personal emails (Gmail, etc.)

**Benefits:**
- Supports ALL university email systems (Google and non-Google)
- Magic-link ensures students with custom email systems can sign in
- Faster sign-in with Google OAuth when available
- Works across all devices

### ✅ 3. Persistent Profiles

**Students:**
- Profile data stored in `Student` table
- Linked to email address (primary key)
- Accessible from any device
- Includes: name, institute, program, services, availability, etc.

**Tourists:**
- Profile data stored in `Tourist` table
- Linked to email address (primary key)
- Accessible from any device
- Includes: name, image, booking history

### ✅ 4. Smart Dashboard Routing

**Automatic routing based on role:**
- Students → `/student/onboarding` (if incomplete) or `/student/dashboard`
- Tourists → `/tourist/dashboard`

**Protected by middleware:**
- Checks JWT token for userType
- Redirects unauthorized users
- Enforces onboarding completion for students

### ✅ 5. Session-Integrated Booking Forms

**Email auto-fill:**
- When signed in, email field is automatically filled
- Email field is read-only (locked) to prevent changes
- Shows "✓ Email linked to your account" message

**Benefits:**
- Faster booking process
- Prevents typos
- Ensures bookings are linked to the correct account

---

## Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SIGNS IN                            │
│                (Google OAuth - any page)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Check Email Domain  │
         └─────────┬───────────┘
                   │
         ┌─────────┴────────────┐
         ▼                      ▼
  .edu/.ac.uk/etc?          Others?
  (Student)                (Tourist)
         │                      │
         ▼                      ▼
  Create/Update            Create/Update
  Student Record          Tourist Record
  (IMMUTABLE)            (IMMUTABLE)
         │                      │
         ▼                      ▼
  /student/auth-landing   /tourist/auth-landing
         │                      │
         ▼                      ▼
  Redirect based           Redirect to
  on onboarding           /tourist/dashboard
  status
```

### Database Schema

```sql
-- User (NextAuth core table)
User {
  id: String (cuid)
  email: String (unique)
  userType: String ("student" | "tourist") -- IMMUTABLE
  // ... NextAuth fields
}

-- Student (role-specific table)
Student {
  id: String (cuid)
  email: String (unique) -- matches User.email
  name: String
  institute: String
  programDegree: String
  city: String -- required for onboarding completion
  status: StudentStatus (PENDING_APPROVAL | APPROVED | SUSPENDED)
  // ... profile fields
}

-- Tourist (role-specific table)
Tourist {
  id: String (cuid)
  email: String (unique) -- matches User.email
  name: String
  image: String
  // ... profile fields
}
```

**Key Points:**
- Each user has exactly ONE record in either Student OR Tourist (never both)
- Email is the linking field between User and role-specific tables
- userType is set once during first sign-in and never changes

---

## Implementation Details

### 1. Auth Configuration (`src/lib/auth-options.ts`)

**Lines 312-357: Immutable Role Determination**
```typescript
// Determine user type IMMUTABLY based on email domain
const userType: 'student' | 'tourist' = isStudentEmail(user.email)
  ? 'student'
  : 'tourist';
```

**Lines 376-431: Single Record Creation**
```typescript
// Create ONLY the appropriate record (not both)
if (userType === 'student') {
  await prisma.student.upsert({ /* ... */ })
} else {
  await prisma.tourist.upsert({ /* ... */ })
}
```

### 2. Sign-In Pages

**Student Sign-In** (`src/app/student/signin/page.tsx`):
- **Primary**: Google OAuth button (for Google-based university emails)
- **Alternative**: Magic link form (for non-Google university emails like HEC)
- Email domain validation (.edu, .ac.uk, etc.) enforced for magic link
- Divider: "Or use magic link"
- Redirects to `/student/auth-landing`
- **Note**: This dual-auth approach supports ALL university email systems

**Tourist Sign-In** (`src/app/tourist/signin/page.tsx`):
- Google OAuth button (sufficient for personal emails)
- Redirects to `/tourist/auth-landing`

### 3. Auth Landing Pages

**Student Landing** (`src/app/student/auth-landing/page.tsx`):
```typescript
// Check if user is actually a student based on email
if (session.user.userType === 'student') {
  // Route to onboarding or dashboard
} else {
  // Show error: "Student access requires university email"
}
```

**Tourist Landing** (`src/app/tourist/auth-landing/page.tsx`):
```typescript
// Check if user is actually a tourist based on email
if (session.user.userType === 'tourist') {
  // Route to dashboard
} else {
  // Show error: "You are registered as a student"
}
```

### 4. Middleware Protection (`middleware.ts`)

**Lines 44-66: Student Route Protection**
```typescript
if (pathname.startsWith('/student/dashboard') ||
    pathname.startsWith('/student/onboarding')) {
  const token = await getToken({ req: request })

  // Verify userType
  if (token.userType !== 'student') {
    redirect('/student/signin')
  }

  // Check onboarding for dashboard access
  if (pathname.startsWith('/student/dashboard')) {
    if (!token.hasCompletedOnboarding) {
      redirect('/student/onboarding')
    }
  }
}
```

**Lines 68-83: Tourist Route Protection**
```typescript
if (pathname.startsWith('/tourist/dashboard')) {
  const token = await getToken({ req: request })

  // Verify userType
  if (token.userType !== 'tourist') {
    redirect('/tourist/signin')
  }
}
```

### 5. Booking Form Integration

**Email Pre-fill** (`src/components/booking/BookingForm.tsx`):
```typescript
const { data: session } = useSession()

useEffect(() => {
  if (session?.user?.email) {
    setFormData((prev) => ({ ...prev, email: session.user.email! }))
  }
}, [session])
```

**Read-Only Email Field** (`src/components/booking/ContactStep.tsx`):
```typescript
<Input
  id="email"
  type="email"
  value={data.email}
  readOnly={isEmailFromSession}
  disabled={isEmailFromSession}
/>
```

---

## User Flows

### New Student Flow

1. **Student visits** `/student/signin`
2. **Clicks** "Continue with Google"
3. **Signs in** with university Google account (e.g., `john@stanford.edu`)
4. **System detects** `.edu` domain → assigns `userType: 'student'`
5. **Creates** `Student` record in database
6. **Redirects** to `/student/auth-landing`
7. **Landing page checks** `userType === 'student'` ✅
8. **Redirects** to `/student/onboarding` (city required)
9. **Student completes** onboarding
10. **Redirects** to `/student/dashboard`

### New Tourist Flow

1. **Tourist visits** `/tourist/signin`
2. **Clicks** "Continue with Google"
3. **Signs in** with personal Google account (e.g., `jane@gmail.com`)
4. **System detects** non-educational domain → assigns `userType: 'tourist'`
5. **Creates** `Tourist` record in database
6. **Redirects** to `/tourist/auth-landing`
7. **Landing page checks** `userType === 'tourist'` ✅
8. **Redirects** to `/tourist/dashboard`

### Returning User Flow

1. **User signs in** (either page)
2. **System checks** existing `User` record
3. **Loads** `userType` from database (immutable)
4. **Updates** corresponding `Student` or `Tourist` record
5. **Routes** to appropriate dashboard

### Wrong Page Flow (Error Case)

**Scenario:** Tourist tries to access student features

1. **Tourist** (with `jane@gmail.com`) visits `/student/signin`
2. **Signs in** with Google
3. **System checks** email domain → `userType: 'tourist'` (immutable)
4. **Redirects** to `/student/auth-landing`
5. **Landing page checks** `userType !== 'student'` ❌
6. **Shows error:** "Student access requires university email"
7. **Offers link:** "Continue as Tourist"

---

## Email Domain Validation

### Supported Educational Domains

Located in `src/lib/email-validation.ts`:

```typescript
STUDENT_EMAIL_DOMAINS = [
  // US & International
  '.edu', '.edu.au', '.edu.sg', '.edu.cn', '.edu.my',

  // UK & Commonwealth
  '.ac.uk', '.ac.nz', '.ac.za', '.ac.jp', '.ac.kr', '.ac.in',

  // Europe
  '.edu.es', '.edu.it', '.edu.de', '.edu.fr',

  // And many more...
]
```

**Validation Function:**
```typescript
function isStudentEmail(email: string): boolean {
  return STUDENT_EMAIL_DOMAINS.some(domain =>
    email.toLowerCase().endsWith(domain)
  )
}
```

---

## Migration from Old System

### What Changed?

| Old System | New System |
|------------|------------|
| Users could be both Student AND Tourist | Users are ONLY Student OR Tourist |
| Role could be switched via auth-landing | Role is immutable (email-based) |
| Magic-link for students, OAuth for tourists | Google OAuth for BOTH |
| `/api/auth/set-user-type` endpoint | Endpoint removed (not needed) |
| Complex role-switching logic | Simple email domain check |
| Email not pre-filled in booking forms | Email auto-filled and locked |

### Deleted Files

- ❌ `/src/app/api/auth/set-user-type/route.ts` - Role switching no longer allowed

### Modified Files

- ✏️ `/src/lib/auth-options.ts` - Immutable role assignment
- ✏️ `/src/app/student/auth-landing/page.tsx` - No role switching
- ✏️ `/src/app/tourist/auth-landing/page.tsx` - No role switching
- ✏️ `/src/app/student/signin/page.tsx` - **Dual auth: Google OAuth AND magic-link**
- ✏️ `/src/components/booking/BookingForm.tsx` - Email pre-fill from session
- ✏️ `/src/components/booking/ContactStep.tsx` - Read-only email when authenticated

### No Changes Needed

- ✅ `middleware.ts` - Already enforces userType checks
- ✅ `src/prisma/schema.prisma` - Schema supports the new system
- ✅ Dashboard components - Work with the new auth flow

---

## Testing the New System

### Test Case 1: Student Sign-Up

1. Visit `/student/signin`
2. Sign in with a `.edu` Google account
3. Verify redirect to `/student/onboarding`
4. Complete onboarding
5. Verify redirect to `/student/dashboard`
6. Try accessing `/tourist/dashboard` → should redirect to `/student/signin`

### Test Case 2: Tourist Sign-Up

1. Visit `/tourist/signin`
2. Sign in with a Gmail account
3. Verify redirect to `/tourist/dashboard`
4. Try accessing `/student/dashboard` → should redirect to `/tourist/signin`

### Test Case 3: Booking Form Email

1. Sign in as tourist
2. Visit booking form page
3. Verify email is pre-filled
4. Verify email field is read-only
5. Verify "✓ Email linked to your account" message

### Test Case 4: Cross-Device Persistence

1. Sign in as student on Device A
2. Complete profile
3. Sign out
4. Sign in as student on Device B (same email)
5. Verify profile data is loaded
6. Verify dashboard shows same data

### Test Case 5: Wrong Page Access

1. Sign in as tourist (Gmail)
2. Manually visit `/student/auth-landing`
3. Verify error message: "Student access requires university email"
4. Verify "Continue as Tourist" button works

---

## Troubleshooting

### Issue: User can't sign in as student

**Symptoms:** Error message about email domain

**Cause:** Email is not from a recognized educational institution

**Solution:**
- Verify email domain is in `STUDENT_EMAIL_DOMAINS` list
- If legitimate university, add domain to the list
- Otherwise, user should sign in as tourist

### Issue: Email not pre-filling in booking form

**Symptoms:** Email field is empty when signed in

**Cause:** Session not loaded or email not in session

**Solution:**
1. Check browser console for session errors
2. Verify NextAuth session is active: `useSession()` returns data
3. Check network tab for `/api/auth/session` response

### Issue: User stuck on auth-landing page

**Symptoms:** Loading spinner doesn't redirect

**Cause:** Session userType doesn't match expected role

**Solution:**
1. Check session data in browser console
2. Verify `userType` in JWT token matches email domain
3. Clear cookies and sign in again
4. Check database for mismatched `User.userType`

---

## Security Considerations

### ✅ Implemented

1. **Email-based role assignment** - Prevents privilege escalation
2. **Middleware protection** - Blocks unauthorized access to dashboards
3. **Read-only email in forms** - Prevents email spoofing in bookings
4. **HttpOnly session cookies** - Protects against XSS attacks
5. **CSRF protection** - Built into NextAuth
6. **Immutable userType** - Prevents role manipulation

### 🔒 Recommendations for Production

1. **Email verification** - Require email verification before onboarding
2. **Rate limiting** - Add rate limits to sign-in endpoints
3. **Session expiry** - Configure shorter session lifetimes for sensitive data
4. **2FA support** - Consider adding two-factor authentication
5. **Audit logging** - Log all sign-ins and role assignments

---

## Future Enhancements

### Planned Features

1. **Profile Management Pages**
   - Student: Edit profile, upload verification docs, set availability
   - Tourist: Edit profile, view booking history, manage preferences

2. **Profile Completion Indicator**
   - Show progress bar for students during onboarding
   - Highlight missing required fields
   - Lock dashboard features until profile is complete

3. **Email Verification Flow**
   - Send verification email after sign-up
   - Require verification before accessing dashboard
   - Add "Verified" badge to profiles

4. **Account Switching (Edge Case)**
   - Allow users with multiple emails to switch accounts
   - Example: Student has both `.edu` and personal email
   - Solution: Sign out and sign in with different email

---

## API Endpoints

### Authentication

- `POST /api/auth/signin` - NextAuth sign-in endpoint
- `POST /api/auth/signout` - NextAuth sign-out endpoint
- `GET /api/auth/session` - Get current session
- `GET /api/auth/callback/google` - Google OAuth callback

### User Management

- ~~`POST /api/auth/set-user-type`~~ - **REMOVED** (no longer needed)

---

## Environment Variables

Required for authentication:

```env
# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-32-character-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://...

# JWT Secret (optional, falls back to NEXTAUTH_SECRET)
JWT_SECRET=your-jwt-secret
```

---

## Support & Maintenance

### Monitoring

**Key Metrics to Track:**
- Sign-in success rate (by role)
- Email domain distribution
- Auth-landing redirect success
- Booking form completion rate
- Session duration

**Error Tracking:**
- OAuth callback failures
- Email domain validation rejections
- Middleware redirect loops
- Session expiry issues

### Logging

**Important logs to monitor:**
```
✅ Auth: Sign-in successful for user@example.com as tourist
✅ Auth: Created Student record: { studentId, email, isNewUser }
❌ Auth: Sign-in failed - no email provided
⚠️  Auth: Error checking existing record
```

---

## Conclusion

The new authentication system provides:
- ✅ **Simplicity** - One Google OAuth flow for all users
- ✅ **Security** - Immutable role assignment prevents abuse
- ✅ **Persistence** - Profiles work across all devices
- ✅ **UX** - Auto-filled, locked email in booking forms
- ✅ **Clarity** - Clear separation between Student and Tourist

This architecture is production-ready and scales with the platform's growth.

---

**Last Updated:** 2025-11-28
**Version:** 2.0.0
**Author:** Claude Code Assistant
