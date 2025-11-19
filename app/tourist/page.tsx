import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GraduationCap, MessageCircle, Star, AlertTriangle } from 'lucide-react'
import { DynamicNavigation } from '@/components/DynamicNavigation'

// Server Component - no client-side bundle overhead
export default function TouristLanding() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Full-bleed Background with London imagery */}
      <div className="absolute inset-0" role="img" aria-label="Beautiful London Thames River with iconic architecture">
        <Image
          src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80"
          alt="Beautiful London Thames River with iconic architecture"
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/15 to-purple-600/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-15" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header - Dynamically imported to reduce initial bundle */}
        <DynamicNavigation variant="tourist" />

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-8 animate-slide-up-fade">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Experience{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block bg-white/10 px-4 py-2 rounded-2xl">
                  Authentic Travel
                </span>
                <br />
                with Local Student Guides
              </h1>

              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium text-shadow">
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
                  <h2 className="font-bold text-amber-900 mb-3 text-lg">Important Notice</h2>
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
              <div className="backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 hover-lift group relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1529667083337-e36bedc13cfa?w=800&q=80"
                    alt="University students learning and collaborating"
                    fill
                    quality={60}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-300/20" />
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
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

              <div className="backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 hover-lift group relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                    alt="Cozy Parisian cafe with authentic ambiance"
                    fill
                    quality={60}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-300/20" />
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
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

              <div className="backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 hover-lift group relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 group-hover:opacity-25 transition-opacity duration-500">
                  <Image
                    src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80"
                    alt="Iconic London bridge and cityscape"
                    fill
                    quality={60}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-pink-300/20" />
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
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

            {/* How It Works Section */}
            <div className="space-y-10 pt-12 animate-fade-in-up delay-500">
              <h2 className="text-4xl font-bold text-center text-white text-shadow-lg">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-ocean rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-glow-blue group-hover:scale-110 transition-all duration-300">
                    1
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-200 transition-colors">Submit Your Request</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    Tell us about your trip preferences, dates, and interests
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 gradient-vibrant rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-glow-purple group-hover:scale-110 transition-all duration-300">
                    2
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-purple-200 transition-colors">Get Matched with Guides</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    We match you with verified student guides who fit your needs
                  </p>
                </div>

                <div className="text-center space-y-4 group hover-lift">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold text-white shadow-premium group-hover:shadow-soft group-hover:scale-110 transition-all duration-300">
                    3
                  </div>
                  <h3 className="font-bold text-lg text-white group-hover:text-green-200 transition-colors">Experience the City</h3>
                  <p className="text-sm text-white/90 leading-relaxed font-medium">
                    Connect directly with your guide and enjoy an authentic local experience
                  </p>
                </div>
              </div>
            </div>

            {/* Image showcase - lazy loaded */}
            <div className="grid md:grid-cols-3 gap-6 pt-12 animate-fade-in-up delay-600">
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80"
                  alt="Iconic Paris architecture and streets"
                  fill
                  quality={70}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <span className="text-white font-bold text-xl">Paris</span>
                </div>
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80"
                  alt="Iconic London landmarks and architecture"
                  fill
                  quality={70}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <span className="text-white font-bold text-xl">London</span>
                </div>
              </div>
              <div className="relative h-64 rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80"
                  alt="Beautiful Rome cityscape with historic architecture"
                  fill
                  quality={70}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <span className="text-white font-bold text-xl">Rome</span>
                </div>
              </div>
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
