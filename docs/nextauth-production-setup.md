# NextAuth Production Configuration for Vercel

This document describes the NextAuth configuration changes made to ensure secure and reliable authentication in production on Vercel.

## Overview

WanderNest uses NextAuth for authentication with:
- **Google OAuth** for both students (academic emails) and tourists
- **Email magic links** for student authentication (optional)
- **Prisma adapter** for database-backed sessions
- **Database session strategy** for security and scalability

## Production Enhancements Implemented

### 1. Vercel Proxy Handling

NextAuth automatically handles Vercel's proxy configuration through the `NEXTAUTH_URL` environment variable. No additional code configuration is required.

**How it works:**
- Vercel uses proxies and load balancers for deployments
- NextAuth detects and trusts forwarded headers automatically
- Setting `NEXTAUTH_URL` to your production domain ensures correct callback URL generation

**Impact:** Fixes callback URL mismatches and redirect issues without code changes

**Note:** No code change needed - this is handled automatically when you set `NEXTAUTH_URL` in your Vercel environment variables.

### 2. Secure Cookie Configuration

```typescript
cookies: {
  sessionToken: {
    name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  },
}
```

**Security Features:**
- `__Secure-` prefix in production (requires HTTPS)
- `httpOnly: true` - Prevents JavaScript access (XSS protection)
- `sameSite: 'lax'` - CSRF protection while allowing OAuth flows
- `secure: true` in production - Cookie only sent over HTTPS
- `path: '/'` - Cookie available site-wide

### 3. Enhanced Google OAuth Configuration

```typescript
GoogleProvider({
  clientId: config.auth.google.clientId || "",
  clientSecret: config.auth.google.clientSecret || "",
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
})
```

**Enhancements:**
- `prompt: "consent"` - Forces consent screen for refresh tokens
- `access_type: "offline"` - Enables refresh token generation
- `response_type: "code"` - Uses authorization code flow (most secure)

### 4. Production-Safe Secret Handling

```typescript
secret: config.auth.nextAuth.secret || process.env.NEXTAUTH_SECRET
```

**Validation:**
- Required in production (enforced by config validation)
- Minimum 32 characters in production
- Clear error messages if missing or too short

### 5. Runtime Configuration

```typescript
export const dynamic = 'force-dynamic'
```

**File:** `src/app/api/auth/[...nextauth]/route.ts`
**Purpose:** Ensures NextAuth runs on Node.js runtime (required for Prisma adapter)
**Impact:** Prevents edge runtime issues with database connections

## Environment Variables Required

### Critical (Production)

| Variable | Validation | Example |
|----------|------------|---------|
| `NEXTAUTH_SECRET` | ≥32 chars | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Must use https:// | `https://wandernest2-umber.vercel.app` |
| `GOOGLE_CLIENT_ID` | Required | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Required | `GOCSPX-xxx` |
| `DATABASE_URL` | Valid PostgreSQL URL | `postgresql://...?sslmode=require` |

### Configuration Validation

The app validates all auth variables on startup:

```typescript
// Automatic checks:
✅ NEXTAUTH_SECRET length (≥32 chars in production)
✅ NEXTAUTH_URL format (must start with https:// in production)
✅ Google OAuth credentials present
✅ Database connection for session storage
```

**View validation status:**
- Check server logs on startup
- Visit `/api/health` endpoint
- Review config warnings/errors

## Google OAuth Setup for Production

### 1. Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to "APIs & Services" > "Credentials"
4. Create "OAuth 2.0 Client ID"
5. Application type: **Web application**

### 2. Configure Authorized Origins

Add your production domain:

```
https://wandernest2-umber.vercel.app
```

For localhost development, also add:

```
http://localhost:3000
```

### 3. Configure Redirect URIs

Add the NextAuth callback endpoints:

**Production:**
```
https://wandernest2-umber.vercel.app/api/auth/callback/google
```

**Localhost (for testing):**
```
http://localhost:3000/api/auth/callback/google
```

