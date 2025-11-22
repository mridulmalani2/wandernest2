'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { GraduationCap, MessageCircle, Star, AlertTriangle, Send, Users, PartyPopper, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { DynamicNavigation } from '@/components/DynamicNavigation'
import Footer from '@/components/Footer'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

export default function TouristLanding() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <div ref={heroRef} className="min-h-screen flex flex-col relative overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80"
          alt="Beautiful London Thames River with iconic architecture"
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/20 via-ui-blue-accent/15 to-ui-purple-primary/20" />
      </motion.div>
      <div className="absolute inset-0 pattern-dots opacity-15" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <DynamicNavigation variant="tourist" />

        {/* Hero Section - Optimized for mobile: reduced padding */}
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-5xl mx-auto space-y-10 md:space-y-16">
            <div className="text-center space-y-6 md:space-y-8 animate-slide-up-fade">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Experience{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl">
                  Authentic Travel
                </span>
                <br />
                with Local Student Guides
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium text-shadow">
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </p>

              <p className="text-sm sm:text-sm md:text-base text-white/90 max-w-2xl mx-auto leading-relaxed text-shadow-sm">
                Choose a guide from your home country for added comfort, or explore connections with local students—it&apos;s entirely up to you.
              </p>

              <div className="flex justify-center gap-3 sm:gap-4 pt-4 animate-fade-in-up delay-300">
                <PrimaryCTAButton
                  href="/booking"
                  showArrow
                  variant="blue"
                >
                  Start Your Adventure
                </PrimaryCTAButton>
              </div>
            </div>

            {/* Features */}
            <div className="pt-8 animate-fade-in-up delay-400">
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white text-shadow-lg">
                  Why Choose WanderNest?
                </h2>
                <p className="text-base md:text-lg text-white/90 text-shadow max-w-2xl mx-auto">
                  Authentic travel experiences with verified local student guides
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                <div className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80"
                      alt="University students studying together with books and laptops"
                      fill
                      quality={60}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  <div className="relative z-10 p-8 h-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl group-hover:bg-white/15 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-ui-blue-primary to-ui-blue-accent text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-ui-blue-accent transition-colors">
                      Verified Students
                    </h3>
                    <p className="text-base text-white/90 leading-relaxed">
                      All guides are verified university students with local knowledge
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80"
                      alt="Cozy Parisian cafe with authentic ambiance"
                      fill
                      quality={60}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  <div className="relative z-10 p-8 h-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl group-hover:bg-white/15 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-ui-purple-primary to-ui-purple-accent text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <MessageCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-ui-purple-accent transition-colors">
                      Personalized Experience
                    </h3>
                    <p className="text-base text-white/90 leading-relaxed">
                      Get custom itineraries based on your interests and preferences
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80"
                      alt="Iconic London bridge and cityscape"
                      fill
                      quality={60}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                  <div className="relative z-10 p-8 h-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl group-hover:bg-white/15 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md">
                      <Star className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-amber-300 transition-colors">
                      Authentic Adventures
                    </h3>
                    <p className="text-base text-white/90 leading-relaxed">
                      Discover hidden gems and local favorites off the beaten path
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works Section - Compact & Consistent */}
            <div className="space-y-6 pt-8 animate-fade-in-up delay-500">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white text-shadow-lg">How It Works</h2>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="text-center group">
                    <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                      <h3 className="font-bold text-lg text-white">Submit Your Request</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Tell us about your trip preferences, dates, and interests
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center group">
                    <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                      <h3 className="font-bold text-lg text-white">Get Matched with Guides</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        We match you with verified student guides who fit your needs
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center group">
                    <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                      <h3 className="font-bold text-lg text-white">Experience the City</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Connect directly with your guide and enjoy an authentic local experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-4 max-w-md mx-auto">
                {/* Step 1 */}
                <div className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-base text-white">Submit Your Request</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Tell us about your trip preferences, dates, and interests
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-base text-white">Get Matched with Guides</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    We match you with verified student guides who fit your needs
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-base text-white">Experience the City</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Connect directly with your guide and enjoy an authentic local experience
                  </p>
                </div>
              </div>
            </div>

            {/* City Destination Cards - Enhanced Design */}
            <div className="space-y-8 pt-8 animate-fade-in-up delay-700">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white text-shadow-lg">Choose Your Destination</h2>
                <div className="inline-block backdrop-blur-md bg-white/20 px-6 py-3 rounded-full border border-white/30">
                  <p className="text-white font-medium text-lg">
                    ✨ Currently available in Paris and London
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Paris Card */}
                <Link href="/booking" className="group block">
                  <div className="relative h-96 rounded-3xl overflow-hidden shadow-premium hover:shadow-elevated transition-all duration-500 hover:-translate-y-2">
                    {/* Background Image */}
                    <Image
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80"
                      alt="Iconic Paris architecture and streets"
                      fill
                      quality={75}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      {/* City Badge */}
                      <div className="mb-4 inline-flex items-center gap-2 self-start backdrop-blur-md bg-white/20 px-4 py-2 rounded-full border border-white/30 group-hover:bg-white/30 transition-colors">
                        <MapPin className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">France</span>
                      </div>

                      {/* City Name */}
                      <h3 className="text-4xl font-bold text-white mb-3 text-shadow-lg group-hover:text-ui-purple-primary transition-colors">
                        Paris
                      </h3>

                      {/* Description */}
                      <p className="text-white/90 text-sm mb-4 leading-relaxed backdrop-blur-sm bg-black/20 px-4 py-3 rounded-xl inline-block">
                        Explore the City of Light with local students
                      </p>

                      {/* Stats */}
                      <div className="flex gap-6 text-white/80 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>45+ guides</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8 rating</span>
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/30">
                        <span className="text-white text-xl">→</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* London Card */}
                <Link href="/booking" className="group block">
                  <div className="relative h-96 rounded-3xl overflow-hidden shadow-premium hover:shadow-elevated transition-all duration-500 hover:-translate-y-2">
                    {/* Background Image */}
                    <Image
                      src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80"
                      alt="Iconic London landmarks and architecture"
                      fill
                      quality={75}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-8">
                      {/* City Badge */}
                      <div className="mb-4 inline-flex items-center gap-2 self-start backdrop-blur-md bg-white/20 px-4 py-2 rounded-full border border-white/30 group-hover:bg-white/30 transition-colors">
                        <MapPin className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">United Kingdom</span>
                      </div>

                      {/* City Name */}
                      <h3 className="text-4xl font-bold text-white mb-3 text-shadow-lg group-hover:text-ui-blue-primary transition-colors">
                        London
                      </h3>

                      {/* Description */}
                      <p className="text-white/90 text-sm mb-4 leading-relaxed backdrop-blur-sm bg-black/20 px-4 py-3 rounded-xl inline-block">
                        Discover royal history and modern culture
                      </p>

                      {/* Stats */}
                      <div className="flex gap-6 text-white/80 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>60+ guides</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9 rating</span>
                        </div>
                      </div>

                      {/* Hover Arrow */}
                      <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/30">
                        <span className="text-white text-xl">→</span>
                      </div>
                    </div>
                  </div>
                </Link>

              </div>
            </div>

            {/* Marketplace Disclaimer - Enhanced */}
            <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up delay-800">
              <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-amber-50/95 to-yellow-50/95 border-2 border-amber-300/60 rounded-3xl shadow-premium hover:shadow-elevated transition-all duration-300">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-300/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl"></div>

                <div className="relative p-6 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="absolute inset-0 bg-amber-400 rounded-2xl blur-md opacity-50"></div>
                        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-lg">
                          <AlertTriangle className="w-8 h-8" strokeWidth={2} />
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-5">
                      {/* Title */}
                      <div className="space-y-2">
                        <h2 className="font-bold text-amber-900 text-2xl md:text-3xl">Important Notice</h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"></div>
                      </div>

                      {/* Main Text */}
                      <div className="space-y-4">
                        <p className="text-base text-amber-900/90 leading-relaxed font-medium bg-white/50 backdrop-blur-sm px-5 py-4 rounded-2xl border border-amber-200/50">
                          <strong className="text-amber-950">WanderNest is a marketplace connector only.</strong> We facilitate connections between tourists and local student guides but do not:
                        </p>

                        {/* List of Items */}
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-amber-200/50 hover:bg-white/80 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-700 text-sm">✕</span>
                            </div>
                            <span className="text-sm text-amber-900 font-medium">Handle any payments or financial transactions</span>
                          </div>

                          <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-amber-200/50 hover:bg-white/80 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-700 text-sm">✕</span>
                            </div>
                            <span className="text-sm text-amber-900 font-medium">Guarantee the quality of services provided</span>
                          </div>

                          <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-amber-200/50 hover:bg-white/80 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-700 text-sm">✕</span>
                            </div>
                            <span className="text-sm text-amber-900 font-medium">Act as an employer or agency for guides</span>
                          </div>

                          <div className="flex items-start gap-3 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl border border-amber-200/50 hover:bg-white/80 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-700 text-sm">✕</span>
                            </div>
                            <span className="text-sm text-amber-900 font-medium">Assume liability for guide-tourist interactions</span>
                          </div>
                        </div>

                        {/* Footer Note */}
                        <p className="text-sm text-amber-900/80 leading-relaxed italic bg-amber-100/50 px-5 py-3 rounded-xl border-l-4 border-amber-500">
                          All arrangements, payments, and services are agreed upon directly between you and your guide.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
