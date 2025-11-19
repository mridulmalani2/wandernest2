import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://wandernest.vercel.app'),
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
    url: 'https://wandernest.vercel.app',
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen relative">
            {/* Subtle world map background image with parallax */}
            <div
              className="fixed inset-0 z-0 opacity-[0.04] parallax-bg"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1920&q=80)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
            {/* Gradient overlay with new color scheme */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-cyan-50/95 via-purple-50/90 to-orange-50/95 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-[2px]" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
