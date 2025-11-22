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
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function MainLanding() {
  const structuredData = getWebsiteStructuredData()
  const organizationData = getOrganizationStructuredData()
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 150])

  return (
    <div ref={heroRef} className="min-h-screen flex flex-col relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <motion.div className="absolute inset-0" style={{ y }}>
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
      </motion.div>
      <div className="absolute inset-0 pattern-dots opacity-20" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navigation variant="default" />

        {/* Hero Section - Asymmetric Layout with 90% zoom effect */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 lg:py-18">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-7 lg:gap-14 items-center min-h-[calc(100vh-14rem)]">

              {/* Left Column - Editorial Text Content */}
              <motion.div
                className="space-y-7 lg:space-y-9"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Headline - Left-aligned Serif */}
                <div className="space-y-3">
                  <motion.h1
                    className="text-[2.7rem] sm:text-[3.375rem] lg:text-[4rem] xl:text-[5.4rem] font-serif font-bold leading-[1.05] tracking-tight text-white text-shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  >
                    Experience Authentic Travel
                    <span className="block mt-2 lg:mt-3">
                      with Local Student Guides
                    </span>
                  </motion.h1>

                  {/* Subheadline - Modern Sans-serif */}
                  <motion.p
                    className="text-base sm:text-lg lg:text-xl text-stone-100 leading-relaxed font-light max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                  >
                    Connect with verified university students who will show you their city
                    through a local&apos;s eyes. Get personalized recommendations and authentic
                    experiences.
                  </motion.p>
                </div>

                {/* Gradient CTAs with Soft Glow */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  {/* Tourist CTA - Gradient Button */}
                  <Link href="/tourist" className="group">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Soft glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400 rounded-2xl opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500" />

                      <div className="relative px-8 py-4 bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400 rounded-2xl shadow-lg overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="relative flex items-center gap-3">
                          <Plane className="w-5 h-5 text-white" />
                          <span className="text-base lg:text-lg font-medium text-white">
                            I&apos;m a Tourist
                          </span>
                          <span className="ml-auto text-white group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>

                  {/* Student CTA - Gradient Button */}
                  <Link href="/student" className="group">
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Soft glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400 rounded-2xl opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500" />

                      <div className="relative px-8 py-4 bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400 rounded-2xl shadow-lg overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                        <div className="relative flex items-center gap-3">
                          <GraduationCap className="w-5 h-5 text-white" />
                          <span className="text-base lg:text-lg font-medium text-white">
                            I&apos;m a Student
                          </span>
                          <span className="ml-auto text-white group-hover:translate-x-1 transition-transform duration-300">
                            →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Right Column - Floating Layered Image Collage */}
              <div className="relative h-[450px] md:h-[540px] lg:h-[630px]">
                {/* Image 1 - Back layer */}
                <motion.div
                  className="absolute top-[10%] left-[5%] w-[65%] h-[45%] rounded-3xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
                  animate={{ opacity: 1, scale: 1, rotate: -6 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    y: -12,
                    rotate: -8,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                      alt="Tourists exploring a European city together"
                      fill
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 80vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                  </div>
                </motion.div>

                {/* Image 2 - Middle layer */}
                <motion.div
                  className="absolute top-[35%] right-[10%] w-[60%] h-[40%] rounded-3xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8, rotate: 8 }}
                  animate={{ opacity: 1, scale: 1, rotate: 5 }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    y: -16,
                    rotate: 7,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
                      alt="University students collaborating and learning together"
                      fill
                      loading="lazy"
                      quality={85}
                      sizes="(max-width: 768px) 80vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                  </div>
                </motion.div>

                {/* Image 3 - Front layer */}
                <motion.div
                  className="absolute bottom-[8%] left-[15%] w-[55%] h-[38%] rounded-3xl overflow-hidden shadow-2xl"
                  initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                  animate={{ opacity: 1, scale: 1, rotate: 3 }}
                  transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{
                    y: -20,
                    rotate: 5,
                    scale: 1.02,
                    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                  }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80"
                      alt="Beautiful Paris cityscape with Eiffel Tower"
                      fill
                      priority
                      quality={85}
                      sizes="(max-width: 768px) 80vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent" />
                  </div>
                </motion.div>

                {/* Decorative floating elements */}
                <motion.div
                  className="absolute top-[5%] right-[8%] w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute bottom-[15%] right-[5%] w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl"
                  animate={{
                    y: [0, 20, 0],
                    scale: [1, 1.15, 1]
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </div>
            </div>

            {/* Why Choose Carousel - Below Hero */}
            <motion.div
              className="mt-14 lg:mt-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <WhyChooseCarousel />
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
