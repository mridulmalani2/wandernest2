'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContactModal } from '@/components/ContactModal/ContactModalProvider'

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
    answer: "You arrange payment directly with tourists. TourWiseCo is a marketplace connector only - we facilitate introductions but don't handle payments. You set your own rates and payment methods.",
  },
]

export default function ModernFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { openContactModal } = useContactModal()

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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white text-shadow-lg">
          Common Questions
        </h2>

        <div className="backdrop-blur-md bg-transparent rounded-3xl border border-white/20 shadow-premium overflow-hidden">
          {faqData.map((faq, index) => {
            const isOpen = openIndex === index
            const isLast = index === faqData.length - 1

            return (
              <div
                key={index}
                className={`group ${!isLast ? 'border-b border-white/10' : ''}`}
              >
                {/* Question Button */}
                <button
                  onClick={() => toggleFAQ(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`
                    w-full text-left px-8 py-7 flex items-center justify-between gap-6 cursor-pointer
                    transition-all duration-300 ease-out
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                    ${isOpen ? 'bg-white/5' : 'hover:bg-white/5'}
                  `}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  {/* Question Text */}
                  <h3 className={`
                    text-xl md:text-2xl font-semibold transition-all duration-300
                    ${isOpen
                      ? 'text-white text-shadow-lg'
                      : 'text-white/95 group-hover:text-white text-shadow'
                    }
                  `}>
                    {faq.question}
                  </h3>

                  {/* Arrow Icon */}
                  <motion.div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white/10"
                    animate={{
                      rotate: isOpen ? 180 : 0,
                      backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <ChevronDown
                      className="w-6 h-6 text-white"
                      strokeWidth={2.5}
                    />
                  </motion.div>
                </button>

                {/* Answer Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                        transition: {
                          height: {
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1]
                          },
                          opacity: {
                            duration: 0.3,
                            ease: 'easeOut',
                            delay: 0.1
                          }
                        }
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1]
                          },
                          opacity: {
                            duration: 0.2,
                            ease: 'easeIn'
                          }
                        }
                      }}
                      className="overflow-hidden"
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                    >
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="px-8 pb-7 pt-2"
                      >
                        <p className="text-lg md:text-xl leading-relaxed text-white/90 font-normal">
                          {faq.answer}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Bottom Text */}
        <div className="mt-12 text-center">
          <p className="text-white/80 text-lg md:text-xl font-normal text-shadow">
            Have more questions? We're here to help you get started.{' '}
            <button
              onClick={openContactModal}
              className="text-white underline hover:text-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/60 focus:ring-offset-2 focus:ring-offset-transparent rounded"
            >
              Contact us
            </button>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
