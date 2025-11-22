// Visual: Using design system border radii, shadows, and typography
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { FAQ } from "@/lib/faq/data";

interface FAQAccordionProps {
  faqs: FAQ[];
  title?: string;
  className?: string;
}

export default function FAQAccordion({
  faqs,
  title = "Common Questions",
  className = "",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <section className={`mx-auto max-w-4xl ${className}`}>
      <h2 className="text-center text-3xl md:text-4xl font-bold mb-12 md:mb-16 text-white text-shadow-lg">
        {title}
      </h2>

      <div className="backdrop-blur-md bg-transparent rounded-3xl border border-white/20 shadow-premium overflow-hidden">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;
          const isLast = idx === faqs.length - 1;

          return (
            <div
              key={idx}
              className={`group ${!isLast ? 'border-b border-white/10' : ''}`}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`
                  w-full text-left px-6 md:px-8 py-6 md:py-7 flex items-center justify-between gap-6 cursor-pointer
                  transition-all duration-300 ease-out
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent
                  ${isOpen ? 'bg-white/5' : 'hover:bg-white/5'}
                `}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${idx}`}
              >
                <h3 className={`
                  text-lg md:text-xl font-semibold transition-all duration-300
                  ${isOpen
                    ? 'text-white text-shadow-lg'
                    : 'text-white/95 group-hover:text-white text-shadow'
                  }
                `}>
                  {item.question}
                </h3>

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

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-answer-${idx}`}
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
                    aria-labelledby={`faq-question-${idx}`}
                  >
                    <motion.div
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="px-6 md:px-8 pb-6 md:pb-7 pt-2"
                    >
                      <p className="text-base md:text-lg leading-relaxed text-white/90 font-normal">
                        {item.answer}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
