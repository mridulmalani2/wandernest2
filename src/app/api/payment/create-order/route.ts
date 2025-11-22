// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';

// Validate Razorpay credentials
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables are required');
}

// Initialize Razorpay instance
const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

async function createPaymentOrder(req: NextRequest) {
  // Validate Razorpay is configured
  if (!razorpay) {
    console.error('Razorpay not initialized due to missing credentials');
    throw new AppError(500, 'Payment service unavailable. Please contact support.', 'PAYMENT_SERVICE_UNAVAILABLE');
  }

  const body = await req.json();
  const { email, phone, touristId, requestId } = body;

  // Validate required fields
  if (!email) {
    throw new AppError(400, 'Email is required', 'MISSING_EMAIL');
  }

  // Get discovery fee amount from environment variable
  const amount = parseFloat(process.env.DISCOVERY_FEE_AMOUNT || '99');

  // Create Razorpay order
  const options = {
    amount: amount * 100, // Razorpay expects amount in paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: {
      email,
      phone: phone || '',
      touristId: touristId || '',
      requestId: requestId || '',
    },
  };

  const order = await razorpay.orders.create(options);

  // Store payment record in database
  const payment = await withDatabaseRetry(async () =>
    prisma.payment.create({
      data: {
        touristId: touristId || null,
        requestId: requestId || null,
        amount,
        currency: 'INR',
        status: 'PENDING',
        razorpayOrderId: order.id,
        email,
        phone: phone || null,
        description: 'Discovery Fee - WanderNest',
      },
    })
  );

  return NextResponse.json({
    success: true,
    orderId: order.id,
    amount: amount,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    paymentId: payment.id,
  });
}

export const POST = withErrorHandler(createPaymentOrder, 'POST /api/payment/create-order');
