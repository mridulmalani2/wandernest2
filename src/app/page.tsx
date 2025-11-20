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

            {/* Two Large CTAs - Photo Cards with Glass Frame Effect */}
            <div className="grid md:grid-cols-2 gap-8 pt-8 max-w-5xl mx-auto">
              {/* Tourist CTA */}
              <Link href="/tourist" className="animate-fade-in-up block">
                <div className="group cursor-pointer rounded-3xl shadow-xl hover:shadow-elevated transition-all duration-500 relative overflow-hidden h-[400px] md:h-[450px] hover:scale-105 hover:-translate-y-2 focus-visible:outline-3 focus-visible:outline-blue-500 focus-visible:outline-offset-4">
                  {/* Photo - Fully visible like a photo card */}
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                      alt="Tourists exploring a European city together"
                      fill
                      loading="lazy"
                      quality={80}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Gradient overlay only at bottom for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Glass border/frame effect - subtle frosted edge */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-white/40 backdrop-blur-[2px] pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
                    {/* Default state content - Always visible */}
                    <div className="space-y-3">
                      <div className="inline-flex p-3 rounded-2xl bg-blue-500/90 backdrop-blur-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Plane className="w-8 h-8" />
                      </div>

                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-white text-shadow-lg tracking-tight">
                        I&apos;m a Tourist
                      </h2>

                      <p className="text-lg md:text-xl text-white font-sans text-shadow">
                        Discover the city with locals
                      </p>
                    </div>

                    {/* Hover state content - Expands and reveals */}
                    <div className="mt-6 space-y-4 max-h-0 opacity-0 group-hover:max-h-56 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                      <p className="text-base md:text-lg text-white/95 leading-relaxed font-sans text-shadow-sm">
                        Find local student guides to show you authentic experiences and hidden gems in your destination city.
                      </p>

                      <div className="pt-2">
                        <span className="inline-flex items-center text-base md:text-lg font-serif font-semibold text-white bg-blue-600/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:bg-blue-500/90 transition-colors">
                          Explore as Tourist
                          <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
                        </span>
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
                <div className="group cursor-pointer rounded-3xl shadow-xl hover:shadow-elevated transition-all duration-500 relative overflow-hidden h-[400px] md:h-[450px] hover:scale-105 hover:-translate-y-2 focus-visible:outline-3 focus-visible:outline-purple-500 focus-visible:outline-offset-4">
                  {/* Photo - Fully visible like a photo card */}
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                      alt="University students collaborating and learning together"
                      fill
                      loading="lazy"
                      quality={80}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Gradient overlay only at bottom for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Glass border/frame effect - subtle frosted edge */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-white/40 backdrop-blur-[2px] pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
                    {/* Default state content - Always visible */}
                    <div className="space-y-3">
                      <div className="inline-flex p-3 rounded-2xl bg-purple-500/90 backdrop-blur-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="w-8 h-8" />
                      </div>

                      <h2 className="text-4xl md:text-5xl font-serif font-bold text-white text-shadow-lg tracking-tight">
                        I&apos;m a Student
                      </h2>

                      <p className="text-lg md:text-xl text-white font-sans text-shadow">
                        Earn while sharing your city
                      </p>
                    </div>

                    {/* Hover state content - Expands and reveals */}
                    <div className="mt-6 space-y-4 max-h-0 opacity-0 group-hover:max-h-56 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                      <p className="text-base md:text-lg text-white/95 leading-relaxed font-sans text-shadow-sm">
                        Become a guide and earn money by showing travelers around your city with flexible hours.
                      </p>

                      <div className="pt-2">
                        <span className="inline-flex items-center text-base md:text-lg font-serif font-semibold text-white bg-purple-600/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:bg-purple-500/90 transition-colors">
                          Start Guiding
                          <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
                        </span>
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
                <div className="space-y-4 order-2 md:order-1 glass-card rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-serif font-bold text-foreground tracking-tight">Authentic Local Experiences</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Skip the tourist traps and discover the real city. Our student guides know the
                    best local cafes, hidden viewpoints, and authentic experiences that guidebooks
                    miss. Connect with the culture through someone who lives it every day.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600 dark:text-blue-400 font-bold">✓</span>
                      <span className="text-foreground">Hidden local spots and neighborhood favorites</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600 dark:text-blue-400 font-bold">✓</span>
                      <span className="text-foreground">Cultural insights from a local perspective</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-blue-600 dark:text-blue-400 font-bold">✓</span>
                      <span className="text-foreground">Personalized recommendations for your interests</span>
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
                <div className="space-y-4 glass-card rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-serif font-bold text-foreground tracking-tight">Verified University Students</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    All our guides are verified university students with proven local knowledge.
                    They are passionate about sharing their city and creating meaningful connections
                    with travelers from around the world.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600 dark:text-purple-400 font-bold">✓</span>
                      <span className="text-foreground">Background-verified student credentials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600 dark:text-purple-400 font-bold">✓</span>
                      <span className="text-foreground">Multilingual guides for better communication</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-purple-600 dark:text-purple-400 font-bold">✓</span>
                      <span className="text-foreground">Rated and reviewed by past travelers</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Feature 3 - Flexible & Personal */}
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 order-2 md:order-1 glass-card rounded-2xl p-8 shadow-xl">
                  <h3 className="text-3xl font-serif font-bold text-foreground tracking-tight">Flexible and Personalized</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Every traveler is unique. Whether you want to explore historic landmarks, find
                    the best street food, or discover nightlife hotspots, your guide will customize
                    the experience to match your interests and pace.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 dark:text-green-400 font-bold">✓</span>
                      <span className="text-foreground">Customized itineraries based on your preferences</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 dark:text-green-400 font-bold">✓</span>
                      <span className="text-foreground">Flexible scheduling around your travel plans</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 text-green-600 dark:text-green-400 font-bold">✓</span>
                      <span className="text-foreground">Small group or one-on-one experiences</span>
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
