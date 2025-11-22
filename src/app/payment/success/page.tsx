'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [countdown, setCountdown] = useState(5)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const paymentId = searchParams.get('paymentId')
  const redirectUrl = searchParams.get('redirect') || '/booking'

  useEffect(() => {
    // Fetch payment details
    if (paymentId) {
      fetch(`/api/payment/status?paymentId=${paymentId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setPaymentDetails(data.payment)
          }
        })
        .catch(console.error)
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(redirectUrl)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentId, router, redirectUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ui-blue-secondary to-ui-purple-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent">
              WanderNest
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-ui-success/15 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-ui-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-ui-success">
              Payment Successful!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your payment. You now have access to our network of local student guides.
            </p>

            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="font-semibold mb-3">Payment Details</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID:</span>
                    <span className="font-mono">{paymentDetails.razorpayPaymentId || 'Processing...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold">₹{paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-ui-success font-semibold">{paymentDetails.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span>{new Date(paymentDetails.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Redirecting to your booking in {countdown} seconds...
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push(redirectUrl)}
                  className="px-8"
                >
                  Continue to Booking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/tourist/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-sm text-gray-600">
              <p>
                A receipt has been sent to your email address.
                For any queries, please contact our support team.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
