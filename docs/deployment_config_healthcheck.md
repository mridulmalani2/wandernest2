# Deployment Configuration Health Check

**Last Audit:** November 22, 2025
**Status:** ✅ Hardened and Production-Ready

---

## Executive Summary

This document summarizes the deployment configuration audit and hardening performed on the WanderNest2 repository to prevent Vercel deployment issues.

### Issues Found and Fixed:

1. ✅ **Critical:** Removed custom `buildCommand` from vercel.json that prevented Next.js framework auto-detection
2. ✅ **Critical:** Enabled automatic database migrations during deployment (via vercel-build script)
3. ✅ **Verified:** No conflicting configuration files
4. ✅ **Verified:** All schema validation requirements met

---

## Configuration Files Overview

### 1. `/vercel.json` - Vercel Deployment Configuration

**Location:** Repository root
**Purpose:** Configures Vercel-specific deployment settings

**Current Configuration:**
```json
{
  "regions": ["iad1"],
  "functions": { /* API route timeouts and memory */ },
  "headers": [ /* CORS, security, caching */ ],
  "env": { /* environment variable mappings */ }
}
```

**What was changed:**
- ❌ **Removed:** `buildCommand` field (was overriding framework detection)

**Why this matters:**
- Vercel can now **auto-detect this as a Next.js project** (not "Other" framework)
- The better `vercel-build` script from package.json is now used
- Database migrations are now automatically applied during deployment

**Schema Compliance:** ✅ All fields valid, no extra properties that would trigger validation errors

---

### 2. `/package.json` - Build Scripts

**Location:** Repository root
**Purpose:** Defines npm scripts including the Vercel build command

**Relevant Scripts:**
```json
{
  "build": "next build",
  "postinstall": "prisma generate --schema=./src/prisma/schema.prisma",
  "vercel-build": "prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build"
}
```

**Build Flow on Vercel:**
1. Install dependencies
2. Run `postinstall` → generates Prisma Client
3. Run `vercel-build` → generates Prisma Client (again, idempotent), deploys migrations, builds Next.js
4. Deploy

**Why this is correct:**
- The `vercel-build` script is **complete** (includes migrations)
- No buildCommand override in vercel.json means this script is actually used
- Prisma schema path (`./src/prisma/schema.prisma`) is correctly specified

---

### 3. `/next.config.js` - Next.js Framework Configuration

**Location:** Repository root
**Purpose:** Configures Next.js framework settings, optimizations, and build behavior

**Status:** ✅ Clean, no deployment blockers

**Key Settings:**
- `reactStrictMode: true` - Good for catching issues early
- `compress: true` - Enables gzip compression
- `poweredByHeader: false` - Security best practice
- No custom `output` config - Compatible with Vercel's serverless deployment
- Image optimization properly configured with allowed domains
- Webpack optimizations for production builds

**No conflicts:** Does not define headers/rewrites/redirects (those are in vercel.json)

---

### 4. `/tsconfig.json` - TypeScript Configuration

**Location:** Repository root
**Purpose:** TypeScript compiler settings

**Status:** ✅ Properly configured

**Key Settings:**
- Path alias: `@/*` maps to `./src/*`
- Target: ES2020 (modern browsers)
- Module resolution: bundler (Next.js compatible)

---

### 5. `/.vercelignore` - Vercel Ignore File

**Location:** Repository root
**Purpose:** Specifies files/folders to exclude from Vercel deployment

**Status:** ✅ Comprehensive

**Excludes:**
- Development files (.env.local, .vscode, etc.)
- Documentation (README, docs/)
- Build artifacts (.next, out, dist)
- Test files
- Git metadata

---

## Deployment Assumptions

### Framework Detection
- **Framework:** Next.js 14 (auto-detected by Vercel)
- **Preset:** nextjs (NOT "Other")
- **Detection Method:** Automatic (presence of `next.config.js` + no buildCommand override)

### Project Root
- **Root Directory:** `/` (repository root)
- **Source Directory:** `/src` (for app code)
- **App Directory:** `/src/app` (Next.js App Router)

