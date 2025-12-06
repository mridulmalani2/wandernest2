'use client';

export const dynamic = 'force-dynamic';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [rememberMe, setRememberMe] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false); // email submit
  const [isVerifying, setIsVerifying] = useState(false); // otp verify
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
  const [domainValidationError, setDomainValidationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Check if already logged in via custom session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/student/auth/session-status');
        const data = await res.json();
        if (data.ok && data.nextPath && data.nextPath.startsWith('/')) {
          router.replace(data.nextPath);
        }
      } catch (error) {
        // Ignore error, just stay on sign-in page
      }
    };
    checkSession();
  }, [router]);

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

      if (!res.ok) {
        throw new Error('Failed to send OTP');
      }

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
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setEmailErrorMessage('Please enter a valid 6-digit code.');
      return;
    }

    setEmailErrorMessage(null);
    setDomainValidationError(null);
    setMessage(null);

    setIsVerifying(true);
    try {
      const res = await fetch('/api/student/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, rememberMe }),
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
      router.replace(callbackUrl);
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
      const res = await fetch('/api/student/auth/send-otp', {
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80"
          alt="Student studying with books and learning materials"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-5" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
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
              <p className="text-gray-300 mt-2 text-shadow">
                Use your university email (.edu, .ac.uk, etc.)
              </p>
            </div>

            {/* Error Messages */}
            {anyError && (
              <div className="glass-card-dark bg-red-900/20 border-2 border-red-500/20 rounded-2xl p-4 shadow-premium animate-scale-in">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-300 font-semibold">
                      {domainValidationError ||
                        emailErrorMessage ||
                        (urlError ? 'An error occurred during authentication' : '')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info / success message */}
            {message && (
              <div className="glass-card-dark bg-green-900/20 border-2 border-green-500/20 rounded-2xl p-4 shadow-premium backdrop-blur-md animate-scale-in">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300 font-semibold flex-1">{message}</p>
                </div>
              </div>
            )}

            {/* Sign In Card */}
            <div className="glass-card-dark rounded-3xl border-2 border-white/10 p-8 shadow-premium space-y-6">
              {step === 'email' ? (
                <>
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-300 mb-2"
                      >
                        University Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-500" />
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
                          className="pl-12 h-12 text-base bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                          disabled={isSubmitting || isVerifying}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        We'll send a 6-digit verification code to your email.
                      </p>
                    </div>

                    <PrimaryCTAButton
                      type="submit"
                      disabled={isSubmitting || !email}
                      isLoading={isSubmitting}
                      loadingText="Sending code..."
                      variant="purple"
                      className="w-full justify-center"
                    >
                      Send verification code
                    </PrimaryCTAButton>
                  </form>

                  <div className="text-center text-sm text-gray-400">
                    <p>
                      By signing in, you agree to our{' '}
                      <Link href="/terms" className="text-purple-400 hover:underline font-semibold">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-purple-400 hover:underline font-semibold">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-3">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Enter your verification code
                    </h3>
                    <p className="text-sm text-gray-300 font-medium">
                      We've sent a 6-digit code to{' '}
                      <span className="font-bold text-purple-400">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpVerify} className="space-y-4">
                    <div>
                      <label
                        htmlFor="code"
                        className="block text-sm font-semibold text-gray-300 mb-2"
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
                        className="text-center tracking-[0.5em] text-2xl font-bold h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                        disabled={isVerifying || isSubmitting}
                        required
                      />
                      <p className="text-xs text-gray-400 mt-2 font-medium">
                        Code is valid for 10 minutes.
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500/50 focus:ring-offset-0"
                      />
                      <label htmlFor="rememberMe" className="text-sm text-gray-300 select-none cursor-pointer">
                        Stay signed in on this device
                      </label>
                    </div>

                    <PrimaryCTAButton
                      type="submit"
                      disabled={isVerifying || code.length !== 6}
                      isLoading={isVerifying}
                      loadingText="Verifying..."
                      variant="purple"
                      className="w-full justify-center"
                    >
                      Verify & continue
                    </PrimaryCTAButton>
                  </form>

                  <div className="flex flex-col gap-2 text-center text-sm">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isSubmitting || isVerifying}
                      className="text-purple-400 font-semibold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      Didn't get the code? Resend
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setMessage(null);
                        setEmailErrorMessage(null);
                      }}
                      className="text-gray-400 hover:underline"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="glass-card-dark bg-purple-900/20 border-2 border-purple-500/20 rounded-2xl p-6 shadow-lg hover-lift backdrop-blur-md">
              <div className="flex items-start space-x-3">
                <div className="text-3xl">🎓</div>
                <div>
                  <h3 className="font-bold text-purple-300 mb-3 text-lg">
                    What happens next?
                  </h3>
                  <ul className="list-disc list-inside text-sm text-purple-200 space-y-2 font-medium">
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
              <p className="text-white font-medium text-shadow">
                Looking to book a guide?{' '}
                <Link
                  href="/booking"
                  className="text-blue-300 hover:text-blue-200 hover:underline font-bold"
                >
                  Sign in as Tourist
                </Link>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-2 glass-card-dark border-white/10 mt-16 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-gray-400 font-medium text-shadow">&copy; {new Date().getFullYear()} TourWiseCo. All rights reserved.</p>
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
