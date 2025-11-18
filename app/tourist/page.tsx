'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useSession, signIn } from 'next-auth/react'
import { Globe, GraduationCap, MessageCircle, Star, AlertTriangle, ChevronLeft } from 'lucide-react'

export default function TouristLanding() {
  const { data: session, status } = useSession()
  const isTourist = session?.user?.userType === 'tourist'

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background with London imagery */}
      <div className="absolute inset-0">
        <Image
          src="/images/london/thames.jpg"
          alt="Thames River"
          fill
          className="object-cover opacity-15"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 via-white/98 to-indigo-50/95" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-30" />

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
              <Link href="/booking">
                <Button className="gradient-ocean hover:shadow-glow-blue transition-all shadow-premium text-white">Book a Guide</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-8 animate-slide-up-fade">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                Experience{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                  Authentic Travel
                </span>
                <br />
                with Local Student Guides
              </h2>

              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </p>

              <div className="flex justify-center gap-4 pt-4 animate-fade-in-up delay-300">
                <Link href="/booking">
                  <Button size="lg" className="text-lg px-10 py-7 gradient-ocean hover:shadow-glow-blue shadow-premium text-white font-semibold group hover-lift">
                    Start Your Adventure
                    <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Marketplace Disclaimer */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 border-2 border-amber-300/60 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto shadow-premium hover-lift animate-fade-in-up delay-400">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-soft">
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
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 hover-lift group relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <Image
                    src="/images/london/big-ben.jpg"
                    alt="Big Ben"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative z-10 p-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Verified Students</h3>
                  <p className="text-gray-600 leading-relaxed">
                    All guides are verified university students with local knowledge
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 hover-lift group relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <Image
                    src="/images/paris/paris-cafe.jpg"
                    alt="Paris cafe"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative z-10 p-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Personalized Experience</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get custom itineraries based on your interests and preferences
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 hover-lift group relative overflow-hidden">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                  <Image
                    src="/images/london/london-bridge.jpg"
                    alt="London bridge"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative z-10 p-8">
                  <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Authentic Adventures</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Discover hidden gems and local favorites off the beaten path
                  </p>
                </div>
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
