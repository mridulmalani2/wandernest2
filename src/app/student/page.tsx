import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import FAQAccordion from '@/components/shared/FAQAccordion'
import { studentFAQs } from '@/lib/faq/data'
import { DollarSign, Clock, Users, Check } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

const FEATURES = [
  {
    icon: DollarSign,
    title: 'High Earnings',
    desc: 'Earn significantly more than standard campus jobs. Set your own rates.',
    groupHoverColor: 'text-green-300',
    imgSrc: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80',
    alt: 'Person calculating earnings'
  },
  {
    icon: Clock,
    title: 'Total Flexibility',
    desc: 'Work around your class schedule. You choose when you\'re available.',
    groupHoverColor: 'text-blue-300',
    imgSrc: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80',
    alt: 'Student planning schedule'
  },
  {
    icon: Users,
    title: 'Build Network',
    desc: 'Connect with professionals and travelers from your home country.',
    groupHoverColor: 'text-purple-300',
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0">
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
      </div>
      <div className="absolute inset-0 pattern-dots opacity-15" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero Section */}
        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 pt-24 pb-8 md:pt-32 md:pb-16">
          <div className="max-w-5xl mx-auto space-y-10 md:space-y-16">

            {/* Hero Text */}
            <div className="text-center space-y-6 md:space-y-8 animate-slide-up-fade">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white text-shadow-lg">
                Earn Money{' '}
                <span className="bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 bg-clip-text text-transparent animate-gradient-shift">
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
                  className="text-lg"
                >
                  Start Earning Today
                </PrimaryCTAButton>
              </div>
            </div>

            {/* Features - Image Cards */}
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
                {FEATURES.map((feature, idx) => (
                  <div key={idx} className="group rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden h-full">
                    <div className="absolute inset-0">
                      <Image
                        src={feature.imgSrc}
                        alt={feature.alt}
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
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <h3 className={`text-xl font-bold mb-3 text-white group-hover:${feature.groupHoverColor} transition-colors`}>
                        {feature.title}
                      </h3>
                      <p className="text-base text-white/90 leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works - Timeline Style */}
            <div className="space-y-6 pt-8 animate-fade-in-up delay-500">
              <h2 className="text-3xl md:text-4xl font-bold text-center text-white text-shadow-lg">How It Works</h2>

              {/* Desktop Timeline */}
              <div className="hidden md:block relative max-w-4xl mx-auto">
                <div className="grid md:grid-cols-3 gap-8">
                  {HOW_IT_WORKS_STEPS.map((step, idx) => (
                    <div key={idx} className="text-center group">
                      <div className="min-h-[120px] space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-5 border border-white/20 group-hover:bg-white/20 transition-all">
                        <h3 className="font-bold text-lg text-white">{step.title}</h3>
                        <p className="text-sm text-white/90 leading-relaxed">
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
                  <div key={idx} className="space-y-2 backdrop-blur-sm bg-white/10 rounded-xl p-4 border border-white/20">
                    <h3 className="font-bold text-base text-white">{step.title}</h3>
                    <p className="text-sm text-white/90 leading-relaxed">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <FAQAccordion faqs={studentFAQs} className="py-20 animate-fade-in-up delay-700" />

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
                          {COMMITMENT_ITEMS.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/10">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-white/70 font-light">{item}</span>
                            </div>
                          ))}
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
                  href="/student/onboarding"
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
