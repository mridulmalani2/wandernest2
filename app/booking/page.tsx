'use client'

import Link from 'next/link'
import { BookingForm } from '@/components/booking/BookingForm'
import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function BookingPage() {
  const { data: session, status } = useSession()
  const isTourist = session?.user?.userType === 'tourist'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
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
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex items-start space-x-3">
            <div className="text-2xl flex-shrink-0">⚠️</div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Marketplace Notice</h3>
              <p className="text-sm text-yellow-800">
                <strong>WanderNest is a connection platform only.</strong> We do not handle payments, guarantee service quality, or assume liability. All services and payments are arranged directly between you and your chosen guide.
              </p>
            </div>
          </div>
        </div>

        {/* Authentication Gate */}
        {status === 'loading' ? (
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : !isTourist ? (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border p-8">
            <div className="text-center space-y-6">
              <div className="text-5xl">🔒</div>
              <h2 className="text-2xl font-bold">Sign In Required</h2>
              <p className="text-gray-600">
                To prevent spam and ensure a secure booking experience, please sign in with Google before creating a booking request.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => signIn('google', { callbackUrl: '/booking' })}
                  className="w-full flex items-center justify-center space-x-3 py-6 text-lg"
                  size="lg"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </Button>
                <p className="text-sm text-gray-500">
                  This helps us protect against spam and bots
                </p>
              </div>
            </div>
          </div>
        ) : (
          <BookingForm />
        )}
      </main>
    </div>
  )
}
