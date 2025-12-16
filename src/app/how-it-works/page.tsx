'use client'

import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import {
  Users,
  Compass,
  Globe,
  DollarSign,
  Calendar,
  Coffee,
  Sparkles,
  Heart,
  GraduationCap,
  Wallet,
  Network,
  ArrowRight,
  Star,
  MessageCircle,
  Linkedin
} from 'lucide-react'
import { getWebsiteStructuredData, getOrganizationStructuredData } from '@/lib/structuredData'

// Tourist USPs
const TOURIST_USPS = [
  {
    icon: GraduationCap,
    title: 'Real Student Guides, Not Scripts',
    description: 'Explore cities with real university students, not scripted tour guides. See the city as locals actually live it — cafes, shortcuts, neighborhoods, and routines tourists never find.',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    icon: Wallet,
    title: 'Personalized & Affordable',
    description: 'Pay less than traditional tours while getting fully personalized experiences. No fixed itineraries. No group herding. Just experiences shaped around you.',
    color: 'from-green-400 to-emerald-400'
  },
  {
    icon: Heart,
    title: 'Cultural Comfort',
    description: 'Choose a guide from your own home country for comfort and cultural familiarity. Travel becomes easier when your guide understands your language, humor, and expectations.',
    color: 'from-pink-400 to-rose-400'
  },
  {
    icon: Compass,
    title: 'Hidden Gems Only',
    description: 'Discover hidden gems that never show up on TripAdvisor. Student guides share the places they genuinely go to — not the ones designed for tourists.',
    color: 'from-purple-400 to-violet-400'
  },
  {
    icon: Star,
    title: 'Support Students Directly',
    description: 'Your spend goes straight to students, helping fund their education — not large tour companies. Travel responsibly while making a real difference.',
    color: 'from-amber-400 to-orange-400'
  }
]

// Student USPs
const STUDENT_USPS = [
  {
    icon: DollarSign,
    title: 'Earn More, Your Way',
    description: 'Earn significantly more than campus jobs, on your own terms. Set your availability, choose your engagements, and earn at rates far above typical student work.',
    color: 'from-green-400 to-emerald-400'
  },
  {
    icon: Calendar,
    title: 'Total Flexibility',
    description: 'No rigid schedules, no long-term commitments. Guide when you want. Pause during exams. Resume anytime. Your studies always come first.',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    icon: Coffee,
    title: 'Monetize What You Know',
    description: 'No certifications, no rehearsed scripts — just share your lived experience. Monetize what you already know: your city and culture.',
    color: 'from-amber-400 to-orange-400'
  },
  {
    icon: Network,
    title: 'Build Global Connections',
    description: 'Meet travelers, professionals, and families from around the world — many beyond student circles. Build an international network that extends beyond campus.',
    color: 'from-purple-400 to-violet-400'
  },
  {
    icon: Wallet,
    title: 'Keep What You Earn',
    description: 'Get paid directly for your time and knowledge. You keep what you charge, with no traditional employer constraints. TourWiseCo takes 0% commission.',
    color: 'from-pink-400 to-rose-400'
  }
]

// Tourist Steps
const TOURIST_STEPS = [
  {
    step: 1,
    title: 'Share Your Preferences',
    description: 'Tell us about your travel dates, interests, and what kind of experience you\'re looking for. Prefer a guide from your home country? Just let us know.',
    icon: MessageCircle
  },
  {
    step: 2,
    title: 'Get Matched',
    description: 'We match you with verified student guides who fit your preferences and availability. Review their profiles and choose the perfect fit.',
    icon: Users
  },
  {
    step: 3,
    title: 'Connect & Explore',
    description: 'Connect directly with your guide to finalize details. Then experience the city through their eyes — local cafes, hidden spots, and authentic adventures.',
    icon: Compass
  }
]

// Student Steps
const STUDENT_STEPS = [
  {
    step: 1,
    title: 'Create Your Profile',
    description: 'Sign up with your university email and complete verification. Showcase your personality, interests, and what makes your city special.',
    icon: GraduationCap
  },
  {
    step: 2,
    title: 'Set Your Terms',
    description: 'Define your availability, preferred tour durations, and hourly rates. You\'re in complete control of when and how you guide.',
    icon: Calendar
  },
  {
    step: 3,
    title: 'Start Earning',
    description: 'Receive booking requests from travelers, accept the ones that work for you, and get paid directly. Build your reputation with reviews.',
    icon: DollarSign
  }
]

