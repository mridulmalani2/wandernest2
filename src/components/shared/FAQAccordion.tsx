// Visual: Using design system border radii, shadows, and typography
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  return (
    <section
      className={`mx-auto max-w-5xl rounded-2xl bg-white/30 backdrop-blur-xl p-10 md:p-14 shadow-elevated border border-white/40 ${className}`}
    >
      <h2 className="text-center text-3xl md:text-4xl font-bold font-serif mb-8 md:mb-10">
        {title}
      </h2>

      <div className="space-y-4">
        {faqs.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <motion.div
              key={idx}
              className="rounded-xl border border-white/50 bg-white/20 shadow-soft overflow-hidden"
              initial={false}
              animate={{
                backgroundColor: isOpen ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.2)'
              }}
              whileHover={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)'
              }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-expanded={isOpen}
              >
                <span className="text-lg md:text-xl font-medium">{item.question}</span>
                <motion.span
                  className="ml-4 text-xl flex-shrink-0"
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  ▶
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: 'auto',
                      opacity: 1,
                      transition: {
                        height: {
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1]
                        },
                        opacity: {
                          duration: 0.25,
                          ease: 'easeOut',
                          delay: 0.05
                        }
                      }
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: {
                          duration: 0.25,
                          ease: [0.22, 1, 0.36, 1]
                        },
                        opacity: {
                          duration: 0.2,
                          ease: 'easeIn'
                        }
                      }
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      initial={{ y: -5 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="px-6 pb-4 text-sm leading-relaxed text-gray-800"
                    >
                      {item.answer}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
