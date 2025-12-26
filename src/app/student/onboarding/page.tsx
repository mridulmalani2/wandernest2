'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { Session } from 'next-auth';
import { OnboardingWizard } from '@/components/student/OnboardingWizard';

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.replace(/[\r\n]+/g, ' ').trim();
  return normalized.length > 0 ? normalized : null;
};

export default function StudentOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionLike, setSessionLike] = useState<Session | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const init = async () => {
      try {
        // ✅ Check our custom OTP session
        const res = await fetch('/api/student/auth/session-status', {
          signal: controller.signal,
        });

        if (res.status === 401) {
          router.push('/student/signin');
          return;
        }

        if (!res.ok) {
          setLoading(false);
          router.push('/student/signin');
          return;
        }

        const isJson = res.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await res.json().catch(() => null) : null;

        // Not logged in / invalid session → back to signin
        if (!data?.ok) {
          router.push('/student/signin');
          return;
        }

        // If backend already knows onboarding is done → straight to dashboard
        if (data.hasCompletedOnboarding || data.student?.hasCompletedOnboarding) {
          router.push('/student/dashboard');
          return;
        }

        const email =
          normalizeString(data?.email) ??
          normalizeString(data?.student?.email);
        const name = normalizeString(data?.student?.name);
        const id =
          normalizeString(data?.student?.id) ??
          normalizeString(data?.user?.id) ??
          'student-onboarding';

        if (!email) {
          router.push('/student/signin');
          return;
        }

        // Create a session-like object for the wizard
        const session: Session = {
          user: {
            id,
            email,
            name,
            image: null,
          },
          expires: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        };

        setSessionLike(session);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.push('/student/signin');
        return;
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => controller.abort();
  }, [router]);

  // Loading state - same UI as before
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
        {/* Background Image with Overlays */}
        <div className="absolute inset-0" role="img" aria-label="Modern university learning space">
          <Image
            src="/images/backgrounds/cafe-ambiance.jpg"
            alt="Modern university lecture hall with natural light"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-5" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card-dark rounded-3xl p-8 shadow-premium animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-white font-medium">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Agar kisi reason se session object nahi bana, kuch mat dikhana
  if (!sessionLike) {
    return null;
  }

  // Existing wizard ko fake session de diye
  return <OnboardingWizard session={sessionLike} />;
}
