# Google OAuth Redirect URI Fix Guide

## Issue Summary

**Error:** `Error 400: redirect_uri_mismatch`

**Cause:** The redirect URI sent by the app (`https://wandernest2-umber.vercel.app/api/auth/callback/google`) is not whitelisted in Google Cloud Console.

---

## ✅ Code Fixes Applied

The following fixes have been applied to the codebase:

1. **Enhanced Google OAuth configuration** (src/lib/auth-options.ts:53-58)
   - Added `prompt: "consent"` - Forces consent screen for refresh tokens
   - Added `access_type: "offline"` - Enables refresh token generation
   - Added `response_type: "code"` - Uses authorization code flow (most secure)

2. **Updated documentation** with correct production URLs
   - docs/nextauth-production-setup.md now shows `wandernest2-umber.vercel.app`

**Note:** Vercel proxy handling is automatically configured through the `NEXTAUTH_URL` environment variable - no additional configuration needed in code.

---

## 🔧 Required Manual Steps (Google Cloud Console)

You must complete these steps in Google Cloud Console to resolve the redirect_uri_mismatch error:

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your WanderNest project
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Locate OAuth 2.0 Client

1. Find your OAuth 2.0 Client ID (the one currently configured in `GOOGLE_CLIENT_ID`)
2. Click on it to edit

### Step 3: Add Authorized Redirect URIs

In the **Authorized redirect URIs** section, add these two URIs:

#### Production URI (CRITICAL):
```
https://wandernest2-umber.vercel.app/api/auth/callback/google
```

#### Localhost URI (for development/testing):
```
http://localhost:3000/api/auth/callback/google
```

**Important Notes:**
- URIs must be **exact** - no trailing slashes
- Production must use `https://`
- Localhost must use `http://`
- Include the full path: `/api/auth/callback/google`

### Step 4: Add Authorized JavaScript Origins (Optional but Recommended)

In the **Authorized JavaScript origins** section, add:

```
https://wandernest2-umber.vercel.app
http://localhost:3000
```

### Step 5: Save Changes

1. Click **Save** at the bottom of the page
2. Wait a few minutes for changes to propagate (usually instant, but can take up to 5 minutes)

---

## ✅ Verification Steps

After completing the manual steps above, verify the fix:

### 1. Test Production Login
1. Go to `https://wandernest2-umber.vercel.app/tourist/signin`
2. Click "Continue with Google"
3. Complete the Google sign-in flow
4. You should be redirected back to the tourist dashboard

### 2. Check for Errors
- No `redirect_uri_mismatch` error should appear
- You should see the Google consent screen (if first-time user)
- Sign-in should complete successfully

### 3. Verify Session
- After sign-in, check if you're logged in
- Navigate to `/tourist/dashboard` - you should see your dashboard
- Refresh the page - session should persist

---

## 🔍 Current Configuration Status

### Redirect URIs Being Used
- **Production:** `https://wandernest2-umber.vercel.app/api/auth/callback/google`
- **Localhost:** `http://localhost:3000/api/auth/callback/google`

### Environment Variables Required in Vercel
Ensure these are set in Vercel Dashboard → Settings → Environment Variables:

- `NEXTAUTH_URL` = `https://wandernest2-umber.vercel.app`
- `NEXTAUTH_SECRET` = (cryptographically secure random string ≥32 chars)
- `GOOGLE_CLIENT_ID` = (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET` = (from Google Cloud Console)

---

## 🐛 Troubleshooting

### Still Getting redirect_uri_mismatch?

**1. Verify the exact redirect URI:**
   - Check the error message for the URI being sent
   - Ensure it exactly matches what you added in Google Cloud Console
   - Common issues: trailing slash, http vs https, typo in domain

**2. Check Vercel environment variables:**
   ```bash
   # NEXTAUTH_URL should be exactly:
   https://wandernest2-umber.vercel.app

   # NOT:
   # https://wandernest2-umber.vercel.app/ (trailing slash)
   # http://wandernest2-umber.vercel.app (http instead of https)
   ```

**3. Wait for propagation:**
   - Google Cloud Console changes can take a few minutes to propagate
   - Try again after 5 minutes
   - Clear browser cache and try in incognito mode

**4. Check OAuth Client ID:**
   - Ensure the `GOOGLE_CLIENT_ID` in Vercel matches the OAuth client you edited
   - If you have multiple OAuth clients, make sure you edited the correct one

### OAuth Consent Screen Issues?

- Ensure your OAuth app is **Published** (not in Testing mode) for production use
- If in Testing mode, add test users or publish the app
- Verify the consent screen is properly configured

---

## 📚 Related Documentation

- [NextAuth Production Setup](./docs/nextauth-production-setup.md) - Complete NextAuth configuration guide
- [Vercel Environment Variables Guide](./VERCEL_ENV_VARIABLES_GUIDE.md) - All environment variables explained
- [.env.example](./.env.example) - Example environment variables

---

## ✅ Summary

**Fixed in Code:**
- ✅ Enhanced Google OAuth with secure authorization parameters
- ✅ Updated documentation with correct production URLs
- ✅ Proper Vercel proxy handling via NEXTAUTH_URL environment variable

**Required Manual Action:**
- ⚠️ Add redirect URIs in Google Cloud Console (Steps above)
- ⚠️ Verify environment variables are set correctly in Vercel

Once the manual steps are completed, the Google OAuth flow will work correctly for both tourists and students.

---

**Last Updated:** 2025-11-24
**Issue:** Google OAuth redirect_uri_mismatch
**Status:** Code fixes applied, awaiting manual Google Cloud Console configuration
