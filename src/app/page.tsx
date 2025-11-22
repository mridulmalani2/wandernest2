'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Plane, GraduationCap } from 'lucide-react'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import TouristCTA from '@/components/cta/TouristCTA'
import StudentCTA from '@/components/cta/StudentCTA'
import WhyChooseCarousel from '@/components/WhyChooseCarousel'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'
import { motion } from 'framer-motion'

export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()

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
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/15 via-ui-purple-accent/10 to-ui-purple-primary/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-20" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="default" />

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center">
          <div className="max-w-6xl mx-auto text-center space-y-16">
            {/* Hero Title - Premium Typography */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Main Headline with Floating Card Effect */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
                <div className="relative px-6 md:px-12 py-10 md:py-14">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.1] tracking-tight text-white mb-6">
                    Experience Authentic Travel
                    <br />
                    <span className="relative inline-block mt-2">
                      <span className="relative z-10">with Local Student Guides</span>
                      <motion.div
                        className="absolute -bottom-3 left-0 right-0 h-2 bg-gradient-to-r from-ui-blue-primary via-ui-purple-primary to-ui-purple-accent rounded-full opacity-70"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </span>
                  </h1>

                  <motion.p
                    className="text-lg md:text-xl lg:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-light tracking-wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    Connect with verified university students who will show you their city
                    through a local&apos;s eyes. Get personalized recommendations and authentic
                    experiences.
                  </motion.p>
                </div>
              </div>
            </motion.div>

            {/* Two Large CTAs - Premium Product Cards */}
            <motion.div
              className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Tourist CTA */}
              <Link href="/tourist" className="block group">
                <motion.div
                  className="relative overflow-hidden rounded-3xl shadow-2xl h-[280px] md:h-[320px] cursor-pointer"
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Background Image with Parallax Effect */}
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                      alt="Tourists exploring a European city together"
                      fill
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Refined gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/30 via-transparent to-ui-blue-accent/20" />
                  </motion.div>

                  {/* Premium border effect */}
                  <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none" />

                  {/* Inner glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                    <div className="space-y-3">
                      {/* Icon with premium styling */}
                      <motion.div
                        className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Plane className="w-6 h-6" />
                      </motion.div>

                      {/* Title */}
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                        I&apos;m a Tourist
                      </h2>

                      {/* Subtitle */}
                      <p className="text-base md:text-lg text-white/90 font-light">
                        Discover the city with locals
                      </p>

                      {/* Description - visible on hover */}
                      <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-out">
                        <p className="text-sm md:text-base text-white/85 leading-relaxed pt-2 font-light">
                          Find local student guides to show you authentic experiences and hidden gems in your destination city.
                        </p>

                        {/* CTA Button */}
                        <div className="mt-4 inline-flex items-center text-sm md:text-base font-medium text-white bg-ui-blue-accent/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-white/10 group-hover:bg-ui-blue-accent transition-colors">
                          Explore as Tourist
                          <span className="ml-2 inline-block group-hover:translate-x-2 transition-transform duration-300">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>

              {/* Student CTA */}
              <Link href="/student" className="block group">
                <motion.div
                  className="relative overflow-hidden rounded-3xl shadow-2xl h-[280px] md:h-[320px] cursor-pointer"
                  whileHover={{ scale: 1.02, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Background Image with Parallax Effect */}
                  <motion.div
                    className="absolute inset-0"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                      alt="University students collaborating and learning together"
                      fill
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    {/* Refined gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-primary/30 via-transparent to-ui-purple-accent/20" />
                  </motion.div>

                  {/* Premium border effect */}
                  <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none" />

                  {/* Inner glow effect on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)'
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                    <div className="space-y-3">
                      {/* Icon with premium styling */}
                      <motion.div
                        className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <GraduationCap className="w-6 h-6" />
                      </motion.div>

                      {/* Title */}
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                        I&apos;m a Student
                      </h2>

                      {/* Subtitle */}
                      <p className="text-base md:text-lg text-white/90 font-light">
                        Earn while sharing your city
                      </p>

                      {/* Description - visible on hover */}
                      <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-out">
                        <p className="text-sm md:text-base text-white/85 leading-relaxed pt-2 font-light">
                          Become a guide and earn money by showing travelers around your city with flexible hours.
                        </p>

                        {/* CTA Button */}
                        <div className="mt-4 inline-flex items-center text-sm md:text-base font-medium text-white bg-ui-purple-accent/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-white/10 group-hover:bg-ui-purple-accent transition-colors">
                          Start Guiding
                          <span className="ml-2 inline-block group-hover:translate-x-2 transition-transform duration-300">
                            →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            <WhyChooseCarousel />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
