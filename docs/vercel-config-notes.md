# Vercel Configuration Guide

This document explains the Vercel deployment configuration for TourWiseCo (WanderNest2) and provides troubleshooting guidance.

---

## 📁 Configuration File Location

**Authoritative Vercel configuration:** `/vercel.json` (repository root)

This is the ONLY `vercel.json` file in the project. There are no additional vercel.json files in subdirectories.

---

## 📋 Configuration Overview

The `vercel.json` file configures how Vercel builds and deploys this Next.js 14 + Prisma application.

### Key Sections:

#### 1. Build Configuration

```json
"buildCommand": "prisma generate --schema=./src/prisma/schema.prisma && next build"
```

**What it does:**
- Generates the Prisma Client from the schema at `src/prisma/schema.prisma`
- Builds the Next.js application for production

**Why this matters:**
- The Prisma schema is in a non-standard location (`src/prisma/` instead of `prisma/`)
- The `--schema` flag is REQUIRED for Prisma to find the schema file
- Prisma Client generation doesn't require `DATABASE_URL` - it only reads the schema file
- Database migrations are NOT run during build (see "Database Migrations" section below)

**Note:** This overrides the `vercel-build` script in `package.json`

---

#### 2. Region Configuration

```json
"regions": ["iad1"]
```

**What it does:**
- Deploys serverless functions to the `iad1` region (AWS US-East, Washington DC)

**Why this matters:**
- Reduces latency for users in North America and Europe
- Should match your database region for optimal performance
- If your database is in a different region, consider updating this

**To change:** Replace `iad1` with your preferred region (e.g., `lhr1` for London, `sfo1` for San Francisco)

---

#### 3. Function Configuration

```json
"functions": {
  "app/api/cities/route.ts": { "maxDuration": 5, "memory": 512 },
  "app/api/matches/route.ts": { "maxDuration": 10, "memory": 1024 },
  ...
}
```

**What it does:**
- Sets custom timeout and memory limits for specific API routes
- Routes not listed use Vercel's defaults (10s timeout, 1024MB memory on Pro plan)

**Key routes and their limits:**

| Route | Timeout | Memory | Reason |
|-------|---------|--------|--------|
| `/api/cities` | 5s | 512MB | Simple database query |
| `/api/matches` | 10s | 1024MB | Complex matching algorithm |
| `/api/admin/analytics` | 15s | 1024MB | Aggregates large datasets |
| `/api/payment/*` | 10s | 512MB | Payment processing |
| `/api/**/*.ts` (catchall) | 8s | 512MB | Default for all other APIs |

**When to adjust:**
- If you see timeout errors in Vercel logs, increase `maxDuration`
- If you see out-of-memory errors, increase `memory`
- More memory costs more - only increase when necessary

---

#### 4. HTTP Headers

The configuration sets three types of headers:

##### A. API CORS Headers (`/api/:path*`)

```json
{
  "source": "/api/:path*",
  "headers": [
    { "key": "Access-Control-Allow-Methods", "value": "GET,DELETE,PATCH,POST,PUT,OPTIONS" },
    { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, ..." }
  ]
}
```

**What it does:**
- Enables CORS for API routes
- Allows specified HTTP methods and headers

**Note:** By default, these headers allow requests from the same domain only. If you need to allow external domains (e.g., for a mobile app), you'll need to add:
```json
{ "key": "Access-Control-Allow-Origin", "value": "https://your-allowed-domain.com" }
```

##### B. Security Headers (All Pages - `/(.*)`]

```json
{ "key": "X-Content-Type-Options", "value": "nosniff" }
{ "key": "X-Frame-Options", "value": "DENY" }
{ "key": "X-XSS-Protection", "value": "1; mode=block" }
{ "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
{ "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
```

**What they do:**
- **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing attacks
- **X-Frame-Options: DENY** - Prevents clickjacking by blocking iframe embedding
- **X-XSS-Protection** - Enables browser XSS filters
- **Referrer-Policy** - Controls referrer information sent to other sites
- **Permissions-Policy** - Disables camera, microphone, geolocation APIs (not needed for this app)
- **Cache-Control** - Forces revalidation on every request (ensures fresh content)

