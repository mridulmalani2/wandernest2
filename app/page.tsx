import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, Plane, GraduationCap } from 'lucide-react'

export default function MainLanding() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Gradient Mesh Background */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-pattern opacity-30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full py-6 px-4 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-xl bg-gradient-primary text-white group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                WanderNest
              </h1>
            </Link>
            <nav className="flex items-center space-x-3">
              <Link href="/student">
                <Button variant="outline" className="hover-lift">I&apos;m a Student</Button>
              </Link>
              <Link href="/booking">
                <Button className="gradient-primary hover:opacity-90 transition-opacity">Book a Guide</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Hero Title */}
            <div className="space-y-6 animate-fade-in-down">
              <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                Experience{' '}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Authentic Travel
                </span>
                <br />
                with Local Student Guides
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </p>
            </div>

            {/* Two Large CTAs */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 max-w-5xl mx-auto">
              {/* Tourist CTA */}
              <Link href="/tourist" className="animate-fade-in-up">
                <div className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-400 transition-all duration-500 hover-lift relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Plane className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      I&apos;m a Tourist
                    </h2>

                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      Find local student guides to show you authentic experiences in your destination city
                    </p>

                    <Button size="lg" className="w-full text-lg py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg group-hover:shadow-xl transition-all">
                      Explore as Tourist
                      <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </Button>
                  </div>
                </div>
              </Link>

              {/* Student CTA */}
              <Link href="/student" className="animate-fade-in-up delay-100">
                <div className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-lg hover:shadow-2xl border border-gray-200 hover:border-purple-400 transition-all duration-500 hover-lift relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-10 h-10" />
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      I&apos;m a Student
                    </h2>

                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                      Become a guide and earn money by showing travelers around your city
                    </p>

                    <Button size="lg" className="w-full text-lg py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg group-hover:shadow-xl transition-all">
                      Start Guiding
                      <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
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