// Founders Data
const FOUNDERS = [
  {
    name: 'Mridul Anil Malani',
    role: 'Founder',
    description: 'Conceived and built the primary MVP infrastructure, and leads as CEO & CFO.',
    linkedin: 'https://www.linkedin.com/in/mridulmalani/',
    image: '/images/founders/mridul.jpg'
  },
  {
    name: 'Aditeya Arya',
    role: 'Co-Founder',
    description: 'Shaped TourWiseCo\'s data architecture and analytics foundations, and leads as CXO & Head of Data Management.',
    linkedin: 'https://www.linkedin.com/in/aditeyaarya/',
    image: '/images/founders/aditeya.jpg'
  },
  {
    name: 'Ajinkya Kamble',
    role: 'Co-Founder',
    description: 'Drove core technology development and product direction, and leads as CTO & Head of Product and Strategy.',
    linkedin: 'https://www.linkedin.com/in/ajinkya-kamble/',
    image: '/images/founders/ajinkya.jpg'
  }
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
          alt="Students and travelers exploring together"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-primary/20 via-ui-blue-primary/15 to-black/40" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebsiteStructuredData())
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationStructuredData())
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8 md:pt-32 md:pb-16">
          <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">

            {/* Hero Section */}
            <section className="text-center space-y-6 md:space-y-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                How TourWiseCo Works:{' '}
                <span className="block mt-2 bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Student-Led Local Experiences
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-4xl mx-auto leading-relaxed font-medium text-shadow">
                TourWiseCo is a marketplace that connects travelers with verified local university students
                for authentic, personalized travel experiences. We believe the best way to explore a new city
                is through the eyes of someone who lives it every day.
              </p>

              {/* Animated scroll indicator */}
              <div className="pt-8">
                <div className="inline-flex flex-col items-center gap-2 text-white/60">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </section>

            {/* Definition Section */}
            <section className="relative">
              <div className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-12 hover:border-white/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-400" />
                    What Are Student Guides?
                  </h2>

                  <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-4xl">
                    <strong className="text-white">Student guides</strong> are verified university students who offer
                    personalized tours and local experiences in their city. Unlike traditional tour guides,
                    student guides share genuine insider knowledge — the coffee shops they study at, the
                    neighborhoods they explore on weekends, and the shortcuts only locals know. They bring
                    fresh perspectives, cultural understanding, and authentic connections to every experience.
                    Many travelers choose guides from their home country for added comfort, language familiarity,
                    and shared cultural references.
                  </p>
                </div>
              </div>
            </section>

            {/* For Tourists Section */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-medium mb-4">
                  <Compass className="w-4 h-4" />
                  For Tourists
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-shadow-lg">
                  How It Works for Travelers
                </h2>
                <p className="text-lg md:text-xl text-white/85 max-w-3xl mx-auto">
                  Discover cities authentically, affordably, and on your terms
                </p>
              </div>

              {/* Tourist Steps */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {TOURIST_STEPS.map((step) => (
                  <div key={step.step} className="group relative">
                    <div className="relative h-full backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="pt-4">
                        <div className="inline-flex p-3 rounded-xl bg-white/10 text-white mb-4 border border-white/10">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-white/80 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tourist USPs */}
              <div className="space-y-6 pt-8">
                <h3 className="text-2xl md:text-3xl font-bold text-center text-white">
                  Why Travelers Choose TourWiseCo
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {TOURIST_USPS.map((usp, idx) => (
                    <div key={idx} className="group relative overflow-hidden">
                      <div className="relative h-full backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${usp.color} text-white mb-4 shadow-lg`}>
                          <usp.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{usp.title}</h4>
                        <p className="text-sm text-white/75 leading-relaxed">{usp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Decorative Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <div className="bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 backdrop-blur-sm px-8 py-2 rounded-full border border-white/10">
                  <Globe className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </div>

            {/* For Students Section */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium mb-4">
                  <GraduationCap className="w-4 h-4" />
                  For Students
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-shadow-lg">
                  How It Works for Student Guides
                </h2>
                <p className="text-lg md:text-xl text-white/85 max-w-3xl mx-auto">
                  Earn flexible income while sharing your city and culture
                </p>
              </div>

              {/* Student Steps */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {STUDENT_STEPS.map((step) => (
                  <div key={step.step} className="group relative">
                    <div className="relative h-full backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="pt-4">
                        <div className="inline-flex p-3 rounded-xl bg-white/10 text-white mb-4 border border-white/10">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-white/80 leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Student USPs */}
              <div className="space-y-6 pt-8">
                <h3 className="text-2xl md:text-3xl font-bold text-center text-white">
                  Why Students Choose to Guide
                </h3>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {STUDENT_USPS.map((usp, idx) => (
                    <div key={idx} className="group relative overflow-hidden">
                      <div className="relative h-full backdrop-blur-md bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-white/30 transition-all duration-300">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${usp.color} text-white mb-4 shadow-lg`}>
                          <usp.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{usp.title}</h4>
                        <p className="text-sm text-white/75 leading-relaxed">{usp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Who We Are Section */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium mb-4">
                  <Users className="w-4 h-4" />
                  Our Team
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-shadow-lg">
                  Who We Are
                </h2>
                <p className="text-lg md:text-xl text-white/85 max-w-3xl mx-auto">
                  A small team passionate about authentic travel and student empowerment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {FOUNDERS.map((founder) => (
                  <div key={founder.name} className="group flex">
                    <div className="relative flex-1 flex flex-col backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-6 text-center hover:border-white/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                      {/* Profile Image */}
                      <div className="relative w-28 h-28 mx-auto mb-5">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-[2px]">
                          <div className="w-full h-full rounded-full overflow-hidden bg-gray-900">
                            <Image
                              src={founder.image}
                              alt={founder.name}
                              width={112}
                              height={112}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-1">{founder.name}</h3>
                        <p className="text-sm text-purple-300 font-medium mb-3">{founder.role}</p>
                        <p className="text-sm text-white/70 leading-relaxed mb-4 flex-1">{founder.description}</p>

                        {/* LinkedIn Link */}
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium hover:bg-white/20 hover:text-white transition-all duration-200 border border-white/10 hover:border-white/20 mt-auto"
                        >
                          <Linkedin className="w-4 h-4" />
                          LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Final CTA Section */}
            <section className="text-center space-y-8 py-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-shadow-lg">
                Ready to Experience Authentic Travel?
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
                Whether you&apos;re exploring a new city or sharing your own, TourWiseCo connects you to meaningful experiences.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link
                  href="/tourist"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Compass className="w-5 h-5" />
                  I&apos;m a Traveler
                </Link>
                <Link
                  href="/student"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold text-lg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-5 h-5" />
                  I&apos;m a Student
                </Link>
              </div>
            </section>

          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
