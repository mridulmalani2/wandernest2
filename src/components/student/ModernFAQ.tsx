'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, Clock, Globe, CreditCard } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  icon: 'help' | 'clock' | 'globe' | 'payment'
  gradient: string
  glowColor: string
}

const iconMap = {
  help: HelpCircle,
  clock: Clock,
  globe: Globe,
  payment: CreditCard,
}

const faqData: FAQItem[] = [
  {
    question: "How much time do I need to commit?",
    answer: "Most experiences are 3-4 hours. You set your own availability blocks and can update them anytime. You're in complete control of when you're available to guide.",
    icon: 'clock',
    gradient: 'from-blue-500 to-blue-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
  {
    question: "Do I need to speak multiple languages?",
    answer: "No! We match you with visitors from your home country, so you can communicate in your native language. This makes the experience more authentic and comfortable for everyone.",
    icon: 'globe',
    gradient: 'from-purple-500 to-purple-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
  },
  {
    question: "What about exam periods?",
    answer: "You can mark specific dates or periods when you're unavailable (like exam weeks or holidays). Simply update your availability calendar, and you won't receive requests during those times.",
    icon: 'help',
    gradient: 'from-green-500 to-emerald-600',
    glowColor: 'rgba(34, 197, 94, 0.4)',
  },
  {
    question: "How do I get paid?",
    answer: "You arrange payment directly with tourists. WanderNest is a marketplace connector only - we facilitate introductions but don't handle payments. You set your own rates and payment methods.",
    icon: 'payment',
    gradient: 'from-pink-500 to-pink-600',
    glowColor: 'rgba(236, 72, 153, 0.4)',
  },
]

export default function ModernFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleFAQ(index)
    }
  }

  return (
    <section className="glass-card rounded-3xl border-2 border-white/40 p-8 md:p-12 shadow-premium hover:shadow-elevated animate-fade-in-up delay-700 transition-shadow duration-500">
      <h2 className="text-4xl font-bold text-center mb-10 text-white text-shadow-lg">
        Common Questions
      </h2>

      <div className="space-y-3 max-w-3xl mx-auto">
        {faqData.map((faq, index) => {
          const isOpen = openIndex === index
          const Icon = iconMap[faq.icon]

          return (
            <div
              key={index}
              className={`
                group relative rounded-2xl transition-all duration-300
                ${isOpen
                  ? 'bg-white/40 shadow-premium'
                  : 'bg-white/20 hover:bg-white/30 shadow-soft hover:shadow-premium'
                }
                backdrop-blur-md border-2
                ${isOpen
                  ? 'border-white/60'
                  : 'border-white/30 hover:border-white/50'
                }
              `}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleFAQ(index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-full text-left p-5 md:p-6 flex items-start gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-2xl"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
              >
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${faq.gradient}
                    flex items-center justify-center text-white
                    transition-all duration-300
                    ${isOpen
                      ? 'scale-110 shadow-lg'
                      : 'group-hover:scale-105'
                    }
                  `}
                  style={{
                    boxShadow: isOpen
                      ? `0 8px 25px -5px ${faq.glowColor}, 0 4px 15px -3px ${faq.glowColor}`
                      : undefined
                  }}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Question Text */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-gray-950 transition-colors">
                    {faq.question}
                  </h3>
                </div>

                {/* Chevron */}
                <ChevronDown
                  className={`
                    flex-shrink-0 w-6 h-6 text-gray-700
                    transition-transform duration-300
                    ${isOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}
                  `}
                />
              </button>

              {/* Answer Panel */}
              <div
                id={`faq-answer-${index}`}
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                `}
                role="region"
                aria-labelledby={`faq-question-${index}`}
              >
                <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0 pl-20 md:pl-[5.5rem]">
                  <p className="text-base md:text-lg leading-relaxed text-gray-800">
                    {faq.answer}
                  </p>
                </div>
              </div>

              {/* Active Gradient Border Accent */}
              {isOpen && (
                <div
                  className="absolute -inset-[2px] rounded-2xl opacity-40 -z-10 blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${faq.glowColor}, transparent)`
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Decoration */}
      <div className="mt-10 text-center">
        <p className="text-white/80 text-sm md:text-base font-medium">
          Have more questions? We're here to help you get started.
        </p>
      </div>
    </section>
  )
}
