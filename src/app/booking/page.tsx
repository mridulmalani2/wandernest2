'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookingForm } from '@/components/booking/BookingForm'
import Navigation from '@/components/Navigation'
// import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

// AUTH DISABLED FOR DEVELOPMENT - DATABASE_URL not configured
export default function BookingPage() {
  // const { data: session, status } = useSession()
  // const isTourist = session?.user?.userType === 'tourist'
  const isTourist = true // DEV MODE: Allow access without auth

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Travelers planning their adventure together">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Travelers planning their adventure together"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="tourist" />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto mb-8 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-4 text-white text-shadow-lg">Book Your Local Guide</h1>
            <p className="text-white text-lg text-shadow">
              Tell us about your trip and we'll match you with the perfect local student
              guide
            </p>
          </div>

          {/* Marketplace Disclaimer */}
          <div className="glass-frosted bg-gradient-to-br from-ui-warning/10 to-ui-warning/5 border-2 border-ui-warning rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-premium hover-lift animate-fade-in-up delay-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-ui-warning text-white shadow-soft">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-ui-warning mb-2 text-lg">Marketplace Notice</h2>
                <p className="text-sm text-ui-warning leading-relaxed">
                  <strong>WanderNest is a connection platform only.</strong> We do not handle payments, guarantee service quality, or assume liability. All services and payments are arranged directly between you and your chosen guide.
                </p>
              </div>
            </div>
          </div>

        {/* Authentication Gate - DISABLED FOR DEV */}
        {/* {status === 'loading' ? (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : !isTourist ? (
          <div className="max-w-2xl mx-auto relative overflow-hidden rounded-2xl shadow-xl border border-gray-200 p-8">
            ... auth gate content ...
          </div>
        ) : (
          <BookingForm />
        )} */}

          {/* DEV MODE: Direct access to booking form */}
          <div className="relative animate-fade-in-up delay-200">
            <BookingForm />
          </div>

          {/* FAQ Section */}
          <div className="mt-16 animate-fade-in-up delay-300">
            <FAQAccordion faqs={paymentFAQs} title="Common Questions" />
          </div>
        </main>
      </div>
    </div>
  )
}
