# Troubleshooting Magic Link Authentication

## Issue: "Could not send magic link. Please contact support."

This error occurs when students try to sign in using magic link (email-based authentication) but the email service is not properly configured.

---

## Quick Diagnosis

### Check Email Configuration Status

Visit: `https://your-app.vercel.app/api/admin/test-email`

This endpoint will show:
- ✅ or ❌ for each required environment variable
- Whether email is configured
- Specific actions needed to fix the issue

---

## Root Cause

The magic link authentication requires **SMTP email configuration** to send sign-in links. Without proper configuration:

1. The EmailProvider is not added to NextAuth
2. When students try to sign in with email, the request fails
3. Error message: "Could not send magic link"

---

## Solution: Configure Email Environment Variables

### Step 1: Choose Email Provider

**Option A: Gmail (Recommended for simplicity)**
- Free and reliable
- Requires App Password (not regular password)

**Option B: SendGrid / Mailgun / AWS SES (Recommended for production)**
- Better deliverability
- Dedicated SMTP service
- Higher sending limits

### Step 2: Get SMTP Credentials

#### For Gmail:

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Enter "WanderNest"
   - Click "Generate"
   - Copy the 16-character password (no spaces)

3. **SMTP Settings for Gmail:**
   ```
   Host: smtp.gmail.com
   Port: 587
   User: your-email@gmail.com
   Pass: xxxx xxxx xxxx xxxx (16-char app password)
   ```

#### For SendGrid:

1. Create account: https://sendgrid.com
2. Create API Key with "Mail Send" permissions
3. **SMTP Settings:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   User: apikey
   Pass: SG.xxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### For Mailgun:

1. Create account: https://mailgun.com
2. Get SMTP credentials from dashboard
3. **SMTP Settings:**
   ```
   Host: smtp.mailgun.org
   Port: 587
   User: postmaster@your-domain.mailgun.org
   Pass: your-mailgun-password
   ```

### Step 3: Add Environment Variables in Vercel

1. Go to **Vercel Dashboard** → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

#### Required Variables:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
```

#### Optional Variables (with defaults):

```bash
EMAIL_FROM=WanderNest <noreply@yourapp.com>
CONTACT_EMAIL=support@yourapp.com
```

4. **Select environments:**
   - ✅ Production
   - ✅ Preview
   - ⬜ Development (optional)

5. Click **Save**

### Step 4: Redeploy

After adding environment variables, trigger a new deployment:

```bash
# Option 1: Trigger redeploy via Git
git commit --allow-empty -m "Redeploy for email configuration"
git push

# Option 2: Trigger redeploy in Vercel Dashboard
# Deployments → Click "..." → Redeploy
```

---

## Verification

### Test 1: Check Configuration Status

```bash
curl https://your-app.vercel.app/api/admin/test-email
```

Expected response (when configured):
```json
{
  "isConfigured": true,
  "status": "✅ Email is configured - magic link authentication should work",
  "variables": {
    "EMAIL_HOST": "✅ Set",
    "EMAIL_PORT": 587,
    "EMAIL_USER": "✅ Set",
    "EMAIL_PASS": "✅ Set"
  }
}
```

### Test 2: Send Test Email

```bash
curl -X POST https://your-app.vercel.app/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "messageId": "xxxxx"
}
```

### Test 3: Try Magic Link Sign-In

1. Go to: `https://your-app.vercel.app/student/signin`
2. Enter a university email address (.edu, .ac.uk, etc.)
3. Click "Send Magic Link"
4. Check your inbox for the sign-in email

---

## Common Issues & Solutions

### Issue: "EAUTH - Authentication failed"

**Cause:** Wrong SMTP credentials

**Solution:**
- For Gmail: Regenerate App Password (not regular password)
- Verify EMAIL_USER matches the email account
- Ensure no extra spaces in EMAIL_PASS

### Issue: "ETIMEDOUT - Connection timeout"

**Cause:** Firewall blocking SMTP ports

**Solution:**
- Verify EMAIL_PORT is 587 (not 465 or 25)
- Check Vercel/cloud provider firewall settings
- Try different SMTP provider (SendGrid, Mailgun)

### Issue: "ECONNREFUSED - Connection refused"

**Cause:** Wrong SMTP host or port

**Solution:**
- Double-check EMAIL_HOST spelling
- Verify EMAIL_PORT is correct (587 for TLS)
- Try EMAIL_PORT=465 with SSL

