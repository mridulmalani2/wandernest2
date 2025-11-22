# TourWiseCo 2 – Post-Go-Live Checklist

This guide covers everything you need to configure to fully activate TourWiseCo 2 in production on Vercel.

---

## 📋 Complete Configuration To-Do List

### 1. Google OAuth Sign-In Setup

Google OAuth is used for **tourist authentication** (non-.edu emails).

#### What You Need to Do:

1. **Visit Google Cloud Console**
   - Go to https://console.cloud.google.com/
   - Create a new project or select an existing one (e.g., "TourWiseCo")

2. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "TourWiseCo Production"

4. **Configure Authorized Redirect URIs**

   **For Production (Vercel):**
   ```
   https://your-app.vercel.app/api/auth/callback/google
   https://your-custom-domain.com/api/auth/callback/google
   ```

   **For Local Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```

5. **Configure Authorized JavaScript Origins**

   **For Production:**
   ```
   https://your-app.vercel.app
   https://your-custom-domain.com
   ```

   **For Local Development:**
   ```
   http://localhost:3000
   ```

6. **Copy Your Credentials**
   - After creating, you'll get a **Client ID** and **Client Secret**
   - Save these for the next step

#### Environment Variables to Set:

**In Vercel Dashboard** (`Settings` → `Environment Variables`):
```bash
GOOGLE_CLIENT_ID="your-google-client-id-from-console.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**In Local `.env.local`:**
```bash
GOOGLE_CLIENT_ID="your-google-client-id-from-console.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

### 2. Email Provider Setup

TourWiseCo uses **nodemailer with SMTP** to send emails (verification codes, booking confirmations, student notifications).

#### Supported Providers:

- **Gmail** (recommended for quick setup)
- **SendGrid**
- **Mailgun**
- **AWS SES**
- **Any SMTP provider**

#### Option A: Gmail Setup (Easiest)

1. **Use a dedicated Gmail account** (e.g., `notifications@yourdomain.com`)

2. **Enable 2-Factor Authentication** on this Gmail account
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

3. **Generate an App-Specific Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password generated

4. **Set Environment Variables:**

   **In Vercel:**
   ```bash
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-16-char-app-password"
   EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"
   ```

   **In Local `.env.local`:**
   ```bash
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASS="your-16-char-app-password"
   EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"
   ```

#### Option B: SendGrid/Mailgun/Other SMTP

1. Create an account with your chosen provider
2. Get SMTP credentials from their dashboard
3. Set the environment variables accordingly:

   ```bash
   EMAIL_HOST="smtp.sendgrid.net"  # or smtp.mailgun.org, etc.
   EMAIL_PORT="587"
   EMAIL_USER="apikey"  # or your username
   EMAIL_PASS="your-api-key"
   EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"
   ```

#### How to Test Emails:

**Local Development:**
- Emails are in **mock mode** by default (logged to console only)
- Check your terminal for logs like: `📧 MOCK EMAIL - Verification Code`
- To test real sending locally, set `NODE_ENV=production` in `.env.local`

**Production:**
- Emails will send automatically if `EMAIL_HOST` is configured
- If `EMAIL_HOST` is missing in production, emails will be silently skipped (no logs)
- Check Vercel function logs to see email send status

#### Additional Email Configuration:

```bash
# Optional: Change verification code expiry time (default: 600 seconds = 10 minutes)
VERIFICATION_CODE_EXPIRY="600"
```

---

### 3. Database Setup

TourWiseCo uses **PostgreSQL** with Prisma ORM.

#### Recommended: Vercel Postgres

1. **In Vercel Dashboard:**
   - Go to your project → "Storage" tab
   - Click "Create Database" → Select "Postgres"
   - Choose a name (e.g., `tourwiseco-db`)
   - Select a region close to your serverless functions (e.g., `iad1` - Washington DC)

2. **Connect to Your Project:**
   - Vercel automatically adds environment variables when you connect the database
   - The main variable is `DATABASE_URL`

3. **Verify Environment Variables:**
   - Check that `DATABASE_URL` is set in Vercel Environment Variables
   - It should look like: `postgres://username:password@host:5432/database?sslmode=require`

#### Alternative: External Postgres Providers

