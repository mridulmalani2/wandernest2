# Razorpay Payment Integration Guide

This document explains how to set up and use the Razorpay payment gateway integration for collecting discovery fees from tourists.

## Overview

The payment system allows you to:
- Charge tourists a one-time discovery fee (₹99 by default)
- Securely process payments via Razorpay
- Track payment status in the database
- Redirect tourists after successful payment

## Setup Instructions

### 1. Get Razorpay Credentials

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to Settings → API Keys
3. Generate API Keys (you'll get a Key ID and Key Secret)
4. For webhooks (optional), go to Settings → Webhooks and create a webhook secret

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"
RAZORPAY_WEBHOOK_SECRET="your-razorpay-webhook-secret"

# Payment Configuration
DISCOVERY_FEE_AMOUNT="99.00"  # Amount in INR
```

### 3. Run Database Migration

The payment integration includes a new `Payment` model. Run Prisma migration:

```bash
npx prisma migrate dev --name add_payment_model
npx prisma generate
```

## Database Schema

The `Payment` model tracks all payment transactions:

```prisma
model Payment {
  id                String        @id @default(cuid())
  touristId         String?
  requestId         String?       // Optional: link to specific tourist request

  amount            Float         // in INR
  currency          String        @default("INR")
  status            PaymentStatus @default(PENDING)

  razorpayOrderId   String        @unique
  razorpayPaymentId String?       @unique
  razorpaySignature String?

  email             String
  phone             String?
  description       String        @default("Discovery Fee - WanderNest")

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}
```

## API Endpoints

### 1. Create Payment Order

**Endpoint:** `POST /api/payment/create-order`

**Request Body:**
```json
{
  "email": "tourist@example.com",
  "phone": "+911234567890",
  "touristId": "optional-tourist-id",
  "requestId": "optional-request-id"
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "order_XXXXXXXXXXXXX",
  "amount": 99,
  "currency": "INR",
  "keyId": "rzp_test_XXXXXXX",
  "paymentId": "payment-record-id"
}
```

### 2. Verify Payment

**Endpoint:** `POST /api/payment/verify`

**Request Body:**
```json
{
  "razorpay_order_id": "order_XXXXXXXXXXXXX",
  "razorpay_payment_id": "pay_XXXXXXXXXXXXX",
  "razorpay_signature": "signature_string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

### 3. Check Payment Status

**Endpoint:** `GET /api/payment/status`

**Query Parameters:**
- `paymentId`: Internal payment record ID
- `email`: Tourist email (returns most recent payment)

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "payment-id",
    "status": "SUCCESS",
    "amount": 99,
    "currency": "INR",
    "createdAt": "2025-11-18T...",
    "razorpayOrderId": "order_XXX",
    "razorpayPaymentId": "pay_XXX"
  }
}
```

## Payment Flow

### User Journey

1. **Navigate to Payment Page**
   ```
   /payment/discovery-fee?touristId=xxx&requestId=xxx&redirect=/booking
   ```

2. **Enter Details**
   - Email (required)
   - Phone (optional)

3. **Click Pay Button**
   - Creates Razorpay order via API
   - Opens Razorpay checkout modal

4. **Complete Payment**
   - User enters card/UPI/netbanking details in Razorpay modal
   - Payment is processed

5. **Verification**
   - Razorpay sends payment details
   - Backend verifies signature
   - Updates payment status in database

6. **Redirect**
   - Success: `/payment/success?paymentId=xxx&redirect=/booking`
   - Failure: `/payment/failed?error=xxx&redirect=/payment/discovery-fee`

## Integration Examples

### Example 1: Redirect from Booking Flow

```typescript
// In your booking component
const handleStartBooking = () => {
  // Check if user has paid discovery fee
  const hasAccessPaid = await checkPaymentStatus(userEmail)

  if (!hasAccessPaid) {
    // Redirect to payment page
    router.push(`/payment/discovery-fee?redirect=/booking&touristId=${touristId}`)
  } else {
    // Continue with booking
    // ...
  }
}
```

### Example 2: Direct Payment Link

Share this link with tourists to collect discovery fee:
```
https://yourdomain.com/payment/discovery-fee
```

With pre-filled parameters:
```
https://yourdomain.com/payment/discovery-fee?touristId=123&redirect=/booking/select-guide
```

### Example 3: Check Payment Status

```typescript
// Check if tourist has paid
const response = await fetch(`/api/payment/status?email=${email}`)
const data = await response.json()

if (data.success && data.payment.status === 'SUCCESS') {
  // User has paid, allow access
} else {
  // Redirect to payment page
}
```

## Pages Included

1. **Payment Page** (`/payment/discovery-fee`)
   - Displays discovery fee details
   - Collects user information
   - Initiates Razorpay payment

2. **Success Page** (`/payment/success`)
   - Shows payment confirmation
   - Displays payment details
   - Auto-redirects to booking/dashboard

3. **Failed Page** (`/payment/failed`)
   - Shows error message
   - Offers retry option
   - Contact support information

## Customization

### Change Payment Amount

Update the `.env` file:
```env
DISCOVERY_FEE_AMOUNT="149.00"  # New amount in INR
```

### Customize Payment Page

Edit `/app/payment/discovery-fee/page.tsx` to:
- Change branding
- Add/remove features list
- Modify form fields
- Update styling

### Add Email Notifications

You can extend the payment verification endpoint to send confirmation emails:

```typescript
// In /app/api/payment/verify/route.ts
if (verifyData.success) {
  // Send confirmation email
  await sendPaymentConfirmationEmail(email, paymentDetails)
}
```

## Testing

### Test Mode

1. Use Razorpay test API keys (starts with `rzp_test_`)
2. Test card details:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

3. Test UPI: `success@razorpay`

### Live Mode

1. Complete Razorpay KYC verification
2. Use live API keys (starts with `rzp_live_`)
3. Update `.env` with live credentials

## Security Considerations

1. **Never expose** `RAZORPAY_KEY_SECRET` on the frontend
2. Always verify payment signatures on the backend
3. Use HTTPS in production
4. Implement rate limiting on payment endpoints
5. Log all payment attempts for audit

## Troubleshooting

### Payment not showing up in database
- Check database connection
- Verify Prisma schema is migrated
- Check API endpoint logs

### Razorpay checkout not opening
- Ensure Razorpay script is loaded
- Check browser console for errors
- Verify API key is correct

### Payment verification failing
- Check `RAZORPAY_KEY_SECRET` is correct
- Verify signature generation logic
- Check Razorpay dashboard for payment status

## Support

For issues with:
- **Razorpay integration**: [Razorpay Support](https://razorpay.com/support/)
- **WanderNest platform**: Contact your development team

## Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)
- [Payment Gateway Integration Guide](https://razorpay.com/docs/payments/payment-gateway/)
