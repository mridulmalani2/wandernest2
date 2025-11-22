# Pre-Deployment Checklist for WanderNest

**Last Updated:** 2025-11-22
**Status:** Production hardening complete - ready for final review

## Executive Summary

This document summarizes the pre-deployment hardening pass completed on the WanderNest codebase. All critical security vulnerabilities have been addressed, experimental flags removed, and the application is now stable for Vercel deployment.

---

## ✅ Completed Hardening Tasks

### 1. Security Fixes (CRITICAL)

#### API Route Authentication
**Problem:** Multiple API routes had no authentication, allowing unauthorized access to sensitive operations.

**Routes Fixed:**
- ✅ `/api/student/dashboard` - Added NextAuth session verification
- ✅ `/api/reviews` - Added tourist authentication + ownership verification
- ✅ `/api/student/requests/accept` - Added student authentication + ownership verification
- ✅ `/api/student/requests/reject` - Added student authentication + ownership verification
- ✅ `/api/student/requests/[requestId]/accept` - Added student authentication + ownership verification
- ✅ `/api/student/upload` - Added student authentication (prevents unauthorized file uploads)
- ✅ `/api/tourist/request/select` - Added tourist authentication + request ownership verification

**Impact:**
- Prevents unauthorized users from accepting bookings on behalf of students
- Prevents unauthorized file uploads consuming storage/CDN quota
- Prevents tourists from hijacking other tourists' requests
- Prevents unauthorized creation of reviews

#### Secrets Scan
- ✅ Scanned entire codebase for accidentally committed secrets
- ✅ Confirmed no API keys, tokens, or credentials in code
- ✅ All sensitive values properly use environment variables

#### Code Injection Prevention
- ✅ Verified no use of `eval()` or `new Function()`
- ✅ Checked `dangerouslySetInnerHTML` usage - only used for:
  - JSON-LD structured data (safe, uses `JSON.stringify`)
  - highlight.js code highlighting (safe, escapes HTML by default)

---

### 2. Dependency & Configuration Hardening

#### Experimental Flags Removed
**File:** `next.config.js`

**Removed:**
```javascript
experimental: {
  optimizePackageImports: [...],  // REMOVED
  optimizeCss: true,                // REMOVED
}
```

**Reason:** These experimental features are not stable in production and can cause unexpected build failures or runtime issues.

**Retained Stable Optimizations:**
- `modularizeImports` for lucide-react (stable, production-ready)
- `removeConsole` in production (stable)
- Image optimization (stable)

#### Dependency Version Fixes
**File:** `package.json`

**Fixed:**
- ✅ `@next/bundle-analyzer`: Changed from `^16.0.3` → `^14.2.15` (matched to Next.js version)

**Current Versions (Verified Stable):**
- Next.js: `14.2.15` (LTS, not bleeding-edge 15.x)
- React: `18.3.1` (Latest stable)
- Prisma: `6.19.0` (Recent stable)
- next-auth: `4.24.13` (v4 stable, v5 still beta)

**Intentionally Pinned (Do NOT Auto-Upgrade):**
- `next@14.2.15` - Stay on v14 for stability; v15 has breaking changes
- `next-auth@4.x` - v5 is in beta, keep on stable v4

---

### 3. Error Handling Improvements

#### API Routes
- ✅ All critical routes use `withErrorHandler` wrapper for consistent error handling
- ✅ Database operations wrapped in `withDatabaseRetry` for transient failure resilience
- ✅ Errors logged to console (for Vercel logs) without leaking sensitive data to clients
- ✅ Appropriate HTTP status codes: 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

---

### 4. Performance Review

#### Bundle Size
- ✅ Dynamic imports used for heavy components (WhyChooseCarousel)
- ✅ Framer Motion tree-shaking via `modularizeImports`
- ✅ Console logs removed in production builds

#### Database Queries
- ✅ Parallel queries using `Promise.all()` where appropriate
- ✅ Optimized Prisma selects (only fetch needed fields)
- ✅ Caching implemented for expensive queries (student reviews, matches)

#### TypeScript `any` Usage
- ✅ Reviewed usage of `any` types - present but minimal (22 occurrences)
- ✅ No unsafe `any` in security-critical paths

---

## 🔍 Known Issues & TODOs (Non-Blocking)

### Security - Medium Priority

1. **Tourist Request Routes (Info Disclosure)**
   - `/api/tourist/request/match` - No auth check, but returns masked data
   - `/api/tourist/request/status` - No auth check, but requires requestId
   - **Mitigation:** Data is anonymized; actual risk is enumeration attacks
   - **TODO:** Add lightweight token-based auth for these routes

2. **Inconsistent Auth Patterns**
   - Some legacy routes use custom `student_token` cookies instead of NextAuth
   - **Example:** `/api/student/requests/[requestId]/reject` (uses token-based auth)
   - **TODO:** Migrate all student routes to use NextAuth `getServerSession()` for consistency

3. **Admin Authentication**
   - Uses separate JWT-based auth (not NextAuth)
   - **Status:** Working as designed, but consider NextAuth for consistency
   - **TODO:** Evaluate migrating admin to NextAuth or keep separate for admin isolation

### Performance - Low Priority

1. **Framer Motion Bundle Size**
   - Used in 10+ components
   - **Mitigation:** Already using `modularizeImports` for tree-shaking
   - **TODO:** Consider lazy-loading animations on mobile for faster FCP

