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
"vercel-build": "node scripts/check-db-url.js && prisma generate && prisma migrate deploy && next build"
```

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
