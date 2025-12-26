import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import Navigation from '@/components/Navigation'
import { RequestIdCleaner } from '@/components/booking/RequestIdCleaner'

export default function SuccessPage() {
  return (
    <>
      <Navigation variant="tourist" />
      <Suspense fallback={null}>
        <RequestIdCleaner />
      </Suspense>
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Image with Overlays */}
        <div className="absolute inset-0" role="img" aria-label="Beautiful celebration scene with confetti">
          <Image
            src="/images/backgrounds/cafe-ambiance.jpg"
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
          <div className="absolute inset-0 bg-gradient-to-br from-ui-success/15 via-ui-blue-primary/10 to-ui-purple-primary/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-2xl w-full">
            <div className="glass-card-dark rounded-3xl border-2 border-white/10 shadow-premium p-8 md:p-12 text-center space-y-6 animate-fade-in-up hover-lift">
              {/* Success Icon */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-ui-success to-ui-success/80 rounded-full flex items-center justify-center shadow-soft animate-scale-in">
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
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Booking Request Confirmed!
                </h1>
                <p className="text-lg text-gray-300">
                  Your email has been verified and your request has been submitted
                  successfully.
                </p>
              </div>

              {/* Marketplace Reminder */}
              <div className="bg-ui-warning/10 border-2 border-ui-warning/50 rounded-2xl p-6 text-left mb-4 shadow-soft">
                <h2 className="text-xl font-bold text-ui-warning mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Important Reminder
                </h2>
                <p className="text-sm text-ui-warning mb-2">
                  <strong>TourWiseCo is a marketplace platform only.</strong> Please remember:
                </p>
                <ul className="space-y-2 text-sm text-ui-warning/90">
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
              <div className="bg-ui-blue-primary/10 border-2 border-ui-blue-accent/50 rounded-2xl p-6 text-left shadow-soft">
                <h2 className="text-xl font-bold text-ui-blue-primary mb-4">What's Next?</h2>
                <ul className="space-y-3 text-ui-blue-primary/90">
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
                  <Button variant="outline" size="lg" className="hover-lift shadow-soft border-white/20 text-white hover:bg-white hover:text-black bg-transparent">
                    Back to Home
                  </Button>
                </Link>
                <PrimaryCTAButton
                  href="/booking"
                  variant="blue"
                >
                  Book Another Trip
                </PrimaryCTAButton>
              </div>

              {/* Contact Info */}
              <p className="text-sm text-gray-400 pt-4">
                Questions? Contact us at{' '}
                <a
                  href="mailto:support@tourwiseco.com"
                  className="text-ui-blue-primary hover:underline font-semibold"
                >
                  support@tourwiseco.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
