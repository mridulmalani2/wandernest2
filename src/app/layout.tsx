import type { Metadata } from 'next'
import './critical.css'
import { Providers } from './providers'
import { PageTransition } from '@/components/transitions/PageTransition'

/*
 * Font Configuration:
 * Using system fonts for optimal performance and build compatibility
 * - System UI fonts provide excellent performance with no download
 * - No external font dependencies required for builds
 * - Google Fonts can be re-enabled in production if desired by uncommenting
 *   the next/font/google imports and font variables
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wandernest.vercel.app'),
  title: {
    default: 'WanderNest - Connect with Local Student Guides for Authentic Travel',
    template: '%s | WanderNest'
  },
  description: 'Experience authentic travel with verified local student guides. Discover hidden gems, get personalized recommendations, and explore cities like a local. Connect with university students in Paris, London, and beyond.',
  keywords: ['local travel guide', 'student guides', 'authentic travel', 'local experiences', 'university students', 'travel marketplace', 'cultural exchange', 'personalized tours', 'local insights', 'travel companions'],
  authors: [{ name: 'WanderNest' }],
  creator: 'WanderNest',
  publisher: 'WanderNest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://wandernest.vercel.app'),
    title: 'WanderNest - Connect with Local Student Guides for Authentic Travel',
    description: 'Experience authentic travel with verified local student guides. Discover hidden gems and explore cities like a local.',
    siteName: 'WanderNest',
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
    title: 'WanderNest - Connect with Local Student Guides',
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
    <html lang="en">
      <head>
        {/* Preconnect to image CDN for faster image loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen relative">
            {/* Light mode gradient background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 transition-colors duration-300" />
            <div className="relative z-10">
              <PageTransition>
                {children}
              </PageTransition>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
