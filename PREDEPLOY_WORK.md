# Pre-Deployment Work - Environment Variables Guide

This guide contains everything you need to configure environment variables for deploying WanderNest2 to production (Vercel).

## Quick Start: Import `.env` Template to Vercel

Copy the `.env` template below and paste it directly into Vercel's "Import .env" feature:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_32
NEXTAUTH_SECRET=CHANGE_ME_GENERATE_WITH_OPENSSL_RAND_BASE64_32
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET_HERE
RAZORPAY_WEBHOOK_SECRET=YOUR_RAZORPAY_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_BASE_URL=https://your-domain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=YOUR_EMAIL_USERNAME_HERE
EMAIL_PASS=YOUR_EMAIL_PASSWORD_HERE
EMAIL_FROM=WanderNest <noreply@your-domain.com>
CONTACT_EMAIL=contact@your-domain.com
NEXTAUTH_URL=https://your-domain.com
REDIS_URL=redis://default:password@hostname:port
DISCOVERY_FEE_AMOUNT=99.00
VERIFICATION_CODE_EXPIRY=600
```

---

## Required Variables for First Production Deployment

These **MUST** be configured before deploying to production:

### 1. Database Configuration

**DATABASE_URL**
- **Purpose**: PostgreSQL database connection string
- **Format**: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`
- **Where to get**:
  - Vercel Postgres (recommended for Vercel deployments)
  - Supabase
  - Neon
  - Railway
  - Any PostgreSQL provider
- **Example**: `postgresql://user:pass@db.example.com:5432/wandernest`

### 2. Authentication & Security

**JWT_SECRET**
- **Purpose**: Secret key for JWT token generation and verification
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Important**: Must be a strong, random string (32+ characters)
- **Example**: `xK8vN2mP9qR7sT4uV6wX8yZ0aB1cD3eF5gH7iJ9kL2mN4oP6qR8sT0uV2wX4yZ6`

**NEXTAUTH_SECRET**
- **Purpose**: Secret for NextAuth.js session encryption
- **How to generate**: Run `openssl rand -base64 32` in terminal
- **Important**: Must be different from JWT_SECRET
- **Example**: `aB2cD4eF6gH8iJ0kL1mN3oP5qR7sT9uV0wX2yZ4aB6cD8eF0gH2iJ4kL6mN8oP0`

