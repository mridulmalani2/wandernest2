'use client';

export const dynamic = 'force-dynamic';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

function StudentSignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/student/auth-landing';
  const error = searchParams.get('error');

  useEffect(() => {
    // If already signed in as student, check onboarding status
    if (session?.user && session.user.userType === 'student') {
      if (session.user.hasCompletedOnboarding) {
        router.push('/student/dashboard');
      } else {
        router.push('/student/onboarding');
      }
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Student studying with books and learning materials">
        <Image
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80"
          alt="Student studying with books and learning materials"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/20 via-ui-purple-primary/15 to-ui-purple-accent/20" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-15" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="student" showBackButton backHref="/student" />

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full space-y-8 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2 text-white text-shadow-lg">
                Sign in as{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                  Student Guide
                </span>
              </h2>
              <p className="text-white mt-2 text-shadow">
                Sign in with your university email
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-4 shadow-premium animate-scale-in">
                <div className="space-y-2">
                  <p className="text-sm text-ui-error font-semibold">
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
                  {error && (
                    <p className="text-xs text-ui-error/80">
                      Make sure you're using your university email address (.edu, .ac.uk, etc.)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Sign In Card */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              <PrimaryCTAButton
                onClick={handleGoogleSignIn}
                disabled={status === 'loading'}
                variant="purple"
                className="w-full justify-center"
              >
                <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
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
              </PrimaryCTAButton>

              <div className="bg-ui-purple-secondary/20 border border-ui-purple-primary/30 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  <strong>📧 Use your university email</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Sign in with a .edu, .ac.uk, or other institutional email address to access student features.
                </p>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>
                  By signing in, you agree to our{' '}
                  <Link href="/terms" className="text-ui-purple-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-ui-purple-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="glass-frosted bg-ui-purple-primary/10 border-2 border-ui-purple-primary/30 rounded-2xl p-6 shadow-soft hover-lift">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎓</div>
                <div>
                  <h3 className="font-bold text-ui-purple-accent mb-2">What happens next?</h3>
                  <ul className="list-disc list-inside text-sm text-ui-purple-accent/80 space-y-1">
                    <li>Complete your profile and verification</li>
                    <li>Set your availability and preferences</li>
                    <li>Start receiving booking requests</li>
                    <li>Earn money by guiding travelers</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tourist Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Looking to book a guide?{' '}
                <Link
                  href="/tourist/signin"
                  className="text-ui-blue-primary hover:underline font-medium"
                >
                  Sign in as Tourist
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-2 glass-card border-white/40 mt-16 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center text-gray-700">
            <p>&copy; {new Date().getFullYear()} TourWiseCo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function StudentSignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ui-blue-secondary to-ui-purple-secondary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-purple-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <StudentSignInContent />
    </Suspense>
  );
}
