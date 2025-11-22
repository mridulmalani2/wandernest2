'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { OnboardingWizard } from '@/components/student/OnboardingWizard';

export default function StudentOnboarding() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      // If not authenticated, redirect to signin
      if (!session?.user) {
        router.push('/student/signin');
        return;
      }

      // Check if student has already completed onboarding
      try {
        setCheckingOnboarding(true);
        const response = await fetch(`/api/student/dashboard?email=${encodeURIComponent(session.user.email || '')}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.student?.hasCompletedOnboarding) {
            // Already onboarded, redirect to dashboard
            router.push('/student/dashboard');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setCheckingOnboarding(false);
        setLoading(false);
      }
    };

    validateSession();
  }, [session, status, router]);

  // Simplified loading state - full UI will be in OnboardingWizard
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

  if (!session) {
    return null;
  }

  return <OnboardingWizard session={session} />;
}
