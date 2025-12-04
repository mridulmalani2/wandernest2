import Link from 'next/link';
import Image from 'next/image';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import Navigation from '@/components/Navigation';

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
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ui-success))]/15 via-[hsl(var(--ui-blue-primary))]/10 to-[hsl(var(--ui-purple-primary))]/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="student" />

        {/* Success Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
          <div className="max-w-2xl w-full text-center space-y-6 md:space-y-8 animate-fade-in-up">
            {/* Success Icon */}
            <div className="flex justify-center animate-scale-in">
              <div className="w-24 h-24 bg-gradient-to-br from-[hsl(var(--ui-success))] to-[hsl(var(--ui-success))]/80 rounded-full flex items-center justify-center shadow-premium hover:scale-110 transition-transform duration-300">
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
              <div className="inline-block glass-card-dark rounded-3xl px-8 py-6 border-2 border-white/10 shadow-premium">
                <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent drop-shadow-sm">
                  Profile Submitted Successfully!
                </h2>
                <p className="text-xl md:text-2xl text-gray-200 font-semibold drop-shadow-sm">
                  Your application is now under review
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div className="glass-card-dark rounded-3xl border-2 border-white/10 shadow-premium p-8 md:p-10 text-left hover-lift animate-fade-in delay-200">
              <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-8">What Happens Next?</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 gradient-ocean rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-2 text-white text-lg">Application Review (1-2 Business Days)</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Our team will verify your student ID and review your cover letter to ensure
                      quality standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(var(--ui-purple-accent))] to-[hsl(var(--ui-blue-accent))] rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-2 text-white text-lg">Discussion Session</h4>
                    <p className="text-gray-300 leading-relaxed">
                      We'll contact you to schedule a brief discussion session where we'll answer
                      your questions and explain what we expect from guides.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[hsl(var(--ui-success))] to-[hsl(var(--ui-success))]/80 rounded-full flex items-center justify-center shadow-soft">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold mb-2 text-white text-lg">Approval & Activation</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Once you're satisfied and we approve your profile, you'll be activated
                      as a guide and can start receiving booking requests!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Info */}
            <div className="glass-card-dark rounded-3xl border-2 border-white/10 shadow-premium p-6 md:p-8 hover-lift animate-fade-in delay-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center shadow-soft text-2xl">
                  📧
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-white text-lg mb-2">Check Your Email</h3>
                  <p className="text-gray-300 leading-relaxed">
                    We've sent a confirmation email with next steps. Please check your inbox
                    (and spam folder) for updates from our team.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in delay-400">
              <PrimaryCTAButton
                href="/"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Return to Home
              </PrimaryCTAButton>
              <PrimaryCTAButton
                href="/student"
                variant="blue"
              >
                Learn More About Guiding
              </PrimaryCTAButton>
            </div>

            {/* Support */}
            <div className="text-gray-300 font-medium animate-fade-in delay-500 pt-2">
              <p className="text-sm md:text-base">
                Have questions? Contact us at <span className="font-semibold text-white">support@tourwiseco.com</span>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t-2 glass-card-dark border-white/10 animate-fade-in">
          <div className="container mx-auto px-4 py-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} TourWiseCo. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
