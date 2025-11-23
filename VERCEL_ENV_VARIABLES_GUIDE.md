# Vercel Environment Variables Configuration Guide

## Overview

This guide explains how to configure environment variables for WanderNest on Vercel, with special attention to **build-time vs runtime** requirements. Understanding this distinction is critical for successful deployment.

---

## 🔑 Key Concepts

### Build-Time vs Runtime

- **Build-Time**: Variables needed during the `vercel-build` script execution (Prisma generation, migrations, Next.js build)
- **Runtime**: Variables needed when your application is running and serving requests

### Vercel Environment Scopes

In Vercel Dashboard → Settings → Environment Variables, you can set variables for:
- **Production**: Used for production deployments
- **Preview**: Used for preview deployments (e.g., pull requests)
- **Development**: Used for local development with `vercel dev`

For build-time variables, you must check the appropriate environment(s) where the build will occur.

---

## 📋 Environment Variables by Category

### 🔴 REQUIRED - Build-Time AND Runtime

These variables MUST be available during BOTH the build phase and runtime:

#### `DATABASE_URL`
- **Required at**: Build-time (Prisma generate + migrations) AND Runtime (database operations)
- **Format**: `postgresql://user:password@host:port/database?sslmode=require`
- **Vercel Setup**:
  - ✅ Check "Production" (or relevant environment)
  - ⚠️ **CRITICAL**: Must be available at build time for `prisma generate` and `prisma migrate deploy`
- **Why Build-Time?**: The `vercel-build` script runs:
  ```bash
  node scripts/check-db-url.js &&
  prisma generate --schema=./src/prisma/schema.prisma &&
  prisma migrate deploy --schema=./src/prisma/schema.prisma &&
  next build
  ```
  Prisma needs DATABASE_URL to generate the client and apply migrations.

---

### 🔴 REQUIRED - Runtime Only

These variables are only needed when your application is running:

#### `NEXTAUTH_SECRET`
- **Required at**: Runtime (JWT signing, session management)
- **Generate**: `openssl rand -base64 32`
- **Used in**:
  - NextAuth configuration (auth-options.ts)
  - Middleware for JWT verification (middleware.ts)
  - Token signing fallback (tokens.ts)
- **Security**: Must be a cryptographically secure random string

#### `NEXTAUTH_URL`
- **Required at**: Runtime (OAuth callbacks, redirects)
- **Format**: `https://your-app.vercel.app`
- **Vercel Behavior**: Can auto-detect from VERCEL_URL, but explicit setting is recommended
- **Fallback**: Uses `NEXT_PUBLIC_BASE_URL` if not set

#### `GOOGLE_CLIENT_ID`
- **Required at**: Runtime (Google OAuth)
- **Get from**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Used for**: Both student (.edu) and tourist authentication

#### `GOOGLE_CLIENT_SECRET`
- **Required at**: Runtime (Google OAuth)
- **Get from**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Security**: Keep secret, never commit to repository

---

### 🟡 OPTIONAL - Runtime (Recommended for Production)

#### Email Configuration (For notifications and magic links)

**When Not Set**: Application works but emails are logged instead of sent

- `EMAIL_HOST`: SMTP server (e.g., `smtp.gmail.com`)
- `EMAIL_PORT`: SMTP port (default: `587`)
- `EMAIL_USER`: SMTP username
- `EMAIL_PASS`: SMTP password (use app-specific password for Gmail)
- `EMAIL_FROM`: From address (default: `TourWiseCo <noreply@tourwiseco.com>`)
- `CONTACT_EMAIL`: Where contact form submissions go (defaults to EMAIL_FROM)

**Email Provider Behavior**:
- If email is not configured, NextAuth EmailProvider is NOT added to providers
- This prevents errors from attempting to use unconfigured email service
- Google OAuth remains available for authentication

#### `REDIS_URL`
- **Used for**: Caching, verification code storage
- **Format**: `redis://default:password@hostname:port`
- **Fallback**: Uses database for verification codes, in-memory for cache
- **Recommended**: For production (better performance)
- **Vercel Options**: Vercel KV or Upstash Redis

#### `JWT_SECRET`
- **Used for**: Admin panel authentication (legacy)
- **Generate**: `openssl rand -base64 32`
- **Only needed if**: Using admin panel features

#### `TOKEN_SECRET`
- **Used for**: Signing match accept/decline email link tokens
- **Fallback**: Uses `NEXTAUTH_SECRET` if not set
- **Only set if**: You want a separate secret for email link tokens

---

### 🟢 OPTIONAL - Defaults Provided

#### `VERIFICATION_CODE_EXPIRY`
- **Default**: `600` (10 minutes)
- **Format**: Seconds as integer
- **Used for**: Tourist verification code expiration

#### `NEXT_PUBLIC_BASE_URL`
- **Scope**: Client-side AND Server-side (NEXT_PUBLIC_ prefix)
- **Used for**: Email links, metadata, social sharing
- **Fallback**: Uses `NEXTAUTH_URL` or `VERCEL_URL`
- **Format**: `https://your-app.vercel.app`

---

### 🔵 AUTO-SET by Vercel

These are automatically provided by Vercel and should NOT be manually set:

#### `NODE_ENV`
- **Value**: `production` in production, `development` in dev
- **Used for**: Conditional logic throughout the app