### Build Command
- **Command:** `vercel-build` script from package.json
- **Full Command:** `prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build`
- **Output:** `.next/` directory with production build

### Database
- **ORM:** Prisma
- **Schema Location:** `./src/prisma/schema.prisma` (non-standard location)
- **Migration Strategy:** Automatic during build via `prisma migrate deploy`

---

## Common Failure Modes - PREVENTED

### ❌ Wrong Framework Detection (NOW FIXED)
**Before:** Custom `buildCommand` in vercel.json caused Vercel to use "Other" framework preset
**After:** No buildCommand → Vercel auto-detects Next.js → Correct optimizations applied

### ❌ Missing Migrations (NOW FIXED)
**Before:** Old buildCommand didn't include `prisma migrate deploy`
**After:** vercel-build script includes migrations → Schema changes automatically applied

### ❌ Schema Validation Errors (PREVENTED)
**Status:** All fields in vercel.json conform to Vercel's schema
**No:** Extra properties like `comment` in header objects
**No:** Invalid region codes
**No:** maxDuration exceeding plan limits (currently max 15s for analytics)

### ❌ Hard-coded Paths (VERIFIED CORRECT)
**Prisma Schema:** `./src/prisma/schema.prisma` (relative to repo root)
**Consistency:** Same path used in both `postinstall` and `vercel-build` scripts
**Also defined in:** package.json `prisma.schema` field

### ❌ Conflicting Config Files (NONE FOUND)
**Verified:** Only one `vercel.json` (at repo root)
**Verified:** Only one `next.config.js` (at repo root)
**No:** Subdirectory configs that could cause conflicts

---

## Do Not Touch Without Care ⚠️

### 1. Do NOT add `buildCommand` to vercel.json
**Why:** It overrides framework detection and prevents the vercel-build script from running
**Result:** Vercel treats this as "Other" framework instead of Next.js
**Impact:** Missing Next.js optimizations, migrations won't run

### 2. Do NOT change Prisma schema path without updating all references
**Current Path:** `./src/prisma/schema.prisma`
**Must Update:**
- `package.json` → `prisma.schema` field
- `package.json` → `postinstall` script
- `package.json` → `vercel-build` script

### 3. Do NOT add extra properties to header objects in vercel.json
**Valid Keys ONLY:** `key`, `value`
**Invalid Keys:** `comment`, `description`, anything else
**Result if violated:** Schema validation error, deployment fails

### 4. Do NOT change region without considering database location
**Current Region:** `iad1` (AWS US-East, Washington DC)
**Best Practice:** Deploy to same region as your database for low latency

### 5. Do NOT set `maxDuration` above your Vercel plan limits
**Current Max:** 15s (for `/api/admin/analytics`)
**Hobby Plan Limit:** 10s
**Pro Plan Limit:** 60s
**Enterprise Plan Limit:** 900s (15 minutes)

---

## Environment Variables Required

All environment variables use the `@variable_name` syntax in vercel.json, which references secrets/env vars set in the Vercel dashboard.

**You must set these in Vercel Dashboard → Settings → Environment Variables:**

