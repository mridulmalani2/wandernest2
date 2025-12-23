import Image from 'next/image'
import Link from 'next/link'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
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
import { getWebsiteStructuredData, getOrganizationStructuredData, getHowItWorksStructuredData, getFAQStructuredData } from '@/lib/structuredData'

// Force static rendering and cache for 24 hours
export const dynamic = 'force-static'
export const revalidate = 86400

// SEO Metadata for the How It Works page
export const metadata: Metadata = {
  title: 'How TourWiseCo Works - Student-Led Local Travel Experiences',
  description: 'Discover how TourWiseCo connects travelers with verified local university student guides for authentic, personalized travel experiences. Learn how to book a guide or become one.',
  keywords: [
    'how TourWiseCo works',
    'student travel guides',
    'local tour guides',
    'authentic travel experiences',
    'university student guides',
    'personalized tours',
    'become a tour guide',
    'book local guide',
    'student guide marketplace',
    'travel like a local'
  ],
  openGraph: {
    title: 'How TourWiseCo Works - Student-Led Local Travel Experiences',
    description: 'Connect with verified local university students for authentic travel experiences. See how it works for travelers and student guides.',
    type: 'website',
    url: 'https://tourwiseco.vercel.app/how-it-works',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Students and travelers exploring together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How TourWiseCo Works - Student-Led Local Experiences',
    description: 'Connect with verified local university students for authentic travel experiences.',
    images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop'],
  },
  alternates: {
    canonical: 'https://tourwiseco.vercel.app/how-it-works',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      {/* Background - Optimized: Removed backdrop-blur-[2px] which kills performance on large screens */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
          alt="Students and travelers exploring together"
          fill
          priority
          quality={60}
          sizes="100vw"
          className="object-cover opacity-40"
        />
        {/* Simplified overlay stack - single composite layer preferred */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-primary/10 via-ui-blue-primary/5 to-transparent mix-blend-overlay" />
      </div>

      {/* Pattern - Low opacity, static */}
      <div className="absolute inset-0 pattern-dots opacity-[0.03] z-0 pointer-events-none" />

      {/* Structured Data for SEO - Sanitized to prevent XSS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getWebsiteStructuredData())
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getOrganizationStructuredData())
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getHowItWorksStructuredData())
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027')
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getFAQStructuredData())
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/'/g, '\\u0027')
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8 md:pt-32 md:pb-16">
          <div className="max-w-6xl mx-auto space-y-20 md:space-y-32">

            {/* Hero Section */}
            <section className="text-center space-y-6 md:space-y-8 will-change-transform">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
                How TourWiseCo Works:{' '}
                <span className="block mt-2 bg-gradient-to-r from-purple-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Student-Led Local Experiences
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-md">
                TourWiseCo is a marketplace that connects travelers with verified local university students
                for authentic, personalized travel experiences. We believe the best way to explore a new city
                is through the eyes of someone who lives it every day.
              </p>

              {/* Scroll indicator - static now */}
              <div className="pt-8">
                <div className="inline-flex flex-col items-center gap-2 text-white/50">
                  <span className="text-sm font-medium">Learn more</span>
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              </div>
            </section>

            {/* Definition Section - Optimized Glass */}
            <section className="relative transform-gpu">
              <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 backdrop-blur-md">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-300" />
                    What Are Student Guides?
                  </h2>

                  <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-4xl">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-200 text-sm font-medium mb-4">
                  <Compass className="w-4 h-4" />
                  For Tourists
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  How It Works for Travelers
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  Discover cities authentically, affordably, and on your terms
                </p>
              </div>

              {/* Tourist Steps */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {TOURIST_STEPS.map((step) => (
                  <div key={step.step} className="group relative transform-gpu hover:-translate-y-1 transition-transform duration-300 will-change-transform">
                    <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="pt-4">
                        <div className="inline-flex p-3 rounded-xl bg-white/5 text-blue-200 mb-4 border border-white/10">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{step.description}</p>
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
                    <div key={idx} className="group relative overflow-hidden transform-gpu hover:border-white/30 transition-colors duration-300">
                      <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${usp.color} text-white mb-4 shadow-lg`}>
                          <usp.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{usp.title}</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{usp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Decorative Divider */}
            <div className="relative py-4 opacity-80">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <div className="bg-gray-900/50 px-8 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                  <Globe className="w-6 h-6 text-white/50" />
                </div>
              </div>
            </div>

            {/* For Students Section */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-200 text-sm font-medium mb-4">
                  <GraduationCap className="w-4 h-4" />
                  For Students
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  How It Works for Student Guides
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  Earn flexible income while sharing your city and culture
                </p>
              </div>

              {/* Student Steps */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {STUDENT_STEPS.map((step) => (
                  <div key={step.step} className="group relative transform-gpu hover:-translate-y-1 transition-transform duration-300 will-change-transform">
                    <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {step.step}
                      </div>
                      <div className="pt-4">
                        <div className="inline-flex p-3 rounded-xl bg-white/5 text-purple-200 mb-4 border border-white/10">
                          <step.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                        <p className="text-gray-300 leading-relaxed">{step.description}</p>
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
                    <div key={idx} className="group relative overflow-hidden transform-gpu hover:border-white/30 transition-colors duration-300">
                      <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${usp.color} text-white mb-4 shadow-lg`}>
                          <usp.icon className="w-5 h-5" />
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{usp.title}</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{usp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Who We Are Section */}
            <section className="space-y-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm font-medium mb-4">
                  <Users className="w-4 h-4" />
                  Our Team
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  Who We Are
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                  A small team passionate about authentic travel and student empowerment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {FOUNDERS.map((founder) => (
                  <div key={founder.name} className="group flex transform-gpu hover:-translate-y-2 transition-transform duration-300 will-change-transform">
                    <div className="relative flex-1 flex flex-col bg-white/5 border border-white/10 rounded-3xl p-6 text-center hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
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
                              loading="eager"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-white mb-1">{founder.name}</h3>
                        <p className="text-sm text-purple-300 font-medium mb-3">{founder.role}</p>
                        <p className="text-sm text-gray-300 leading-relaxed mb-4 flex-1">{founder.description}</p>

                        {/* LinkedIn Link */}
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors duration-200 border border-white/10 hover:border-white/20 mt-auto"
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
            <section className="text-center space-y-8 py-8 transform-gpu">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                Ready to Experience Authentic Travel?
              </h2>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                Whether you&apos;re exploring a new city or sharing your own, TourWiseCo connects you to meaningful experiences.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link
                  href="/tourist"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-lg hover:brightness-110 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 will-change-transform"
                >
                  <Compass className="w-5 h-5" />
                  I&apos;m a Traveler
                </Link>
                <Link
                  href="/student"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold text-lg hover:brightness-110 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 will-change-transform"
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
