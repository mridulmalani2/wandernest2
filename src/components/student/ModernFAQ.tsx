'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "How much time do I need to commit?",
    answer: "Most experiences are 3-4 hours. You set your own availability blocks and can update them anytime. You're in complete control of when you're available to guide.",
  },
  {
    question: "Do I need to speak multiple languages?",
    answer: "No! We match you with visitors from your home country, so you can communicate in your native language. This makes the experience more authentic and comfortable for everyone.",
  },
  {
    question: "What about exam periods?",
    answer: "You can mark specific dates or periods when you're unavailable (like exam weeks or holidays). Simply update your availability calendar, and you won't receive requests during those times.",
  },
  {
    question: "How do I get paid?",
    answer: "You arrange payment directly with tourists. WanderNest is a marketplace connector only - we facilitate introductions but don't handle payments. You set your own rates and payment methods.",
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
    <section className="py-20 animate-fade-in-up delay-700">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white text-shadow-lg">
          Common Questions
        </h2>

        <div className="space-y-1">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={index}
                className="group"
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full text-left py-6 flex items-center justify-between gap-6 cursor-pointer focus:outline-none focus-visible:outline-2 focus-visible:outline-white/60 focus-visible:outline-offset-4 rounded-lg transition-all duration-200"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  {/* Question Text */}
                  <h3 className={`
                    text-xl md:text-2xl font-semibold transition-all duration-300
                    ${isOpen
                      ? 'text-white text-shadow-lg'
                      : 'text-white/90 text-shadow group-hover:text-white group-hover:text-shadow-lg group-hover:translate-x-1'
                    }
                  `}>
                    {faq.question}
                  </h3>

                  {/* Arrow */}
                  <ChevronDown
                    className={`
                      flex-shrink-0 w-7 h-7 text-white/90 transition-all duration-300
                      ${isOpen
                        ? 'rotate-180 text-white'
                        : 'group-hover:text-white group-hover:translate-y-0.5'
                      }
                    `}
                    strokeWidth={2.5}
                  />
                </button>

                {/* Answer Panel */}
                <div
                  id={`faq-answer-${index}`}
                  className={`
                    overflow-hidden transition-all duration-500 ease-out
                    ${isOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}
                  `}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <div className="pb-6 pr-12">
                    <p className="text-lg md:text-xl leading-relaxed text-white/80 font-light">
                      {faq.answer}
                    </p>
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className={`
                  h-px transition-all duration-300
                  ${isOpen
                    ? 'bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-60'
                    : 'bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-40 group-hover:opacity-60'
                  }
                `} />
              </div>
            )
          })}
        </div>

        {/* Bottom Text */}
        <div className="mt-12 text-center">
          <p className="text-white/70 text-lg font-light">
            Have more questions? We're here to help you get started.
          </p>
        </div>
      </div>
    </section>
  )
}
