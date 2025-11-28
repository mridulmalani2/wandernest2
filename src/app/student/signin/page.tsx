'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import { Input } from '@/components/ui/input';
import {
  isStudentEmail,
  isValidEmailFormat,
  getStudentEmailErrorMessage,
} from '@/lib/email-validation';

type Step = 'email' | 'otp';

function StudentSignInContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/student/auth-landing';
  const urlError = searchParams.get('error'); // next-auth wale errors agar aaye to

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('email');
  const [code, setCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false); // email submit
  const [isVerifying, setIsVerifying] = useState(false); // otp verify
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [domainValidationError, setDomainValidationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // already logged in as student → redirect
  useEffect(() => {
    if (session?.user && session.user.userType === 'student') {
      if (session.user.hasCompletedOnboarding) {
        router.push('/student/dashboard');
      } else {
        router.push('/student/onboarding');
      }
    }
  }, [session, router]);

  // STEP 1: Email → request OTP
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setEmailErrorMessage(null);
    setDomainValidationError(null);
    setMessage(null);

    // format check
    if (!isValidEmailFormat(email)) {
      setDomainValidationError('Please enter a valid email address.');
      return;
    }

    // domain check (student email)
    if (!isStudentEmail(email)) {
      setDomainValidationError(getStudentEmailErrorMessage(email));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/student/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setEmailErrorMessage(
          data.error || 'Could not send verification code. Please try again.'
        );
        return;
      }

      setMessage('We’ve sent a 6-digit verification code to your email.');
      setStep('otp');
    } catch (error) {
      console.error('OTP request error:', error);
      setEmailErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2: Verify OTP
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setEmailErrorMessage(null);
    setDomainValidationError(null);
    setMessage(null);

    setIsVerifying(true);
    try {
      const res = await fetch('/api/student/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setEmailErrorMessage(
          data.error || 'Invalid or expired code. Please try again.'
        );
        return;
      }

      // backend StudentSession cookie set karega
      setMessage('Signed in successfully. Redirecting…');
      router.push(callbackUrl);
    } catch (error) {
      console.error('OTP verify error:', error);
      setEmailErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // resend OTP
  const handleResend = async () => {
    if (!email || isSubmitting || isVerifying) return;
    setEmailErrorMessage(null);
    setDomainValidationError(null);
    setMessage(null);

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/student/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEmailErrorMessage(
          data.error || 'Could not resend code. Please try again.'
        );
        return;
      }

      setMessage('New code sent to your email.');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setEmailErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const anyError = domainValidationError || emailErrorMessage || urlError;

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
                Use your university email (.edu, .ac.uk, etc.)
              </p>
            </div>

            {/* Error Messages */}
            {anyError && (
              <div className="glass-card bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-4 shadow-premium animate-scale-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-ui-error flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-ui-error font-semibold">
                      {domainValidationError ||
                        emailErrorMessage ||
                        (urlError === 'EmailSignin'
                          ? 'An error occurred during authentication'
                          : 'An error occurred during authentication')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info / success message */}
            {message && (
              <div className="glass-card bg-emerald-500/10 border-2 border-emerald-400/40 rounded-2xl p-3 text-sm text-emerald-100 shadow-premium">
                {message}
              </div>
            )}

            {/* Sign In Card */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              {step === 'email' ? (
                <>
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
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
                            setMessage(null);
                          }}
                          placeholder="your.email@university.edu"
                          className="pl-12"
                          disabled={isSubmitting || isVerifying}
                        />
                      </div>
                      <p className="text-xs text-gray-200 mt-1">
                        We’ll send a 6-digit verification code to your email.
                      </p>
                    </div>

                    <PrimaryCTAButton
                      type="submit"
                      disabled={isSubmitting || !email}
                      variant="purple"
                      className="w-full justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <span>Send verification code</span>
                      )}
                    </PrimaryCTAButton>
                  </form>

                  <div className="text-center text-sm text-gray-200">
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
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-ui-blue-secondary/30 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-8 h-8 text-ui-blue-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Enter your verification code
                    </h3>
                    <p className="text-sm text-gray-200">
                      We’ve sent a 6-digit code to{' '}
                      <span className="font-semibold">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpVerify} className="space-y-4">
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-100 mb-2"
                      >
                        6-digit code
                      </label>
                      <Input
                        id="code"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={code}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, ''))
                        }
                        placeholder="••••••"
                        className="text-center tracking-[0.5em] text-lg font-semibold"
                        disabled={isVerifying || isSubmitting}
                        required
                      />
                      <p className="text-xs text-gray-200 mt-1">
                        Code is valid for 10 minutes.
                      </p>
                    </div>

                    <PrimaryCTAButton
                      type="submit"
                      disabled={isVerifying || code.length !== 6}
                      variant="purple"
                      className="w-full justify-center"
                    >
                      {isVerifying ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <span>Verify & continue</span>
                      )}
                    </PrimaryCTAButton>
                  </form>

                  <div className="flex flex-col gap-2 text-center text-xs text-gray-200">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting || isVerifying}
                      className="text-ui-blue-primary hover:underline disabled:opacity-60"
                    >
                      Didn’t get the code? Resend
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setMessage(null);
                        setEmailErrorMessage(null);
                      }}
                      className="text-gray-300 hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="glass-frosted bg-ui-purple-primary/10 border-2 border-ui-purple-primary/30 rounded-2xl p-6 shadow-soft hover-lift">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">🎓</div>
                <div>
                  <h3 className="font-bold text-ui-purple-accent mb-2">
                    What happens next?
                  </h3>
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
              <p className="text-gray-200">
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
          <div className="container mx-auto px-4 py-8 text-center text-gray-100">
            <p>&copy; {new Date().getFullYear()} TourWiseCo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function StudentSignIn() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ui-blue-secondary to-ui-purple-secondary">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-purple-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <StudentSignInContent />
    </Suspense>
  );
}
