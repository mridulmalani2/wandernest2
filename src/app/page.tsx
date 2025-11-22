import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plane, GraduationCap } from 'lucide-react'
import Navigation from '@/components/Navigation'
import TouristCTA from '@/components/cta/TouristCTA'
import StudentCTA from '@/components/cta/StudentCTA'
import WhyChooseCarousel from '@/components/WhyChooseCarousel'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'

// ISR: Revalidate homepage every hour
export const revalidate = 3600

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
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/15 via-ui-purple-accent/10 to-ui-purple-primary/15" />
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
                Experience Authentic Travel
                <br />
                <span className="relative inline-block">
                  with Local Student Guides
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-ui-blue-primary via-ui-purple-primary to-ui-purple-accent rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-sans animate-fade-in-up delay-200 text-shadow">
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </p>
            </div>

            {/* Two Large CTAs - Photo Cards with Glass Frame Effect */}
            <div className="grid md:grid-cols-2 gap-6 pt-8 max-w-4xl mx-auto">
              {/* Tourist CTA */}
              <Link href="/tourist" className="animate-fade-in-up block">
                <div className="group cursor-pointer rounded-2xl shadow-xl hover:shadow-elevated transition-all duration-500 relative overflow-hidden h-[200px] md:h-[225px] hover:scale-105 hover:-translate-y-2 focus-visible:outline-3 focus-visible:outline-ui-blue-accent focus-visible:outline-offset-4">
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
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/40 backdrop-blur-[2px] pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-5">
                    {/* Default state content - Always visible */}
                    <div className="space-y-2">
                      <div className="inline-flex p-2 rounded-xl bg-ui-blue-primary/90 backdrop-blur-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Plane className="w-5 h-5" />
                      </div>

                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-shadow-lg tracking-tight">
                        I&apos;m a Tourist
                      </h2>

                      <p className="text-sm md:text-base text-white font-sans text-shadow">
                        Discover the city with locals
                      </p>
                    </div>

                    {/* Hover state content - Expands and reveals */}
                    <div className="mt-3 space-y-2 max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                      <p className="text-xs md:text-sm text-white/95 leading-relaxed font-sans text-shadow-sm">
                        Find local student guides to show you authentic experiences and hidden gems in your destination city.
                      </p>

                      <div className="pt-1">
                        <span className="inline-flex items-center text-xs md:text-sm font-serif font-semibold text-white bg-ui-blue-accent/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:bg-ui-blue-primary/90 transition-colors">
                          Explore as Tourist
                          <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Student CTA */}
              <Link href="/student" className="animate-fade-in-up delay-100 block">
                <div className="group cursor-pointer rounded-2xl shadow-xl hover:shadow-elevated transition-all duration-500 relative overflow-hidden h-[200px] md:h-[225px] hover:scale-105 hover:-translate-y-2 focus-visible:outline-3 focus-visible:outline-ui-purple-accent focus-visible:outline-offset-4">
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
                  <div className="absolute inset-0 rounded-2xl border-2 border-white/40 backdrop-blur-[2px] pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-5">
                    {/* Default state content - Always visible */}
                    <div className="space-y-2">
                      <div className="inline-flex p-2 rounded-xl bg-ui-purple-primary/90 backdrop-blur-sm text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="w-5 h-5" />
                      </div>

                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-white text-shadow-lg tracking-tight">
                        I&apos;m a Student
                      </h2>

                      <p className="text-sm md:text-base text-white font-sans text-shadow">
                        Earn while sharing your city
                      </p>
                    </div>

                    {/* Hover state content - Expands and reveals */}
                    <div className="mt-3 space-y-2 max-h-0 opacity-0 group-hover:max-h-32 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out">
                      <p className="text-xs md:text-sm text-white/95 leading-relaxed font-sans text-shadow-sm">
                        Become a guide and earn money by showing travelers around your city with flexible hours.
                      </p>

                      <div className="pt-1">
                        <span className="inline-flex items-center text-xs md:text-sm font-serif font-semibold text-white bg-ui-purple-accent/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg hover:bg-ui-purple-primary/90 transition-colors">
                          Start Guiding
                          <span className="ml-2 group-hover:translate-x-2 transition-transform inline-block">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Premium Carousel - Why Choose WanderNest */}
            <WhyChooseCarousel />

            {/* Footer Note */}
            <p className="text-sm text-white/90 pt-16 animate-fade-in text-shadow">
              © {new Date().getFullYear()} WanderNest. Connecting cultures, one guide at a time.
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