**Important:**
- Use your actual Vercel domain (wandernest2-umber.vercel.app)
- Must include `/api/auth/callback/google` path exactly
- Must use `https://` for production (not `http://`)
- Must use `http://` for localhost development
- No trailing slashes
- Both URIs should be added to support development and production

### 4. Copy Credentials

Copy the **Client ID** and **Client Secret** to Vercel environment variables.

## Session Strategy: Database vs JWT

WanderNest uses **database sessions** for enhanced security:

```typescript
session: {
  strategy: "database"
}
```

### Advantages:
- ✅ Sessions can be revoked instantly
- ✅ No JWT size limits (middleware uses getToken)
- ✅ Sensitive data not exposed in cookies
- ✅ Better audit trail

### Requirements:
- ✅ Prisma adapter configured (already done)
- ✅ Session model in schema (already present)
- ✅ Node.js runtime (enforced with `dynamic = 'force-dynamic'`)

## Middleware Integration

The middleware at `/middleware.ts` uses NextAuth JWT tokens for route protection:

```typescript
const token = await getToken({
  req: request,
  secret: process.env.NEXTAUTH_SECRET
})
```

**Protected Routes:**
- `/student/dashboard/*` - Requires student role
- `/student/onboarding/*` - Requires student role
- `/tourist/dashboard/*` - Requires tourist role

## Security Features Summary

| Feature | Implementation | Protection Against |
|---------|----------------|---------------------|
| Secure Cookies | `__Secure-` prefix + secure flag | Man-in-the-middle attacks |
| HTTP Only | `httpOnly: true` | XSS attacks |
| SameSite | `sameSite: 'lax'` | CSRF attacks |
| Database Sessions | Prisma adapter | Token replay attacks |
| Proxy Handling | `NEXTAUTH_URL` env var | Proxy misconfiguration |
| Secret Validation | Length + format checks | Weak secrets |
| HTTPS Enforcement | URL validation | Downgrade attacks |

## Troubleshooting

### Issue: "Callback URL mismatch"

**Solution:**
1. Check `NEXTAUTH_URL` matches your Vercel domain
2. Verify Google OAuth redirect URI includes full path
3. Ensure no trailing slashes
4. Confirm HTTPS (not HTTP) in production

### Issue: "Session not persisting"

**Solution:**
1. Verify `NEXTAUTH_SECRET` is set and ≥32 chars
2. Check browser accepts cookies from your domain
3. Ensure `DATABASE_URL` is correctly configured
4. Check Vercel logs for Prisma connection errors

### Issue: "Database connection timeout"

**Solution:**
1. Verify PostgreSQL connection string includes `?sslmode=require`
2. Check database is accessible from Vercel region
3. Review connection pooling settings
4. Check `/api/health` for database status

### Issue: "OAuth consent screen not showing"

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
2. Check Google Cloud Console project is not suspended
3. Ensure OAuth app is published (not in testing mode)
4. Verify authorized origins include your domain

## Verification Checklist

Before deploying to production:

- [ ] `NEXTAUTH_SECRET` is set (≥32 characters)
- [ ] `NEXTAUTH_URL` uses https:// and matches your domain
- [ ] Google OAuth credentials configured in Vercel
- [ ] Google OAuth redirect URI includes your Vercel domain
- [ ] `DATABASE_URL` is set with SSL mode
- [ ] `/api/health` returns 200 OK
- [ ] Can sign in with Google (test with both student and tourist emails)
- [ ] Session persists after page refresh
- [ ] Protected routes redirect unauthenticated users
- [ ] Cookie has `__Secure-` prefix in production
- [ ] No console errors related to auth

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Prisma Adapter Docs](https://authjs.dev/reference/adapter/prisma)

## Support

For auth-related issues:
1. Check `/api/health` endpoint for configuration status
2. Review Vercel deployment logs
3. Verify environment variables in Vercel dashboard
4. Test locally with `vercel dev` before deploying
