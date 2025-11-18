'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Globe, AlertCircle, Info, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function StudentSignIn() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setStep('verify');
      } else {
        setError(data.message || data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/student/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the token in localStorage and cookie
        localStorage.setItem('student_token', data.token);
        document.cookie = `student_token=${data.token}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days

        // Redirect based on onboarding status
        router.push(data.redirectTo || '/student/onboarding');
      } else {
        setError(data.error || 'Invalid verification code');
        if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        if (data.action === 'regenerate') {
          setStep('email');
          setCode('');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    setCode('');
    setAttemptsRemaining(3);

    try {
      const response = await fetch('/api/student/auth/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setError('');
        alert('New verification code sent to your email!');
      } else {
        setError(data.message || data.error || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
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
              <Link href="/student">
                <Button variant="ghost" className="hover-lift">Back to Student Page</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Sign In Form */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full space-y-8 animate-fade-in-up">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold">Sign in as a Student Guide</h2>
              <p className="text-lg text-gray-600">
                {step === 'email'
                  ? 'Use your student email to get started'
                  : 'Enter the verification code sent to your email'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-300 rounded-2xl p-4 shadow-lg animate-scale-in">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Error</h3>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Sign In Box */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-8 shadow-xl space-y-6">
              {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 font-semibold mb-2">
                          Student Email Required
                        </p>
                        <p className="text-xs text-blue-800 leading-relaxed mb-1">
                          Only student email domains are allowed (.edu, .edu.in, .ac.uk, etc.)
                        </p>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Works with any email provider: Gmail, Outlook, Yahoo, etc.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base">Student Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.name@university.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 text-base"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                    size="lg"
                    disabled={loading || !email}
                  >
                    {loading ? 'Sending...' : 'Send Verification Code'}
                  </Button>

                  <p className="text-xs text-gray-500 text-center leading-relaxed">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-green-900 font-semibold mb-2">
                          Check Your Email
                        </p>
                        <p className="text-xs text-green-800 leading-relaxed mb-1">
                          We sent a 6-digit verification code to <strong>{email}</strong>
                        </p>
                        <p className="text-xs text-green-800 leading-relaxed">
                          Attempts remaining: {attemptsRemaining}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-base">Verification Code</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      disabled={loading}
                      className="h-14 text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity shadow-lg"
                    size="lg"
                    disabled={loading || code.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify Email'}
                  </Button>

                  <div className="flex justify-between items-center text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setCode('');
                        setError('');
                        setAttemptsRemaining(3);
                      }}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Change Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={loading}
                      className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Resend Code
                    </button>
                  </div>
                </form>
              )}

              {step === 'email' && (
                <div className="border-t pt-6 space-y-3">
                  <h3 className="font-bold text-base">What happens next?</h3>
                  <ul className="text-sm text-gray-600 space-y-3">
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>Enter your student email address</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      <span>Receive a verification code via email</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>Complete your profile and verification</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                      <span>Set your availability and start receiving bookings</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
