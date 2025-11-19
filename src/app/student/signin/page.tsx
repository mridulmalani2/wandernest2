'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-15" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b-2 glass-card border-white/40 shadow-premium animate-fade-in">
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
              <Link href="/student">
                <Button variant="ghost" className="hover-lift shadow-soft">Back to Student Page</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Sign In Form */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full space-y-8 animate-fade-in-up">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-white text-shadow-lg">Sign in as a Student Guide</h2>
              <p className="text-lg text-white text-shadow">
                {step === 'email'
                  ? 'Use your student email to get started'
                  : 'Enter the verification code sent to your email'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="glass-card bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 shadow-premium animate-scale-in">
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
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              {step === 'email' ? (
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div className="glass-frosted bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-4 shadow-soft">
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
                    className="w-full h-12 text-base gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift"
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
                  <div className="glass-frosted bg-gradient-to-br from-green-50 to-green-100/50 border-2 border-green-200 rounded-2xl p-4 shadow-soft">
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
                    className="w-full h-12 text-base gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift"
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
        <footer className="border-t-2 glass-card border-white/40 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center text-gray-700">
            <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
