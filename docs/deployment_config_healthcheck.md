# Deployment Configuration Health Check

**Last Updated:** 2025-11-22
**Status:** ✅ Hardened and Verified

## Overview

This document explains the deployment configuration for WanderNest2 on Vercel. The configuration has been audited and hardened to prevent common deployment failures.

---

## Deployment Assumptions

### Framework & Build System
- **Framework:** Next.js 14.2.15 (App Router)
- **Project Root:** Repository root (`/`)
- **Source Directory:** `src/` (all application code lives here)
- **Build Command:** Automatic (Vercel uses `vercel-build` script from package.json)
- **Node Version:** Automatically detected by Vercel from package.json engines (defaults to Node 20.x LTS)

### Database & Prisma
- **Prisma Schema Location:** `src/prisma/schema.prisma`
- **Build Process:**
  1. `prisma generate` - Generates Prisma Client
  2. `prisma migrate deploy` - Applies migrations to production database
  3. `next build` - Builds the Next.js application

### Environment Variables
- **Configuration Method:** Vercel Dashboard (NOT vercel.json)
- **Required Variables:** See `.env.example` for the complete list
- **Critical Variables:**
  - `DATABASE_URL` - PostgreSQL connection string
  - `NEXTAUTH_SECRET` - Auth.js session encryption key
  - `NEXTAUTH_URL` - Production URL for OAuth callbacks
  - `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - Payment integration

---

## Configuration Files

### 1. vercel.json

**Location:** `/vercel.json`

**Purpose:** Configures Vercel-specific deployment settings (function limits, headers, and caching).

**What's Inside:**

```json
{
  "functions": { ... },  // API route timeout and memory limits
  "headers": [ ... ]      // Security headers and caching rules
}
```

**Key Points:**
- ✅ **NO** `buildCommand` - Lets Vercel auto-detect Next.js and use framework preset
- ✅ **NO** `env` - Environment variables are set in Vercel dashboard
- ✅ **NO** `regions` - Deprecated field, Vercel auto-manages regions
- ✅ Schema-compliant configuration (no extra properties)

**Function Limits:**
- Default API routes: 8s max duration, 512MB memory
- Specific high-load routes (matches, analytics): 10-15s, 1024MB
- Cities endpoint: 5s, 512MB (fast lookup)

**Headers:**
- Security headers on all routes (XSS protection, frame options, CSP)
- CORS headers for API routes
- Optimized caching for static assets (31536000s = 1 year)
- Short cache for tourist page (300s with stale-while-revalidate)

### 2. next.config.js

**Location:** `/next.config.js`

**Purpose:** Next.js framework configuration.

**What Changed:**
- ❌ **Removed:** Custom webpack configuration (conflicts with Vercel optimizations)
- ❌ **Removed:** `compress: true` (redundant, Vercel handles compression)
- ❌ **Removed:** `swcMinify: true` (now the default in Next.js 14)
- ❌ **Removed:** Manual chunk splitting (Vercel optimizes this automatically)
- ✅ **Kept:** Essential optimizations (package imports, CSS optimization, image config)
- ✅ **Kept:** Bundle analyzer for performance debugging
- ✅ **Kept:** Console log removal in production

**Key Optimizations:**
- `optimizePackageImports` - Tree-shaking for large libraries (Radix UI, Lucide)
- `optimizeCss: true` - CSS bundle optimization
- `modularizeImports` - Reduces Lucide React bundle size by ~70%
- Image optimization for Unsplash, Pexels, and Vercel Blob Storage

### 3. package.json

**Location:** `/package.json`

**Build Scripts:**
```json
{
  "build": "next build",
  "vercel-build": "prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build",
  "postinstall": "prisma generate --schema=./src/prisma/schema.prisma"
}
```

**How It Works:**
- `postinstall` - Runs after `npm install` (generates Prisma Client locally)
- `vercel-build` - Vercel automatically uses this script (if present) instead of `build`
- Prisma schema path is explicitly specified to handle `src/` directory structure

### 4. .vercelignore

**Location:** `/.vercelignore`

**Purpose:** Excludes unnecessary files from deployment (reduces upload time and build size).

**What's Excluded:**
- Development files (.env.local, test files, IDE configs)
- Build artifacts (.next, out, dist - rebuilt on Vercel)
- Documentation (README.md, docs/)
- Git metadata (.git, .gitignore)
- Logs and temporary files

---

## What Vercel Auto-Detects

When you deploy, Vercel will automatically detect:

✅ **Framework:** Next.js 14 (App Router)
✅ **Root Directory:** `/` (repository root)
✅ **Build Command:** `npm run vercel-build` (from package.json)
✅ **Install Command:** `npm install` (with postinstall hook for Prisma)
✅ **Output Directory:** `.next` (Next.js default)
✅ **Development Command:** `npm run dev`

**Why this matters:** By NOT overriding these in vercel.json, we let Vercel use its optimized framework preset, which includes:
- Intelligent caching
- Automatic static optimization
- Edge function detection
- Image optimization CDN
- Serverless function bundling

---

## Common Pitfalls & Prevention

### ❌ Problem: Schema Validation Errors
**Cause:** Extra properties in vercel.json (e.g., `regions`, `env`, invalid headers config)
**Prevention:** Our vercel.json only uses documented, schema-compliant fields

### ❌ Problem: Build Command Failures
**Cause:** Custom buildCommand that doesn't match package.json or assumes wrong paths
**Prevention:** Removed buildCommand, rely on framework preset + vercel-build script

### ❌ Problem: Framework Not Detected
**Cause:** vercel.json overrides prevent Vercel from detecting Next.js
**Prevention:** Minimal vercel.json, no buildCommand or framework overrides

### ❌ Problem: Prisma Client Not Generated
**Cause:** Build command doesn't run `prisma generate` with correct schema path
**Prevention:** Explicit `--schema=./src/prisma/schema.prisma` in vercel-build script

### ❌ Problem: Environment Variables Not Found
**Cause:** Using `env` field in vercel.json (deprecated)
**Prevention:** All env vars are set in Vercel dashboard under Project Settings → Environment Variables

### ❌ Problem: Wrong Root Directory
**Cause:** Vercel detects `src/` as project root instead of repository root
**Prevention:** Standard Next.js structure with `src/` as source directory (not project root)

---

## DO NOT TOUCH Without Care

### Critical Configuration That Must Stay Stable:

1. **Prisma Schema Path**
   - Always use `--schema=./src/prisma/schema.prisma` in scripts
   - Changing this breaks builds and migrations

2. **vercel-build Script**
   - Must run in order: prisma generate → migrate deploy → next build
   - Changing order or removing steps will break deployments

3. **Function Timeout Limits**
   - Some API routes (analytics, matches) need 10-15s timeouts
   - Reducing these will cause "Function Execution Timeout" errors

4. **Image Remote Patterns**
   - Required for Unsplash, Pexels, and Vercel Blob Storage
   - Removing these breaks image loading

5. **vercel.json Headers**
   - Security headers protect against XSS, clickjacking, MIME-sniffing
   - DO NOT remove or weaken these without security review

---

## Deployment Checklist

Before deploying changes to Vercel:

- [ ] Run `npm run build` locally to verify Next.js builds successfully
- [ ] Verify `prisma generate --schema=./src/prisma/schema.prisma` works
- [ ] Check that no new env vars are needed (add to Vercel dashboard first)
- [ ] Confirm vercel.json is still schema-compliant (no extra properties)
- [ ] Test API routes locally to ensure they don't exceed function timeout limits
- [ ] Verify no hard-coded localhost URLs or file paths
- [ ] Check that new dependencies don't conflict with Vercel's build environment

---

## Debugging Deployment Failures

### If Vercel Build Fails:

1. **Check Build Logs** - Look for the specific error (Prisma, TypeScript, dependency issues)
2. **Verify Environment Variables** - Ensure all required vars are set in Vercel dashboard
3. **Test Locally** - Run `npm run vercel-build` to replicate the production build
4. **Check Prisma Schema** - Ensure `prisma generate --schema=./src/prisma/schema.prisma` works
5. **Review Recent Changes** - Compare vercel.json and next.config.js with this documentation

### If Functions Timeout:

1. **Check Function Limits** - Verify timeout in vercel.json matches route requirements
2. **Optimize Database Queries** - Slow queries are the #1 cause of timeouts
3. **Add Indexes** - Ensure Prisma schema has proper indexes for frequently queried fields
4. **Reduce Data Fetching** - Limit SELECT fields, use pagination, implement caching

### If Framework Not Detected:

1. **Remove Build Overrides** - Check vercel.json for `buildCommand` or `framework` fields
2. **Verify package.json** - Ensure Next.js is in dependencies (not devDependencies)
3. **Check Root Directory** - Confirm Vercel project settings use `/` as root

---

## Next Steps

After any configuration changes:

1. **Test Locally First** - Always run `npm run build` before pushing
2. **Deploy to Preview** - Push to a branch and test the Vercel preview deployment
3. **Monitor Build Logs** - Watch for warnings or deprecation notices
4. **Update This Document** - Keep this healthcheck doc in sync with any config changes

---

## Questions & Support

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Prisma on Vercel:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

**Last Audit:** 2025-11-22
**Audit By:** Claude Code (automated deployment config review)
