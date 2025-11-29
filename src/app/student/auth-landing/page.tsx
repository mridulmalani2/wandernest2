'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function StudentAuthLanding() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/student/auth/session-status', {
          method: 'GET',
          credentials: 'include',
        });

        const data = await res.json();
        console.log('session-status response:', data);
        setDebug(data);

        if (!res.ok) {
          setError('Something went wrong while checking your session.');
          return;
        }

        if (data?.nextPath) {
          router.replace(data.nextPath);
        } else {
          setError('Could not determine where to send you. Please sign in again.');
        }
      } catch (err) {
        console.error('session-status error:', err);
        setError('Network error while checking your session. Please try again.');
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students collaborating on campus"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium max-w-lg w-full text-center space-y-4">
          {!error ? (
            <>
              <h1 className="text-2xl font-semibold text-white text-shadow">
                Loading your dashboard…
              </h1>
              <p className="text-white/90 text-sm">
                We&apos;re verifying your session and getting your student dashboard ready.
              </p>
              <div className="flex items-center justify-center gap-3 text-white/90 pt-4">
                <div className="h-10 w-10 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Just a moment…</span>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-red-200 mb-2">Something went wrong</h1>
              <p className="text-red-100 text-sm mb-4">{error}</p>
              <button
                onClick={() => router.replace('/student/signin')}
                className="text-sm font-medium text-white underline"
              >
                Go back to sign in
              </button>

              {debug && (
                <pre className="mt-4 text-xs text-left text-gray-200 bg-black/30 p-3 rounded-lg max-h-40 overflow-auto">
                  {JSON.stringify(debug, null, 2)}
                </pre>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
