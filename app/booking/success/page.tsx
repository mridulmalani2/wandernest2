import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const requestId = searchParams.id

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
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

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Booking Request Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your email has been verified and your request has been submitted
              successfully.
            </p>
          </div>

          {/* Request ID */}
          {requestId && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Your Request ID</p>
              <p className="text-lg font-mono font-bold text-gray-900">{requestId}</p>
              <p className="text-xs text-gray-500 mt-2">
                Save this ID for your records
              </p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <h2 className="text-xl font-bold text-blue-900 mb-4">What's Next?</h2>
            <ul className="space-y-3 text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">📧</span>
                <span>We've sent a confirmation email to your inbox</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🔍</span>
                <span>Local student guides will review your request</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">💌</span>
                <span>You'll receive proposals from interested guides</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✨</span>
                <span>Choose your favorite and start planning your adventure!</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg">Book Another Trip</Button>
            </Link>
          </div>

          {/* Contact Info */}
          <p className="text-sm text-gray-500 pt-4">
            Questions? Contact us at{' '}
            <a
              href="mailto:support@wandernest.com"
              className="text-blue-600 hover:underline"
            >
              support@wandernest.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
