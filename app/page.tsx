import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Globe, Plane, GraduationCap } from 'lucide-react'

export const metadata = {
  title: 'WanderNest - Connect with Local Student Guides for Authentic Travel',
  description: 'Experience authentic travel with verified local student guides. Discover hidden gems, get personalized recommendations, and explore cities like a local.',
}

export default function MainLanding() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WanderNest',
    url: 'https://wandernest.vercel.app',
    description: 'Marketplace connecting tourists with local student guides for authentic travel experiences',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://wandernest.vercel.app/booking?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WanderNest',
    url: 'https://wandernest.vercel.app',
    logo: 'https://wandernest.vercel.app/logo.png',
    description: 'Marketplace platform connecting tourists with verified local student guides',
    sameAs: [],
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Young travelers exploring city together - authentic travel experience"
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/85 via-purple-50/80 to-pink-50/85" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full py-6 px-4 backdrop-blur-md bg-white/10 border-b border-white/20 animate-fade-in-down">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-xl gradient-vibrant text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-glow-blue">
                <Globe className="w-8 h-8" />
              </div>
              <span className="text-3xl font-bold text-gradient-vibrant">
                WanderNest
              </span>
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
              <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
                Experience{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block">
                  Authentic Travel
                </span>
                <br />
                <span className="relative inline-block">
                  with Local Student Guides
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </span>
              </h1>

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
                <div className="group cursor-pointer backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-400 transition-all duration-500 hover-lift relative overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                    <Image
                      src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80"
                      alt="Beautiful London cityscape with iconic architecture"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-blue-300/20 to-cyan-400/30" />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

                  <div className="relative z-10 p-10">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Plane className="w-10 h-10" />
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                      I&apos;m a Tourist
                    </h3>

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
                <div className="group cursor-pointer backdrop-blur-md rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-purple-400 transition-all duration-500 hover-lift relative overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                      alt="University students collaborating and learning together"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 via-purple-300/20 to-pink-400/30" />
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />

                  <div className="relative z-10 p-10">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <GraduationCap className="w-10 h-10" />
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                      I&apos;m a Student
                    </h3>

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

            {/* Visual Features Section with Images */}
            <div className="pt-16 space-y-12 animate-fade-in-up delay-300">
              <h2 className="text-4xl md:text-5xl font-bold text-center text-gradient-vibrant">
                Why Choose WanderNest?
              </h2>

              {/* Feature 1 - Authentic Local Experiences */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 order-2 md:order-1">
                  <h3 className="text-3xl font-bold">Authentic Local Experiences</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Skip the tourist traps and discover the real city. Our student guides know the
                    best local cafes, hidden viewpoints, and authentic experiences that guidebooks
                    miss. Connect with the culture through someone who lives it every day.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">✓</span>
                      <span>Hidden local spots and neighborhood favorites</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">✓</span>
                      <span>Cultural insights from a local perspective</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600">✓</span>
                      <span>Personalized recommendations for your interests</span>
                    </li>
                  </ul>
                </div>
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl group order-1 md:order-2">
                  <Image
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                    alt="Local cafe experience with authentic ambiance"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>

              {/* Feature 2 - Verified Student Guides */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                    alt="Young university students collaborating and sharing knowledge"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-bold">Verified University Students</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    All our guides are verified university students with proven local knowledge.
                    They are passionate about sharing their city and creating meaningful connections
                    with travelers from around the world.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600">✓</span>
                      <span>Background-verified student credentials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600">✓</span>
                      <span>Multilingual guides for better communication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600">✓</span>
                      <span>Rated and reviewed by past travelers</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 3 - Flexible & Personal */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 order-2 md:order-1">
                  <h3 className="text-3xl font-bold">Flexible and Personalized</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Every traveler is unique. Whether you want to explore historic landmarks, find
                    the best street food, or discover nightlife hotspots, your guide will customize
                    the experience to match your interests and pace.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span>Customized itineraries based on your preferences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span>Flexible scheduling around your travel plans</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600">✓</span>
                      <span>Small group or one-on-one experiences</span>
                    </li>
                  </ul>
                </div>
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl group order-1 md:order-2">
                  <Image
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                    alt="Group of young travelers exploring a European city together"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-gray-500 pt-16 animate-fade-in">
              © {new Date().getFullYear()} WanderNest. Connecting cultures, one guide at a time.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