**Options:**
- **Supabase** (https://supabase.com) - Free tier available
- **Neon** (https://neon.tech) - Serverless Postgres
- **Railway** (https://railway.app)
- **PlanetScale** (MySQL, requires Prisma adapter changes)

**Setup Steps:**
1. Create a database on your chosen platform
2. Copy the connection string
3. Add to Vercel environment variables as `DATABASE_URL`

#### Database Connection String Format:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connection_limit=5&pool_timeout=10&connect_timeout=10"
```

**Important connection parameters:**
- `sslmode=require` - Required for secure connections
- `connection_limit=5` - Prevents connection pool exhaustion on serverless
- `pool_timeout=10` - Connection pool timeout
- `connect_timeout=10` - Initial connection timeout

#### Running Migrations:

**For Vercel Postgres (Automatic):**
- Migrations run automatically during deployment via `vercel-build` script
- No manual action needed

**For Local Development:**

1. **Set DATABASE_URL in `.env.local`:**
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/tourwiseco"
   ```

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy --schema=./src/prisma/schema.prisma
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate --schema=./src/prisma/schema.prisma
   ```

#### Connecting Production DB to Vercel:

**Option 1: Via Vercel Dashboard (Recommended)**
- Go to Project → Storage → Connect existing database
- Enter your connection string
- Vercel will automatically set `DATABASE_URL`

**Option 2: Manual Environment Variable**
- Go to Settings → Environment Variables
- Add `DATABASE_URL` with your connection string
- Select all environments (Production, Preview, Development)

#### Testing Database Connection:

```bash
# From your local machine with production DATABASE_URL
npx prisma db pull --schema=./src/prisma/schema.prisma

# Should show your schema without errors
```

---

### 4. Payment Setup (Razorpay)

TourWiseCo uses **Razorpay** for payment processing (discovery fee).

#### What You Need to Do:

1. **Create Razorpay Account**
   - Go to https://dashboard.razorpay.com/signup
   - Complete business verification

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate keys for **Live Mode** (not Test Mode)
   - Copy both:
     - **Key ID** (starts with `rzp_live_`)
     - **Key Secret** (keep this secret!)

3. **Set Up Webhook (for payment verification)**
   - Go to Settings → Webhooks
   - Create a new webhook
   - URL: `https://your-app.vercel.app/api/payment/webhook`
   - Events to subscribe: `payment.authorized`, `payment.failed`
   - Copy the **Webhook Secret**

#### Environment Variables to Set:

**In Vercel:**
```bash
RAZORPAY_KEY_ID="rzp_live_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your-razorpay-secret-key"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
DISCOVERY_FEE_AMOUNT="99.00"  # Amount in INR
```

**In Local `.env.local`:**
```bash
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"  # Use test keys locally
RAZORPAY_KEY_SECRET="your-razorpay-test-secret"
RAZORPAY_WEBHOOK_SECRET="your-test-webhook-secret"
DISCOVERY_FEE_AMOUNT="99.00"
```

#### Testing Payments:

- Use Razorpay's test mode locally
- Test card: 4111 1111 1111 1111, any future expiry, any CVV
- Full guide: https://razorpay.com/docs/payments/payments/test-card-details/

---

### 5. NextAuth & Security Configuration

#### Environment Variables to Set:

**In Vercel:**
```bash
NEXTAUTH_SECRET="generate-a-random-32-char-string"
NEXTAUTH_URL="https://your-app.vercel.app"
JWT_SECRET="generate-another-random-32-char-string"
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"
NODE_ENV="production"
```

**In Local `.env.local`:**
```bash
NEXTAUTH_SECRET="local-development-secret-key"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="local-jwt-secret-key"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"
```

#### Generate Random Secrets:

Run this in your terminal:
```bash
# For NEXTAUTH_SECRET
openssl rand -base64 32

# For JWT_SECRET
openssl rand -base64 32
```

---

### 6. Optional: Redis for Verification Code Caching

**Note:** Redis is **optional**. The app works fine without it, but Redis provides better performance for verification code storage.

#### If You Want Redis:

1. **Use Vercel KV (Recommended):**
   - In Vercel Dashboard → Storage → Create Database → KV
   - Vercel automatically sets `REDIS_URL`

2. **Or Use Upstash:**
   - Go to https://upstash.com
   - Create a Redis database
   - Copy the connection string
   - Set as `REDIS_URL` in Vercel

#### Environment Variable:

```bash
REDIS_URL="redis://default:password@hostname:port"
```

**If not set:** Verification codes will still work, stored in-memory (fine for most use cases).

---

### 7. Remaining Dummy/Placeholder Data to Replace

#### ⚠️ Files to Delete or Disable Before Production:

| File/Component | Purpose | Action Required |
|----------------|---------|-----------------|
| `src/lib/demo/dummyStudents.ts` | Contains hard-coded sample students for demo | **Delete or leave** (not used in production flows) |
| `src/lib/dev-auth-bypass.tsx` | Developer auth bypass for local testing | **Keep** (auto-disabled when `NODE_ENV=production`) |
| `src/lib/dev-auth-server.ts` | Server-side dev auth | **Keep** (auto-disabled in production) |
| `src/components/DevAuthPanel.tsx` | Dev tools panel | **Keep** (auto-hidden when `NODE_ENV=production`) |
| `src/app/demo/*` | Demo pages for testing flows | **Keep or delete** (not linked from main navigation) |

#### Content Placeholders:

| Location | What to Change |
|----------|----------------|
| `src/lib/constants.ts:6-9` | **CITIES** - Currently only Paris and London. Add more cities as needed. |
| `src/lib/constants.ts:42-44` | **CAMPUSES** - Update university lists for each city |
| `src/lib/constants.ts:87-97` | **CITY_RATES** - Base hourly rates by city (used for suggestions) |
| Marketing copy in `src/app/page.tsx` | Hero text, CTAs, feature descriptions |
| Footer in `src/components/Footer.tsx` | Company info, social links, legal pages |

---

### 8. Content and Configuration Editing Guide

#### Adding New Cities:

**File:** `src/lib/constants.ts`

```typescript
export const CITIES = [
  { value: 'paris', label: 'Paris, France' },
  { value: 'london', label: 'London, United Kingdom' },
  { value: 'barcelona', label: 'Barcelona, Spain' },  // Add new cities here
  { value: 'berlin', label: 'Berlin, Germany' },
] as const;
```

**Also update:**
- `CAMPUSES` object (add universities for the new city)
- `CITY_RATES` (add price ranges)

#### Editing Marketing Copy:

**File:** `src/app/page.tsx`

Key sections:
- Hero headline and CTA
- Feature cards
- How it works steps
- Testimonials (if any)

#### Editing Pricing:

**File:** `.env` (Vercel Environment Variables)

```bash
DISCOVERY_FEE_AMOUNT="99.00"  # Change this value
```

**File:** `src/lib/constants.ts` (for city-specific rates)

```typescript
export const CITY_RATES: Record<string, { min: number; max: number }> = {
  'Paris': { min: 20, max: 35 },  // Edit these ranges
  // ...
}
```

#### Key Configuration Constants:

**File:** `src/lib/constants.ts`

- `LANGUAGES` - Available language options
- `INTERESTS` - Tourist interest categories
- `SERVICE_TYPES` - Service offerings (itinerary help vs. guided experience)
- `CACHE_TTL` - Cache durations for different data types

#### Tweakable Settings:

| Setting | File | Default | Purpose |
|---------|------|---------|---------|
| Max students per match | Not configurable | 3 | Number of students shown to tourists |
| Verification code expiry | Environment var | 600s (10 min) | How long codes are valid |
| Request expiry | API logic | 7 days | How long requests stay active |
| Min/max hourly rates | `constants.ts` | Varies by city | Price suggestions |

---

## 🔍 Sanity Check Before Going Fully Live

Use this checklist to verify everything works in production:

### Pre-Launch Checklist:

- [ ] **1. Database Connected**
  - [ ] `DATABASE_URL` set in Vercel
  - [ ] Migrations applied successfully
  - [ ] No build errors related to Prisma

- [ ] **2. Google Sign-In Works**
  - [ ] Test signing in as a tourist (non-.edu email)
  - [ ] User is redirected to dashboard after sign-in
  - [ ] User data appears in database (check via Prisma Studio or SQL)

- [ ] **3. Student Flow Works**
  - [ ] Sign up with a `.edu` email
  - [ ] Receive verification code via email
  - [ ] Complete onboarding form
  - [ ] Student profile appears in database with `PENDING_APPROVAL` status

- [ ] **4. Tourist Flow Works**
  - [ ] Sign in with Google
  - [ ] Create a new booking request
  - [ ] Matches are generated (3 students shown)
  - [ ] Can select a student and confirm booking

- [ ] **5. Email Notifications Work**
  - [ ] Tourist receives booking confirmation email
  - [ ] Students receive notification when selected
  - [ ] Tourist receives acceptance email when student accepts
  - [ ] Check email in Vercel function logs if not receiving

- [ ] **6. Payment Flow Works** (if enabled)
  - [ ] Discovery fee payment page loads
  - [ ] Razorpay checkout opens
  - [ ] Test payment (use Razorpay test mode first)
  - [ ] Payment record saved in database

- [ ] **7. No Dev-Only Controls Visible**
  - [ ] No "🔧 DEV AUTH" panel visible in production
  - [ ] No bypass authentication shortcuts
  - [ ] `/demo` routes are not accessible (or intentionally kept)

- [ ] **8. Environment Variables Set**
  - [ ] All required vars in Vercel (see list below)
  - [ ] `NODE_ENV=production` in Vercel
  - [ ] `NEXTAUTH_URL` matches your production domain
  - [ ] `NEXT_PUBLIC_BASE_URL` matches your production domain

- [ ] **9. Security Headers Active**
  - [ ] Test with https://securityheaders.com
  - [ ] Check CSP, X-Frame-Options, etc. (configured in `vercel.json`)

- [ ] **10. Performance Check**
  - [ ] Test page load speeds
  - [ ] Check Vercel Analytics for errors
  - [ ] Verify no function timeouts in logs

### Quick Test Script:

1. **Tourist Journey:**
   - Go to `/tourist/signin`
   - Sign in with Google (non-.edu email)
   - Go to `/tourist/request`
   - Fill out booking form
   - Verify you see 3 matched students
   - Select one and confirm
   - Check email for confirmation

2. **Student Journey:**
   - Go to `/student/signup`
   - Enter `.edu` email
   - Check email for verification code
   - Complete onboarding
   - Check database: student status should be `PENDING_APPROVAL`
   - (Admin) Approve student via `/admin` dashboard
   - Student should now appear in matches

3. **Verify Emails:**
   - Check all emails are sent (booking confirmation, student notification, acceptance)
   - If emails don't arrive, check Vercel function logs

---

## 📝 Required Environment Variables Summary

### ✅ Must-Have Variables (Production Will Fail Without These):

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="random-32-char-string"
NEXTAUTH_URL="https://your-app.vercel.app"
JWT_SECRET="random-32-char-string"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Base URL
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"

# Node Environment
NODE_ENV="production"
```

### ⚠️ Highly Recommended (Features Won't Work Without These):

```bash
# Email (required for verification codes and notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"

# Payments (required for discovery fee)
RAZORPAY_KEY_ID="rzp_live_xxxx"
RAZORPAY_KEY_SECRET="your-secret"
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"
DISCOVERY_FEE_AMOUNT="99.00"
```

### 🔧 Optional (Nice to Have):

```bash
# Redis (optional - for better verification code performance)
REDIS_URL="redis://..."

# Verification settings (optional - has sensible defaults)
VERIFICATION_CODE_EXPIRY="600"
```

---

## 🐛 Known Stub Logic / TODOs

These areas depend on **your external accounts or decisions**:

| Area | Status | What's Needed |
|------|--------|---------------|
| **Admin Dashboard** | ✅ Working | Default admin login: you need to manually create an admin user in the database |
| **Payment Integration** | ⚠️ Stub in code | Razorpay credentials required; payment flow exists but needs testing |
| **Student Approval Flow** | ✅ Working | Admin must manually approve students via `/admin/students` |
| **Profile Photos** | ⚠️ Partial | Uses Vercel Blob for uploads; works but needs testing in production |
| **Review System** | ✅ Working | Functional but needs real-world testing |
| **Matching Algorithm** | ✅ Working | Uses real data, but could be tuned based on feedback |

### Creating First Admin User:

You need to manually create an admin user in the database:

**Option 1: Via Prisma Studio**
```bash
npx prisma studio --schema=./src/prisma/schema.prisma
```

Then add a record to the `Admin` table:
- email: `your-email@example.com`
- passwordHash: (generate with bcrypt)
- name: `Your Name`
- role: `SUPER_ADMIN`

**Option 2: Via SQL**
```sql
INSERT INTO "Admin" (id, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin-1',
  'admin@tourwiseco.com',
  '$2a$10$your-bcrypt-hash-here',  -- Use bcrypt to hash your password
  'Admin User',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

To generate password hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

---

## 🎯 Final Notes

- **Test in Vercel Preview Deployments First**: Deploy to a preview branch before production
- **Monitor Vercel Function Logs**: First 24 hours after launch, watch for errors
- **Set Up Error Tracking**: Consider Sentry or similar for production error monitoring
- **Scale Database**: Start with basic tier, scale up based on usage
- **Email Limits**: Gmail has sending limits (~500/day). For high volume, use SendGrid/Mailgun
- **Payment Gateway**: Test Razorpay in test mode thoroughly before going live

---

**Questions or Issues?**
- Check Vercel deployment logs for errors
- Verify all environment variables are set correctly
- Ensure Google OAuth redirect URIs match exactly
- Test email sending with a simple test script first

**Good luck with your launch! 🚀**
