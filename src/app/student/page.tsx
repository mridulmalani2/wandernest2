import Image from 'next/image'
import Footer from '@/components/Footer'
import FAQAccordion from '@/components/shared/FAQAccordion'
import { studentFAQs } from '@/lib/faq/data'
import { DollarSign, Clock, Users, Check } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

// Force static rendering and cache for 24 hours - prevents hydration issues
export const dynamic = 'force-static'
export const revalidate = 86400

const FEATURES = [
  {
    icon: DollarSign,
    title: 'High Earnings',
    desc: 'Earn significantly more than standard campus jobs. Set your own rates.',
    imgSrc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    alt: 'Person calculating earnings'
  },
  {
    icon: Clock,
    title: 'Total Flexibility',
    desc: 'Work around your class schedule. You choose when you\'re available.',
    imgSrc: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
    alt: 'Student planning schedule'
  },
  {
    icon: Users,
    title: 'Build Network',
    desc: 'Connect with professionals and travelers from your home country.',
    imgSrc: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80',
    alt: 'People networking'
  }
];

const HOW_IT_WORKS_STEPS = [
  {
    title: 'Create Profile',
    text: 'Sign up with your university email and verify your student status'
  },
  {
    title: 'Set Availability',
    text: 'Choose your dates, times, and hourly rates'
  },
  {
    title: 'Start Earning',
    text: 'Accept booking requests and get paid directly by tourists'
  }
];

const COMMITMENT_ITEMS = [
  'Setting your own rates and schedule',
  'Delivering a safe and authentic experience',
  'Handling payments directly with tourists',
  'Maintaining your student verification status'
];

export default function StudentLandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      {/* Background - Optimized: Removed backdrop-blur which kills performance on large screens */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students collaborating on campus"
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

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8 md:pt-32 md:pb-16">
          <div className="max-w-5xl mx-auto space-y-16 md:space-y-20">

            {/* Hero Text */}
            <section className="text-center space-y-6 md:space-y-8 will-change-transform">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
                Earn Money Sharing Your City
                <br />
                <span className="text-gray-200">
                  with Visitors from Home
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-md">
                Turn your local knowledge into income. Host visitors from your home country,
                earn more than campus jobs, and build your network.
              </p>

              <div className="flex justify-center gap-3 sm:gap-4 pt-6">
                <PrimaryCTAButton
                  href="/student/onboarding"
                  showArrow
                  variant="purple"
                  className="text-lg"
                >
                  Start Earning Today
                </PrimaryCTAButton>
              </div>
            </section>

            {/* Features - Image Cards */}
            <section className="transform-gpu">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                  Why Guide with TourWiseCo?
                </h2>
                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                  Flexible, high-paying, and culturally rewarding
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="group relative transform-gpu hover:-translate-y-1 transition-transform duration-300 will-change-transform">
                    <div className="relative h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                      {/* Background image - preloaded */}
                      <div className="absolute inset-0">
                        <Image
                          src={feature.imgSrc}
                          alt={feature.alt}
                          fill
                          quality={60}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover opacity-30"
                          priority={idx < 3}
                        />
                      </div>
                      <div className="relative z-10 p-8 h-full">
                        <div className="inline-flex p-4 rounded-2xl bg-white/10 text-white mb-6 shadow-md border border-white/10">
                          <feature.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-white">
                          {feature.title}
                        </h3>
                        <p className="text-base text-gray-300 leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* How It Works - Timeline Style */}
            <section className="space-y-8 transform-gpu">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-lg">How It Works</h2>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {HOW_IT_WORKS_STEPS.map((step, idx) => (
                    <div key={idx} className="text-center group transform-gpu hover:-translate-y-1 transition-transform duration-300 will-change-transform">
                      <div className="min-h-[120px] space-y-2 bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors duration-300 backdrop-blur-sm">
                        <h3 className="font-bold text-lg text-white">{step.title}</h3>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Vertical Timeline */}
              <div className="md:hidden space-y-4 max-w-md mx-auto">
                {HOW_IT_WORKS_STEPS.map((step, idx) => (
                  <div key={idx} className="space-y-2 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                    <h3 className="font-bold text-base text-white">{step.title}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <FAQAccordion faqs={studentFAQs} className="py-16" />

            {/* Student Guide Commitment */}
            <section className="max-w-3xl mx-auto transform-gpu">
              <div className="relative overflow-hidden bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-md">
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
                        <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                          <strong className="text-white font-medium">As a TourWiseCo guide, you are your own boss.</strong> We connect you with tourists, but you are responsible for:
                        </p>

                        {/* List of Items */}
                        <div className="grid md:grid-cols-2 gap-3">
                          {COMMITMENT_ITEMS.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-400">{item}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs md:text-sm text-gray-400 leading-relaxed italic border-l-2 border-white/20 pl-4">
                          TourWiseCo takes 0% commission from your earnings. You keep 100% of what you charge.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="text-center space-y-8 py-8 transform-gpu">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                Ready to Start?
              </h2>
              <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of students earning flexible income today.
              </p>
              <div className="flex justify-center pt-4">
                <PrimaryCTAButton
                  href="/student/onboarding"
                  showArrow
                  variant="purple"
                  className="text-lg"
                >
                  Create Student Profile
                </PrimaryCTAButton>
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
