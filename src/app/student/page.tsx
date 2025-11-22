import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
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
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-primary/20 via-ui-purple-accent/15 to-ui-blue-primary/20" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-15" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Navigation variant="student" />

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-16">

            {/* Hero */}
            <div className="text-center space-y-8 animate-slide-up-fade">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Earn More Than{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block bg-white/10 px-4 py-2 rounded-2xl">
                  Campus Jobs
                </span>
                <br />
                While Sharing Your City
              </h1>

              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium text-shadow">
                Host visitors from your home country in Paris or London and earn more than typical student jobs.
                Choose your schedule, meet interesting people, and share your local knowledge.
              </p>

              <div className="flex justify-center gap-4 pt-4 animate-fade-in-up delay-300">
                <Link href="/student/onboarding">
                  <Button size="lg" className="text-lg px-10 py-7 gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-semibold group hover-lift">
                    Explore Now
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="backdrop-blur-md rounded-3xl shadow-xl border-2 border-white/40 animate-fade-in-up delay-400 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <Image
                  src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80"
                  alt="Arc de Triomphe and Paris landmarks"
                  fill
                  quality={75}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-white/85 backdrop-blur-md" />
              <div className="relative z-10 p-8 md:p-12">
                <h2 className="text-4xl font-bold text-center mb-12">Why Guide with WanderNest?</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 shadow-soft hover:shadow-premium hover-lift-lg group border-2 border-ui-blue-primary/60 hover:border-ui-blue-accent/60 transition-all">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-ui-blue-primary to-ui-blue-secondary text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-ui-blue-accent transition-colors">Earn More</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Make significantly more than standard campus jobs with flexible hours
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-6 shadow-soft hover:shadow-premium hover-lift-lg group border-2 border-ui-purple-primary/60 hover:border-ui-purple-accent/60 transition-all">
                  <div className="inline-flex p-3 rounded-xl gradient-vibrant text-white mb-4 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-glow-purple">
                    <Clock className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-ui-purple-accent transition-colors">Fully Flexible</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Choose your own time slots and work around your class schedule
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 shadow-soft hover:shadow-premium hover-lift-lg group border-2 border-ui-success/60 hover:border-ui-success/60 transition-all">
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-ui-success to-ui-success text-white mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-ui-success transition-colors">Cultural Connection</h3>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    Meet visitors from your home country and share your culture
                  </p>
                </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="space-y-10 animate-fade-in-up delay-500">
              <h2 className="text-4xl font-bold text-center text-white text-shadow-lg">How It Works</h2>
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-ocean rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-glow-blue group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    1
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-ui-blue-primary transition-colors">Sign In</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    Use your student email (.edu) to sign in with Google
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-vibrant rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-glow-purple group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    2
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-ui-purple-primary transition-colors">Verify Status</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    Upload your student ID to confirm your enrollment
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 bg-gradient-to-br from-ui-success to-ui-success rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    3
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-ui-success transition-colors">Create Profile</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    Describe your ideal day-out and share your expertise
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-sunset rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                    4
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-ui-purple-primary transition-colors">Get Requests</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    Set your availability and start receiving booking requests
                  </p>
                </div>
              </div>
            </div>

            {/* Modern FAQ */}
            <ModernFAQ />

            {/* Benefits Visualization with Images */}
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up delay-800">
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                  alt="Students working together and networking"
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-8">
                  <div className="text-white space-y-2">
                    <h3 className="text-2xl font-bold">Build Your Network</h3>
                    <p className="text-sm text-white/90">
                      Connect with travelers from around the world and expand your cultural horizons
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"
                  alt="Students celebrating success and achievement"
                  fill
                  quality={80}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-8">
                  <div className="text-white space-y-2">
                    <h3 className="text-2xl font-bold">Earn While You Learn</h3>
                    <p className="text-sm text-white/90">
                      Make meaningful income on your own schedule while pursuing your degree
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-6 py-12 animate-fade-in-up delay-1000">
              <h2 className="text-4xl md:text-5xl font-bold text-white text-shadow-lg">Ready to Start Earning?</h2>
              <p className="text-xl text-white max-w-2xl mx-auto leading-relaxed font-medium text-shadow">
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
        <footer className="border-t bg-white/40 backdrop-blur-md mt-16">
          <div className="container mx-auto px-4 py-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
