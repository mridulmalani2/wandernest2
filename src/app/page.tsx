'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plane, GraduationCap } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import TouristCTA from '@/components/cta/TouristCTA'
import StudentCTA from '@/components/cta/StudentCTA'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import dynamic from 'next/dynamic'

// PERF: Enable SSR for WhyChooseCarousel to improve LCP and hydration
const WhyChooseCarousel = dynamic(() => import('@/components/WhyChooseCarousel'), {
  loading: () => <div className="mt-14 lg:mt-20 h-[500px] animate-pulse bg-white/10 rounded-3xl" />,
  ssr: true // Changed from false to enable server-side rendering
})

export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()

  // PERF: Removed scroll listener for parallax - now using CSS-only parallax effect

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />

      {/* PERF: Optimized hero background - local image, CSS-only parallax, simplified overlays */}
      <div className="absolute inset-0 parallax-bg">
        <Image
          src="/images/backgrounds/paris-blur.jpg"
          alt="Beautiful Paris cityscape with Eiffel Tower"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="object-cover"
        />
        {/* PERF: Removed backdrop-blur to reduce GPU cost, simplified to single overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-ui-blue-accent/20 to-ui-purple-primary/25" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-20" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="default" />

        {/* Hero Section - Asymmetric Layout */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-18">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-7 lg:gap-14 items-center min-h-[calc(100vh-14rem)]">

              {/* Left Column - Editorial Text Content */}
              <div className="space-y-7 lg:space-y-9 animate-slide-in-left">
                {/* Headline - Left-aligned Serif */}
                <div className="space-y-3">
                  <h1 className="hero-text-enter text-[2.7rem] sm:text-[3.375rem] lg:text-[4rem] xl:text-[5.4rem] font-serif font-bold leading-[1.05] tracking-tight text-white text-shadow-lg">
                    Experience Authentic Travel
                    <span className="block mt-2 lg:mt-3">
                      with Local Student Guides
                    </span>
                  </h1>

                  {/* Subheadline - Modern Sans-serif */}
                  <p className="hero-subtext-enter text-base sm:text-lg lg:text-xl text-stone-100 leading-relaxed font-light max-w-xl">
                    Connect with verified university students in Paris and London who will show you their city
                    through a local&apos;s eyes. Get personalized recommendations and authentic
                    experiences.
                  </p>
                </div>

                {/* Gradient CTAs with Soft Glow */}
                <div className="hero-cta-enter flex flex-col sm:flex-row gap-4">
                  <PrimaryCTAButton
                    href="/tourist"
                    icon={Plane}
                    showArrow
                    variant="blue"
                  >
                    I&apos;m a Tourist
                  </PrimaryCTAButton>

                  <PrimaryCTAButton
                    href="/student"
                    icon={GraduationCap}
                    showArrow
                    variant="purple"
                  >
                    I&apos;m a Student
                  </PrimaryCTAButton>
                </div>
              </div>

              {/* Right Column - PERF: Replaced heavy image collage with lightweight decorative elements */}
              <div className="relative h-[450px] md:h-[540px] lg:h-[630px]">
                {/* Decorative gradient cards - pure CSS, no images */}
                <div className="image-layer-1 absolute top-[10%] left-[5%] w-[65%] h-[45%] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-ui-blue-accent/30 via-blue-500/25 to-blue-600/20 backdrop-blur-md border border-white/10" />
                <div className="image-layer-2 absolute top-[35%] right-[10%] w-[60%] h-[40%] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-ui-purple-accent/30 via-purple-500/25 to-purple-600/20 backdrop-blur-md border border-white/10" />
                <div className="image-layer-3 absolute bottom-[8%] left-[15%] w-[55%] h-[38%] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-pink-500/30 via-pink-600/25 to-purple-500/20 backdrop-blur-md border border-white/10" />

                {/* Decorative floating elements */}
                <div className="absolute top-[5%] right-[8%] w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-float-slow" />
                <div className="absolute bottom-[15%] right-[5%] w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float-slow" style={{ animationDelay: '1s' }} />
              </div>
            </div>

            {/* Why Choose Carousel - Below Hero */}
            <div className="carousel-enter mt-14 lg:mt-20">
              <WhyChooseCarousel />
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