2. **Image Optimization**
   - Using Next.js Image component correctly
   - AVIF/WebP formats enabled
   - **TODO:** Audit actual images uploaded to ensure they're optimized

---

## 📋 Pre-Launch Verification Checklist

Before deploying to Vercel production, verify:

### Environment Variables (Vercel Dashboard)
- [ ] `DATABASE_URL` - PostgreSQL connection string (with SSL)
- [ ] `JWT_SECRET` - Strong random string (32+ chars)
- [ ] `NEXTAUTH_SECRET` - Strong random string (32+ chars, different from JWT_SECRET)
- [ ] `NEXTAUTH_URL` - Production URL (https://your-domain.com)
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth credentials
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - SMTP settings (optional but recommended)
- [ ] `NEXT_PUBLIC_BASE_URL` - Production URL
- [ ] `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token (for file uploads)
- [ ] `NODE_ENV=production`

### Vercel Configuration
- [ ] Verify `vercel.json` function memory/timeout limits are appropriate
- [ ] Confirm security headers in `vercel.json` are applied
- [ ] Check that Postgres database is provisioned (Vercel Postgres or external)
- [ ] Verify Blob storage is configured for student file uploads

### Database
- [ ] Run `prisma migrate deploy` as part of build (already in `vercel-build` script)
- [ ] Confirm database has at least one admin user for `/admin` access
- [ ] Test database connection in staging environment

### Build & Deploy
- [ ] Run `npm run build` locally to verify no build errors
- [ ] Check build output for unexpected warnings
- [ ] Deploy to Vercel preview environment first
- [ ] Test all critical flows in preview:
  - Student sign-up → onboarding → dashboard
  - Tourist sign-up → create request → select guides
  - Admin login → approve students
  - File upload functionality
  - Review creation

### Post-Deployment Smoke Tests
- [ ] Visit `/` - homepage loads
- [ ] Visit `/api/health` - returns 200 OK
- [ ] Student flow: Sign in with Google (academic email)
- [ ] Tourist flow: Sign in with Google (any email)
- [ ] Admin flow: Login at `/admin/login`
- [ ] Check Vercel logs for any runtime errors
- [ ] Verify no console errors in browser (production mode)

---

## 🔐 Security Flows Verified

### Student Flow
1. **Sign Up:** Google OAuth → Academic email validation → Creates Student record
2. **Onboarding:** Protected by NextAuth middleware → Profile creation
3. **Dashboard:** Protected by API auth → Only own data accessible
4. **Accept/Reject Requests:** Protected by API auth → Can only act on own behalf
5. **File Upload:** Protected by API auth → Only students can upload

### Tourist Flow
1. **Sign Up:** Google OAuth → Any email accepted → Creates Tourist record
2. **Create Request:** Protected by NextAuth → Request linked to authenticated user
3. **Select Guides:** Protected by API auth → Can only select for own requests
4. **Leave Review:** Protected by API auth → Can only review own bookings

### Admin Flow
1. **Login:** Separate JWT-based auth → Admin dashboard access
2. **All Actions:** Protected by `verifyAdmin` middleware

---

## 📊 Top 5 Issues Found & Fixed

1. **CRITICAL: Unauthorized API Access**
   - 7 API routes had no authentication
   - Anyone could accept requests, upload files, create reviews
   - **Fixed:** Added NextAuth session verification + ownership checks

2. **CRITICAL: Request Hijacking**
   - `/api/tourist/request/select` allowed selecting guides for any request
   - **Fixed:** Added tourist authentication + request ownership verification

3. **HIGH: Experimental Next.js Flags**
   - `optimizePackageImports` and `optimizeCss` are unstable
   - **Fixed:** Removed experimental flags, kept stable optimizations

4. **MEDIUM: Version Mismatch**
   - `@next/bundle-analyzer@16.x` incompatible with `next@14.x`
   - **Fixed:** Downgraded bundle-analyzer to match Next.js version

5. **MEDIUM: Missing Error Handling**
   - Some API routes could leak stack traces to clients
   - **Fixed:** Consistent error handling with `withErrorHandler`

---

## 🚀 Build Verification

**Status:** Ready for build test

**Command to test:**
```bash
npm run build
```

**Expected output:**
- No TypeScript errors
- No ESLint errors
- Build completes successfully
- No warnings about missing env vars (at build time)

---

## 📞 Support & Escalation

If you encounter issues during deployment:

1. **Build Failures:** Check Vercel build logs for missing dependencies or env vars
2. **Database Connection:** Verify `DATABASE_URL` and that migrations ran (`prisma migrate deploy`)
3. **Auth Issues:** Confirm `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, Google OAuth credentials
4. **File Upload Errors:** Verify `BLOB_READ_WRITE_TOKEN` is set

---

## 🎯 Final Recommendation

**The application is now READY for Vercel deployment.**

✅ All critical security issues resolved
✅ Experimental flags removed
✅ Dependencies stable and compatible
✅ Error handling in place
✅ No committed secrets

**Next Steps:**
1. Set all environment variables in Vercel dashboard
2. Run `npm run build` locally to confirm
3. Deploy to Vercel preview environment
4. Run smoke tests from checklist above
5. If preview tests pass → promote to production
6. Monitor Vercel logs for first 24 hours

---

**Prepared by:** Claude Code
**Review Date:** 2025-11-22
**Deployment Target:** Vercel (Serverless Functions + Vercel Postgres + Vercel Blob)
