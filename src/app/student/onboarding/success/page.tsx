import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export default function OnboardingSuccess() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Students collaborating and celebrating success">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students collaborating and celebrating success"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/15 via-blue-600/10 to-purple-600/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b-2 glass-card border-white/40 shadow-premium animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg gradient-ocean text-white group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderNest
              </h1>
            </Link>
          </div>
        </header>

        {/* Success Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in-up">
          {/* Success Icon */}
          <div className="flex justify-center animate-scale-in">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-premium hover:scale-110 transition-transform duration-300">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="animate-fade-in delay-100">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 text-shadow">Profile Submitted Successfully!</h2>
            <p className="text-xl text-gray-700 font-medium">
              Your application is now under review
            </p>
          </div>

          {/* What's Next */}
          <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 text-left space-y-6 hover-lift animate-fade-in delay-200">
            <h3 className="text-2xl font-bold text-center">What Happens Next?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 gradient-ocean rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-gray-900">Application Review (1-2 Business Days)</h4>
                  <p className="text-gray-700 text-sm">
                    Our team will verify your student ID and review your cover letter to ensure
                    quality standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 gradient-vibrant rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-gray-900">Discussion Session</h4>
                  <p className="text-gray-700 text-sm">
                    We'll contact you to schedule a brief discussion session where we'll answer
                    your questions and explain what we expect from guides.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-soft">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-gray-900">Approval & Activation</h4>
                  <p className="text-gray-700 text-sm">
                    Once you're satisfied and we approve your profile, you'll be activated
                    as a guide and can start receiving booking requests!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="glass-frosted bg-gradient-to-br from-yellow-50 to-amber-100/50 border-2 border-yellow-300/60 rounded-3xl p-6 shadow-premium hover-lift animate-fade-in delay-300">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📧</div>
              <div className="text-left">
                <h3 className="font-bold text-yellow-900 mb-2">Check Your Email</h3>
                <p className="text-sm text-yellow-800">
                  We've sent a confirmation email with next steps. Please check your inbox
                  (and spam folder) for updates from our team.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in delay-400">
            <Link href="/">
              <Button variant="outline" size="lg" className="hover-lift shadow-soft">
                Return to Home
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" className="gradient-ocean hover:shadow-glow-blue shadow-premium">
                Learn More About Guiding
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-sm text-gray-700 font-medium animate-fade-in delay-500">
            <p>Have questions? Contact us at support@wandernest.com</p>
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
