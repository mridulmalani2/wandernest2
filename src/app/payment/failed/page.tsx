'use client'

export const dynamic = 'force-dynamic'

import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function PaymentFailedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const error = searchParams.get('error') || 'Payment could not be processed'
  const redirectUrl = searchParams.get('redirect') || '/payment/discovery-fee'

  return (
    <div className="min-h-screen bg-gradient-to-br from-ui-blue-secondary to-ui-purple-secondary">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent">
              TourWiseCo
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-ui-error/15 rounded-full flex items-center justify-center mx-auto">
                <svg
                  className="w-12 h-12 text-ui-error"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-ui-error">
              Payment Failed
            </h1>

            <p className="text-gray-600 mb-6">
              {error}
            </p>

            <div className="bg-ui-warning/10 border border-ui-warning/25 rounded-lg p-4 mb-6">
              <p className="text-sm text-ui-warning">
                Don't worry! No amount has been deducted from your account.
                Please try again or contact support if the issue persists.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => router.push(redirectUrl)}
                  className="px-8"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  Go to Home
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-sm text-gray-600">
              <p>
                Need help? Contact our support team at{' '}
                <a href="mailto:support@tourwiseco.com" className="text-ui-blue-primary hover:underline">
                  support@tourwiseco.com
                </a>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
