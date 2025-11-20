import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plane, GraduationCap } from 'lucide-react'
import Navigation from '@/components/Navigation'
import TouristCTA from '@/components/cta/TouristCTA'
import StudentCTA from '@/components/cta/StudentCTA'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import { STUDENT_SIGNUP_FORM_URL } from '@/lib/constants'

export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()

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
      {/* Full-bleed Background Image with Overlay - Optimized with Next.js Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80"
          alt="Beautiful Paris cityscape with Eiffel Tower"
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-pink-600/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-20" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="default" />

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Hero Title */}
            <div className="space-y-6 animate-slide-up-fade">
              <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Experience{' '}
                <span className="text-white bg-gradient-to-br from-purple-600/40 via-blue-600/40 to-pink-600/40 animate-gradient-shift inline-block px-4 py-2 rounded-2xl backdrop-blur-sm border border-white/20">
                  Authentic Travel
                </span>
                <br />
                <span className="relative inline-block">
                  with Local Student Guides
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-sans animate-fade-in-up delay-200 text-shadow">
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </p>
            </div>

            {/* Two Large CTAs - Modern Glassmorphism Cards with Hover Expansion */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 max-w-5xl mx-auto">
              {/* Tourist CTA */}
              <Link href="/tourist" className="animate-fade-in-up block">
                <div className="group cursor-pointer rounded-3xl shadow-xl hover:shadow-elevated border-2 border-white/60 hover:border-white/90 transition-all duration-500 relative overflow-hidden h-[400px] md:h-[450px] focus-visible:outline-3 focus-visible:outline-blue-500 focus-visible:outline-offset-4 hover:scale-[1.02] hover:-translate-y-2">
                  {/* Background Image - More prominent */}
                  <div className="absolute inset-0 opacity-90 group-hover:opacity-70 transition-opacity duration-500">
                    <Image
                      src="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80"
                      alt="Beautiful London cityscape with iconic architecture"
                      fill
                      loading="lazy"
                      quality={75}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                  </div>

                  {/* Glassmorphism Overlay - Lighter and more transparent */}
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm group-hover:backdrop-blur-md group-hover:bg-white/30 dark:group-hover:bg-black/50 transition-all duration-500" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
                    {/* Default state content - Always visible */}
                    <div className="space-y-3">
                      <div className="inline-flex p-3 rounded-2xl bg-blue-600/90 backdrop-blur-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Plane className="w-8 h-8" />
                      </div>

                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-white text-shadow-lg tracking-tight">
                        I&apos;m a Tourist
                      </h2>

                      <p className="text-lg md:text-xl text-white/95 font-sans text-shadow">
                        Discover the city with locals
                      </p>
                    </div>

                    {/* Hover state content - Expands and reveals */}
                    <div className="mt-6 space-y-4 max-h-0 opacity-0 group-hover:max-h-48 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                      <p className="text-base md:text-lg text-white/95 leading-relaxed font-sans text-shadow">
                        Discover private, student-led city walks and custom itineraries. Experience authentic local culture through the eyes of verified university students.
                      </p>

                      <div className="pt-2">
                        <Button size="lg" className="w-full text-base md:text-lg py-6 gradient-ocean hover:shadow-glow-blue shadow-premium text-white font-serif font-semibold tracking-wide group/btn">
                          Explore as Tourist
                          <span className="ml-2 group-hover/btn:translate-x-2 transition-transform inline-block">→</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Student CTA */}
              {/* TODO: Once student portal is production-ready, replace Google Form URL with internal route */}
              {/* Temporary redirect to Google Form while building student onboarding flow */}
              {/* <Link href="/student" className="animate-fade-in-up delay-100 block"> */}
              <a href={STUDENT_SIGNUP_FORM_URL} target="_blank" rel="noopener noreferrer" className="animate-fade-in-up delay-100 block">
                <div className="group cursor-pointer rounded-3xl shadow-xl hover:shadow-elevated border-2 border-white/60 hover:border-white/90 transition-all duration-500 relative overflow-hidden h-[400px] md:h-[450px] focus-visible:outline-3 focus-visible:outline-purple-500 focus-visible:outline-offset-4 hover:scale-[1.02] hover:-translate-y-2">
                  {/* Background Image - More prominent */}
                  <div className="absolute inset-0 opacity-90 group-hover:opacity-70 transition-opacity duration-500">
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                      alt="University students collaborating and learning together"
                      fill
                      loading="lazy"
                      quality={75}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
                  </div>

                  {/* Glassmorphism Overlay - Lighter and more transparent */}
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/30 backdrop-blur-sm group-hover:backdrop-blur-md group-hover:bg-white/30 dark:group-hover:bg-black/50 transition-all duration-500" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
                    {/* Default state content - Always visible */}
                    <div className="space-y-3">
                      <div className="inline-flex p-3 rounded-2xl bg-purple-600/90 backdrop-blur-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="w-8 h-8" />
                      </div>

                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-white text-shadow-lg tracking-tight">
                        I&apos;m a Student
                      </h2>

                      <p className="text-lg md:text-xl text-white/95 font-sans text-shadow">
                        Earn while sharing your city
                      </p>
                    </div>

                    {/* Hover state content - Expands and reveals */}
                    <div className="mt-6 space-y-4 max-h-0 opacity-0 group-hover:max-h-48 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                      <p className="text-base md:text-lg text-white/95 leading-relaxed font-sans text-shadow">
                        Explore student opportunities, flexible hours, and safe connections with tourists. Become a verified guide and show travelers the authentic side of your city.
                      </p>

                      <div className="pt-2">
                        <Button size="lg" className="w-full text-base md:text-lg py-6 gradient-vibrant hover:shadow-glow-purple shadow-premium text-white font-serif font-semibold tracking-wide group/btn">
                          Start Guiding
                          <span className="ml-2 group-hover/btn:translate-x-2 transition-transform inline-block">→</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
              {/* </Link> */}
            </div>

            {/* Visual Features Section with Images */}
            <div className="pt-16 space-y-12 animate-fade-in-up delay-300">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-center text-white text-shadow-lg tracking-tight">
                Why Choose WanderNest?
              </h2>

              {/* Feature 1 - Authentic Local Experiences */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 order-2 md:order-1 bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Authentic Local Experiences</h3>
                  <p className="text-lg text-gray-700 leading-relaxed font-sans">
                    Skip the tourist traps and discover the real city. Our student guides know the
                    best local cafes, hidden viewpoints, and authentic experiences that guidebooks
                    miss. Connect with the culture through someone who lives it every day.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Hidden local spots and neighborhood favorites</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Cultural insights from a local perspective</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Personalized recommendations for your interests</span>
                    </li>
                  </ul>
                </div>
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl group order-1 md:order-2">
                  <Image
                    src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                    alt="Local cafe experience with authentic ambiance"
                    fill
                    loading="lazy"
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 50vw"
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
                    loading="lazy"
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="space-y-4 bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Verified University Students</h3>
                  <p className="text-lg text-gray-700 leading-relaxed font-sans">
                    All our guides are verified university students with proven local knowledge.
                    They are passionate about sharing their city and creating meaningful connections
                    with travelers from around the world.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Background-verified student credentials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Multilingual guides for better communication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Rated and reviewed by past travelers</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 3 - Flexible & Personal */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 order-2 md:order-1 bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">Flexible and Personalized</h3>
                  <p className="text-lg text-gray-700 leading-relaxed font-sans">
                    Every traveler is unique. Whether you want to explore historic landmarks, find
                    the best street food, or discover nightlife hotspots, your guide will customize
                    the experience to match your interests and pace.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Customized itineraries based on your preferences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Flexible scheduling around your travel plans</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 font-bold">✓</span>
                      <span className="text-gray-700 font-sans">Small group or one-on-one experiences</span>
                    </li>
                  </ul>
                </div>
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl group order-1 md:order-2">
                  <Image
                    src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                    alt="Group of young travelers exploring a European city together"
                    fill
                    loading="lazy"
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <p className="text-sm text-white/90 dark:text-white/80 pt-16 animate-fade-in text-shadow">
              © {new Date().getFullYear()} WanderNest. Connecting cultures, one guide at a time.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
