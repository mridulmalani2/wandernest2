import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './critical.css'
import { Providers } from './providers'

/*
 * Font Loading Optimization:
 * - Only load critical weights upfront (400 for body, 700 for headings)
 * - font-display: swap prevents FOIT (Flash of Invisible Text)
 * - adjustFontFallback: true reduces CLS (Cumulative Layout Shift)
 * - preload: true for critical fonts only
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
  adjustFontFallback: true,
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: true,
})

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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/*
          Font Loading Optimization:
          - Preconnect to Google Fonts to establish early connection
          - Next.js automatically handles font preloading for critical weights
          - font-display: swap ensures text is visible while fonts load
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preconnect to image CDN for faster image loading */}
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* Theme initialization script - prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen relative">
            {/* Theme-aware gradient background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/30 transition-colors duration-300" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  )
}
