'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

export const dynamic = 'force-dynamic';

export default function StudentAuthLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ui-blue-primary/20 to-ui-purple-accent/20 text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">Preparing your student experience…</span>
          </div>
        </div>
      }
    >
      <StudentAuthLandingContent />
    </Suspense>
  );
}

function StudentAuthLandingContent() {
export default function StudentAuthLanding() {
function StudentAuthLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent');
  const { data: session, status, update } = useSession();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const routeUser = async () => {
      if (status === 'loading') return;

      // No session - return to signin
      if (!session?.user) {
        router.replace('/student/signin');
        return;
      }

      // Already a student - go straight to onboarding/dashboard handling
      if (session.user.userType === 'student') {
        router.replace('/student/onboarding');
        return;
      }

      // Only attempt to convert when the intent is explicitly student
      if (intent !== 'student') {
        router.replace('/tourist/dashboard');
        return;
      }

      setIsSwitching(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/set-user-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType: 'student' }),
        });

        if (!response.ok) {
          throw new Error('Failed to switch user type');
        }

        await update();
        router.replace('/student/onboarding');
      } catch (err) {
        console.error('Failed to switch to student role:', err);
        setError(
          'We could not route you to the student onboarding flow. Please try again or contact support.'
        );
      } finally {
        setIsSwitching(false);
      }
    };

    routeUser();
  }, [intent, router, session, status, update]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0" role="img" aria-label="Students collaborating on campus">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students collaborating on campus"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/20 via-ui-purple-primary/15 to-ui-purple-accent/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="student" showBackButton backHref="/student" />

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium max-w-lg w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold text-white text-shadow">Preparing your student experience</h1>
            <p className="text-white/90 text-sm leading-relaxed">
              We&apos;re routing your Google sign-in to the student onboarding flow so you can verify your student status and access the
              student dashboard.
            </p>

            {isSwitching && (
              <div className="flex items-center justify-center gap-3 text-white/90">
                <div className="h-10 w-10 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Just a moment…</span>
              </div>
            )}

            {error && (
              <div className="bg-ui-error/10 border border-ui-error/40 text-ui-error rounded-2xl p-3 text-sm">
                <p className="font-semibold mb-2">Something went wrong</p>
                <p className="mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <PrimaryCTAButton href="/student/signin" variant="purple" className="w-full sm:w-auto">
                    Try signing in again
                  </PrimaryCTAButton>
                  <PrimaryCTAButton href="/tourist/dashboard" variant="ghost" className="w-full sm:w-auto">
                    Go to tourist dashboard
                  </PrimaryCTAButton>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentAuthLandingContent;
