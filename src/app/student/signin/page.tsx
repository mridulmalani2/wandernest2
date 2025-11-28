'use client';

export const dynamic = 'force-dynamic';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import { Input } from '@/components/ui/input';
import { isStudentEmail, isValidEmailFormat, getStudentEmailErrorMessage } from '@/lib/email-validation';

function StudentSignInContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/student/auth-landing';
  const error = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailProviderAvailable, setEmailProviderAvailable] = useState<boolean | null>(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [domainValidationError, setDomainValidationError] = useState<string | null>(null);
  const [isCheckingProvider, setIsCheckingProvider] = useState(true);

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

  // Check if email provider is configured
  useEffect(() => {
    const checkEmailProvider = async () => {
      setIsCheckingProvider(true);
      try {
        const response = await fetch('/api/auth/provider-status');
        if (response.ok) {
          const data = await response.json();
          const isEmailAvailable = data.providers?.email ?? false;
          setEmailProviderAvailable(isEmailAvailable);
        } else {
          setEmailProviderAvailable(true);
        }
      } catch (error) {
        setEmailProviderAvailable(true);
      } finally {
        setIsCheckingProvider(false);
      }
    };

    checkEmailProvider();
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Clear previous errors
    setEmailErrorMessage(null);
    setDomainValidationError(null);

    // Validate email format
    if (!isValidEmailFormat(email)) {
      setDomainValidationError('Please enter a valid email address.');
      return;
    }

    // Validate email domain for students
    if (!isStudentEmail(email)) {
      setDomainValidationError(getStudentEmailErrorMessage(email));
      return;
    }

    // Check if email provider is available
    if (emailProviderAvailable === false) {
      setEmailErrorMessage(
        'Magic link sign-in is temporarily unavailable. Please contact support.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        console.error('Sign-in error:', result.error);
        if (result.error === 'EmailSignin') {
          setEmailErrorMessage(
            'Could not send magic link. The email service may not be configured correctly. Please contact support or try signing in with Google if you have a university Google account.'
          );
        } else {
          setEmailErrorMessage(`Sign-in failed: ${result.error}. Please try again or contact support.`);
        }
      } else if (result?.ok) {
        setEmailSent(true);
      }
    } catch (error) {
      setEmailErrorMessage('An unexpected error occurred. Please try again or contact support.');
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
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/20 via-ui-purple-primary/15 to-ui-purple-accent/20" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-15" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
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
                Use your approved university email (HEC, Ashoka, etc.)
              </p>
            </div>

            {/* Error Messages */}
            {(error || emailErrorMessage || domainValidationError) && (
              <div className="glass-card bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-4 shadow-premium animate-scale-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-ui-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-ui-error font-semibold">
                      {domainValidationError || emailErrorMessage ||
                        (error === 'EmailSignin' ? 'Check your email for the sign in link' :
                         'An error occurred during authentication')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Provider Not Configured Warning */}
            {emailProviderAvailable === false && !isCheckingProvider && (
              <div className="glass-card bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-4 shadow-premium animate-scale-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-ui-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-ui-error font-semibold mb-2">
                      Magic Link Sign-In Unavailable
                    </p>
                    <p className="text-sm text-gray-700">
                      The email authentication service is not configured. Please contact support.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Card */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              {!emailSent ? (
                <>
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        University Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (domainValidationError) setDomainValidationError(null);
                            if (emailErrorMessage) setEmailErrorMessage(null);
                          }}
                          placeholder="student@hec.edu or student@ashoka.edu.in"
                          className="pl-12"
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Only approved university domains allowed • We'll send a secure sign-in link
                      </p>
                    </div>

                    <PrimaryCTAButton
                      type="submit"
                      disabled={isSubmitting || !email || (emailProviderAvailable === false && !isCheckingProvider)}
                      variant="purple"
                      className="w-full justify-center"
                    >
                      {isCheckingProvider ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span>Checking availability...</span>
                        </>
                      ) : emailProviderAvailable === false ? (
                        <span>Sign-In Unavailable</span>
                      ) : isSubmitting ? (
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
                      <CheckCircle2 className="w-8 h-8 text-ui-success" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Check your inbox!</h3>
                  <p className="text-gray-600 mb-4">
                    We've sent a magic sign-in link to <span className="font-semibold">{email}</span>
                  </p>
                  <div className="bg-ui-blue-secondary/20 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-700"><strong>Next steps:</strong></p>
                    <ol className="text-sm text-gray-600 mt-2 space-y-1 text-left">
                      <li>1. Open your university email inbox</li>
                      <li>2. Click the secure sign-in link</li>
                      <li>3. You'll be automatically signed in</li>
                    </ol>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    The link expires in 24 hours and can only be used once.
                  </p>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-ui-purple-primary hover:underline text-sm font-medium"
                  >
                    Try a different email address
                  </button>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="glass-frosted bg-ui-purple-primary/10 border-2 border-ui-purple-primary/30 rounded-2xl p-6 shadow-soft hover-lift">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎓</div>
                <div>
                  <h3 className="font-bold text-ui-purple-accent mb-2">Approved Universities</h3>
                  <p className="text-sm text-ui-purple-accent/80 mb-2">
                    TourWiseCo partners with specific universities:
                  </p>
                  <ul className="list-disc list-inside text-sm text-ui-purple-accent/80 space-y-1">
                    <li>HEC Paris (hec.edu, hec.fr)</li>
                    <li>Ashoka University (ashoka.edu.in)</li>
                    <li>Select .edu institutions (Stanford, MIT, Harvard, etc.)</li>
                  </ul>
                  <p className="text-xs text-ui-purple-accent/60 mt-3">
                    University not listed? Contact support to request approval.
                  </p>
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
