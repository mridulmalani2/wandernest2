# 📧 Email Deliverability & Spam Fix Checklist

If your emails are landing in Spam, it is almost always due to missing DNS records. Since you are using Resend, you must verify your domain to ensure high deliverability.

## 1. Verify Domain in Resend Dashboard
1. Go to your [Resend Dashboard](https://resend.com/domains).
2. Click **Add Domain** and enter `tourwiseco.com` (or your actual domain).
3. Resend will provide you with **DNS records** (TXT, MX, CNAME).

## 2. Add DNS Records to Your Domain Provider
Log in to your domain provider (GoDaddy, Namecheap, Vercel, etc.) and add the records provided by Resend:

| Type | Name | Value | Status |
|------|------|-------|--------|
| **MX** | `bounces` | `feedback-smtp.us-east-1.amazonses.com` | *Required for bounce handling* |
| **TXT** | `resend._domainkey` | `k=rsa; p=...` (Long key) | *DKIM (Critical for trust)* |
| **TXT** | `@` (or root) | `v=spf1 include:resend.com ~all` | *SPF (Prevents spoofing)* |

> **Note:** If you already have an SPF record (starts with `v=spf1`), **do not create a new one**. Instead, append `include:resend.com` to the existing one.
> Example: `v=spf1 include:_spf.google.com include:resend.com ~all`

## 3. Verify DMARC Record (Crucial for Gmail/Yahoo)
Gmail and Yahoo now **require** a DMARC record.
Add this TXT record if you don't have one:

- **Type:** `TXT`
- **Name:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:admin@tourwiseco.com`

*(Change `p=none` to `p=quarantine` or `p=reject` once you are confident everything is working).*

## 4. Update Environment Variables
Ensure your `EMAIL_FROM` variable matches the verified domain.
In Vercel Settings > Environment Variables:

```bash
EMAIL_FROM="TourWiseCo <noreply@tourwiseco.com>"
```
*Do not use `@gmail.com` or `@resend.dev` addresses in production.*

## 5. Test Your Score
Go to [Mail-Tester.com](https://www.mail-tester.com/), copy the email address they give you, and sign up on your app using that email. Check your score. You want a 10/10.
