'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { OnboardingWizard } from '@/components/student/OnboardingWizard';

interface SessionLike {
  user: {
    email: string | null;
    userType: 'student';
    name?: string | null;
  };
}

export default function StudentOnboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionLike, setSessionLike] = useState<SessionLike | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ Check our custom OTP session
        const res = await fetch('/api/student/auth/session-status');

        if (!res.ok) {
          router.push('/student/signin');
          return;
        }

        const data = await res.json();

        // Not logged in / invalid session → back to signin
        if (!data.ok) {
          router.push('/student/signin');
          return;
        }

        // If backend already knows onboarding is done → straight to dashboard
        if (data.hasCompletedOnboarding || data.student?.hasCompletedOnboarding) {
          router.push('/student/dashboard');
          return;
        }

        const email =
          data.email ??
          data.student?.email ??
          null;

        // Hum ek "fake" NextAuth-style session object bana rahe hain
        // taaki OnboardingWizard ka existing prop `session` reuse ho jaye.
        setSessionLike({
          user: {
            email,
            userType: 'student',
            name: data.student?.name ?? null,
          },
        });
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        router.push('/student/signin');
        return;
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  // Loading state - same UI as before
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background Image with Overlays */}
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
          {/* Dark overlay for text contrast */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          {/* Gradient overlay for visual depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ui-purple-accent))]/15 via-[hsl(var(--ui-blue-primary))]/10 to-[hsl(var(--ui-purple-primary))]/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--ui-blue-accent))] mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading...</p>
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
  return <OnboardingWizard session={sessionLike as any} />;
}
