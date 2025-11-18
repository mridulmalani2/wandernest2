import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Globe, GraduationCap, MessageCircle, Star, AlertTriangle, ChevronLeft } from 'lucide-react'

export default function TouristLanding() {
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
              <Link href="/booking">
                <Button className="gradient-primary hover:opacity-90 transition-opacity">Book a Guide</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-8 animate-fade-in-down">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
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

              <div className="flex justify-center gap-4 pt-4">
                <Link href="/booking">
                  <Button size="lg" className="text-lg px-8 py-6 gradient-primary hover:opacity-90 transition-opacity shadow-lg">
                    Start Your Adventure
                  </Button>
                </Link>
              </div>
            </div>

            {/* Marketplace Disclaimer */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 border border-amber-300 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto shadow-lg animate-fade-in-up">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl bg-amber-500 text-white">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 mb-3 text-lg">Important Notice</h3>
                  <p className="text-sm text-amber-900 mb-3 leading-relaxed">
                    <strong>WanderNest is a marketplace connector only.</strong> We facilitate connections between tourists and local student guides but do not:
                  </p>
                  <ul className="space-y-2 text-sm text-amber-900">
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5">•</span>
                      <span>Handle any payments or financial transactions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5">•</span>
                      <span>Guarantee the quality of services provided</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5">•</span>
                      <span>Act as an employer or agency for guides</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 mt-0.5">•</span>
                      <span>Assume liability for guide-tourist interactions</span>
                    </li>
                  </ul>
                  <p className="text-sm text-amber-900 mt-3 leading-relaxed">
                    All arrangements, payments, and services are agreed upon directly between you and your guide.
                  </p>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 pt-8 animate-fade-in-up delay-100">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover-lift group">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Verified Students</h3>
                <p className="text-gray-600 leading-relaxed">
                  All guides are verified university students with local knowledge
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover-lift group">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Personalized Experience</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get custom itineraries based on your interests and preferences
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 hover-lift group">
                <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Authentic Adventures</h3>
                <p className="text-gray-600 leading-relaxed">
                  Discover hidden gems and local favorites off the beaten path
                </p>
              </div>
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
