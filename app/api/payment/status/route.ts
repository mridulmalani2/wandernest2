import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get('paymentId');
    const email = searchParams.get('email');

    if (!paymentId && !email) {
      return NextResponse.json(
        { error: 'Either paymentId or email is required' },
        { status: 400 }
      );
    }

    let payment;

    if (paymentId) {
      payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
    } else if (email) {
      // Get the most recent payment for this email
      payment = await prisma.payment.findFirst({
        where: { email },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        createdAt: payment.createdAt,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
