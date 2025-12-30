'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GraduationCap, MessageCircle, Star, AlertTriangle, Users, MapPin } from 'lucide-react'
import Footer from '@/components/Footer'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import { motion, Variants } from 'framer-motion'
import { useRef } from 'react'

// Animation Variants
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
    },
  },
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      duration: 0.5,
    },
  },
}

const cardHover: Variants = {
  hover: {
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
}

export default function TouristLanding() {
  const containerRef = useRef(null)

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black selection:bg-ui-blue-primary/30">
      {/* Background with optimized loading */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/backgrounds/cafe-ambiance.jpg"
          alt="Beautiful London Thames River with iconic architecture"
          fill
          priority
          quality={70}
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/10 via-transparent to-ui-purple-primary/10 mix-blend-overlay" />
      </div>

      <div className="absolute inset-0 pattern-dots opacity-10 z-[1] pointer-events-none" />

      <div className="relative z-10 flex flex-col min-h-screen" ref={containerRef}>
        {/* Hero Section */}
        <motion.main
          className="flex-1 container mx-auto px-4 pt-24 pb-8 md:pt-36 md:pb-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="max-w-5xl mx-auto space-y-12 md:space-y-20">
            <div className="text-center space-y-8 md:space-y-10">
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-2xl"
                variants={fadeInUp}
              >
                Experience Authentic Travel
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-indigo-300 animate-gradient-shift">
                  with Local Student Guides
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl text-blue-50/90 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg"
                variants={fadeInUp}
              >
                Connect with verified university students who will show you their city
                through a local&apos;s eyes. Get personalized recommendations and authentic
                experiences.
              </motion.p>

              <motion.p
                className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto leading-relaxed"
                variants={fadeInUp}
              >
                Choose a guide from your home country for added comfort, or explore connections with local students.
              </motion.p>

              <motion.div
                className="flex justify-center gap-4 pt-4"
                variants={fadeInUp}
              >
                <PrimaryCTAButton
                  href="/booking"
                  showArrow
                  variant="blue"
                  className="text-lg px-8 py-6 shadow-glow-blue hover:shadow-glow-blue-lg transition-shadow duration-300"
                >
                  Start Your Adventure
                </PrimaryCTAButton>
              </motion.div>
            </div>

            {/* Features */}
            <motion.div
              className="pt-16"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="text-center space-y-4 mb-16">
                <motion.h2
                  className="text-3xl md:text-5xl font-serif font-bold text-white drop-shadow-lg"
                  variants={fadeInUp}
                >
                  Why Choose TourWiseCo?
                </motion.h2>
                <motion.p
                  className="text-lg text-blue-100/80 max-w-2xl mx-auto"
                  variants={fadeInUp}
                >
                  Authentic travel experiences with verified local student guides
                </motion.p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
                {[
                  {
                    icon: GraduationCap,
                    title: "Verified Students",
                    desc: "All guides are verified university students with local knowledge",
                    color: "text-blue-400"
                  },
                  {
                    icon: MessageCircle,
                    title: "Personalized Experience",
                    desc: "Get custom itineraries based on your interests and preferences",
                    color: "text-purple-400"
                  },
                  {
                    icon: Star,
                    title: "Authentic Adventures",
                    desc: "Discover hidden gems and local favorites off the beaten path",
                    color: "text-amber-400"
                  }
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="group relative rounded-3xl overflow-hidden h-full min-h-[320px] bg-white/5 border border-white/10 backdrop-blur-md"
                    variants={scaleIn}
                    whileHover="hover"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0"
                      variants={{ hover: { opacity: 0.8 } }}
                    />

                    <div className="relative z-10 p-8 h-full flex flex-col items-start">
                      <motion.div
                        className={`inline-flex p-4 rounded-2xl bg-white/10 ${feature.color} mb-6 shadow-lg border border-white/10 backdrop-blur-sm`}
                        variants={cardHover}
                      >
                        <feature.icon className="w-8 h-8" />
                      </motion.div>

                      <h3 className={`text-2xl font-bold mb-4 text-white group-hover:${feature.color.replace('text-', 'text-')} transition-colors`}>
                        {feature.title}
                      </h3>
                      <p className="text-lg text-blue-100/70 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* How It Works Section */}
            <motion.div
              className="space-y-12 pt-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.h2
                className="text-3xl md:text-5xl font-bold text-center text-white drop-shadow-lg"
                variants={fadeInUp}
              >
                How It Works
              </motion.h2>

              <div className="relative max-w-5xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                  {[
                    "Submit Your Request",
                    "Get Matched with Guides",
                    "Experience the City"
                  ].map((step, idx) => (
                    <motion.div
                      key={idx}
                      className="text-center group relative"
                      variants={fadeInUp}
                    >
                      <div className="min-h-[160px] flex flex-col items-center justify-center space-y-4 backdrop-blur-md bg-white/5 rounded-3xl p-8 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-premium">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 font-bold text-lg border border-blue-500/30 mb-2">
                          {idx + 1}
                        </div>
                        <h3 className="font-bold text-xl text-white">{step}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* City Destination Cards */}
            <motion.div
              className="space-y-12 pt-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div className="text-center" variants={fadeInUp}>
                <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                  Choose Your Destination
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
                {[
                  {
                    city: "Paris",
                    country: "France",
                    image: "/images/backgrounds/eifel_background.jpg",
                    stats: "45+ guides",
                    color: "group-hover:text-purple-300"
                  },
                  {
                    city: "London",
                    country: "United Kingdom",
                    image: "/images/backgrounds/big_ben.jpg",
                    stats: "60+ guides",
                    color: "group-hover:text-blue-300"
                  }
                ].map((dest, idx) => (
                  <Link key={idx} href="/booking" className="group block h-full">
                    <motion.div
                      className="relative h-[480px] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"
                      variants={scaleIn}
                      whileHover={{ y: -10, transition: { duration: 0.3 } }}
                    >
                      {/* Background Image */}
                      <Image
                        src={dest.image}
                        alt={`Iconic ${dest.city} architecture`}
                        fill
                        quality={85}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Content */}
                      <div className="absolute inset-0 flex flex-col justify-end p-10">
                        <div className="mb-auto self-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                            <span className="text-white text-xl">→</span>
                          </div>
                        </div>

                        <div className="mb-4 inline-flex items-center gap-2 self-start backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/20">
                          <MapPin className="w-4 h-4 text-white" />
                          <span className="text-white text-sm font-medium">{dest.country}</span>
                        </div>

                        <h3 className={`text-5xl font-bold text-white mb-4 drop-shadow-lg ${dest.color} transition-colors`}>
                          {dest.city}
                        </h3>

                        <div className="flex items-center gap-2 text-blue-100/80">
                          <Users className="w-5 h-5" />
                          <span className="text-lg font-medium">{dest.stats}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Marketplace Disclaimer */}
            <motion.div
              className="mt-24 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="relative overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl">
                <div className="relative p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start gap-8">
                    <div className="flex-shrink-0">
                      <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 shadow-inner border border-amber-500/20">
                        <AlertTriangle className="w-8 h-8" strokeWidth={2} />
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div>
                        <h2 className="font-bold text-white text-2xl">Important Notice</h2>
                        <div className="h-1 w-12 bg-amber-500/50 rounded-full mt-3"></div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-base md:text-lg text-blue-50/80 leading-relaxed font-light">
                          <strong className="text-white font-medium">TourWiseCo is a marketplace connector only.</strong> We facilitate connections between tourists and local student guides.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {["Handle any payments", "Guarantee service quality", "Act as an employer", "Assume liability"].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                                <span className="text-red-400 text-xs font-bold">✕</span>
                              </div>
                              <span className="text-sm text-blue-100/60 font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.main>

        <Footer />
      </div>
    </div>
  )
}
