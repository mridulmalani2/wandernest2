'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookingForm } from '@/components/booking/BookingForm'
import Navigation from '@/components/Navigation'
import { signIn, useSession } from 'next-auth/react'
import { AlertTriangle, Loader2, LogIn, CheckCircle2 } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

export default function BookingPage() {
  const { data: session, status } = useSession()
  const loading = status === 'loading'
  const isTourist = session?.user?.userType === 'tourist'

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Beautiful travel destination">
        <Image
          src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
          alt="Starry night mountains"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-5" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="tourist" />

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
          {loading ? (
            <div className="max-w-md w-full space-y-8 animate-fade-in-up">
              <div className="glass-card-dark rounded-3xl border-2 border-white/10 shadow-premium p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-white font-medium">Loading...</p>
              </div>
            </div>
          ) : !session ? (
            <div className="max-w-md w-full space-y-8 animate-fade-in-up">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-2 text-white text-shadow-lg">
                  Book Your{' '}
                  <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                    Local Guide
                  </span>
                </h2>
                <p className="text-gray-300 mt-2 text-shadow">
                  Sign in to connect with local student guides
                </p>
              </div>

              {/* Sign In Card */}
              <div className="glass-card-dark rounded-3xl border-2 border-white/10 p-8 shadow-premium space-y-6">
                <div className="text-center py-4">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <LogIn className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Sign In to Book</h3>
                  <p className="text-gray-300 mb-6">
                    To create a booking request and connect with local student guides,
                    sign in with your Google account.
                  </p>

                  <PrimaryCTAButton
                    onClick={() => signIn('google', { callbackUrl: '/booking' })}
                    variant="blue"
                    icon={LogIn}
                    className="w-full justify-center"
                  >
                    Sign In with Google
                  </PrimaryCTAButton>
                </div>

                <div className="text-center text-sm text-white/85">
                  <p>
                    By signing in, you agree to our{' '}
                    <Link href="/terms" className="text-blue-200 hover:text-blue-100 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-blue-200 hover:text-blue-100 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="glass-card-dark rounded-3xl border-2 border-white/10 p-8 shadow-premium space-y-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-base text-white">What happens next?</h3>
                  <ul className="text-sm text-gray-200 space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-ui-blue-primary flex-shrink-0 mt-0.5" />
                      <span>Tell us about your trip and preferences</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-ui-purple-primary flex-shrink-0 mt-0.5" />
                      <span>We'll match you with qualified local guides</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-ui-success flex-shrink-0 mt-0.5" />
                      <span>Review profiles and choose your guide</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-ui-purple-accent flex-shrink-0 mt-0.5" />
                      <span>Connect directly and plan your adventure</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Student Link */}
              <div className="text-center">
                <p className="text-gray-200">
                  Are you a student?{' '}
                  <Link
                    href="/student/signin"
                    className="text-ui-blue-primary hover:underline font-medium"
                  >
                    Sign in as Student Guide
                  </Link>
                </p>
              </div>

              {/* Marketplace Disclaimer */}
              <div className="glass-card-dark bg-ui-warning/10 border-2 border-ui-warning/30 rounded-2xl p-4 md:p-6 shadow-premium animate-fade-in-up delay-100">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-ui-warning text-white shadow-soft">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-amber-100 mb-2 text-lg">Marketplace Notice</h2>
                    <p className="text-sm text-amber-100/90 leading-relaxed">
                      <strong>TourWiseCo is a connection platform only.</strong> We do not handle payments, guarantee service quality, or assume liability. All services and payments are arranged directly between you and your chosen guide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : !isTourist ? (
            <div className="max-w-md w-full space-y-8 animate-fade-in-up">
              <div className="text-center">
                <h2 className="text-4xl font-bold mb-2 text-white text-shadow-lg">
                  Book Your{' '}
                  <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                    Local Guide
                  </span>
                </h2>
                <p className="text-white mt-2 text-shadow">
                  Tourist account required to book guides
                </p>
              </div>

              {/* Error Card */}
              <div className="glass-card-dark bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-4 shadow-premium animate-scale-in">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-ui-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-200 font-semibold">
                      You're signed in with a student account. To book a guide, please sign in with a personal (non-.edu) email address.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign In Card */}
              <div className="glass-card-dark rounded-3xl border-2 border-white/10 p-8 shadow-premium space-y-6">
                <div className="text-center py-4">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-ui-warning/20 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-ui-warning" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Tourist Account Required</h3>
                  <p className="text-gray-200 mb-6">
                    Please sign in with a different account to create booking requests.
                  </p>

                  <PrimaryCTAButton
                    onClick={() => signIn('google', { callbackUrl: '/booking' })}
                    variant="blue"
                    icon={LogIn}
                    className="w-full justify-center"
                  >
                    Sign In with Different Account
                  </PrimaryCTAButton>
                </div>
              </div>

              {/* Student Link */}
              <div className="text-center">
                <p className="text-gray-200">
                  Want to become a guide?{' '}
                  <Link
                    href="/student/signin"
                    className="text-ui-blue-primary hover:underline font-medium"
                  >
                    Sign in as Student Guide
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="max-w-4xl mx-auto mb-6 md:mb-8 text-center animate-fade-in-up">
                <h1 className="text-4xl font-bold mb-2 text-white text-shadow-lg">
                  Book Your{' '}
                  <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                    Local Guide
                  </span>
                </h1>
                <p className="text-white mt-2 text-shadow">
                  Tell us about your trip and we'll match you with the perfect local student guide
                </p>
              </div>

              <BookingForm />

              {/* Marketplace Disclaimer */}
              <div className="glass-card-dark bg-ui-warning/10 border-2 border-ui-warning/30 rounded-2xl p-4 md:p-6 mt-8 max-w-4xl mx-auto shadow-premium animate-fade-in-up delay-100">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="flex-shrink-0 p-3 rounded-xl bg-ui-warning text-white shadow-soft">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 id="disclaimer-booking-heading" className="font-bold text-amber-100 mb-2 text-lg">Marketplace Notice</h2>
                    <p className="text-sm text-amber-100/90 leading-relaxed">
                      <strong>TourWiseCo is a connection platform only.</strong> We do not handle payments, guarantee service quality, or assume liability. All services and payments are arranged directly between you and your chosen guide.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t-2 glass-card-dark border-white/10 mt-16 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} TourWiseCo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
