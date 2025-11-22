import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import ModernFAQ from '@/components/student/ModernFAQ'
import { DollarSign, Clock, Users } from 'lucide-react'

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full-bleed Background with Paris imagery */}
      <div className="absolute inset-0" role="img" aria-label="Beautiful Paris street scene with classic architecture">
        <Image
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
          alt="Beautiful Paris street scene with classic architecture"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Enhanced dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-10" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Navigation variant="student" />

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-20 md:py-24">
          <div className="max-w-6xl mx-auto space-y-20 md:space-y-24">

            {/* Hero */}
            <div className="text-center space-y-10 animate-slide-up-fade pt-8">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Earn More Than{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block bg-white/15 px-6 py-3 rounded-2xl backdrop-blur-sm border border-white/20">
                  Campus Jobs
                </span>
                <br />
                While Sharing Your City
              </h1>

              <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-medium text-shadow">
                Host visitors from your home country in Paris or London and earn more than typical student jobs.
                Choose your schedule, meet interesting people, and share your local knowledge.
              </p>

              <div className="flex justify-center gap-4 pt-6 animate-fade-in-up delay-300">
                <Link href="/student/onboarding">
                  <Button
                    size="lg"
                    className="text-lg px-12 py-8 h-auto gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-semibold group hover-lift transition-all duration-300 focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-4"
                  >
                    Explore Now
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 animate-fade-in-up delay-400 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <Image
                  src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80"
                  alt="Arc de Triomphe and Paris landmarks"
                  fill
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xl" />
              <div className="relative z-10 p-8 md:p-12 lg:p-16">
                <div className="text-center space-y-3 mb-12">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900">
                    Why Guide with WanderNest?
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                    Turn your local knowledge into income while building meaningful connections
                  </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                  <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-ui-blue-primary/30 hover:-translate-y-1">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-ui-blue-primary to-ui-blue-secondary text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-ui-blue-primary transition-colors">
                      Earn More
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      Make significantly more than standard campus jobs with flexible hours
                    </p>
                  </div>

                  <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-ui-purple-primary/30 hover:-translate-y-1">
                    <div className="inline-flex p-4 rounded-2xl gradient-vibrant text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-ui-purple-primary transition-colors">
                      Fully Flexible
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      Choose your own time slots and work around your class schedule
                    </p>
                  </div>

                  <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-ui-success/30 hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-ui-success to-emerald-600 text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-ui-success transition-colors">
                      Cultural Connection
                    </h3>
                    <p className="text-base text-gray-600 leading-relaxed">
                      Meet visitors from your home country and share your culture
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-12 animate-fade-in-up delay-500">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-white text-shadow-lg">How It Works</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                <div className="text-center space-y-5 group hover-lift">
                  <div className="w-24 h-24 gradient-ocean rounded-2xl flex items-center justify-center mx-auto text-4xl font-bold text-white shadow-premium group-hover:shadow-glow-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    1
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-ui-blue-primary transition-colors">Sign In</h3>
                  <p className="text-base text-white/90 leading-relaxed font-medium px-2">
                    Use your student email (.edu) to sign in with Google
                  </p>
                </div>

                <div className="text-center space-y-5 group hover-lift">
                  <div className="w-24 h-24 gradient-vibrant rounded-2xl flex items-center justify-center mx-auto text-4xl font-bold text-white shadow-premium group-hover:shadow-glow-purple group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    2
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-ui-purple-primary transition-colors">Verify Status</h3>
                  <p className="text-base text-white/90 leading-relaxed font-medium px-2">
                    Upload your student ID to confirm your enrollment
                  </p>
                </div>

                <div className="text-center space-y-5 group hover-lift">
                  <div className="w-24 h-24 bg-gradient-to-br from-ui-success to-ui-success rounded-2xl flex items-center justify-center mx-auto text-4xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    3
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-ui-success transition-colors">Create Profile</h3>
                  <p className="text-base text-white/90 leading-relaxed font-medium px-2">
                    Describe your ideal day-out and share your expertise
                  </p>
                </div>

                <div className="text-center space-y-5 group hover-lift">
                  <div className="w-24 h-24 gradient-sunset rounded-2xl flex items-center justify-center mx-auto text-4xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    4
                  </div>
                  <h3 className="font-bold text-xl text-white group-hover:text-ui-purple-primary transition-colors">Get Requests</h3>
                  <p className="text-base text-white/90 leading-relaxed font-medium px-2">
                    Set your availability and start receiving booking requests
                  </p>
                </div>
              </div>
            </div>

            {/* Modern FAQ */}
            <ModernFAQ />

            {/* Benefits Visualization with Images */}
            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 animate-fade-in-up delay-800">
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-premium group">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Students working together and networking"
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white space-y-3">
                    <h3 className="text-2xl md:text-3xl font-bold text-shadow-lg">Build Your Network</h3>
                    <p className="text-base text-white/95 leading-relaxed text-shadow">
                      Connect with travelers from around the world and expand your cultural horizons
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden shadow-premium group">
                <Image
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"
                  alt="Students celebrating success and achievement"
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-8">
                  <div className="text-white space-y-3">
                    <h3 className="text-2xl md:text-3xl font-bold text-shadow-lg">Earn While You Learn</h3>
                    <p className="text-base text-white/95 leading-relaxed text-shadow">
                      Make meaningful income on your own schedule while pursuing your degree
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-8 py-16 animate-fade-in-up delay-1000">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-shadow-lg">Ready to Start Earning?</h2>
              <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto leading-relaxed font-medium text-shadow">
                Join hundreds of students already earning flexible income by sharing their city with visitors.
              </p>
              <Link href="/student/signin">
                <Button
                  size="lg"
                  className="text-lg px-12 py-8 h-auto gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-semibold group hover-lift-lg transition-all duration-300 focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-4"
                >
                  Explore Now
                  <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
                </Button>
              </Link>
            </div>

          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
