# Prisma Migration Fix Guide

## Problem Summary

Your Neon database has a failed migration (`20251118181312_add_tourist_model_and_google_oauth`) recorded in the `_prisma_migrations` table. This causes:
- **P3009 Error**: "migrate found failed migrations in the target database"
- **P3018 Error**: "relation 'Tourist' already exists" when trying to apply migrations

The local migrations folder has already been cleaned up with a single "init" migration, but the database still has the old failed migration recorded.

## Solution Overview

We'll perform a complete database reset and reapply the clean migration:

1. **Reset the Neon database** - Completely wipe all tables and enums
2. **Apply the clean migration** - Deploy the single "init" migration
3. **Verify everything works** - Test the build process

---

## Step-by-Step Instructions

### Step 1: Verify Current Status (Optional but Recommended)

First, check the current state of your migrations:

```bash
node scripts/verify-migration-status.js
```

This will show you:
- What migrations exist locally
- What migrations are recorded in the database
- Any failed migrations
- Current database tables

### Step 2: Reset the Neon Database

⚠️ **WARNING**: This will delete ALL data in your database!

```bash
node scripts/reset-neon-db.js
```

This script will:
- Drop all tables (including `_prisma_migrations`)
- Drop all enum types
- Verify the database is completely clean

Expected output: You should see green checkmarks confirming all tables and enums were dropped.

### Step 3: Apply the Clean Migration

Now deploy the single clean "init" migration:

```bash
npx prisma migrate deploy --schema=./src/prisma/schema.prisma
```

Expected output:
```
1 migration found in prisma/migrations
Applying migration `20251123214252_init`
The following migration(s) have been applied:
migrations/
  └─ 20251123214252_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate --schema=./src/prisma/schema.prisma
```

### Step 5: Verify Migration Status

Run the verification script again to confirm everything is clean:

```bash
node scripts/verify-migration-status.js
```

You should see:
- 1 local migration (`20251123214252_init`)
- 1 applied migration in the database (SUCCESS)
- All expected tables created

### Step 6: Test the Build Process

Test that your Vercel build command works:

```bash
npm run vercel-build
```

This runs: `node scripts/check-db-url.js && prisma generate && prisma migrate deploy && next build`

Expected result: Build completes successfully without any Prisma errors.

### Step 7: Deploy to Vercel

Once the build works locally, trigger a Vercel deployment:

1. **Push your changes to GitHub**:
   ```bash
   git push origin claude/setup-vercel-deployment-013JjnaiEHg2Ppo6FANpBSxU
   ```

2. **Trigger Vercel deployment**:
   - Go to Vercel Dashboard
   - Click "Redeploy" on your project
   - Or push a commit to trigger automatic deployment

---

## What Changed

### Files Created
1. **`scripts/reset-neon-db.js`** - Complete database reset script
2. **`scripts/verify-migration-status.js`** - Migration diagnostics tool
3. **`prisma.config.ts`** - Modern Prisma configuration
4. **`MIGRATION_FIX_GUIDE.md`** - This guide

### Migration State
- **Before**: Had problematic migration `20251118181312_add_tourist_model_and_google_oauth`
- **After**: Clean single migration `20251123214252_init` that represents entire schema

---

## Troubleshooting

### Error: "DATABASE_URL is not set"
Make sure you have DATABASE_URL in your `.env` file or environment:
```bash
export DATABASE_URL="postgresql://..."
```

### Error: "Connection timeout"
Your Neon database might be sleeping (free tier). Try again in a few seconds.

### Error: "Migration already applied"
This is actually good! It means the migration was already successfully applied. Skip to the verification step.

### Build fails with "Module not found"
Run `npm install` to ensure all dependencies are installed.

### Still seeing P3009 or P3018 errors
The database reset might not have completed fully. Try:
1. Check Neon dashboard - look at the "Tables" tab
2. If you still see old tables, you may need to reset via Neon's UI:
   - Go to Neon Console → Your Database → Query Editor
   - Run the reset commands manually (documented below)

---

## Manual Database Reset (Alternative Method)

If the script doesn't work, you can reset manually via Neon's Query Editor:

```sql
-- Drop all tables
DROP TABLE IF EXISTS "ContactMessage" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "StudentSession" CASCADE;
DROP TABLE IF EXISTS "TouristSession" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;
DROP TABLE IF EXISTS "Report" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "RequestSelection" CASCADE;
DROP TABLE IF EXISTS "TouristRequest" CASCADE;
DROP TABLE IF EXISTS "Tourist" CASCADE;
DROP TABLE IF EXISTS "UnavailabilityException" CASCADE;
DROP TABLE IF EXISTS "StudentAvailability" CASCADE;
DROP TABLE IF EXISTS "Student" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- Drop all enums
DROP TYPE IF EXISTS "AdminRole" CASCADE;
DROP TYPE IF EXISTS "RequestStatus" CASCADE;
DROP TYPE IF EXISTS "StudentStatus" CASCADE;
```

Then proceed to Step 3 (Apply the Clean Migration).

---

## Future Migration Best Practices

To avoid this situation in the future:

1. **Always test migrations locally first** before deploying to production
2. **Use `prisma migrate dev`** in development, not `migrate deploy`
3. **Never manually edit the database** while migrations are in progress
4. **If a migration fails**, resolve it immediately:
   ```bash
   # Mark as rolled back
   npx prisma migrate resolve --rolled-back <migration-name> --schema=./src/prisma/schema.prisma
   # Or mark as applied if it actually succeeded
   npx prisma migrate resolve --applied <migration-name> --schema=./src/prisma/schema.prisma
   ```
5. **Keep backups** before running migrations in production (Neon has point-in-time recovery)

---

## Questions or Issues?

If you encounter any issues not covered here:
1. Run `node scripts/verify-migration-status.js` to get detailed diagnostics
2. Check Neon dashboard for database state
3. Review Vercel deployment logs for specific error messages
4. Ensure DATABASE_URL is correctly set in Vercel environment variables
