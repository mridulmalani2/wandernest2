'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookingForm } from '@/components/booking/BookingForm'
// import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Globe, AlertTriangle } from 'lucide-react'

// AUTH DISABLED FOR DEVELOPMENT - DATABASE_URL not configured
export default function BookingPage() {
  // const { data: session, status } = useSession()
  // const isTourist = session?.user?.userType === 'tourist'
  const isTourist = true // DEV MODE: Allow access without auth

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80)',
        }}
        role="img"
        aria-label="Travelers planning their adventure together"
      >
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-pink-600/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b-2 glass-card border-white/40 shadow-premium sticky top-0 z-50 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg gradient-ocean text-white group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderNest
              </h1>
            </Link>
            <nav className="flex items-center space-x-4">
              {isTourist ? (
                <>
                  <Link href="/tourist/dashboard">
                    <Button variant="outline" className="hover-lift shadow-soft">My Bookings</Button>
                  </Link>
                  <Link href="/tourist">
                    <Button variant="ghost" className="hover-lift shadow-soft">Home</Button>
                  </Link>
                </>
              ) : (
                <Link href="/tourist">
                  <Button variant="ghost" className="hover-lift shadow-soft">Back</Button>
                </Link>
              )}
            </nav>
          </div>
        </header>

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
          <div className="glass-frosted bg-gradient-to-br from-amber-50 to-yellow-100/50 border-2 border-amber-300 rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-premium hover-lift animate-fade-in-up delay-100">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 rounded-xl bg-amber-500 text-white shadow-soft">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-amber-900 mb-2 text-lg">Marketplace Notice</h2>
                <p className="text-sm text-amber-900 leading-relaxed">
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
        </main>
      </div>
    </div>
  )
}