#### `VERCEL_URL`
- **Value**: Your Vercel deployment URL
- **Available**: Build-time AND Runtime
- **Used as**: Fallback for base URL in metadata

---

## 🛠️ Setup Instructions

### Step 1: Vercel Dashboard Configuration

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add variables according to the table below

### Step 2: Environment Variable Checklist

| Variable | Required? | Build-Time? | Runtime? | Environment |
|----------|-----------|-------------|----------|-------------|
| `DATABASE_URL` | ✅ Required | ✅ Yes | ✅ Yes | Production |
| `NEXTAUTH_SECRET` | ✅ Required | ❌ No | ✅ Yes | Production |
| `NEXTAUTH_URL` | ✅ Required | ❌ No | ✅ Yes | Production |
| `GOOGLE_CLIENT_ID` | ✅ Required | ❌ No | ✅ Yes | Production |
| `GOOGLE_CLIENT_SECRET` | ✅ Required | ❌ No | ✅ Yes | Production |
| `EMAIL_HOST` | ⚠️ Recommended | ❌ No | ✅ Yes | Production |
| `EMAIL_PORT` | ⚠️ Recommended | ❌ No | ✅ Yes | Production |
| `EMAIL_USER` | ⚠️ Recommended | ❌ No | ✅ Yes | Production |
| `EMAIL_PASS` | ⚠️ Recommended | ❌ No | ✅ Yes | Production |
| `EMAIL_FROM` | 🔵 Optional | ❌ No | ✅ Yes | Production |
| `CONTACT_EMAIL` | 🔵 Optional | ❌ No | ✅ Yes | Production |
| `REDIS_URL` | 🔵 Optional | ❌ No | ✅ Yes | Production |
| `JWT_SECRET` | 🔵 Optional | ❌ No | ✅ Yes | Production |
| `TOKEN_SECRET` | 🔵 Optional | ❌ No | ✅ Yes | Production |
| `NEXT_PUBLIC_BASE_URL` | 🔵 Optional | ✅ Yes | ✅ Yes | Production |
| `VERIFICATION_CODE_EXPIRY` | 🔵 Optional | ❌ No | ✅ Yes | Production |

---

## 🔒 Security Best Practices

### 1. Never Commit Secrets

```bash
# These files are in .gitignore and should NEVER be committed
.env
.env*.local
.env.production.local
```

### 2. Use Strong Random Secrets

```bash
# Generate secure secrets with:
openssl rand -base64 32
```

### 3. Separate Secrets for Different Environments

- Use different `NEXTAUTH_SECRET` values for production vs preview
- Use different database URLs for production vs preview

### 4. Client-Side Variable Caution

- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- **Never** put secrets in `NEXT_PUBLIC_` variables
- Current client-side variables: `NEXT_PUBLIC_BASE_URL` only

---

## 🐛 Troubleshooting

### Build Fails with "DATABASE_URL is not set"

**Cause**: DATABASE_URL is not available during the build phase

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Ensure it's checked for the environment you're deploying to (Production/Preview)
4. Redeploy

### Authentication Fails in Production

**Possible Causes**:
1. `NEXTAUTH_SECRET` not set
2. `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` not set
3. Google OAuth redirect URIs not configured correctly

**Solution**:
1. Verify all authentication variables are set in Vercel
2. Check Google Cloud Console → Credentials → Authorized redirect URIs
3. Ensure `https://your-app.vercel.app/api/auth/callback/google` is added

### Emails Not Sending

**Expected Behavior**: Application works, but emails are logged instead of sent

**To Enable Emails**:
1. Set all email configuration variables: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
2. For Gmail, use an [App Password](https://myaccount.google.com/apppasswords)
3. Redeploy

### Middleware Errors

**Cause**: `NEXTAUTH_SECRET` not available in Edge Runtime

**Note**: Middleware uses direct `process.env` access (not config module) because it runs in Edge Runtime which has different constraints. This is intentional and correct.

---

## 📚 Related Documentation

- [Environment Variables (.env.example)](./.env.example)
- [Production Template (.env.production.template)](./.env.production.template)
- [Configuration Module (src/lib/config.ts)](./src/lib/config.ts)
- [Build Script (package.json)](./package.json) - See `vercel-build`
- [Database URL Check (scripts/check-db-url.js)](./scripts/check-db-url.js)

---

## 🔄 Migration from Other Platforms

If migrating from another platform (Heroku, Railway, Render, etc.):

1. **Export environment variables** from your current platform
2. **Identify build-time variables**: Only `DATABASE_URL` needs build-time access
3. **Import to Vercel**: Use the Vercel Dashboard or CLI
4. **Update OAuth redirects**: Update Google OAuth to use your Vercel URL
5. **Test deployment**: Deploy to a preview environment first

---

## ✅ Validation

After configuration, your application will log its configuration status on startup:

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

✅ All systems configured
========================================
```

If you see warnings or errors, check the corresponding environment variables in Vercel.

---

## 📞 Support

- **Configuration Issues**: Check Vercel Deployment Logs
- **Database Issues**: See [Database Setup Guide](./docs/database_setup_vercel.md)
- **Build Failures**: Review build logs in Vercel Dashboard
- **Runtime Errors**: Check Function Logs in Vercel Dashboard → Logs

---

**Last Updated**: 2025-01-23
**Version**: 1.0.0
**Maintained by**: WanderNest Development Team