### Core Application
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Should be "production"
- `NEXT_PUBLIC_BASE_URL` - Your production URL (e.g., https://wandernest.app)

### Authentication
- `NEXTAUTH_SECRET` - Secret for NextAuth.js session encryption
- `NEXTAUTH_URL` - Your production URL (same as NEXT_PUBLIC_BASE_URL)
- `JWT_SECRET` - Secret for JWT token signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Email
- `EMAIL_HOST` - SMTP server hostname
- `EMAIL_PORT` - SMTP port (typically 587)
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `EMAIL_FROM` - From address for outgoing emails

### Payment (Razorpay)
- `RAZORPAY_KEY_ID` - Razorpay API key ID
- `RAZORPAY_KEY_SECRET` - Razorpay API secret
- `RAZORPAY_WEBHOOK_SECRET` - Razorpay webhook signature secret
- `DISCOVERY_FEE_AMOUNT` - Amount in paise (e.g., 9900 for ₹99)

### Redis (Optional)
- `REDIS_URL` - Redis connection string (for rate limiting, caching)

### Other
- `VERIFICATION_CODE_EXPIRY` - Expiry time for email verification codes (in minutes)

**See also:** `docs/post-go-live-checklist.md` for detailed environment variable documentation

---

## What Vercel Will Auto-Detect

With the hardened configuration, Vercel will automatically detect:

### ✅ Framework
- **Detected:** Next.js
- **Version:** 14.2.15 (from package.json)
- **Preset:** nextjs

### ✅ Build Command
- **Command:** Uses `vercel-build` from package.json
- **No Override:** No custom buildCommand in vercel.json

### ✅ Output Directory
- **Directory:** `.next` (standard Next.js output)
- **Auto-detected:** Yes

### ✅ Install Command
- **Command:** `npm install` (or `pnpm install` if lockfile detected)
- **Auto-detected:** Yes (from package-lock.json)

### ✅ Development Command
- **Command:** `npm run dev` (uses `next dev` from package.json)
- **Auto-detected:** Yes

---

## Deployment Checklist

Before deploying to production, verify:

### Pre-Deployment
- [ ] All environment variables set in Vercel dashboard (see list above)
- [ ] Database created and accessible from Vercel's iad1 region
- [ ] Google OAuth credentials configured with correct redirect URLs
- [ ] Razorpay account set up with webhook configured
- [ ] SMTP credentials tested for email sending

### During First Deployment
- [ ] Watch build logs for any Prisma migration errors
- [ ] Verify Next.js build completes successfully
- [ ] Check that framework is detected as "Next.js" (not "Other")

### Post-Deployment
- [ ] Test authentication flows (Google OAuth, email/password)
- [ ] Verify database connection works (check any API route)
- [ ] Test email sending (registration, password reset)
- [ ] Test payment flow (Razorpay integration)
- [ ] Check function logs for errors
- [ ] Verify security headers: https://securityheaders.com

### Monitoring
- [ ] Set up Vercel alerts for function errors
- [ ] Monitor function execution times (watch for timeouts)
- [ ] Monitor database connection pool usage
- [ ] Check for any Redis connection errors (if using)

---

## Troubleshooting Quick Reference

### Build Fails: "Cannot find module '@prisma/client'"
- **Cause:** Prisma Client generation failed
- **Fix:** Verify `--schema=./src/prisma/schema.prisma` is in build command
- **Status:** ✅ Already correct in vercel-build script

### Build Fails: "Schema validation error"
- **Cause:** Invalid field in vercel.json
- **Fix:** Remove extra properties, check JSON syntax
- **Status:** ✅ Schema already validated

### Deployment Works but App Crashes
- **Cause:** Missing environment variables or failed migrations
- **Fix:** Check Vercel logs, verify DATABASE_URL is set, check migration status
- **How to Check:** `npx prisma migrate status --schema=./src/prisma/schema.prisma`

### Functions Timing Out
- **Cause:** maxDuration too low or slow database queries
- **Fix:** Increase maxDuration in vercel.json or optimize queries
- **Current Max:** 15s for admin analytics, 10s for most APIs

### Framework Detected as "Other"
- **Cause:** Custom buildCommand in vercel.json
- **Fix:** Remove buildCommand, use vercel-build script instead
- **Status:** ✅ Already fixed

---

## Related Documentation

- **Detailed Vercel Config:** `docs/vercel-config-notes.md`
- **Environment Variables:** `docs/post-go-live-checklist.md`
- **Deployment Guide:** `VERCEL_DEPLOYMENT.md`
- **API Documentation:** `API_DOCUMENTATION.md`

---

## Audit History

| Date | Change | Reason |
|------|--------|--------|
| 2025-11-22 | Removed `buildCommand` from vercel.json | Enable Next.js framework auto-detection |
| 2025-11-22 | Updated documentation | Reflect new build configuration |
| 2025-11-22 | Verified schema compliance | Prevent validation errors |

---

**Audited by:** Claude (Deployment Config Hardening)
**Next Review:** Before any major framework upgrades or infrastructure changes
