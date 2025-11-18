import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Globe, Plane, GraduationCap } from 'lucide-react'

export default function MainLanding() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/images/backgrounds/paris-blur.jpg"
          alt="Paris background"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/95 to-purple-50/90" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full py-6 px-4 backdrop-blur-md bg-white/30 border-b border-white/20 animate-fade-in-down">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-xl gradient-vibrant text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-glow-blue">
                <Globe className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gradient-vibrant">
                WanderNest
              </h1>
            </Link>
            <nav className="flex items-center space-x-3">
              <Link href="/student">
                <Button variant="outline" className="hover-lift border-2 hover:border-purple-400 hover:text-purple-600 transition-all">I&apos;m a Student</Button>
              </Link>
              <Link href="/booking">
                <Button className="gradient-vibrant hover:shadow-glow-purple transition-all shadow-premium text-white">Book a Guide</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Hero Title */}
            <div className="space-y-6 animate-slide-up-fade">
              <h2 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                Experience{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                  Authentic Travel
                </span>
                <br />
                <span className="relative inline-block">
                  with Local Student Guides
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up delay-200">
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </p>
            </div>

            {/* Two Large CTAs */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 max-w-5xl mx-auto">
              {/* Tourist CTA */}
              <Link href="/tourist" className="animate-fade-in-up">
                <div className="group cursor-pointer bg-white/90 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-400 transition-all duration-500 hover-lift relative overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <Image
                      src="/images/london/london-eye.jpg"
                      alt="London"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 p-10">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Plane className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                      I&apos;m a Tourist
                    </h2>

                    <p className="text-gray-700 mb-8 text-lg leading-relaxed font-medium">
                      Find local student guides to show you authentic experiences in your destination city
                    </p>

                    <Button size="lg" className="w-full text-lg py-7 gradient-ocean hover:shadow-glow-blue shadow-premium text-white font-semibold group/btn">
                      Explore as Tourist
                      <span className="ml-2 group-hover/btn:translate-x-2 transition-transform inline-block">→</span>
                    </Button>
                  </div>
                </div>
              </Link>

              {/* Student CTA */}
              <Link href="/student" className="animate-fade-in-up delay-100">
                <div className="group cursor-pointer bg-white/90 backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-purple-400 transition-all duration-500 hover-lift relative overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <Image
                      src="/images/paris/eiffel-tower.jpg"
                      alt="Paris"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 p-10">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <GraduationCap className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                      I&apos;m a Student
                    </h2>

                    <p className="text-gray-700 mb-8 text-lg leading-relaxed font-medium">
                      Become a guide and earn money by showing travelers around your city
                    </p>

                    <Button size="lg" className="w-full text-lg py-7 gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-semibold group/btn">
                      Start Guiding
                      <span className="ml-2 group-hover/btn:translate-x-2 transition-transform inline-block">→</span>
                    </Button>
                  </div>
                </div>
              </Link>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-gray-500 pt-12 animate-fade-in">
              © {new Date().getFullYear()} WanderNest. Connecting cultures, one guide at a time.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
