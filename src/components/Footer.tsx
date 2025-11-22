'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { useContactModal } from '@/components/ContactModal/ContactModalProvider'

interface FooterProps {
  variant?: 'default' | 'minimal'
}

export default function Footer({ variant = 'default' }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { openContactModal } = useContactModal()

  if (variant === 'minimal') {
    return (
      <footer className="relative z-20 mt-auto">
        <div className="border-t border-white/20 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-sm text-white/90 text-shadow-sm">
              © {currentYear} TourWiseCo. Connecting cultures, one guide at a time.
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="relative z-20 mt-auto">
      <div className="border-t border-white/20 bg-gradient-to-b from-black/10 to-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-2.5 group w-fit">
                <div className="p-1.5 rounded-lg bg-white/10 text-white backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <Globe className="w-5 h-5" />
                </div>
                <span className="text-xl font-sans font-semibold text-white tracking-tight transition-all duration-300 group-hover:text-white/90">
                  TourWiseCo
                </span>
              </Link>
              <p className="text-sm text-white/80 leading-relaxed max-w-md">
                Connecting travelers with verified local student guides in Paris and London for authentic, personalized experiences.
                Discover these cities through the eyes of those who know them best.
              </p>
              <div className="pt-2">
                <p className="text-xs text-white/60">
                  © {currentYear} TourWiseCo. All rights reserved.
                </p>
              </div>
            </div>

            {/* For Travelers */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                For Travelers
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/tourist"
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/booking"
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Book a Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tourist/signin"
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Students */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                For Students
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/student"
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Become a Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="/student/signin"
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Guide Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/student/dashboard"
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={openContactModal}
                    className="text-sm text-white/80 hover:text-white transition-colors duration-200 inline-block hover:translate-x-1 transform text-left"
                  >
                    Contact us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar - Legal Disclaimer */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
              <p className="text-xs text-white/70 leading-relaxed text-center">
                <strong className="text-white/90">Important Notice:</strong> TourWiseCo is a marketplace connector only.
                We facilitate connections between tourists and local student guides but do not handle payments,
                guarantee service quality, act as an employer, or assume liability for guide-tourist interactions.
                All arrangements and payments are agreed upon directly between travelers and guides.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
