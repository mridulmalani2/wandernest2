'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TouristSignIn() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/tourist/dashboard'
  const error = searchParams.get('error')

  useEffect(() => {
    // If already signed in as tourist, redirect to dashboard
    if (session?.user && session.user.userType === 'tourist') {
      router.push(callbackUrl)
    }
  }, [session, router, callbackUrl])

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WanderNest
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/tourist">
              <Button variant="ghost">
                <span className="mr-1">←</span> Back
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-2">
              Sign in as{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tourist
              </span>
            </h2>
            <p className="text-gray-600 mt-2">
              Sign in to book guides and manage your trips
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
              <p className="text-sm text-red-800">
                {error === 'OAuthSignin'
                  ? 'Error occurred while signing in with Google'
                  : error === 'OAuthCallback'
                  ? 'Error occurred during the authentication callback'
                  : error === 'OAuthCreateAccount'
                  ? 'Could not create account with the provided information'
                  : error === 'EmailCreateAccount'
                  ? 'Could not create account with the provided email'
                  : error === 'Callback'
                  ? 'Error in the authentication callback'
                  : error === 'OAuthAccountNotLinked'
                  ? 'This email is already associated with another account'
                  : error === 'EmailSignin'
                  ? 'Check your email for the sign in link'
                  : error === 'CredentialsSignin'
                  ? 'Invalid credentials'
                  : error === 'SessionRequired'
                  ? 'Please sign in to access this page'
                  : 'An error occurred during authentication'}
              </p>
            </div>
          )}

          {/* Sign In Card */}
          <div className="bg-white rounded-xl shadow-lg border p-8 space-y-6">
            <Button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center space-x-3 py-6 text-lg"
              variant="outline"
              disabled={status === 'loading'}
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
              <span>Continue with Google</span>
            </Button>

            <div className="text-center text-sm text-gray-500">
              <p>
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">Why sign in?</h3>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>Manage all your bookings in one place</li>
                  <li>Track your trip requests and guide matches</li>
                  <li>Save time on future bookings</li>
                  <li>Communicate with your guides</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Student Link */}
          <div className="text-center">
            <p className="text-gray-600">
              Are you a student guide?{' '}
              <Link
                href="/student/signin"
                className="text-blue-600 hover:underline font-medium"
              >
                Sign in as Student
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
