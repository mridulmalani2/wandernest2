import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Globe, DollarSign, Clock, Users, Shield, ChevronLeft, CheckCircle } from 'lucide-react'

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with Paris imagery */}
      <div className="absolute inset-0">
        <Image
          src="/images/paris/paris-street.jpg"
          alt="Paris street"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/95 via-white/98 to-blue-50/95" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-30" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/20 backdrop-blur-md bg-white/50 sticky top-0 z-50 shadow-soft animate-fade-in-down">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg gradient-vibrant text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-premium">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-gradient-vibrant">
                WanderNest
              </h1>
            </Link>
            <nav className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" className="hover-lift hover:bg-purple-50">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
                </Button>
              </Link>
              <Link href="/student/signin">
                <Button variant="outline" className="hover-lift border-2 hover:border-purple-400 hover:text-purple-600">Sign In</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-20">

            {/* Hero */}
            <div className="text-center space-y-8 animate-slide-up-fade">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                Earn More Than{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                  Campus Jobs
                </span>
                <br />
                While Sharing Your City
              </h2>

              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                Host visitors from your home country in Paris or London and earn more than typical student jobs.
                Choose your schedule, meet interesting people, and share your local knowledge.
              </p>

              <div className="flex justify-center gap-4 pt-4 animate-fade-in-up delay-300">
                <Link href="/student/signin">
                  <Button size="lg" className="text-lg px-10 py-7 gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-semibold group hover-lift">
                    Explore Now
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 animate-fade-in-up relative overflow-hidden">
              <div className="absolute inset-0 opacity-5">
                <Image
                  src="/images/paris/arc-de-triomphe.jpg"
                  alt="Arc de Triomphe"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative z-10 p-8 md:p-12">
                <h3 className="text-4xl font-bold text-center mb-12">Why Guide with WanderNest?</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-sm hover-lift group">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-blue-700 transition-colors">Earn More</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Make significantly more than standard campus jobs with flexible hours
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 shadow-soft hover:shadow-premium hover-lift-lg group border-2 border-purple-100/60 hover:border-purple-300/60 transition-all">
                  <div className="inline-flex p-3 rounded-xl gradient-vibrant text-white mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-glow-purple">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-purple-700 transition-colors">Fully Flexible</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Choose your own time slots and work around your class schedule
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 shadow-soft hover:shadow-premium hover-lift-lg group border-2 border-green-100/60 hover:border-green-300/60 transition-all">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-soft">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-green-700 transition-colors">Cultural Connection</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Meet visitors from your home country and share your culture
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 rounded-2xl p-6 shadow-soft hover:shadow-premium hover-lift-lg group border-2 border-indigo-100/60 hover:border-indigo-300/60 transition-all">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-soft">
                    <Shield className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 group-hover:text-indigo-700 transition-colors">Verified & Safe</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    All users are verified. We screen profiles for your safety
                  </p>
                </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-10 animate-fade-in-up delay-500">
              <h3 className="text-4xl font-bold text-center text-gradient-vibrant">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-ocean rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-glow-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    1
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-blue-700 transition-colors">Sign In</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Use your student email (.edu) to sign in with Google
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-vibrant rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-glow-purple group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    2
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-purple-700 transition-colors">Verify Status</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Upload your student ID to confirm your enrollment
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    3
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-green-700 transition-colors">Create Profile</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Describe your ideal day-out and share your expertise
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-sunset rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    4
                  </div>
                  <h4 className="font-bold text-lg group-hover:text-pink-700 transition-colors">Get Requests</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Set your availability and start receiving booking requests
                  </p>
                </div>
              </div>
            </div>

            {/* Mini FAQ */}
            <div className="glass-card rounded-3xl border-2 border-white/40 p-8 md:p-12 shadow-premium hover:shadow-elevated animate-fade-in-up delay-700">
              <h3 className="text-4xl font-bold text-center mb-10 text-gradient-vibrant">Common Questions</h3>

              <div className="space-y-4">
                <details className="group rounded-xl border-2 border-gray-200 p-5 hover:border-blue-400 hover:shadow-soft transition-all hover-lift bg-white/50">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg group-hover:text-blue-700 transition-colors">How much time do I need to commit?</span>
                    <CheckCircle className="w-5 h-5 text-blue-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    Most experiences are 3-4 hours. You set your own availability blocks and can update them anytime.
                    You&apos;re in complete control of when you&apos;re available to guide.
                  </p>
                </details>

                <details className="group rounded-xl border-2 border-gray-200 p-5 hover:border-purple-400 hover:shadow-soft transition-all hover-lift bg-white/50">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg group-hover:text-purple-700 transition-colors">Do I need to speak multiple languages?</span>
                    <CheckCircle className="w-5 h-5 text-purple-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    No! We match you with visitors from your home country, so you can communicate in your native language.
                    This makes the experience more authentic and comfortable for everyone.
                  </p>
                </details>

                <details className="group rounded-xl border-2 border-gray-200 p-5 hover:border-green-400 hover:shadow-soft transition-all hover-lift bg-white/50">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg group-hover:text-green-700 transition-colors">What about exam periods?</span>
                    <CheckCircle className="w-5 h-5 text-green-600 group-open:rotate-180 transition-transform" />
                  </summary>
                  <p className="text-gray-600 pt-4 leading-relaxed">
                    You can mark specific dates or periods when you&apos;re unavailable (like exam weeks or holidays).
                    Simply update your availability calendar, and you won&apos;t receive requests during those times.
                  </p>
                </details>

                <details className="group rounded-xl border-2 border-gray-200 p-5 hover:border-pink-400 hover:shadow-soft transition-all hover-lift bg-white/50">
                  <summary className="font-bold cursor-pointer list-none flex justify-between items-center">
                    <span className="text-lg group-hover:text-pink-700 transition-colors">How do I get paid?</span>
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
            <div className="text-center space-y-6 py-12 animate-fade-in-up delay-1000">
              <h3 className="text-4xl md:text-5xl font-bold text-gradient-vibrant">Ready to Start Earning?</h3>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-medium">
                Join hundreds of students already earning flexible income by sharing their city with visitors.
              </p>
              <Link href="/student/signin">
                <Button size="lg" className="text-lg px-10 py-7 gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-semibold group hover-lift-lg">
                  Explore Now
                  <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
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
