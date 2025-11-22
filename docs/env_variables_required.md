# Environment Variables Required for WanderNest

This document lists all environment variables needed to deploy WanderNest on Vercel.

## Critical Variables (REQUIRED for Production)

These variables MUST be set for the application to function in production:

### 1. Database Configuration

```bash
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

**Purpose:** PostgreSQL database connection string
**Required:** ✅ YES (Production & Development)
**Format:** PostgreSQL connection URL with SSL mode
**Example:** `postgresql://user:pass@ep-cool-name-123456.us-east-1.postgres.vercel-storage.com/verceldb?sslmode=require`
**Notes:**
- For Vercel Postgres, this is auto-configured when you link your database
- Must use SSL in production (`sslmode=require`)
- Connection pooling is handled automatically by Prisma

### 2. Authentication - Google OAuth

```bash
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"
```

**Purpose:** Google OAuth for tourist and student authentication
**Required:** ✅ YES (Production) / ⚠️ Optional (Development)
**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Production: `https://yourdomain.com/api/auth/callback/google`
   - Development: `http://localhost:3000/api/auth/callback/google`

**Notes:**
- Students must use academic email domains (.edu, .ac.uk, etc.)
- Tourists can use any Google account

### 3. NextAuth Configuration

```bash
NEXTAUTH_SECRET="your-random-secret-string-here"
NEXTAUTH_URL="https://yourdomain.com"
```

**Purpose:** NextAuth session encryption and OAuth callbacks
**Required:** ✅ YES (Production) / ⚠️ Recommended (Development)
**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

**Notes:**
- `NEXTAUTH_SECRET` must be a random 32+ character string
- `NEXTAUTH_URL` should match your production domain
- In Vercel, `NEXTAUTH_URL` can be auto-detected, but explicit is better

---

## Optional Variables (Recommended for Full Functionality)

### 4. Email Configuration (SMTP)

```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="WanderNest <noreply@wandernest.com>"
```

**Purpose:** Send email notifications to tourists and students
**Required:** ⚠️ Optional (app works without it, but no email notifications)
**Supported providers:**
- Gmail (recommended for development)
- SendGrid
- AWS SES
- Postmark
- Resend

**Gmail Setup:**
1. Enable 2-factor authentication on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the app password (16 characters) as `EMAIL_PASS`

**What breaks without email:**
- ❌ Booking confirmations to tourists
- ❌ Request notifications to students
- ❌ Acceptance notifications
- ❌ Verification codes (for non-OAuth users)
- ✅ Core booking flow still works (database records are created)

### 5. Redis Cache (Optional but Recommended)

```bash
REDIS_URL="redis://default:password@host:port"
```

**Purpose:** Caching and verification code storage
**Required:** ⚠️ Optional (falls back to database)
**Recommended for:** Production deployments
**Providers:**
- Vercel KV (recommended)
- Upstash Redis
- Redis Cloud

**Without Redis:**
- Verification codes stored in database (slower but functional)
- Cache uses in-memory storage (reset on each deployment)
- Slightly higher database load

**Vercel KV Setup:**
1. Go to your Vercel project
2. Navigate to Storage tab
3. Create a new KV database
4. Copy the `REDIS_URL` environment variable

### 6. Public Base URL

```bash
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

**Purpose:** Used in email links and OAuth callbacks
**Required:** ⚠️ Recommended (Production)
**Notes:**
- Falls back to `NEXTAUTH_URL` if not set
- Must include protocol (https://)
- No trailing slash

### 7. JWT Secret (Admin Authentication)

```bash
JWT_SECRET="your-jwt-secret-string"
```

**Purpose:** Admin panel authentication
**Required:** ⚠️ Optional (only if using admin panel)
**How to generate:**
```bash
openssl rand -hex 32
```

### 8. Verification Code Expiry

```bash
VERIFICATION_CODE_EXPIRY="600"
```

**Purpose:** How long verification codes are valid (in seconds)
**Required:** ❌ No (defaults to 600 seconds = 10 minutes)
**Valid range:** 300-3600 (5 minutes to 1 hour)

---

## Environment-Specific Settings

### NODE_ENV

```bash
NODE_ENV="production"
```

**Purpose:** Determines environment mode
**Required:** ✅ Auto-set by Vercel
**Valid values:** `development`, `production`, `test`
**Notes:**
- Vercel automatically sets this to `production`
- Affects logging, error messages, and validation strictness

---

## Quick Start: Minimum Required Variables

For a basic production deployment, you need these 4 variables:

```bash
# 1. Database (Vercel Postgres auto-configures this)
DATABASE_URL="postgresql://..."

