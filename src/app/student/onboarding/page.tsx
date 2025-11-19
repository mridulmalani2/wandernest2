'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { OnboardingWizard } from '@/components/student/OnboardingWizard';

export default function StudentOnboarding() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Get token from localStorage or cookie
        const token = localStorage.getItem('student_token') ||
                     document.cookie
                       .split('; ')
                       .find(row => row.startsWith('student_token='))
                       ?.split('=')[1];

        if (!token) {
          router.push('/student/signin');
          return;
        }

        // Validate session with backend
        const response = await fetch('/api/student/auth/session', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // Session invalid or expired
          localStorage.removeItem('student_token');
          document.cookie = 'student_token=; path=/; max-age=0';
          router.push('/student/signin');
          return;
        }

        const data = await response.json();

        if (data.success) {
          // Check if already onboarded
          if (data.student.hasCompletedOnboarding) {
            router.push('/student/dashboard');
            return;
          }

          // Create a session-like object for OnboardingWizard
          setSession({
            user: {
              id: data.student.id,
              email: data.student.email,
              name: data.student.name,
            },
          });
        } else {
          router.push('/student/signin');
        }
      } catch (error) {
        console.error('Session validation error:', error);
        router.push('/student/signin');
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1920&q=80"
            alt="Students celebrating success"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-blue-600/10 to-pink-600/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
