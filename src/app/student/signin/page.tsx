'use client';

export const dynamic = 'force-dynamic';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Mail } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

function StudentSignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/student/onboarding';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                Use any email to sign in as a student — including Outlook, Yahoo, or university email IDs.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-4 shadow-premium animate-scale-in">
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
              </div>
            )}

            {/* Sign In Card */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              {!emailSent ? (
                <>
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@university.edu"
                          className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ui-purple-primary focus:border-transparent transition-all"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <PrimaryCTAButton
                      type="submit"
                      disabled={isSubmitting || !email}
                      variant="purple"
                      className="w-full justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span>Sending magic link...</span>
                        </>
                      ) : (
                        <span>Send Magic Link</span>
                      )}
                    </PrimaryCTAButton>
                  </form>

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
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="mb-4">
                    <div className="mx-auto w-16 h-16 bg-ui-success/20 rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-ui-success" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email!</h3>
                  <p className="text-gray-600 mb-4">
                    We've sent a magic link to <span className="font-semibold">{email}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Click the link in your email to sign in. You can close this page.
                  </p>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="mt-6 text-ui-purple-primary hover:underline text-sm font-medium"
                  >
                    Try a different email
                  </button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-base">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-ui-blue-primary flex-shrink-0 mt-0.5" />
                    <span>Complete your profile and verification</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-ui-purple-primary flex-shrink-0 mt-0.5" />
                    <span>Set your availability and preferences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-ui-success flex-shrink-0 mt-0.5" />
                    <span>Start receiving booking requests</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-ui-purple-accent flex-shrink-0 mt-0.5" />
                    <span>Earn money by guiding travelers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Tourist Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Looking to book a guide?{' '}
                <Link
                  href="/tourist/signin"
                  className="text-ui-purple-primary hover:underline font-medium"
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
