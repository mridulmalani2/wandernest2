'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

export const dynamic = 'force-dynamic';

function TouristAuthLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status, update } = useSession();
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const routeUser = async () => {
      if (status === 'loading') return;

      // No session - return to signin
      if (!session?.user) {
        router.replace('/tourist/signin');
        return;
      }

      // USER IS SIGNING IN FROM TOURIST FLOW - ALWAYS TREAT AS TOURIST
      // Anyone landing on this page came from /tourist/signin and should be treated as a tourist

      // If already marked as tourist, proceed to dashboard
      if (session.user.userType === 'tourist') {
        router.replace('/tourist/dashboard');
        return;
      }

      // User is not yet marked as tourist - convert them
      // This handles the case where a student account exists but user is signing in as tourist
      setIsSwitching(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/set-user-type', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userType: 'tourist' }),
        });

        if (!response.ok) {
          throw new Error('Failed to set user type to tourist');
        }

        // Update the session with the new userType
        await update();

        // Redirect to dashboard
        router.replace('/tourist/dashboard');
      } catch (err) {
        console.error('Failed to switch to tourist role:', err);
        setError(
          'We could not route you to the tourist dashboard. Please try again or contact support.'
        );
      } finally {
        setIsSwitching(false);
      }
    };

    routeUser();
  }, [router, session, status, update]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0" role="img" aria-label="Beautiful travel destination">
        <Image
          src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1920&q=80"
          alt="Beautiful travel destination"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/20 via-ui-blue-accent/15 to-ui-purple-primary/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="tourist" showBackButton backHref="/tourist" />

        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium max-w-lg w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold text-white text-shadow">Preparing your travel experience</h1>
            <p className="text-white/90 text-sm leading-relaxed">
              We&apos;re setting up your account for the tourist dashboard. This will only take a moment.
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
                  <PrimaryCTAButton href="/tourist/signin" variant="blue" className="w-full sm:w-auto">
                    Try signing in again
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

export default function TouristAuthLanding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ui-blue-primary/10 via-ui-blue-accent/10 to-ui-purple-primary/10">
          <div className="glass-card rounded-3xl border-2 border-white/40 p-6 shadow-premium text-center text-white/90">
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              <span>Preparing your travel experience…</span>
            </div>
          </div>
        </div>
      }
    >
      <TouristAuthLandingContent />
    </Suspense>
  );
}
