# Email Setup Guide for WanderNest

This guide explains how to configure email delivery for booking confirmations, magic links, and notifications.

## Overview

WanderNest uses **Nodemailer** with SMTP to send emails. The system supports:
- ✉️ Booking confirmation emails to tourists
- 🔐 Magic link authentication for students
- 📧 Student invitation emails for new bookings
- 🔔 Acceptance notifications to both parties

## Quick Start

### Required Environment Variables

Set these in your Vercel dashboard (`Settings → Environment Variables`):

```bash
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password-here"
EMAIL_FROM="WanderNest <noreply@yourapp.com>"
```

### Gmail Setup (Recommended)

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (custom name)"
   - Enter "WanderNest" as the name
   - Copy the 16-character password (no spaces)

3. **Set Environment Variables in Vercel**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=abcd efgh ijkl mnop  # 16-char app password
   EMAIL_FROM=WanderNest <noreply@yourapp.com>
   ```

4. **Redeploy**
   - After setting variables, trigger a new deployment
   - Vercel reads env vars only at build/startup time

## Testing Email Configuration

### Method 1: Test Email Endpoint

**Check Configuration Status:**
```bash
curl https://your-app.vercel.app/api/admin/test-email
```

**Send Test Email:**
```bash
curl -X POST https://your-app.vercel.app/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-test-email@gmail.com"}'
```

### Method 2: Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Make a test booking
3. Look for these log messages:

**✅ Success:**
```
✅ Email transporter initialized
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: youremail@gmail.com

📧 Sending email (attempt 1/3): Booking Confirmation
   To: customer@example.com
   Subject: Your WanderNest Booking Confirmation
   From: WanderNest <noreply@yourapp.com>

✅ Email sent successfully: Booking Confirmation
   Message ID: <abc123@gmail.com>
   Accepted: customer@example.com
   Rejected: None
```

**❌ Mock Mode (email not configured):**
```
⚠️  WARNING: Email not configured - emails will only be logged
   Missing variables:
   - EMAIL_HOST
   - EMAIL_USER
   - EMAIL_PASS

📧 MOCK EMAIL MODE - Booking Confirmation
   To: customer@example.com
   Subject: Your WanderNest Booking Confirmation
⚠️  EMAIL NOT SENT - Configure EMAIL_HOST, EMAIL_USER, EMAIL_PASS
```

**❌ Authentication Error:**
```
❌ Failed to send email (attempt 1/3): Booking Confirmation
   Error: Invalid login: 535-5.7.8 Username and Password not accepted
   Error Code: EAUTH
   ⚠️  Authentication error - not retrying
```

## Troubleshooting

### Problem: "Email not configured" in logs

**Solution:**
1. Verify environment variables are set in Vercel:
   - Go to Dashboard → Settings → Environment Variables
   - Check `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` exist
   - Ensure they're set for the correct environment (Production/Preview)
2. Redeploy after adding variables
3. Check logs for "Email transporter initialized" message

### Problem: Authentication errors (EAUTH)

**Symptoms:**
```
Error Code: EAUTH
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**
- **Gmail:** Use App Password, not regular password
- **Verify:** Email and password are correct
- **Check:** 2-Step Verification is enabled (required for App Passwords)
- **Copy carefully:** App password has no spaces (abcdefghijklmnop)

### Problem: Connection timeout

**Symptoms:**
```
Error Code: ETIMEDOUT
Error: Connection timeout
```

**Solutions:**
- **Port:** Ensure using 587 (TLS) or 465 (SSL), not 25
- **Firewall:** Check Vercel can make outbound SMTP connections
- **Alternative:** Try port 465 with SSL:
  ```bash
  EMAIL_PORT=465
  ```

### Problem: Emails going to spam

**Solutions:**
1. **Verify sender address:**
   - Use a domain you own in `EMAIL_FROM`
   - Example: `noreply@yourdomain.com`

2. **Configure SPF/DKIM:**
   - Add SPF record to your DNS:
     ```
     v=spf1 include:_spf.google.com ~all
     ```
   - Configure DKIM in Gmail settings

3. **Use professional email:**
   - Avoid gmail.com addresses in production
   - Use custom domain (e.g., `noreply@wandernest.com`)

### Problem: Emails not received

**Checklist:**
1. ✅ Check Vercel logs for "Email sent successfully"
2. ✅ Verify recipient email is correct
3. ✅ Check spam/junk folder
4. ✅ Verify email service isn't blocking
5. ✅ Test with different email provider (Gmail, Outlook, etc.)
6. ✅ Check Message ID in logs and search in email client

## Alternative Email Providers

### SendGrid

```bash
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASS="your-sendgrid-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### Mailgun

```bash
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT="587"
EMAIL_USER="postmaster@your-domain.mailgun.org"
EMAIL_PASS="your-mailgun-password"
EMAIL_FROM="noreply@your-domain.mailgun.org"
```

### AWS SES

```bash
EMAIL_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_PORT="587"
EMAIL_USER="your-ses-smtp-username"
EMAIL_PASS="your-ses-smtp-password"
EMAIL_FROM="noreply@verified-domain.com"
```

## Email Templates

All emails use responsive HTML templates located in `/src/lib/email.ts`:

- **Booking Confirmation** - `sendBookingConfirmation()`
- **Student Invitation** - `sendStudentMatchInvitation()`
- **Acceptance Notification** - `sendTouristAcceptanceNotification()`
- **Verification Email** - `sendVerificationEmail()`

## Production Checklist

Before going live:

- [ ] Email environment variables set in Vercel
- [ ] Test email endpoint returns success
- [ ] Send test booking and receive confirmation email
- [ ] Check emails don't go to spam
- [ ] Verify magic link authentication works
- [ ] Set up custom domain for `EMAIL_FROM` (recommended)
- [ ] Configure SPF/DKIM records (recommended)
- [ ] Monitor Vercel logs for email errors

## Support

If you're still experiencing issues:

1. **Check Vercel logs** for detailed error messages
2. **Test with `/api/admin/test-email` endpoint**
3. **Verify environment variables** are set correctly
4. **Try different email provider** (SendGrid, Mailgun)

## Monitoring Email Delivery

The booking API now returns email delivery status:

```json
{
  "success": true,
  "requestId": "abc123",
  "emailDelivery": {
    "sent": true,
    "messageId": "<abc123@gmail.com>",
    "error": null
  }
}
```

Check this response after booking to confirm email was sent.