# 2. Google OAuth
GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-secret"

# 3. NextAuth
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

---

## Setting Environment Variables in Vercel

### Via Vercel Dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable with appropriate scope:
   - **Production**: Required for live site
   - **Preview**: For PR deployments
   - **Development**: For local development with `vercel dev`

### Via `.env.local` (Local Development):

Create a `.env.local` file in your project root:

```bash
# Copy from .env.example
cp .env.example .env.local

# Edit with your values
nano .env.local
```

**Important:** Never commit `.env.local` or any file with real credentials!

### Via Vercel CLI:

```bash
# Link your project
vercel link

# Pull environment variables from Vercel
vercel env pull .env.local

# Add a new environment variable
vercel env add VARIABLE_NAME
```

---

## Validation and Health Checks

The application validates all environment variables on startup. Check your logs for:

```
========================================
🔧 WanderNest Configuration Status
========================================

📊 Environment: production

🔌 Integration Status:
  Database:     ✅ Connected
  Email:        ✅ Configured
  Google Auth:  ✅ Configured
  NextAuth:     ✅ Configured
  Redis Cache:  ✅ Configured
```

If you see errors, the application will provide specific guidance on which variables are missing or misconfigured.

---

## Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env.local` for local development
   - Add `.env*` to `.gitignore`

2. **Use different credentials per environment**
   - Development database ≠ Production database
   - Different OAuth credentials for dev/prod

3. **Rotate secrets regularly**
   - Change `NEXTAUTH_SECRET` after security incidents
   - Rotate database passwords quarterly
   - Update OAuth secrets if compromised

4. **Limit OAuth redirect URIs**
   - Only add trusted domains
   - Remove development URLs from production OAuth apps

5. **Use Vercel's encryption**
   - All environment variables are encrypted at rest
   - Sensitive values are redacted in logs

---

## Troubleshooting

### "Database required but not available"

```
✅ Fix: Set DATABASE_URL environment variable
Check: Vercel Postgres connection string is correct
```

### "Google OAuth is not configured - authentication will fail"

```
✅ Fix: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
Check: OAuth redirect URIs include your domain
```

### "Email not configured - emails will not be sent"

```
⚠️  Warning only - app still works
Fix: Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS
Note: Email is optional but recommended
```

### "NEXTAUTH_SECRET is required in production"

```
✅ Fix: Generate and set NEXTAUTH_SECRET
Command: openssl rand -base64 32
```

---

## Summary Table

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection |
| `GOOGLE_CLIENT_ID` | ✅ Yes | - | OAuth authentication |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes | - | OAuth authentication |
| `NEXTAUTH_SECRET` | ✅ Yes | - | Session encryption |
| `NEXTAUTH_URL` | ⚠️ Recommended | - | OAuth callbacks |
| `EMAIL_HOST` | ⚠️ Optional | - | SMTP server |
| `EMAIL_PORT` | ⚠️ Optional | 587 | SMTP port |
| `EMAIL_USER` | ⚠️ Optional | - | SMTP username |
| `EMAIL_PASS` | ⚠️ Optional | - | SMTP password |
| `EMAIL_FROM` | ⚠️ Optional | "WanderNest <...>" | Email sender |
| `REDIS_URL` | ⚠️ Optional | - | Cache & verification |
| `NEXT_PUBLIC_BASE_URL` | ⚠️ Optional | - | Public site URL |
| `JWT_SECRET` | ⚠️ Optional | - | Admin auth |
| `VERIFICATION_CODE_EXPIRY` | ❌ No | 600 | Code TTL (seconds) |
| `NODE_ENV` | ✅ Auto | production | Environment mode |

---

## Need Help?

- Check application logs for specific error messages
- Review Vercel deployment logs
- Ensure all required variables are set in the correct environment
- Test locally with `vercel dev` before deploying
