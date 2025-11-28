'use client';

import Image from 'next/image';
import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

export const dynamic = 'force-dynamic';

function StudentAuthLandingContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/student/auth/session-status', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();

        if (data?.nextPath) {
          // Hamesha server se diya hua path use karo
          router.replace(data.nextPath);
          return;
        }

        // Agar kuch bhi galat ho gaya
        setError('Could not verify your session. Please sign in again.');
        setLoading(false);
      } catch (err) {
        console.error('Error checking student session:', err);
        setError('Something went wrong. Please sign in again.');
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

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
            {!error ? (
              <>
                <h1 className="text-2xl font-semibold text-white text-shadow">
                  Preparing your student experience
                </h1>
                <p className="text-white/90 text-sm leading-relaxed">
                  We&apos;re setting up your account for the student dashboard. This will only take a moment.
                </p>
                <div className="flex items-center justify-center gap-3 text-white/90 pt-4">
                  <div className="h-10 w-10 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">
                    {loading ? 'Just a moment…' : 'Almost done…'}
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-ui-error/10 border border-ui-error/40 text-ui-error rounded-2xl p-4 text-sm">
                <p className="font-semibold mb-2 text-lg">Access Issue</p>
                <p className="mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <PrimaryCTAButton href="/student/signin" variant="purple" className="w-full sm:w-auto">
                    Back to Student Sign In
                  </PrimaryCTAButton>
                  <PrimaryCTAButton href="/tourist/signin" variant="blue" className="w-full sm:w-auto">
                    Continue as Tourist
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

export default function StudentAuthLanding() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ui-blue-primary/10 via-ui-purple-primary/10 to-ui-purple-accent/10">
          <div className="glass-card rounded-3xl border-2 border-white/40 p-6 shadow-premium text-center text-white/90">
            <div className="flex items-center justify-center gap-3">
              <div className="h-8 w-8 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
              <span>Preparing your student experience…</span>
            </div>
          </div>
        </div>
      }
    >
      <StudentAuthLandingContent />
    </Suspense>
  );
}
