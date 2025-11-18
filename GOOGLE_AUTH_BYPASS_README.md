# Google Auth Temporary Bypass - Instructions

## Overview
This project temporarily bypasses Google OAuth authentication to allow local development and testing without configuring Google Cloud credentials.

## What Was Changed

### 1. `/lib/auth-options.ts`
- Added a `CredentialsProvider` with id `'dev-bypass'` that creates a dummy tourist user
- This provider only works in development mode (NODE_ENV !== 'production')
- Creates a test user: `dev.tourist@wandernest.local` with name "Dev Tourist"
- Google OAuth provider is still active but will be bypassed by the dev login button

### 2. `/app/tourist/signin/page.tsx`
- Added a new "Dev Login (Temporary Bypass)" button with a gradient blue-to-purple background
- Google sign-in button is commented out but preserved
- Added a development mode warning box to inform users this is temporary
- All original Google authentication code is preserved in comments

## How to Use the Bypass

1. Go to the tourist sign-in page: `http://localhost:3000/tourist/signin`
2. Click the "Dev Login (Temporary Bypass)" button
3. You will be automatically logged in as "Dev Tourist" and redirected to `/tourist/dashboard`

## How to Restore Google Authentication

When ready to use real Google OAuth, follow these steps:

### Step 1: Remove the Dev Bypass from `/lib/auth-options.ts`

**Remove these lines (26-72):**
```typescript
// ====== TEMPORARY DEV BYPASS - REMOVE IN PRODUCTION ======
CredentialsProvider({
  id: 'dev-bypass',
  name: 'Dev Bypass',
  credentials: {},
  async authorize() { ... }
}),
// ====== END TEMPORARY DEV BYPASS ======
```

**Remove these comment markers around GoogleProvider (74-80):**
```typescript
// ====== PRODUCTION GOOGLE AUTH (CURRENTLY COMMENTED FOR LOCAL DEV) ======
// Uncomment this when ready to use real Google authentication
GoogleProvider({ ... }),
// ====== END GOOGLE AUTH ======
```

The final providers array should look like:
```typescript
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
],
```

### Step 2: Restore the UI in `/app/tourist/signin/page.tsx`

**Remove the `handleDevBypass` function (23-29):**
```typescript
// ====== TEMPORARY DEV BYPASS ======
const handleDevBypass = async () => {
  await signIn('dev-bypass', { callbackUrl })
}
// ====== END TEMPORARY DEV BYPASS ======
```

**Remove comment markers around `handleGoogleSignIn` (31-36):**
```typescript
// ====== PRODUCTION GOOGLE AUTH (PRESERVED FOR LATER) ======
// Uncomment this when ready to use real Google authentication
const handleGoogleSignIn = () => {
  signIn('google', { callbackUrl })
}
// ====== END GOOGLE AUTH ======
```

**Remove the dev bypass button (103-122) and restore the Google button (124-154):**

Remove:
```tsx
{/* ====== TEMPORARY DEV BYPASS BUTTON ====== */}
<Button onClick={handleDevBypass} ...>
  <span>🚀</span>
  <span>Dev Login (Temporary Bypass)</span>
</Button>
{/* divider */}
```

Uncomment the Google button by removing `{/*` and `*/}` markers.

**Remove the Dev Warning Box (170-181):**
```tsx
{/* Dev Warning Box */}
<div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
  ...
</div>
```

### Step 3: Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret
7. Update your `.env` file:
   ```
   GOOGLE_CLIENT_ID="your-actual-client-id"
   GOOGLE_CLIENT_SECRET="your-actual-client-secret"
   ```

### Step 4: Test Google Authentication

1. Restart your development server
2. Go to `/tourist/signin`
3. Click "Continue with Google"
4. Verify the OAuth flow works correctly

## Database Cleanup (Optional)

If you want to remove the test user from your database:

```sql
DELETE FROM "Tourist" WHERE email = 'dev.tourist@wandernest.local';
DELETE FROM "User" WHERE email = 'dev.tourist@wandernest.local';
DELETE FROM "Account" WHERE userId IN (SELECT id FROM "User" WHERE email = 'dev.tourist@wandernest.local');
DELETE FROM "Session" WHERE userId IN (SELECT id FROM "User" WHERE email = 'dev.tourist@wandernest.local');
```

Or use Prisma Studio:
```bash
npx prisma studio
```
Then manually delete the dev user records.

## Important Notes

- The dev bypass ONLY works in development mode (NODE_ENV !== 'production')
- The Google OAuth provider is still configured, so you can test both methods if needed
- All original Google authentication code has been preserved in comments
- Delete this README file when the bypass is removed