### Issue: Environment variables not taking effect

**Cause:** Variables not set for correct environment or deployment needed

**Solution:**
1. Verify variables are set for "Production" environment
2. Trigger new deployment (not just restart)
3. Check Vercel deployment logs for configuration status

### Issue: Email sent but not received

**Cause:** Spam filtering or wrong "from" address

**Solution:**
- Check spam/junk folder
- Verify EMAIL_FROM uses valid domain
- For production, use verified domain (not gmail.com)
- Consider dedicated email service (SendGrid, Mailgun)

---

## Alternative: Disable Magic Link (Use Google OAuth Only)

If you can't configure email immediately, students can still sign in using **Google OAuth** if they have a university Google account:

1. Students visit `/student/signin`
2. Click "Continue with Google" (instead of magic link)
3. Sign in with university Google account (e.g., `student@stanford.edu`)
4. System automatically detects `.edu` domain and assigns student role

**Note:** This only works if the student's university uses Google Workspace.

---

## Production Best Practices

### Use Dedicated Email Service

For production deployments, avoid using personal Gmail:

1. **SendGrid** (Recommended)
   - 100 emails/day free
   - Excellent deliverability
   - Email tracking and analytics

2. **Mailgun**
   - 5,000 emails/month free
   - Good for transactional emails

3. **AWS SES**
   - Very cheap ($0.10 per 1,000 emails)
   - Requires domain verification

### Verify Sender Domain

To avoid spam filters:

1. Add SPF record to DNS
2. Add DKIM record to DNS
3. Set up DMARC policy
4. Use verified domain in EMAIL_FROM

### Monitor Email Delivery

- Track bounce rates
- Monitor spam complaints
- Check delivery logs regularly
- Set up alerts for failed sends

---

## Architecture Details

### How Magic Link Works

1. Student enters email on `/student/signin`
2. Frontend checks `/api/auth/provider-status` for email availability
3. If available, calls NextAuth `signIn('email', { email })`
4. NextAuth triggers EmailProvider's `sendVerificationRequest`
5. Server creates transport with SMTP credentials
6. Server sends email with signed magic link
7. Student clicks link in email
8. NextAuth verifies signature and creates session

### Configuration Check Flow

```
config.ts (line 105):
  isEmailConfigured = !!(EMAIL_HOST && EMAIL_USER && EMAIL_PASS)
       ↓
auth-options.ts (line 28):
  if (config.email.isConfigured) {
    providers.push(EmailProvider({...}))
  }
       ↓
provider-status/route.ts:
  Returns { email: config.email.isConfigured }
       ↓
student/signin/page.tsx:
  Checks provider status and shows/hides magic link form
```

### Code Locations

- **Config validation**: `src/lib/config.ts:98-111`
- **EmailProvider setup**: `src/lib/auth-options.ts:28-123`
- **Email sending**: `src/lib/auth-options.ts:92-135`
- **Frontend check**: `src/app/student/signin/page.tsx:43-63`
- **Error handling**: `src/app/student/signin/page.tsx:101-115`

---

## Getting Help

### Check Logs

**Vercel Dashboard** → Your Project → **Deployments** → Click on deployment → **Function Logs**

Look for:
- `✅ EmailProvider configured` (email is set up)
- `⚠️ EmailProvider not configured` (email is not set up)
- `📧 Attempting to send magic link email` (send attempt)
- `✅ Magic link email sent successfully` (success)
- `❌ Error sending magic link email` (failure with details)

### Contact Support

If you still have issues after following this guide:

1. Share the output of `/api/admin/test-email` (GET request)
2. Share relevant error logs from Vercel
3. Describe which email provider you're using
4. Mention if test email (POST) succeeded or failed

---

## Quick Reference

### Minimum Required Variables

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Test Commands

```bash
# Check status
curl https://your-app.vercel.app/api/admin/test-email

# Send test email
curl -X POST https://your-app.vercel.app/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com"}'
```

### Documentation Files

- `.env.example` - Complete environment variable reference
- `.env.production.template` - Minimal production template
- `VERCEL_ENV_VARIABLES_GUIDE.md` - Detailed Vercel setup guide
- `AUTHENTICATION_SYSTEM.md` - Authentication architecture overview
- `TROUBLESHOOTING_MAGIC_LINK.md` - This file

---

**Last Updated:** 2025-11-28
**Issue:** Magic Link Authentication Failure
**Solution:** Configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS in Vercel
