import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, DollarSign, Clock, Users, Shield, ChevronLeft, CheckCircle } from 'lucide-react'

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-mesh" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg bg-gradient-primary text-white group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderNest
              </h1>
            </Link>
            <nav className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" className="hover-lift">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                </Button>
              </Link>
              <Link href="/student/signin">
                <Button variant="outline" className="hover-lift">Sign In</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-20">

            {/* Hero */}
            <div className="text-center space-y-8 animate-fade-in-down">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Earn More Than{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Campus Jobs
                </span>
                <br />
                While Sharing Your City
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Host visitors from your home country in Paris or London and earn more than typical student jobs.
                Choose your schedule, meet interesting people, and share your local knowledge.
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <Link href="/student/signin">
                  <Button size="lg" className="text-lg px-8 py-6 gradient-primary hover:opacity-90 transition-opacity shadow-lg">
                    Explore Now
                  </Button>
                </Link>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-gray-200 animate-fade-in-up">
              <h3 className="text-4xl font-bold text-center mb-12">Why Guide with WanderNest?</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-sm hover-lift group">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Earn More</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Make significantly more than standard campus jobs with flexible hours
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 shadow-sm hover-lift group">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Fully Flexible</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Choose your own time slots and work around your class schedule
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 shadow-sm hover-lift group">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Cultural Connection</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Meet visitors from your home country and share your culture
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-6 shadow-sm hover-lift group">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Verified & Safe</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    All users are verified. We screen profiles for your safety
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-10 animate-fade-in-up delay-100">
              <h3 className="text-4xl font-bold text-center">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center space-y-4 group">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    1
                  </div>
                  <h4 className="font-bold text-lg">Sign In</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Use your student email (.edu) to sign in with Google
                  </p>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    2
                  </div>
                  <h4 className="font-bold text-lg">Verify Status</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Upload your student ID to confirm your enrollment
                  </p>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    3
                  </div>
                  <h4 className="font-bold text-lg">Create Profile</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Describe your ideal day-out and share your expertise
                  </p>
                </div>

                <div className="text-center space-y-4 group">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    4
                  </div>
                  <h4 className="font-bold text-lg">Get Requests</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Set your availability and start receiving booking requests
                  </p>
                </div>
              </div>
            </div>

            {/* Mini FAQ */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 p-8 md:p-12 shadow-xl animate-fade-in-up delay-200">
              <h3 className="text-4xl font-bold text-center mb-10">Common Questions</h3>

              <div className="space-y-4">
                <details className="group rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-colors">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg">How much time do I need to commit?</span>
                    <CheckCircle className="w-5 h-5 text-blue-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    Most experiences are 3-4 hours. You set your own availability blocks and can update them anytime.
                    You&apos;re in complete control of when you&apos;re available to guide.
                  </p>
                </details>

                <details className="group rounded-lg border border-gray-200 p-4 hover:border-purple-300 transition-colors">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg">Do I need to speak multiple languages?</span>
                    <CheckCircle className="w-5 h-5 text-purple-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    No! We match you with visitors from your home country, so you can communicate in your native language.
                    This makes the experience more authentic and comfortable for everyone.
                  </p>
                </details>

                <details className="group rounded-lg border border-gray-200 p-4 hover:border-green-300 transition-colors">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg">What about exam periods?</span>
                    <CheckCircle className="w-5 h-5 text-green-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    You can mark specific dates or periods when you&apos;re unavailable (like exam weeks or holidays).
                    Simply update your availability calendar, and you won&apos;t receive requests during those times.
                  </p>
                </details>

                <details className="group rounded-lg border border-gray-200 p-4 hover:border-pink-300 transition-colors">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg">How do I get paid?</span>
                    <CheckCircle className="w-5 h-5 text-pink-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    You arrange payment directly with tourists. WanderNest is a marketplace connector only -
                    we facilitate introductions but don&apos;t handle payments. You set your own rates and payment methods.
                  </p>
                </details>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-6 py-12 animate-fade-in-up delay-300">
              <h3 className="text-4xl font-bold">Ready to Start Earning?</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of students already earning flexible income by sharing their city with visitors.
              </p>
              <Link href="/student/signin">
                <Button size="lg" className="text-lg px-8 py-6 gradient-primary hover:opacity-90 transition-opacity shadow-lg">
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
    </div>
  )
}
