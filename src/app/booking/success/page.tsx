import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const requestId = searchParams.id

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Beautiful celebration scene with confetti">
        <Image
          src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1920&q=80"
          alt="Beautiful celebration scene with confetti"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/15 via-blue-600/10 to-purple-600/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-2xl w-full">
          <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 md:p-12 text-center space-y-6 animate-fade-in-up hover-lift">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-soft animate-scale-in">
                <svg
                  className="w-12 h-12 text-white"
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
              <div className="glass-frosted bg-gray-50/90 border-2 border-gray-300 rounded-2xl p-4 shadow-soft">
                <p className="text-sm text-gray-700 mb-1 font-medium">Your Request ID</p>
                <p className="text-lg font-mono font-bold text-gray-900">{requestId}</p>
                <p className="text-xs text-gray-600 mt-2">
                  Save this ID for your records
                </p>
              </div>
            )}

            {/* Marketplace Reminder */}
            <div className="glass-frosted bg-yellow-50/90 border-2 border-yellow-300 rounded-2xl p-6 text-left mb-4 shadow-soft">
              <h2 className="text-xl font-bold text-yellow-900 mb-3 flex items-center">
                <span className="mr-2">⚠️</span>
                Important Reminder
              </h2>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>WanderNest is a marketplace platform only.</strong> Please remember:
              </p>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>All payments are negotiated and handled directly between you and your guide</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>We do not guarantee service quality or assume liability</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You are responsible for vetting guides and making your own arrangements</span>
                </li>
              </ul>
            </div>

            {/* What's Next */}
            <div className="glass-frosted bg-blue-50/90 border-2 border-blue-300 rounded-2xl p-6 text-left shadow-soft">
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
                <Button variant="outline" size="lg" className="hover-lift shadow-soft">
                  Back to Home
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="lg" className="gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift">
                  Book Another Trip
                </Button>
              </Link>
            </div>

            {/* Contact Info */}
            <p className="text-sm text-gray-600 pt-4">
              Questions? Contact us at{' '}
              <a
                href="mailto:support@wandernest.com"
                className="text-blue-600 hover:underline font-semibold"
              >
                support@wandernest.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
