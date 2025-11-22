# TourWiseCo - Vercel Deployment Guide

This guide will help you deploy TourWiseCo to Vercel successfully.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A PostgreSQL database (recommended: Vercel Postgres, Supabase, or Neon)
3. Google OAuth credentials (for tourist login)
4. (Optional) Redis instance (Vercel KV or Upstash)

## Quick Deploy

### 1. Fork or Clone the Repository

```bash
git clone <your-repo-url>
cd tourwiseco
```

### 2. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 3. Set Up Database

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the `DATABASE_URL` connection string

#### Option B: External Provider (Supabase/Neon/PlanetScale)
1. Create a PostgreSQL database
2. Copy the connection string
3. Ensure the connection string includes `?sslmode=require` for SSL

### 4. Configure Environment Variables

In your Vercel project settings, add these environment variables:

#### Required Variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication Secrets (generate with: openssl rand -base64 32)
JWT_SECRET="<generate-random-string>"
NEXTAUTH_SECRET="<generate-random-string>"
NEXTAUTH_URL="https://your-app.vercel.app"

# Google OAuth
GOOGLE_CLIENT_ID="<your-google-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-client-secret>"
```

#### Optional Variables:

```bash
# Email (for verification codes - if not set, will use mock mode)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"

# Redis (for caching - if not set, app will work without caching)
REDIS_URL="redis://default:password@hostname:port"

# Environment
NODE_ENV="production"
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-app.vercel.app`
   - Authorized redirect URIs: `https://your-app.vercel.app/api/auth/callback/google`
5. Copy the Client ID and Client Secret

### 6. Deploy to Vercel

#### Method A: Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Next.js
4. Add all environment variables
5. Click "Deploy"

#### Method B: Vercel CLI
```bash
vercel
# Follow prompts
# On first deploy, link to a new project
vercel --prod
```

### 7. Run Database Migrations

After first deployment, run migrations:

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Pull environment variables locally
vercel env pull .env.local

# Run Prisma migrations
npx prisma migrate deploy
npx prisma generate
```

Alternatively, add this to your Vercel build command in project settings:
```bash
prisma migrate deploy && prisma generate && next build
```

## Important Notes

### File Uploads
- Student ID card uploads are stored as Base64 in the database
- This is suitable for Vercel's serverless environment
- For production with many users, consider migrating to:
  - Vercel Blob Storage
  - AWS S3
  - Cloudinary

### Redis (Optional)
- If `REDIS_URL` is not set, the app works without caching
- Verification codes are logged to console in development
- For production, recommended options:
  - Vercel KV (integrated Redis)
  - Upstash Redis (serverless)

### Database Connection Pooling
- The app uses Prisma with optimized connection pooling
- For Vercel Postgres or Supabase, use the provided connection pooler URL
- Connection string should include `?sslmode=require` for SSL

### Email Service
- Without email configuration, verification codes are logged to console
- For production, use:
  - SendGrid
  - AWS SES
  - Resend
  - Postmark

## Troubleshooting

### Build Errors

**Error: "Can't find module @/lib/db"**
- Fixed: All imports now use @/lib/prisma

**Error: "Redis connection refused"**
- Fixed: Redis now uses lazy connection and graceful fallback

**Error: "File system read-only"**
- Fixed: File uploads now use Base64 encoding

### Runtime Errors

**Database connection issues:**
```bash
# Ensure DATABASE_URL is correct
# Check SSL mode is enabled
# Verify database is accessible from Vercel
```

**OAuth redirect mismatch:**
```bash
# Update Google OAuth authorized redirect URIs
# Ensure NEXTAUTH_URL matches your Vercel domain
```

## Post-Deployment

### 1. Create Admin Account
Run this in your database console:

```sql
INSERT INTO "Admin" (id, email, "passwordHash", name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@example.com',
  '$2b$10$...',  -- Generate using: bcrypt.hash('your-password', 10)
  'Admin User',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

### 2. Test the Application

1. Visit `https://your-app.vercel.app`
2. Test tourist flow: Sign in with Google
3. Test student flow: Create account with .edu email
4. Test admin panel: Login at /admin/login

### 3. Monitor Performance

- Check Vercel Analytics dashboard
- Monitor serverless function execution time
- Watch for cold starts on API routes

## Architecture Changes for Vercel

The following changes were made to make the app Vercel-compatible:

1. ✅ All API routes marked as dynamic (`export const dynamic = 'force-dynamic'`)
2. ✅ Redis connection made lazy and optional
3. ✅ File uploads converted to Base64 storage
4. ✅ Prisma client optimized for serverless
5. ✅ Removed duplicate Prisma instances
6. ✅ Added comprehensive error handling
7. ✅ Configured Next.js for standalone output

## Support

For issues specific to this deployment:
- Check Vercel deployment logs
- Verify all environment variables are set
- Ensure database migrations ran successfully

For app-specific issues, check the main README.md
