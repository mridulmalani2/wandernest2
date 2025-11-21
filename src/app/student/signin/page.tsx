'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { CheckCircle2 } from 'lucide-react';

export default function StudentSignIn() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to onboarding after a brief moment
    const timer = setTimeout(() => {
      router.push('/student/onboarding');
    }, 1500);

    return () => clearTimeout(timer);
  }, [router]);

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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-15" />

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
                Redirecting you to get started...
              </p>
            </div>

            {/* Info Box */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 shadow-premium space-y-6">
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-bold text-base">What happens next?</h3>
                <ul className="text-sm text-gray-600 space-y-3">
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Complete your profile and verification</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>Set your availability and preferences</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Start receiving booking requests</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span>Earn money by guiding travelers</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4">
                <Link href="/student/onboarding">
                  <Button className="w-full h-12 text-base gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift" size="lg">
                    Continue to Onboarding
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-2 glass-card border-white/40 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center text-gray-700">
            <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
