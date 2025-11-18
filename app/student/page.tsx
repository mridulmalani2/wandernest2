import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WanderNest
            </h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">
                <span className="mr-1">←</span> Back to Home
              </Button>
            </Link>
            <Link href="/student/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Hero */}
          <div className="text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Earn More Than{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Campus Jobs
              </span>
              <br />
              While Sharing Your City
            </h2>

            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Host visitors from your home country in Paris or London and earn more than typical student jobs.
              Choose your schedule, meet interesting people, and share your local knowledge.
            </p>

            <div className="flex justify-center gap-4 pt-4">
              <Link href="/student/signin">
                <Button size="lg" className="text-lg px-8 py-6">
                  Explore Now
                </Button>
              </Link>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-center mb-8">Why Guide with WanderNest?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="font-bold mb-2">Earn More</h4>
                <p className="text-sm text-gray-600">
                  Make significantly more than standard campus jobs with flexible hours
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">⏰</div>
                <h4 className="font-bold mb-2">Fully Flexible</h4>
                <p className="text-sm text-gray-600">
                  Choose your own time slots and work around your class schedule
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🌍</div>
                <h4 className="font-bold mb-2">Cultural Connection</h4>
                <p className="text-sm text-gray-600">
                  Meet visitors from your home country and share your culture
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🛡️</div>
                <h4 className="font-bold mb-2">Verified & Safe</h4>
                <p className="text-sm text-gray-600">
                  All users are verified. We screen profiles for your safety
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8">
            <h3 className="text-3xl font-bold text-center">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-blue-600">
                  1
                </div>
                <h4 className="font-bold">Sign In</h4>
                <p className="text-sm text-gray-600">
                  Use your student email (.edu) to sign in with Google
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-purple-600">
                  2
                </div>
                <h4 className="font-bold">Verify Status</h4>
                <p className="text-sm text-gray-600">
                  Upload your student ID to confirm your enrollment
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-blue-600">
                  3
                </div>
                <h4 className="font-bold">Create Profile</h4>
                <p className="text-sm text-gray-600">
                  Describe your ideal day-out and share your expertise
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-2xl font-bold text-purple-600">
                  4
                </div>
                <h4 className="font-bold">Get Requests</h4>
                <p className="text-sm text-gray-600">
                  Set your availability and start receiving booking requests
                </p>
              </div>
            </div>
          </div>

          {/* Mini FAQ */}
          <div className="bg-white rounded-2xl border p-8 md:p-12 space-y-6">
            <h3 className="text-3xl font-bold text-center mb-8">Common Questions</h3>

            <div className="space-y-4">
              <details className="group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center py-3 border-b">
                  <span>How much time do I need to commit?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 pt-3">
                  Most experiences are 3-4 hours. You set your own availability blocks and can update them anytime.
                  You're in complete control of when you're available to guide.
                </p>
              </details>

              <details className="group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center py-3 border-b">
                  <span>Do I need to speak multiple languages?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 pt-3">
                  No! We match you with visitors from your home country, so you can communicate in your native language.
                  This makes the experience more authentic and comfortable for everyone.
                </p>
              </details>

              <details className="group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center py-3 border-b">
                  <span>What about exam periods?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 pt-3">
                  You can mark specific dates or periods when you're unavailable (like exam weeks or holidays).
                  Simply update your availability calendar, and you won't receive requests during those times.
                </p>
              </details>

              <details className="group">
                <summary className="font-bold cursor-pointer list-none flex justify-between items-center py-3 border-b">
                  <span>How do I get paid?</span>
                  <span className="group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-gray-600 pt-3">
                  You arrange payment directly with tourists. WanderNest is a marketplace connector only -
                  we facilitate introductions but don't handle payments. You set your own rates and payment methods.
                </p>
              </details>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center space-y-6 py-8">
            <h3 className="text-3xl font-bold">Ready to Start Earning?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of students already earning flexible income by sharing their city with visitors.
            </p>
            <Link href="/student/signin">
              <Button size="lg" className="text-lg px-8 py-6">
                Explore Now
              </Button>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
