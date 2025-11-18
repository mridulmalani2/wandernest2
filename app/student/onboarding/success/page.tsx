import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OnboardingSuccess() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WanderNest
            </h1>
          </Link>
        </div>
      </header>

      {/* Success Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-4xl font-bold mb-4">Profile Submitted Successfully!</h2>
            <p className="text-xl text-gray-600">
              Your application is now under review
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-2xl border shadow-lg p-8 text-left space-y-6">
            <h3 className="text-2xl font-bold text-center">What Happens Next?</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Application Review (1-2 Business Days)</h4>
                  <p className="text-gray-600 text-sm">
                    Our team will verify your student ID and review your cover letter to ensure
                    quality standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Discussion Session</h4>
                  <p className="text-gray-600 text-sm">
                    We'll contact you to schedule a brief discussion session where we'll answer
                    your questions and explain what we expect from guides.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Approval & Activation</h4>
                  <p className="text-gray-600 text-sm">
                    Once you're satisfied and we approve your profile, you'll be activated
                    as a guide and can start receiving booking requests!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/">
              <Button variant="outline" size="lg">
                Return to Home
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg">
                Learn More About Guiding
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-sm text-gray-500">
            <p>Have questions? Contact us at support@wandernest.com</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