**Test your security headers:** https://securityheaders.com

##### C. Page-Specific Caching

```json
// Tourist page - 5 minute cache with 10 minute stale-while-revalidate
{
  "source": "/tourist",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=300, stale-while-revalidate=600" }
  ]
}

// Static assets - 1 year cache (immutable)
{
  "source": "/_next/static/(.*)",
  "headers": [
    { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
  ]
}
```

**What they do:**
- Tourist page is cached for 5 minutes, with stale content allowed for up to 10 minutes
- Next.js static assets (JS, CSS) are cached for 1 year (safe because they have content hashes in filenames)

---

#### 5. Environment Variable Mapping

```json
"env": {
  "DATABASE_URL": "@database_url",
  "JWT_SECRET": "@jwt_secret",
  ...
}
```

**What it does:**
- Maps Vercel environment variables to your application
- The `@variable_name` syntax references Vercel secrets or environment variables

**Important:**
- These are NOT the actual values - they're references to variables you set in the Vercel dashboard
- You must set all these variables in **Settings → Environment Variables** in Vercel
- See `docs/post-go-live-checklist.md` for the complete list of required environment variables

---

## 🔧 Additional Configuration Files

While `vercel.json` is the main configuration, these files also affect deployment:

### 1. `next.config.js`

**Location:** `/next.config.js`

**What it configures:**
- Next.js framework settings (compression, SWC minification, etc.)
- Webpack optimizations (code splitting, tree shaking)
- Image optimization settings
- Experimental features (optimizePackageImports, optimizeCss, etc.)

**Note:** The comment on line 161 says "Headers are configured in vercel.json for better Vercel integration"

**No conflicts:** This file does NOT define headers/rewrites that would conflict with `vercel.json`

---

### 2. `middleware.ts`

**Location:** `/middleware.ts`

**What it does:**
- Authentication checks for protected routes
- Redirects unauthenticated users to sign-in pages
- Sets security headers programmatically (in addition to vercel.json headers)

**Headers set by middleware:**
```typescript
response.headers.set('X-Frame-Options', 'SAMEORIGIN')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('X-DNS-Prefetch-Control', 'on')
```

**Note:** Some of these overlap with `vercel.json` headers, but that's OK - middleware headers take precedence for routes it handles.

**No conflicts:** Middleware only runs on specific routes (see `config.matcher` in the file)

---

### 3. `package.json` Scripts

**Location:** `/package.json`

**Relevant scripts:**
```json
{
  "postinstall": "prisma generate --schema=./src/prisma/schema.prisma",
  "vercel-build": "prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build"
}
```

**Important:**
- The `vercel-build` script is NOT used because `vercel.json` has a `buildCommand` that overrides it
- If you remove `buildCommand` from `vercel.json`, Vercel would use the `vercel-build` script instead
- The `vercel-build` script includes `prisma migrate deploy`, which the current `buildCommand` does NOT

---

## 🗃️ Database Migrations

**Current behavior:**
- The `buildCommand` in `vercel.json` does NOT run database migrations
- Migrations must be applied separately

**Why?**
- Vercel builds run on multiple instances concurrently
- Running migrations during build can cause race conditions
- Best practice is to run migrations before deployment, not during

**How to run migrations:**

### Option 1: Manually (Recommended for first deployment)

```bash
# Set DATABASE_URL to your production database
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy --schema=./src/prisma/schema.prisma
```

### Option 2: Use Vercel CLI (Before deploying)

```bash
# Set production env variables locally
vercel env pull .env.production

# Run migrations
DATABASE_URL=$(cat .env.production | grep DATABASE_URL | cut -d '=' -f2-) \
  npx prisma migrate deploy --schema=./src/prisma/schema.prisma

# Then deploy
vercel --prod
```

### Option 3: Add a post-deployment script

You could create a separate API route or GitHub Action that runs migrations after successful deployment. This is more advanced and requires careful synchronization.

---

