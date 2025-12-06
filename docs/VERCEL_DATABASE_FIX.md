# Vercel Database Configuration Fix

## Problem
Prisma was failing during Vercel deployment with error:
```
Error code: P1012
error: Error validating datasource `db`: the URL must start with the protocol `postgresql://` or `postgres://`.
```

## Root Cause
The DATABASE_URL environment variable was not being properly exposed to the Prisma CLI during the Vercel build process, even though it was set in Vercel's Environment Variables.

## Solution Implemented

### 1. Added Build-Time Diagnostic (`scripts/check-db-url.js`)
A safe diagnostic script that runs before Prisma commands to validate DATABASE_URL:
- ✅ Checks if DATABASE_URL exists
- ✅ Validates it starts with `postgresql://` or `postgres://`
- ✅ Ensures it's a valid URL format
- ✅ **Never logs secrets** - only logs protocol prefix
- ❌ Fails fast with clear error messages if validation fails

### 2. Updated Build Command
Modified `package.json` to run diagnostic before Prisma:
```json
"vercel-build": "node scripts/check-db-url.js && prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build"
```

**⚠️ CRITICAL SAFETY NOTE:**
This build command must **NEVER** include `scripts/reset-neon-db.js`. The reset script completely wipes the database (all tables, all data) and is **ONLY** for local development troubleshooting. Including it in `vercel-build` would delete all production data on every deployment.

### 3. What to Check in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Ensure DATABASE_URL is configured for **Production** environment:

| Variable Name  | Value | Environments |
|---------------|-------|--------------|
| DATABASE_URL  | `postgresql://...neon.tech...?sslmode=require&channel_binding=require` | ✅ Production |

**CRITICAL CHECKS:**
1. ✅ Variable name is exactly `DATABASE_URL` (case-sensitive)
2. ✅ Value starts with `postgresql://` (NOT `Server=` or other formats)
3. ✅ It's checked for **Production** environment
4. ✅ No extra quotes around the value
5. ✅ Connection string includes `?sslmode=require` for Neon
6. ✅ No old/duplicate DATABASE_URL variables from Azure

### 4. How to Fix in Vercel

**If you see the P1012 error in build logs:**

1. **Delete any old DATABASE_URL variables:**
   - Check for duplicates or Azure-related URLs
   - Remove all old DATABASE_URL entries

2. **Add fresh DATABASE_URL:**
   - Click "Add New" → "Environment Variable"
   - Name: `DATABASE_URL`
   - Value: Your Neon PostgreSQL connection string
   - Select: ✅ Production (check the box)
   - Click "Save"

3. **Redeploy:**
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Click "Redeploy"

**The diagnostic script will now tell you exactly what's wrong:**

```
🔍 DATABASE_URL Diagnostic Check
==================================
❌ ERROR: DATABASE_URL is not set
   Please ensure DATABASE_URL is configured in Vercel Environment Variables
   Go to: Vercel Dashboard → Settings → Environment Variables → Production
```

OR if it's an Azure URL:

```
❌ ERROR: DATABASE_URL must start with postgresql:// or postgres://
   Found protocol: UNKNOWN://
   This is likely an Azure or other non-PostgreSQL connection string
   Please update DATABASE_URL in Vercel to use your Neon PostgreSQL URL
```

## Expected Success Output

When DATABASE_URL is correctly configured, you'll see in build logs:

```
🔍 DATABASE_URL Diagnostic Check
==================================
✅ DATABASE_URL is set
✅ Protocol: postgresql://
✅ DATABASE_URL is a valid URL format
✅ DATABASE_URL validation passed
==================================
```

Then Prisma commands will proceed successfully.

## Files Changed

1. **`scripts/check-db-url.js`** - New diagnostic script
2. **`package.json`** - Updated `vercel-build` command to include diagnostic

## Important Notes

- ✅ No `.env` file in repo - everything uses Vercel's encrypted env vars
- ✅ Diagnostic script never logs secrets
- ✅ Fails fast with clear error messages
- ✅ Can be removed after successful deployment if desired
- ✅ Safe to keep permanently for ongoing validation

## After Successful Deploy

The diagnostic script can optionally be removed by changing `vercel-build` back to:
```json
"vercel-build": "prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build"
```

However, **it's recommended to keep it** as it provides ongoing validation and helpful error messages if DATABASE_URL ever becomes misconfigured.

---

## Database Reset Script Safety

### ⚠️ CRITICAL: scripts/reset-neon-db.js

This repository contains a `scripts/reset-neon-db.js` file that **completely wipes the database**, removing:
- All tables (including `_prisma_migrations`)
- All enums
- **ALL USER DATA** (students, tourists, bookings, reviews, admin accounts, etc.)

### Production Protection Measures

The reset script has multiple safety guards:

1. **Blocks production environment**: Exits if `NODE_ENV === "production"`
2. **Blocks Vercel deployments**: Exits if `VERCEL` environment variable is set
3. **Requires explicit permission**: Exits unless `ALLOW_DB_RESET=true` is set

### Safe Development Usage

To reset your **LOCAL** database during development:

```bash
# Safe wrapper that sets required environment variables
npm run db:reset:dev
```

This will:
- Set `ALLOW_DB_RESET=true`
- Set `NODE_ENV=development`
- Run the reset against your local `DATABASE_URL`
- Apply migrations after reset

### What NOT to Do

❌ **NEVER** include `reset-neon-db.js` in `vercel-build` or any production script
❌ **NEVER** run it against production Neon database
❌ **NEVER** use it in CI/CD pipelines
❌ **NEVER** run `node scripts/reset-neon-db.js` directly (use `npm run db:reset:dev`)

### Correct vercel-build Script

The production build script must look like this:

```json
"vercel-build": "node scripts/check-db-url.js && prisma generate --schema=./src/prisma/schema.prisma && prisma migrate deploy --schema=./src/prisma/schema.prisma && next build"
```

**No `reset-neon-db.js` anywhere in the chain!**

### If You Accidentally Added reset-neon-db.js to Production

If you find `reset-neon-db.js` in the `vercel-build` script:

1. **Remove it immediately** from `package.json`
2. Commit and push the fix
3. The next deployment will stop wiping the database
4. Previous data is likely lost and will need manual recovery from backups

### For Production Database Management

To reset or modify the production database:

1. **Use the Neon web console** for manual operations
2. **Create a backup first** before any destructive operations
3. **Never use automated scripts** that could accidentally run during deploys
