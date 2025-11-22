'use client';

export const dynamic = 'force-dynamic';

import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

export default function StudentSignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/student/onboarding';
  const error = searchParams.get('error');

  useEffect(() => {
    // If already signed in as student, redirect to onboarding or dashboard
    if (session?.user && session.user.userType === 'student') {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

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
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-white text-shadow-lg">Welcome, Student Guide!</h2>
              <p className="text-lg text-white text-shadow">
                Sign in to get started
              </p>
            </div>

            {/* Sign-in Box */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  Authentication failed. Please try again.
                </div>
              )}

              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={status === 'loading'}
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 font-medium py-6 rounded-xl border-2 border-gray-200 shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </div>

              <div className="border-t pt-6 space-y-3">
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
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-2 glass-card border-white/40 mt-16 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center text-gray-700">
            <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
