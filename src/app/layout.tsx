import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './critical.css'
import './globals.css'
import { Providers } from './providers'
import { PageTransition } from '@/components/transitions/PageTransition'
import CookieConsent from '@/components/CookieConsent'

/*
 * Typography System Configuration:
 *
 * FONT PALETTE (Standardized):
 * 1. Inter — Primary body/UI font (--font-body)
 * 2. General Sans — Display & headers (--font-display)
 * 3. Satoshi — Playful accent font for cards, carousels, feature highlights (--font-accent)
 *
 * All fonts loaded locally via Next.js font optimization for best performance.
 * CSS variables are assigned for consistent usage across the codebase.
 */

// Primary body/UI font (Inter)
const inter = localFont({
  src: [
    {
      path: '../fonts/Inter-Variable.woff2',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-body',
})

// Display & headers font (General Sans from Fontshare)
const generalSans = localFont({
  src: [
    {
      path: '../fonts/GeneralSans-Variable.woff2',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-display',
})

// Accent font for cards, carousels, features (Satoshi from Fontshare)
const satoshi = localFont({
  src: [
    {
      path: '../fonts/Satoshi-Variable.woff2',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-accent',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tourwiseco.vercel.app'),
  title: {
    default: 'TourWiseCo - Connect with Local Student Guides for Authentic Travel',
    template: '%s | TourWiseCo'
  },
  description: 'Experience authentic travel with verified local student guides. Discover hidden gems, get personalized recommendations, and explore cities like a local. Connect with university students in Paris, London, and beyond.',
  keywords: ['local travel guide', 'student guides', 'authentic travel', 'local experiences', 'university students', 'travel marketplace', 'cultural exchange', 'personalized tours', 'local insights', 'travel companions'],
  authors: [{ name: 'TourWiseCo' }],
  creator: 'TourWiseCo',
  publisher: 'TourWiseCo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://tourwiseco.vercel.app'),
    title: 'TourWiseCo - Connect with Local Student Guides for Authentic Travel',
    description: 'Experience authentic travel with verified local student guides. Discover hidden gems and explore cities like a local.',
    siteName: 'TourWiseCo',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Group of young travelers exploring a city together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TourWiseCo - Connect with Local Student Guides',
    description: 'Experience authentic travel with verified local student guides. Discover hidden gems and explore cities like a local.',
    images: ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${generalSans.variable} ${satoshi.variable}`}>
      <head>
        {/* Preconnect to image CDN for faster image loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="font-body">
        <Providers>
          <div className="min-h-screen relative">
            {/* Dark mode gradient background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-gray-900 to-slate-900 transition-colors duration-300" />
            <div className="relative z-10">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
            <CookieConsent />
          </div>
        </Providers>
      </body>
    </html>
  )
}
