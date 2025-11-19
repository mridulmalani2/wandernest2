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
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Travelers planning their adventure together"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-purple-50/85 to-pink-50/90" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-20" />

      <div className="relative z-10">
      {/* Header */}
      <header className="border-b bg-white/40 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 rounded-lg bg-gradient-primary text-white group-hover:scale-110 transition-transform duration-300">
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
                  <Button variant="outline">My Bookings</Button>
                </Link>
                <Link href="/tourist">
                  <Button variant="ghost">Home</Button>
                </Link>
              </>
            ) : (
              <Link href="/tourist">
                <Button variant="ghost">Back</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Book Your Local Guide</h1>
          <p className="text-gray-600 text-lg">
            Tell us about your trip and we'll match you with the perfect local student
            guide
          </p>
        </div>

        {/* Marketplace Disclaimer */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 border border-amber-300 rounded-2xl p-6 mb-8 max-w-4xl mx-auto shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-2 text-lg">Marketplace Notice</h3>
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
        <BookingForm />
      </main>
      </div>
    </div>
  )
}
