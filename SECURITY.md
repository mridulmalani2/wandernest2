# Security Documentation

This document outlines the security measures implemented in WanderNest and best practices for maintaining security.

## Table of Contents

1. [Error Handling](#error-handling)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Rate Limiting](#rate-limiting)
5. [Security Headers](#security-headers)
6. [Data Protection](#data-protection)
7. [API Security](#api-security)
8. [Monitoring & Logging](#monitoring--logging)

## Error Handling

### Centralized Error Handler

All API routes use a centralized error handler (`/src/lib/error-handler.ts`) that:

- **Sanitizes error messages** to prevent sensitive data exposure
- **Logs errors server-side** with context for debugging
- **Returns appropriate HTTP status codes**
- **Provides detailed errors in development**, generic messages in production
- **Handles database errors gracefully** with retry logic for transient failures

### Usage Example

```typescript
import { withErrorHandler, AppError, withDatabaseRetry } from '@/lib/error-handler';

async function myApiHandler(req: NextRequest) {
  // Throw custom errors with specific status codes
  if (!userId) {
    throw new AppError(401, 'Unauthorized', 'AUTH_REQUIRED');
  }

  // Wrap database operations with retry logic
  const data = await withDatabaseRetry(async () =>
    prisma.user.findUnique({ where: { id: userId } })
  );

  return NextResponse.json({ success: true, data });
}

export const POST = withErrorHandler(myApiHandler, 'POST /api/my-route');
```

### Client-Side Error Boundaries

React Error Boundaries are implemented at the application root to catch and display user-friendly error messages for runtime errors.

## Authentication & Authorization

### Authentication Methods

1. **Tourist Authentication**: Google OAuth via NextAuth
2. **Student Authentication**: Email verification with JWT tokens
3. **Admin Authentication**: Email/password with bcrypt + JWT

### Protected Routes

- **Middleware** (`/middleware.ts`) protects routes at the edge:
  - `/admin/*` - Requires admin-token cookie
  - `/student/dashboard/*` - Requires student-token cookie
  - `/tourist/dashboard/*` - Requires tourist-token cookie

### API Route Protection

Each protected API route verifies authentication:

```typescript
// For admin routes
const authResult = await verifyAdmin(request);
if (!authResult.authorized) {
  throw new AppError(401, 'Unauthorized', 'AUTH_FAILED');
}
```

### Session Security

- **Database-backed sessions** for NextAuth (tourist/student OAuth)
- **JWT tokens** with configurable expiry
- **Secure cookies**: httpOnly, sameSite, secure in production
- **Token rotation** on sensitive actions

## Input Validation & Sanitization

### Zod Schema Validation

All user input is validated using Zod schemas before processing:

```typescript
import { z } from 'zod';
import { validateOrThrow } from '@/lib/error-handler';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

const validatedData = validateOrThrow(schema, requestBody);
```

### Input Sanitization

Use the sanitization utilities (`/src/lib/sanitization.ts`) for additional security:

```typescript
import { sanitizeText, sanitizeEmail, sanitizeUrl } from '@/lib/sanitization';

const cleanName = sanitizeText(userInput.name, 100);
const cleanEmail = sanitizeEmail(userInput.email);
const cleanUrl = sanitizeUrl(userInput.website);
```

### Preventing XSS

- **Strip HTML tags** from all user-generated text content
- **Escape output** when rendering user content
- **Use React's built-in escaping** (avoid `dangerouslySetInnerHTML`)
- **Validate URLs** to prevent `javascript:` protocol injection

### SQL Injection Prevention

- **Use Prisma ORM** for all database queries (parameterized by default)
- **Never concatenate user input** into raw SQL queries
- **Validate all input** before database operations

## Rate Limiting

### Vercel Rate Limiting (Recommended)

For production deployments on Vercel, implement rate limiting using Vercel's built-in features or the `@vercel/edge` package:

```typescript
// Example using Vercel Edge Config
import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

export async function rateLimit(req: NextRequest, limit = 10, window = 60) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const key = `rate_limit:${ip}`;

  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, window);
  }

  if (count > limit) {
    return false;
  }

  return true;
}
```

### Routes Requiring Rate Limiting

High-priority routes for rate limiting:

1. **Authentication endpoints** (`/api/admin/login`, `/api/student/signin`)
   - Limit: 5 attempts per 15 minutes per IP
   - Prevents brute force attacks

2. **Payment endpoints** (`/api/payment/*`)
   - Limit: 10 requests per minute per user
   - Prevents payment abuse

3. **Email sending** (verification codes, etc.)
   - Limit: 3 emails per hour per email address
   - Prevents spam

4. **Search/matching endpoints** (`/api/tourist/request/match`)
   - Limit: 20 requests per minute per user
   - Prevents resource exhaustion

### Implementation Priority

1. Set up Redis instance (Upstash recommended for Vercel)
2. Add rate limiting to authentication routes
3. Add rate limiting to payment routes
4. Add rate limiting to email sending
5. Monitor and adjust limits based on usage patterns

## Security Headers

Security headers are configured in `/vercel.json`:

```json
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### CORS Configuration

CORS is **disabled by default** as the API and frontend are on the same domain. If you need to allow external domains:

1. Add environment variable `ALLOWED_ORIGINS`
2. Update `/vercel.json` to use specific origins instead of `*`
3. Never use `Access-Control-Allow-Origin: *` with credentials

## Data Protection

### Sensitive Data Handling

1. **Environment Variables**
   - All secrets stored in Vercel environment variables
   - Never commit `.env` files to version control
   - Use `@secret_name` references in `vercel.json`

2. **API Responses**
   - Never return password hashes to clients
   - Filter sensitive fields in API responses
   - Use `select` in Prisma queries to limit exposed data

3. **Logging**
   - Never log sensitive data (passwords, tokens, API keys)
   - Sanitize error messages before logging
   - Use structured logging for better security monitoring

### Password Security

- **Bcrypt hashing** with 10 rounds for admin passwords
- **Never store plain-text passwords**
- **Password reset tokens** expire after 1 hour
- **Minimum password requirements**: 8 characters (configurable)

### JWT Security

- **Strong secrets**: Use at least 32 random characters
- **Short expiry times**: Tokens expire after 8 hours (configurable)
- **Validate on every request**: Never trust client-side token validation
- **Invalidate on logout**: Clear cookies/localStorage

## API Security

### Best Practices

1. **Always validate authentication** before processing requests
2. **Validate authorization** - ensure user has permission for the action
3. **Use HTTPS only** in production (enforced by Vercel)
4. **Validate request methods** (GET, POST, etc.)
5. **Check Content-Type** headers for POST/PUT/PATCH requests
6. **Limit request body size** to prevent DoS attacks
7. **Use database transactions** for multi-step operations

### Example Secure API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';
import { verifyAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['approve', 'reject']),
});

async function updateUser(req: NextRequest) {
  // 1. Verify authentication
  const auth = await verifyAdmin(req);
  if (!auth.authorized) {
    throw new AppError(401, 'Unauthorized', 'AUTH_REQUIRED');
  }

  // 2. Validate input
  const body = await req.json();
  const validatedData = schema.parse(body);

  // 3. Database operation with retry
  const user = await withDatabaseRetry(async () =>
    prisma.user.update({
      where: { id: validatedData.userId },
      data: { status: validatedData.action === 'approve' ? 'ACTIVE' : 'SUSPENDED' },
    })
  );

  // 4. Return sanitized response
  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      status: user.status,
      // Don't return sensitive fields
    },
  });
}

export const POST = withErrorHandler(updateUser, 'POST /api/admin/users/update');
```

## Monitoring & Logging

### Error Tracking

Consider integrating error tracking services:

1. **Sentry** - Comprehensive error tracking
2. **LogRocket** - Session replay for debugging
3. **DataDog** - Application performance monitoring

### Security Monitoring

Monitor these metrics:

1. **Failed authentication attempts**
2. **Unusual API usage patterns**
3. **Database query performance**
4. **Error rates by endpoint**
5. **Payment failures and fraud indicators**

### Audit Logging

For sensitive operations, maintain audit logs:

```typescript
await prisma.auditLog.create({
  data: {
    action: 'USER_APPROVED',
    performedBy: adminId,
    targetId: userId,
    timestamp: new Date(),
    metadata: { reason: 'Manual review completed' },
  },
});
```

## Security Checklist

### Before Deployment

- [ ] All secrets in environment variables (not in code)
- [ ] Rate limiting implemented on critical endpoints
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured
- [ ] CORS properly configured (not using wildcards)
- [ ] Error messages sanitized (no sensitive data exposure)
- [ ] All user input validated with Zod schemas
- [ ] Database queries parameterized (using Prisma)
- [ ] Authentication required on protected routes
- [ ] Password hashing implemented (bcrypt)
- [ ] JWT secrets are strong and random
- [ ] File upload size limits configured
- [ ] Database backups configured
- [ ] Error tracking service integrated

### Regular Security Maintenance

- [ ] Update dependencies monthly (`npm audit`)
- [ ] Review access logs weekly
- [ ] Rotate secrets quarterly
- [ ] Security audit annually
- [ ] Penetration testing before major releases
- [ ] Review and update rate limits based on traffic
- [ ] Monitor for suspicious activity
- [ ] Keep Next.js and dependencies up to date

## Reporting Security Issues

If you discover a security vulnerability, please email security@wandernest.com immediately. Do not open public issues for security vulnerabilities.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)
- [Vercel Security](https://vercel.com/docs/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
