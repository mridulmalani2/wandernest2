'use client'

import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import ModernFAQ from '@/components/student/ModernFAQ'
import { DollarSign, Clock, Users } from 'lucide-react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

export default function StudentLandingPage() {
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
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students collaborating on campus"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-primary/20 via-ui-blue-primary/15 to-black/40" />
      </motion.div>
      <div className="absolute inset-0 pattern-dots opacity-15" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-5xl mx-auto space-y-10 md:space-y-16">

            {/* Hero Text */}
            <div className="text-center space-y-6 md:space-y-8 animate-slide-up-fade">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Earn Money{' '}
                <span className="text-gradient-vibrant animate-gradient-shift inline-block bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl">
                  Sharing Your City
                </span>
                <br />
                with Visitors from Home
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed font-medium text-shadow">
                Turn your local knowledge into income. Host visitors from your home country,
                earn more than campus jobs, and build your network.
              </p>

              <div className="flex justify-center gap-3 sm:gap-4 pt-4 animate-fade-in-up delay-300">
                <PrimaryCTAButton
                  href="/student/onboarding"
                  showArrow
                  variant="purple"
                >
                  Start Earning Today
                </PrimaryCTAButton>
              </div>
            </div>

            {/* Features - Image Cards (Matching Tourist Style) */}
            <div className="pt-8 animate-fade-in-up delay-400">
              <div className="text-center space-y-3 mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white text-shadow-lg">
                  Why Guide with TourWiseCo?
                </h2>
                <p className="text-base md:text-lg text-white/90 text-shadow max-w-2xl mx-auto">
                  Flexible, high-paying, and culturally rewarding
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                <div className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80"
                      alt="Person holding money or calculating earnings"
                      fill
                      quality={60}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                  </div>
                  <div className="relative z-10 p-8 h-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl group-hover:bg-white/15 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-white/10 text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md border border-white/20">
                      <DollarSign className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-green-300 transition-colors">
                      High Earnings
                    </h3>
                    <p className="text-base text-white/90 leading-relaxed">
                      Earn significantly more than standard campus jobs. Set your own rates.
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80"
                      alt="Student planning schedule"
                      fill
                      quality={60}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                  </div>
                  <div className="relative z-10 p-8 h-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl group-hover:bg-white/15 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-white/10 text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md border border-white/20">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">
                      Total Flexibility
                    </h3>
                    <p className="text-base text-white/90 leading-relaxed">
                      Work around your class schedule. You choose when you're available.
                    </p>
                  </div>
                </div>

                <div className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="absolute inset-0">
                    <Image
                      src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                      alt="People networking"
                      fill
                      quality={60}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50"></div>
                  </div>
                  <div className="relative z-10 p-8 h-full backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl group-hover:bg-white/15 transition-all">
                    <div className="inline-flex p-4 rounded-2xl bg-white/10 text-white mb-6 group-hover:scale-105 transition-all duration-300 shadow-md border border-white/20">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
                      Build Network
                    </h3>
                    <p className="text-base text-white/90 leading-relaxed">
                      Connect with professionals and travelers from your home country.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works - Timeline Style (Matching Tourist Style) */}
            <div className="space-y-6 pt-8 animate-fade-in-up delay-500">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white text-shadow-lg">How It Works</h2>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="text-center group">
                    <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                      <h3 className="font-bold text-lg text-white">Create Profile</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Sign up with your university email and verify your student status
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="text-center group">
                    <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                      <h3 className="font-bold text-lg text-white">Set Availability</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Choose your dates, times, and hourly rates
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="text-center group">
                    <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                      <h3 className="font-bold text-lg text-white">Start Earning</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Accept booking requests and get paid directly by tourists
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-4 max-w-md mx-auto">
                <div className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-base text-white">Create Profile</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Sign up with your university email and verify your student status
                  </p>
                </div>

                <div className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-base text-white">Set Availability</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Choose your dates, times, and hourly rates
                  </p>
                </div>

                <div className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="font-bold text-base text-white">Start Earning</h3>
                  <p className="text-sm text-white/90 leading-relaxed">
                    Accept booking requests and get paid directly by tourists
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <ModernFAQ />

            {/* Student Guide Commitment - Enhanced Glass */}
            <div className="mt-16 max-w-3xl mx-auto animate-fade-in-up delay-800">
              <div className="relative overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl shadow-premium hover:shadow-elevated transition-all duration-300">
                <div className="relative p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                      <div className="p-3 rounded-xl bg-white/10 text-white shadow-lg border border-white/10">
                        <Users className="w-6 h-6" strokeWidth={2} />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 space-y-4">
                      {/* Title */}
                      <div>
                        <h2 className="font-bold text-white text-xl md:text-2xl">Student Guide Commitment</h2>
                        <div className="h-1 w-12 bg-white/20 rounded-full mt-2"></div>
                      </div>

                      {/* Main Text */}
                      <div className="space-y-4">
                        <p className="text-sm md:text-base text-white/80 leading-relaxed font-light">
                          <strong className="text-white font-medium">As a TourWiseCo guide, you are your own boss.</strong> We connect you with tourists, but you are responsible for:
                        </p>

                        {/* List of Items */}
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm text-white/70 font-light">Setting your own rates and schedule</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm text-white/70 font-light">Delivering a safe and authentic experience</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm text-white/70 font-light">Handling payments directly with tourists</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                              <span className="text-white text-xs">✓</span>
                            </div>
                            <span className="text-sm text-white/70 font-light">Maintaining your student verification status</span>
                          </div>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs md:text-sm text-white/60 leading-relaxed italic border-l-2 border-white/20 pl-4">
                          TourWiseCo takes 0% commission from your earnings. You keep 100% of what you charge.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center space-y-8 py-16 animate-fade-in-up delay-1000">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white text-shadow-lg">Ready to Start?</h2>
              <p className="text-xl md:text-2xl text-white/95 max-w-2xl mx-auto leading-relaxed font-medium text-shadow">
                Join hundreds of students earning flexible income today.
              </p>
              <div className="flex justify-center mt-4">
                <PrimaryCTAButton
                  href="/student/signin"
                  showArrow
                  variant="purple"
                  className="text-lg"
                >
                  Create Student Profile
                </PrimaryCTAButton>
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
