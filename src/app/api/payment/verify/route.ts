// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { withErrorHandler, withDatabaseRetry, AppError } from '@/lib/error-handler';

async function verifyPayment(req: NextRequest) {
  const body = await req.json();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(400, 'Missing required payment details', 'MISSING_PAYMENT_DETAILS');
  }

  // Verify signature - validate secret is configured
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error('RAZORPAY_KEY_SECRET environment variable is not configured');
    throw new AppError(500, 'Payment verification unavailable. Please contact support.', 'PAYMENT_SERVICE_UNAVAILABLE');
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    // Update payment status to FAILED
    await withDatabaseRetry(async () =>
      prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: 'FAILED' },
      })
    );

    throw new AppError(400, 'Invalid payment signature', 'INVALID_SIGNATURE');
  }

  // Update payment record with success status
  const payment = await withDatabaseRetry(async () =>
    prisma.payment.updateMany({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    })
  );

  if (payment.count === 0) {
    throw new AppError(404, 'Payment record not found', 'PAYMENT_NOT_FOUND');
  }

  return NextResponse.json({
    success: true,
    message: 'Payment verified successfully',
  });
}

export const POST = withErrorHandler(verifyPayment, 'POST /api/payment/verify');
