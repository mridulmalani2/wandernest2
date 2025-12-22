'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plane, GraduationCap, ChevronDown, Sparkles, Users, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * LandingFallback - Static version for devices without WebGL
 *
 * Preserves all functionality:
 * - Hero headline and subheadline
 * - Tourist/Student CTAs
 * - Value propositions
 * - Clear conversion paths
 *
 * Uses CSS animations instead of 3D for a polished experience
 * while being accessible to all devices.
 */
export function LandingFallback() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a1a3a] to-[#0f0f2f]">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-slow" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float-slow"
          style={{ animationDelay: '-3s' }}
        />

        {/* Star pattern */}
        <div className="absolute inset-0 pattern-dots opacity-20" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Headline */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight tracking-tight mb-6"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          >
            Experience Authentic Travel
            <span className="block mt-2 md:mt-3">with Local Student Guides</span>
          </h1>

          {/* Subheadline */}
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect with verified university students in Paris and London who will show you
            their city through a local&apos;s eyes. Get personalized recommendations and
            authentic experiences.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              href="/tourist"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Plane className="w-5 h-5" />
              <span className="text-lg">I&apos;m a Tourist</span>
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/student"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#A66CFF] to-[#E85D9B] rounded-2xl font-medium text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <GraduationCap className="w-5 h-5" />
              <span className="text-lg">I&apos;m a Student</span>
              <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <span className="text-white/60 text-xs uppercase tracking-widest">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5 text-white/60 animate-bounce" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4"
              style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
            >
              Why Choose TourWise?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Experience travel differently with our verified student guides
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Authentic Experiences',
                description:
                  'Discover hidden gems, local cafes, and secret spots that only residents know about.',
                color: 'from-blue-500/20 to-purple-500/20',
              },
              {
                icon: Users,
                title: 'Verified Students',
                description:
                  'All guides are verified university students with proven local knowledge and passion.',
                color: 'from-purple-500/20 to-pink-500/20',
              },
              {
                icon: Calendar,
                title: 'Flexible & Personal',
                description:
                  'Customize your experience based on your interests, pace, and schedule.',
                color: 'from-blue-500/20 to-cyan-500/20',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="relative group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`}
                />
                <div className="relative glass-card-dark rounded-3xl p-8 border border-white/10 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="text-3xl md:text-4xl font-serif font-bold text-white mb-6"
            style={{ textShadow: '0 2px 15px rgba(0,0,0,0.4)' }}
          >
            Ready to Start Your Journey?
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tourist"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-medium text-white transition-all duration-300 hover:scale-105"
            >
              <Plane className="w-5 h-5" />
              <span>Book a Guide</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/student"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl font-medium text-white transition-all duration-300 hover:scale-105"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Become a Guide</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