**GOOGLE_CLIENT_ID**
- **Purpose**: Google OAuth client ID for Google sign-in
- **Where to get**: [Google Cloud Console](https://console.cloud.google.com/)
  1. Create a new project or select existing
  2. Enable Google+ API
  3. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
  4. Add authorized redirect URIs: `https://your-domain.com/api/auth/callback/google`
- **Example**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

**GOOGLE_CLIENT_SECRET**
- **Purpose**: Google OAuth client secret
- **Where to get**: Same as GOOGLE_CLIENT_ID above
- **Example**: `GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz`

### 3. Payment Processing (Razorpay)

**RAZORPAY_KEY_ID**
- **Purpose**: Razorpay API key ID (public key)
- **Where to get**: [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys
- **Important**: This is sent to the client-side for payment initialization
- **Example**: `rzp_live_AbCdEfGhIjKlMn`

**RAZORPAY_KEY_SECRET**
- **Purpose**: Razorpay API secret key (private key)
- **Where to get**: Razorpay Dashboard → Settings → API Keys
- **Important**: Never expose to client, server-side only
- **Example**: `OpQrStUvWxYzAbCdEfGhIjKl`

**RAZORPAY_WEBHOOK_SECRET**
- **Purpose**: Secret for verifying Razorpay webhook signatures
- **Where to get**: Razorpay Dashboard → Settings → Webhooks
- **Important**: Used to verify webhook authenticity
- **Example**: `whsec_AbCdEfGhIjKlMnOpQrStUvWxYz`

### 4. Application URL

**NEXT_PUBLIC_BASE_URL**
- **Purpose**: Public base URL for the application
- **Format**: `https://your-domain.com` (no trailing slash)
- **Important**: Prefixed with `NEXT_PUBLIC_` so it's available on client-side
- **Used for**: Email links, metadata, sitemap generation, structured data
- **Example**: `https://wandernest2-umber.vercel.app`

---

## Optional but Recommended: Email Configuration

These variables enable email functionality (contact forms, verification codes, notifications):

**EMAIL_HOST**
- **Purpose**: SMTP server hostname
- **Examples**:
  - Gmail: `smtp.gmail.com`
  - SendGrid: `smtp.sendgrid.net`
  - AWS SES: `email-smtp.us-east-1.amazonaws.com`
- **Default**: Falls back to mock mode if not set

**EMAIL_PORT**
- **Purpose**: SMTP server port
- **Common values**:
  - `587` - TLS (recommended)
  - `465` - SSL
  - `25` - Unencrypted (not recommended)
- **Default**: `587`

**EMAIL_USER**
- **Purpose**: SMTP authentication username
- **Format**: Usually your email address or API username
- **Example**: `your-email@gmail.com` or `apikey` (for SendGrid)

**EMAIL_PASS**
- **Purpose**: SMTP authentication password
- **Important**: For Gmail, use an [App-Specific Password](https://support.google.com/accounts/answer/185833)
- **Example**: `abcd efgh ijkl mnop` (Gmail app password format)

**EMAIL_FROM**
- **Purpose**: Sender email address for outgoing emails
- **Format**: `Name <email@domain.com>`
- **Example**: `WanderNest <noreply@wandernest.com>`
- **Important**: Must be authorized to send from your SMTP provider

**CONTACT_EMAIL**
- **Purpose**: Email address to receive contact form submissions
- **Default**: Falls back to EMAIL_FROM if not set
- **Example**: `contact@wandernest.com`

---

## Optional Advanced Configuration

**REDIS_URL**
- **Purpose**: Redis connection URL for caching verification codes
- **Format**: `redis://default:password@hostname:port`
- **Where to get**: Vercel KV, Upstash, Redis Cloud
- **Benefits**: Improves performance for verification code handling
- **Default**: Verification works without Redis (just no caching)
- **Example**: `redis://default:pass123@redis.example.com:6379`

**NEXTAUTH_URL**
- **Purpose**: Application base URL for NextAuth
- **Format**: Same as NEXT_PUBLIC_BASE_URL
- **Default**: Auto-detected from NEXT_PUBLIC_BASE_URL or VERCEL_URL
- **When to set**: Only if auto-detection fails
- **Example**: `https://wandernest.com`

**DISCOVERY_FEE_AMOUNT**
- **Purpose**: Amount for discovery fee in INR
- **Format**: Decimal number (e.g., `99.00`)
- **Default**: `99.00` (₹99)
- **Example**: `149.00`

**VERIFICATION_CODE_EXPIRY**
- **Purpose**: Expiry time for email verification codes (in seconds)
- **Default**: `600` (10 minutes)
- **Example**: `900` (15 minutes)

---

## Variables Automatically Set by Vercel

These are automatically configured by Vercel—**do not manually add them**:

**NODE_ENV**
- Automatically set to `production` in Vercel production deployments
- Set to `development` locally

**VERCEL_URL**
- Automatically set to your deployment URL by Vercel
- Format: `your-project-hash.vercel.app`
- Used as fallback when NEXT_PUBLIC_BASE_URL is not set

---

## Environment Variable Setup Checklist

- [ ] **Database**: Set up PostgreSQL and add DATABASE_URL
- [ ] **Secrets**: Generate JWT_SECRET and NEXTAUTH_SECRET
- [ ] **Google Auth**: Create OAuth credentials and add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET
- [ ] **Payment**: Get Razorpay API keys and webhook secret
- [ ] **Base URL**: Set NEXT_PUBLIC_BASE_URL to your production domain
- [ ] **Email**: Configure SMTP settings (optional but recommended)
- [ ] **Redis**: Set up Redis for caching (optional performance boost)

---

## Deployment Steps

1. **Import to Vercel**:
   - Go to Vercel Project Settings → Environment Variables
   - Click "Import .env"
   - Paste the template above
   - Replace all placeholder values with real credentials

2. **Set Environment Scopes**:
   - Production: All required variables
   - Preview: Can use same as production or separate test credentials
   - Development: Use `.env.local` file locally

3. **Verify Configuration**:
   - All required variables have real values (no `CHANGE_ME` or `YOUR_*_HERE`)
   - Secrets are strong, random, and unique
   - URLs have correct format (https://, no trailing slash)
   - Google OAuth redirect URIs are configured in Google Cloud Console
   - Razorpay webhooks are configured with your deployment URL

4. **Deploy**:
   - Commit your code changes
   - Push to your repository
   - Vercel will automatically deploy with the configured environment variables

---

## Security Best Practices

1. **Never commit `.env` files** to version control (already in `.gitignore`)
2. **Use different secrets** for each environment (production/preview/development)
3. **Rotate secrets regularly**, especially after team member changes
4. **Use app-specific passwords** for email providers (especially Gmail)
5. **Enable 2FA** on all service provider accounts (Google, Razorpay, etc.)
6. **Monitor Vercel logs** for any unauthorized access attempts
7. **Use Vercel's encrypted environment variables** (they are encrypted at rest)

---

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL format is correct
- Check that database allows connections from Vercel IPs
- Ensure database user has proper permissions

### Google OAuth Not Working
- Verify authorized redirect URIs in Google Cloud Console
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET match
- Ensure Google+ API is enabled in your Google Cloud project

### Email Not Sending
- Verify SMTP credentials are correct
- For Gmail, ensure you're using an app-specific password
- Check that EMAIL_FROM is authorized by your SMTP provider
- Review Vercel function logs for SMTP errors

### Payment Issues
- Verify Razorpay is in live mode (not test mode)
- Check that webhook URL is correctly configured in Razorpay dashboard
- Ensure RAZORPAY_WEBHOOK_SECRET matches the one in Razorpay settings

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs/environment-variables
- **NextAuth.js Documentation**: https://next-auth.js.org/configuration/options
- **Razorpay Documentation**: https://razorpay.com/docs/
- **Google OAuth Setup**: https://support.google.com/cloud/answer/6158849
- **Prisma Database Setup**: https://www.prisma.io/docs/getting-started

---

**Last Updated**: 2025-11-22
