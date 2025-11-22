# WanderNest Production Failure Modes & Troubleshooting Guide

This document describes potential failure modes for WanderNest backend integrations and provides a playbook for diagnosing and resolving production issues.

## Table of Contents

1. [Quick Health Check](#quick-health-check)
2. [Database (PostgreSQL via Prisma)](#database-postgresql-via-prisma)
3. [Email Notification System](#email-notification-system)
4. [Authentication (Google OAuth)](#authentication-google-oauth)
5. [Critical User Flows](#critical-user-flows)
6. [Monitoring & Alerts](#monitoring--alerts)
7. [Emergency Procedures](#emergency-procedures)

---

## Quick Health Check

### Health Check Endpoint

**URL**: `GET /api/health`

**Expected Response** (Healthy):
```json
{
  "status": "healthy",
  "timestamp": "2025-01-22T10:30:00.000Z",
  "environment": "production",
  "components": {
    "database": { "status": "healthy", "healthy": true },
    "email": { "status": "healthy" },
    "googleAuth": { "status": "healthy" },
    "payment": { "status": "healthy" }
  },
  "warnings": 0,
  "errors": 0
}
```

**If Unhealthy**:
- Check `components` section to see which integration is failing
- Review `warnings` and `errors` counts
- Follow specific integration troubleshooting below

### Server Logs

On Vercel, view logs in real-time:
```bash
vercel logs [deployment-url] --follow
```

Look for these indicators:
- ✅ = Success
- ⚠️  = Warning (non-critical)
- ❌ = Error (critical)

---

## Database (PostgreSQL via Prisma)

### What It Does

The database stores all persistent data:
- Student profiles and availability
- Tourist accounts and booking requests
- Request selections and bookings
- Reviews and ratings
- Payment records

### Configuration

**Required Environment Variable**:
- `DATABASE_URL` - PostgreSQL connection string

**Format**:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connection_limit=5&pool_timeout=10&connect_timeout=10
```

### Common Failure Modes

#### 1. Database Not Configured

**Symptoms**:
- Health check shows `database.status: "not_configured"`
- Logs show: `⚠️  Database not configured - running in demo mode`
- Application works but data doesn't persist

**Cause**: `DATABASE_URL` environment variable is missing or contains "dummy"

**Resolution**:
1. In Vercel dashboard, go to Settings → Environment Variables
2. Add `DATABASE_URL` with your Postgres connection string
3. Redeploy the application
4. Verify with `GET /api/health`

**Prevention**: Always set `DATABASE_URL` for production deployments

---

#### 2. Database Connection Failed

**Symptoms**:
- Health check shows `database.status: "unhealthy"`
- Logs show: `❌ Database health check failed`
- API requests return 500 errors with "Database required but not available"

**Possible Causes**:

**A. Wrong Credentials**
- **Log**: `Authentication failed for database`
- **Check**: Verify username/password in `DATABASE_URL`
- **Fix**: Update credentials in Vercel environment variables

**B. Cannot Reach Database**
- **Log**: `Cannot reach database server`
- **Check**: Verify host and port in `DATABASE_URL`
- **Check**: Ensure database is running and accessible
- **Check**: Network/firewall rules allow connections from Vercel IPs

**C. Database Timeout**
- **Log**: `Database server connection timed out`
- **Check**: Database server load and performance
- **Check**: Connection pool settings in `DATABASE_URL`
- **Fix**: Add/adjust connection pooling parameters:
  ```
  ?connection_limit=5&pool_timeout=10&connect_timeout=10
  ```

**D. Database Does Not Exist**
- **Log**: `Database does not exist`
- **Check**: Database name in `DATABASE_URL` matches actual database
- **Fix**: Create database or update connection string

---

#### 3. Migration Issues

**Symptoms**:
- Database connects but queries fail
- Logs show Prisma errors about missing tables/columns
- Errors like `P2021: The table does not exist`

**Cause**: Database schema doesn't match application code

**Resolution**:
```bash
# Run migrations
npx prisma migrate deploy

# If that fails, check migration status
npx prisma migrate status

# Generate Prisma client
npx prisma generate
```

**Prevention**:
- Always run migrations after schema changes
- Include migration step in deployment pipeline

---

#### 4. Connection Pool Exhausted

**Symptoms**:
- Intermittent database errors
- Logs show `P1008: Database operations timed out`
- Performance degrades under load

**Cause**: Too many concurrent database connections

**Resolution**:
1. Check current connection limit in `DATABASE_URL`
2. Increase connection pool size:
   ```
   ?connection_limit=10&pool_timeout=20
   ```
3. For Vercel Postgres, check quota limits in dashboard
4. Consider upgrading database plan

**Prevention**:
- Monitor connection pool usage
- Set appropriate limits based on expected traffic
- Use connection pooling (PgBouncer) for high traffic

---

### Database Troubleshooting Checklist

When database issues occur:

1. ✅ Check health endpoint: `GET /api/health`
2. ✅ Verify `DATABASE_URL` is set in Vercel
3. ✅ Test connection string locally:
   ```bash
   psql "your-connection-string"
   ```
4. ✅ Check database is running (Vercel dashboard or provider)
5. ✅ Verify migrations are up to date:
   ```bash
   npx prisma migrate status
   ```
6. ✅ Check database logs for errors
7. ✅ Monitor connection pool usage
8. ✅ Review recent schema changes

---

## Email Notification System

### What It Does

Sends emails for:
- Booking confirmation (to tourist after request creation)
- Student notification (when tourist selects them)
- Acceptance notification (to tourist when student accepts)
- Student confirmation (to student when they accept)
- Email verification codes

### Configuration

**Required Environment Variables**:
- `EMAIL_HOST` - SMTP server (e.g., `smtp.gmail.com`)
- `EMAIL_PORT` - SMTP port (usually `587` for TLS)
- `EMAIL_USER` - SMTP username/email
- `EMAIL_PASS` - SMTP password (app-specific password for Gmail)

**Optional**:
- `EMAIL_FROM` - Sender name and email (default: `TourWiseCo <noreply@tourwiseco.com>`)
- `NEXT_PUBLIC_BASE_URL` - For generating email links

### Common Failure Modes

#### 1. Email Not Configured

**Symptoms**:
- Health check shows `email.status: "not_configured"`
- Logs show: `⚠️  Email not configured - using mock mode`
- In development: Email content logged to console
- In production: No emails sent

**Cause**: Missing `EMAIL_HOST`, `EMAIL_USER`, or `EMAIL_PASS`

**Impact**:
- ⚠️  **Non-Critical**: Bookings still work, but users don't receive notifications
- Users may miss important updates about their bookings

**Resolution**:
1. Set up SMTP credentials (Gmail recommended):
   - For Gmail, create an "App Password" at https://myaccount.google.com/apppasswords
2. Add environment variables in Vercel:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   ```
3. Redeploy
4. Test by creating a booking request

**Prevention**: Always configure email for production environments

---

#### 2. Email Sending Failed

**Symptoms**:
- Logs show: `❌ Failed to send email: [context]`
- Specific error message in logs
- Email count in API response shows failed sends

**Possible Causes**:

**A. Authentication Failed**
- **Log**: Error includes "authentication failed" or "535"
- **Check**: `EMAIL_USER` and `EMAIL_PASS` are correct
- **Fix**: Generate new app-specific password for Gmail

**B. Connection Refused**
- **Log**: `ECONNREFUSED`
- **Check**: `EMAIL_HOST` and `EMAIL_PORT` are correct
- **Check**: Network allows outbound SMTP connections
- **Fix**: Verify SMTP server details

**C. Timeout**
- **Log**: `ETIMEDOUT`
- **Check**: SMTP server is reachable
- **Fix**: Increase connection timeout or change SMTP provider

**D. Rate Limiting**
- **Log**: Error includes "rate limit" or "quota exceeded"
- **Check**: Gmail sending limits (500/day for free accounts)
- **Fix**: Upgrade to paid email service or reduce email volume

---

#### 3. Email Links Don't Work

**Symptoms**:
- Emails send successfully
- Links in emails point to wrong domain or localhost

**Cause**: `NEXT_PUBLIC_BASE_URL` not set correctly

**Resolution**:
1. Set `NEXT_PUBLIC_BASE_URL` in Vercel:
   ```
   NEXT_PUBLIC_BASE_URL=https://wandernest.com
   ```
2. Redeploy
3. Test email links

---

### Email Troubleshooting Checklist

When email issues occur:

1. ✅ Check health endpoint: `GET /api/health`
2. ✅ Verify all email env vars are set in Vercel
3. ✅ Test SMTP credentials manually:
   ```bash
   npm install -g nodemailer-cli
   nodemailer-send --host smtp.gmail.com --port 587 \
     --user your-email@gmail.com --pass your-password \
     --to test@example.com --subject "Test" --text "Test"
   ```
4. ✅ Check server logs for specific error messages
5. ✅ Verify email provider status (Gmail, SendGrid, etc.)
6. ✅ Check email sending rate limits
7. ✅ Test with different recipient email addresses
8. ✅ Verify `NEXT_PUBLIC_BASE_URL` is set for email links

**Important**: Email failures are **non-critical** and will not break booking flows. The core booking data is always persisted safely to the database first.

---

## Authentication (Google OAuth)

### What It Does

Handles user sign-in via Google OAuth:
- Determines user type (student vs tourist) based on email domain
- Creates/updates user records in database
- Manages sessions

### Configuration

**Required Environment Variables**:
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NEXTAUTH_SECRET` - Secret for signing session tokens
- `NEXTAUTH_URL` - Application URL (e.g., `https://wandernest.com`)

### Common Failure Modes

#### 1. Google OAuth Not Configured

**Symptoms**:
- Health check shows `googleAuth.status: "not_configured"`
- Sign-in button doesn't work or shows error
- Users cannot log in

**Cause**: Missing `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET`

**Impact**: **CRITICAL** - No users can sign in

**Resolution**:
1. Create Google OAuth credentials:
   - Go to https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID (Web application)
   - Add authorized redirect URIs:
     ```
     https://wandernest.com/api/auth/callback/google
     ```
2. Add environment variables in Vercel:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   NEXTAUTH_SECRET=generate-a-random-secret
   NEXTAUTH_URL=https://wandernest.com
   ```
3. Redeploy immediately

**Prevention**: Verify auth configuration before going live

---

#### 2. OAuth Redirect URI Mismatch

**Symptoms**:
- Sign-in redirects to Google, then shows error
- Error message: "redirect_uri_mismatch"
- Logs show Google OAuth errors

**Cause**: Authorized redirect URIs in Google Console don't match actual callback URL

**Resolution**:
1. In Google Cloud Console, check OAuth 2.0 Client redirect URIs
2. Add the correct callback URL:
   ```
   https://your-actual-domain.com/api/auth/callback/google
   ```
3. For preview deployments, add:
   ```
   https://*.vercel.app/api/auth/callback/google
   ```
4. Wait a few minutes for Google to propagate changes
5. Test sign-in again

---

#### 3. Database Errors During Sign-In

**Symptoms**:
- Sign-in fails after Google authentication
- Logs show: `❌ Auth: Sign-in callback failed`
- Database error messages in logs

**Cause**: Database unavailable during user record creation

**Resolution**:
1. Check database health: `GET /api/health`
2. Fix database issues (see Database section)
3. Ask users to try signing in again

**Prevention**: System now gracefully handles database failures during auth

---

#### 4. Session Issues

**Symptoms**:
- Users get signed out unexpectedly
- "Session expired" errors
- Inconsistent user state

**Possible Causes**:

**A. Missing NEXTAUTH_SECRET**
- **Check**: Verify `NEXTAUTH_SECRET` is set
- **Fix**: Generate and set a random secret (32+ characters)

**B. NEXTAUTH_URL Mismatch**
- **Check**: `NEXTAUTH_URL` matches actual deployment URL
- **Fix**: Update to correct URL

**C. Database Session Storage Issues**
- **Check**: Database connection is stable
- **Fix**: Resolve database issues

---

### Authentication Troubleshooting Checklist

When auth issues occur:

1. ✅ Check health endpoint: `GET /api/health`
2. ✅ Verify all auth env vars in Vercel:
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
3. ✅ Check Google Cloud Console:
   - OAuth consent screen configured
   - Redirect URIs match deployment URLs
   - Client credentials are active
4. ✅ Test OAuth flow manually in browser
5. ✅ Check server logs for specific errors
6. ✅ Verify database is healthy (sessions stored in DB)
7. ✅ Clear browser cookies and try again
8. ✅ Test with different Google accounts

---

## Critical User Flows

### Flow 1: Student Onboarding

**Path**: Sign in → Complete profile → Admin approval → Active

**Required Integrations**:
- ✅ Database (critical)
- ✅ Google Auth (critical)
- ⚠️  Email (nice-to-have for confirmation)

**Failure Modes**:

| Issue | Symptoms | Impact | Fix |
|-------|----------|--------|-----|
| Database down | 500 error on submit | **CRITICAL**: Cannot create profile | Fix database connection |
| Google auth down | Cannot sign in | **CRITICAL**: Cannot start onboarding | Fix OAuth configuration |
| Missing fields | Validation errors | Low: Clear error messages | Check form data |
| Duplicate email | 409 error | Low: User already exists | User should sign in instead |

**Error Messages**:
- `Database required but not available` → Database misconfigured
- `A profile with this email already exists` → Duplicate registration
- `This Google account is already registered` → Account already used

---

### Flow 2: Tourist Request Creation

**Path**: Sign in → Fill form → Submit → Receive confirmation

**Required Integrations**:
- ✅ Database (critical)
- ✅ Google Auth (critical)
- ⚠️  Email (confirmation email)

**Failure Modes**:

| Issue | Symptoms | Impact | Fix |
|-------|----------|--------|-----|
| Database down | Falls back to demo mode | **MEDIUM**: Request not persisted | Fix database ASAP |
| Email fails | Request created, no email | Low: Core data saved | Check email config |
| Auth fails | Cannot access form | **CRITICAL**: Cannot create request | Fix OAuth |
| Invalid data | Validation errors | Low: Clear feedback | Check form inputs |

**Error Messages**:
- `Database required but not available` → Using demo mode fallback
- `Tourist profile not found` → Auth issue, sign in again
- `Validation failed` → Check request data

**Monitoring**:
- Watch for demo mode usage in production
- Alert if email failures exceed 10%

---

### Flow 3: Matching & Selection

**Path**: Request created → Find matches → Select students → Students notified

**Required Integrations**:
- ✅ Database (critical - for matches and selections)
- ⚠️  Email (student notifications)

**Failure Modes**:

| Issue | Symptoms | Impact | Fix |
|-------|----------|--------|-----|
| Database down | Cannot find matches | **CRITICAL**: Flow blocked | Fix database immediately |
| No approved students | Empty match list | **MEDIUM**: No matches available | Admin must approve students |
| Email fails | Selections saved, emails fail | Low: Students not notified | Check email, students can see in dashboard |
| Request already processed | 400 error | Low: Prevents duplicate processing | Expected behavior |

**Error Messages**:
- `Request not found` → Invalid request ID
- `Request already been processed` → Duplicate selection attempt
- `Students are not available` → Students became unavailable
- `⚠️  Failed to send X notification emails` → Email issue, selections still saved

---

### Flow 4: Booking Confirmation

**Path**: Student sees request → Accepts → Both parties notified → Booking confirmed

**Required Integrations**:
- ✅ Database (critical - for transaction)
- ⚠️  Email (notifications)

**Failure Modes**:

| Issue | Symptoms | Impact | Fix |
|-------|----------|--------|-----|
| Database down | Cannot accept | **CRITICAL**: Cannot complete booking | Fix database immediately |
| Transaction fails | Error, no booking created | **CRITICAL**: Retry needed | Check logs, may be race condition |
| Email fails | Booking saved, no emails | Low: Users see in dashboard | Check email config |
| Request expired | 400 error | Expected: Request too old | Tourist should create new request |
| Already accepted | 400 error | Expected: Race condition | First student won |

**Error Messages**:
- `Request not found` → Invalid request ID
- `Request is no longer available` → Another student accepted
- `Request has expired` → Request older than 7 days
- `You were not matched with this request` → Not in selection list
- `Your account must be approved to accept` → Student not approved yet
- `⚠️  X notification emails failed` → Booking saved, email issue

**Transaction Safety**:
- All database updates happen in a single transaction
- Email sending happens AFTER transaction commits
- Email failures never roll back the booking

---

## Monitoring & Alerts

### Key Metrics to Monitor

**1. Health Check Endpoint**
- Monitor: `GET /api/health` every 1-5 minutes
- Alert if: Status code != 200 OR `status !== "healthy"`
- Check: `components` object for failing integrations

**2. Error Rates**
- Monitor: Server logs for `❌` markers
- Alert if: Error rate > 1% of requests
- Patterns to watch:
  - `❌ Database health check failed`
  - `❌ Failed to send email`
  - `❌ Auth: Sign-in callback failed`

**3. Critical Flow Success Rates**
- Student onboarding completion rate
- Tourist request creation rate
- Booking acceptance rate
- Monitor for sudden drops

**4. Email Delivery**
- Track successful vs failed email sends
- Alert if failure rate > 10%
- Check for: `⚠️  Failed to send X emails`

**5. Database Performance**
- Connection pool utilization
- Query latency
- Transaction failure rate

### Recommended Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Health check failures | 2 consecutive | 5 consecutive |
| Error rate | > 1% | > 5% |
| Database connection time | > 2s | > 5s |
| Email failure rate | > 10% | > 25% |
| API response time | > 3s p95 | > 10s p95 |

### Log Analysis

**Search for Critical Issues**:
```bash
# On Vercel
vercel logs [url] | grep "❌"

# Database issues
vercel logs [url] | grep "Database"

# Email issues
vercel logs [url] | grep "email"

# Auth issues
vercel logs [url] | grep "Auth"
```

**Log Levels**:
- `✅` = Success (informational)
- `⚠️` = Warning (investigate if frequent)
- `❌` = Error (requires immediate attention)

---

## Emergency Procedures

### Critical: Complete System Down

**Symptoms**: Nothing works, all requests fail

**Steps**:
1. Check Vercel deployment status
2. Check health endpoint: `GET /api/health`
3. Review recent deployments - rollback if needed:
   ```bash
   vercel rollback
   ```
4. Check environment variables in Vercel dashboard
5. Review Vercel logs for widespread errors

---

### Critical: Database Down

**Symptoms**: All database operations fail, health check unhealthy

**Immediate Actions**:
1. Check database provider status (Vercel Postgres dashboard)
2. Verify `DATABASE_URL` in environment variables
3. Test connection manually:
   ```bash
   psql "your-database-url"
   ```
4. Check database provider alerts/incidents

**Temporary Mitigation**:
- System will fall back to demo mode for some operations
- No data loss - just temporary unavailability
- Users will see generic error messages

**Long-term Fix**:
- Resolve database connectivity issue
- Run health check to verify: `GET /api/health`
- Test critical flows

---

### Critical: Authentication Down

**Symptoms**: Users cannot sign in

**Immediate Actions**:
1. Check Google Cloud Console for OAuth app status
2. Verify environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. Check redirect URIs match deployment URL
4. Review auth-related logs

**Temporary Mitigation**:
- None - auth must be fixed immediately
- Communicate estimated fix time to users

---

### Non-Critical: Email Down

**Symptoms**: Emails not being sent, warnings in logs

**Immediate Actions**:
1. Check email provider status (Gmail, etc.)
2. Verify email environment variables
3. Check for rate limiting

**Impact**:
- Low impact - bookings still work
- Users may miss notifications but can see updates in dashboard

**Fix Priority**: Medium - fix within 24 hours

**Mitigation**:
- Core flows continue working
- In-app notifications still visible
- Can manually notify affected users if needed

---

## Configuration Checklist

Before deploying to production, verify all environment variables are set:

### Database
- [ ] `DATABASE_URL` - PostgreSQL connection string

### Email
- [ ] `EMAIL_HOST` - SMTP server
- [ ] `EMAIL_PORT` - SMTP port (587)
- [ ] `EMAIL_USER` - SMTP username
- [ ] `EMAIL_PASS` - SMTP password
- [ ] `EMAIL_FROM` - Sender email (optional)
- [ ] `NEXT_PUBLIC_BASE_URL` - Application URL

### Authentication
- [ ] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- [ ] `NEXTAUTH_SECRET` - Session secret
- [ ] `NEXTAUTH_URL` - Application URL

### Payment (Optional)
- [ ] `RAZORPAY_KEY_ID` - Payment gateway key
- [ ] `RAZORPAY_KEY_SECRET` - Payment gateway secret
- [ ] `RAZORPAY_WEBHOOK_SECRET` - Webhook verification
- [ ] `DISCOVERY_FEE_AMOUNT` - Fee amount (default: 99.00)

### Cache (Optional but recommended)
- [ ] `REDIS_URL` - Redis connection string

---

## Testing Production Configuration

After deployment, run through this checklist:

1. **Health Check**
   ```bash
   curl https://your-domain.com/api/health
   ```
   - Verify all components show "healthy"
   - Check for warnings/errors

2. **Database**
   - Create a test student profile
   - Create a test tourist request
   - Verify data persists after refresh

3. **Authentication**
   - Sign in with a student email (.edu)
   - Sign in with a tourist email (gmail, etc.)
   - Verify correct user type assigned
   - Check session persists

4. **Email**
   - Create a tourist request
   - Check confirmation email received
   - Verify email links work

5. **Complete Flow**
   - Create tourist request
   - Select students
   - Accept as student
   - Verify both parties notified

6. **Error Handling**
   - Try invalid operations (should get clear errors)
   - Check logs for proper error formatting
   - Verify no sensitive data in error messages

---

## Support & Escalation

### When to Escalate

**Immediate (within 5 minutes)**:
- Complete system down
- Database completely unavailable
- Authentication completely broken
- Security breach suspected

**Urgent (within 1 hour)**:
- Partial database outage
- Critical flow broken (bookings)
- High error rates (> 10%)

**Standard (within 24 hours)**:
- Email delivery issues
- Non-critical feature broken
- Performance degradation

### Information to Gather

When reporting an issue, include:
1. Time of incident (with timezone)
2. Affected flows/features
3. Error messages from logs
4. Health check response
5. Number of affected users
6. Recent changes/deployments

### Contact Points

- **Vercel Status**: https://www.vercel-status.com/
- **Google Cloud Status**: https://status.cloud.google.com/
- **Application Logs**: `vercel logs [deployment-url]`

---

## Summary

### Critical Integration Points

1. **Database (PostgreSQL)**
   - Most critical - required for all core flows
   - Failures are CRITICAL and require immediate attention
   - Has demo mode fallback for non-critical scenarios

2. **Google OAuth**
   - Critical for user authentication
   - Failures block all user access
   - Must be configured correctly before production

3. **Email**
   - Non-critical - nice-to-have for notifications
   - Failures logged but don't break flows
   - Users can still see updates in dashboards

4. **Payment (Razorpay)**
   - Optional for basic functionality
   - Required only for discovery fee payment
   - Can be added later if needed

### Key Principles

1. **Database First**: All critical data is persisted to database before any other operations
2. **Graceful Degradation**: Email failures don't break booking flows
3. **Clear Error Messages**: All errors include context and suggested fixes
4. **Comprehensive Logging**: Success (✅), warnings (⚠️), and errors (❌) clearly marked
5. **Transaction Safety**: Database operations use transactions to ensure consistency

### Where to Look When Things Go Wrong

1. **First**: Health check endpoint (`/api/health`)
2. **Second**: Vercel logs (search for `❌`)
3. **Third**: Specific integration section in this document
4. **Fourth**: Environment variables in Vercel dashboard
5. **Fifth**: Provider status pages (Vercel, Google, etc.)

---

**Last Updated**: 2025-01-22

**Document Version**: 1.0

For questions or updates to this document, please contact the development team.
