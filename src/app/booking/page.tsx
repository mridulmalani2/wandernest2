'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookingForm } from '@/components/booking/BookingForm'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { signIn } from 'next-auth/react'
import { useAuth } from '@/lib/use-auth'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, LogIn } from 'lucide-react'
import FAQAccordion from '@/components/shared/FAQAccordion'
import { paymentFAQs } from '@/lib/faq/data'

export default function BookingPage() {
  const { data: session, status } = useAuth()
  const loading = status === 'loading'
  const isTourist = session?.user?.userType === 'tourist'

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Travelers planning their adventure together"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="tourist" />

        {/* Main Content - Optimized for mobile: reduced padding */}
        <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
          <div className="max-w-4xl mx-auto mb-6 md:mb-8 text-center animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 md:mb-4 text-white text-shadow-lg">Book Your Local Guide</h1>
            <p className="text-white text-base sm:text-lg text-shadow">
              Tell us about your trip and we'll match you with the perfect local student
              guide
            </p>
          </div>

          {/* Marketplace Disclaimer - Optimized for mobile: responsive padding and spacing */}
          <div className="glass-frosted bg-gradient-to-br from-ui-warning/10 to-ui-warning/5 border-2 border-ui-warning rounded-2xl p-4 md:p-6 mb-6 md:mb-8 max-w-4xl mx-auto shadow-premium hover-lift animate-fade-in-up delay-100">
            <div className="flex items-start space-x-3 md:space-x-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-ui-warning text-white shadow-soft">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 id="disclaimer-booking-heading" className="font-bold text-amber-900 mb-2 text-lg">Marketplace Notice</h2>
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong>WanderNest is a connection platform only.</strong> We do not handle payments, guarantee service quality, or assume liability. All services and payments are arranged directly between you and your chosen guide.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            {loading ? (
              <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-12 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-ui-blue-primary mx-auto mb-4" />
                <p className="text-gray-700 font-medium">Loading...</p>
              </div>
            ) : !session ? (
              <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 md:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <LogIn className="h-16 w-16 text-ui-blue-primary mx-auto mb-6" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Sign In to Book
                  </h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    To create a booking request and connect with local student guides,
                    you need to sign in with your Google account. This helps us protect both
                    tourists and students on our platform.
                  </p>
                  <Button
                    onClick={() => signIn('google', { callbackUrl: '/booking' })}
                    className="bg-ui-blue-primary hover:bg-ui-blue-accent text-white px-8 py-6 text-lg shadow-lg hover-lift"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In with Google
                  </Button>
                </div>
              </div>
            ) : !isTourist ? (
              <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 md:p-12 text-center">
                <div className="max-w-md mx-auto">
                  <AlertTriangle className="h-16 w-16 text-ui-warning mx-auto mb-6" />
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Tourist Account Required
                  </h2>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    You're signed in with a student account. To book a guide, please sign in
                    with a personal (non-.edu) email address.
                  </p>
                  <Button
                    onClick={() => signIn('google', { callbackUrl: '/booking' })}
                    className="bg-ui-blue-primary hover:bg-ui-blue-accent text-white px-8 py-6 text-lg shadow-lg hover-lift"
                  >
                    Sign In with Different Account
                  </Button>
                </div>
              </div>
            ) : (
              <BookingForm />
            )}
          </div>

          <section aria-label="Frequently asked questions" className="mt-16">
            <FAQAccordion faqs={paymentFAQs} title="Common Questions" />
          </section>
        </main>

        {/* Footer */}
        <Footer variant="minimal" />
      </div>
    </div>
  )
}
