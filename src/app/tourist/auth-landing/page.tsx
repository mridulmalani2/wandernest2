'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

export const dynamic = 'force-dynamic';

function TouristAuthLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const routeUser = async () => {
      if (status === 'loading') return;

      // No session - return to booking flow
      if (!session?.user) {
        router.replace('/booking');
        return;
      }

      // USER ROLE IS DETERMINED BY EMAIL DOMAIN (IMMUTABLE)
      // Check if user is actually a tourist based on their email
      if (session.user.userType === 'tourist') {
        // User is a tourist - proceed to booking
        router.replace('/booking');
        return;
      }

      // User is NOT a tourist (they're a student) - show error
      // This happens when someone with a .edu email tries to access tourist features
      setError(
        'You are registered as a student with a university email address. Please use the student portal to access your account, or sign in with a non-educational email to create a tourist account.'
      );
    };

    routeUser();
  }, [router, session, status]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0" role="img" aria-label="Beautiful travel destination">
        <Image
          src="/images/backgrounds/cafe-ambiance.jpg"
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
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium max-w-lg w-full text-center space-y-4">
            {!error ? (
              <>
                <h1 className="text-2xl font-semibold text-white text-shadow">Preparing your travel experience</h1>
                <p className="text-white/90 text-sm leading-relaxed">
                  We&apos;re setting up your account for the tourist dashboard. This will only take a moment.
                </p>
                <div className="flex items-center justify-center gap-3 text-white/90 pt-4">
                  <div className="h-10 w-10 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Just a moment…</span>
                </div>
              </>
            ) : (
              <div className="bg-ui-error/10 border border-ui-error/40 text-ui-error rounded-2xl p-4 text-sm">
                <p className="font-semibold mb-2 text-lg">Access Denied</p>
                <p className="mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <PrimaryCTAButton href="/student/signin" variant="purple" className="w-full sm:w-auto">
                    Continue as Student
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