## 🚨 Common Issues and Troubleshooting

### Issue 1: "Invalid request: headers[0].headers[0] should NOT have additional property `comment`"

**Status:** ✅ FIXED

**What happened:**
- Earlier versions of `vercel.json` had a `comment` field inside header objects
- Vercel's JSON schema only allows `key` and `value` in header objects
- The comment was removed in commit `dd6dadf`

**Current status:** All headers now only have `key` and `value` properties. This error should not occur.

---

### Issue 2: "Prisma Client not generated"

**Symptoms:**
- Build fails with "Cannot find module '@prisma/client'"
- Or "Prisma Client has not been generated"

**Cause:**
- The `buildCommand` is missing the `--schema` flag
- Prisma is looking for schema in the wrong location

**Solution:**
- ✅ Already fixed - the buildCommand now includes `--schema=./src/prisma/schema.prisma`

---

### Issue 3: Build succeeds but app crashes at runtime

**Symptoms:**
- Deployment completes successfully
- But accessing the app returns 500 errors
- Logs show database connection errors

**Cause:**
- `DATABASE_URL` not set in Vercel environment variables
- Or database migrations not applied

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify `DATABASE_URL` is set for Production environment
3. Run migrations manually (see "Database Migrations" section above)
4. Redeploy

---

### Issue 4: API routes timing out

**Symptoms:**
- Vercel logs show "Function execution timed out"
- Specific API routes fail with 504 Gateway Timeout

**Cause:**
- Route takes longer than configured `maxDuration`
- Or database queries are slow

**Solution:**
1. Check which route is timing out in Vercel logs
2. Increase `maxDuration` for that route in `vercel.json`
3. Or optimize the database queries (add indexes, reduce data fetching)

---

### Issue 5: CORS errors when calling API from frontend

**Symptoms:**
- Browser console shows "CORS policy" errors
- API calls fail with 403 or 404

**Cause:**
- Missing `Access-Control-Allow-Origin` header
- Or API route is not matching the `/api/:path*` pattern

**Solution:**
1. If calling from same domain: Should work (same-origin)
2. If calling from external domain: Add to headers:
```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "https://your-allowed-domain.com"
}
```
3. For multiple domains, use environment variable:
```json
{
  "key": "Access-Control-Allow-Origin",
  "value": "@allowed_origins"
}
```

---

## 📝 Making Changes to vercel.json

### Safe Changes:

✅ Adjusting `maxDuration` or `memory` for function routes
✅ Adding new function route configurations
✅ Changing `regions` (test first in preview deployment)
✅ Adding cache headers for specific pages
✅ Updating environment variable mappings

### Changes that Require Testing:

⚠️ Modifying the `buildCommand` - test in a preview branch first
⚠️ Changing security headers - verify with https://securityheaders.com
⚠️ Adding CORS headers - test cross-origin requests thoroughly

### Changes to Avoid:

❌ Adding `comment` fields inside header objects (causes build errors)
❌ Removing required environment variables
❌ Setting `maxDuration` above your Vercel plan limits

---

## 🎯 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in Vercel dashboard (see `docs/post-go-live-checklist.md`)
- [ ] Database migrations applied to production database
- [ ] Test deployment in a preview branch first
- [ ] Verify security headers with https://securityheaders.com
- [ ] Check function logs for any errors
- [ ] Test authentication flows (tourist, student, admin)
- [ ] Verify email sending works
- [ ] Test payment flow (if enabled)

---

## 🔗 Related Documentation

- **Environment Variables:** `docs/post-go-live-checklist.md`
- **Prisma Schema:** `src/prisma/schema.prisma`
- **Next.js Config:** `next.config.js`
- **Middleware:** `middleware.ts`
- **API Routes:** `src/app/api/`

---

## 📚 External Resources

- [Vercel Configuration Reference](https://vercel.com/docs/configuration)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vercel Function Limits](https://vercel.com/docs/functions/serverless-functions/runtimes#limits)

---

**Last Updated:** November 22, 2025
**Vercel Config Version:** Clean, production-ready (post-comment-removal)

