// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, phone, touristId, requestId } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
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
    const payment = await prisma.payment.create({
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
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
