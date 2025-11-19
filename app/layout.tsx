import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './critical.css'
import { Providers } from './providers'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Reduced from 5 to 3 weights
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'], // Reduced from 6 to 4 weights
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
  fallback: ['Georgia', 'serif'],
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
        {/* Preconnect to Google Fonts for faster font loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preconnect to image CDN */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={inter.className}>
        {/* Defer non-critical CSS loading */}
        <Script
          id="load-non-critical-css"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/non-critical.css';
                link.media = 'print';
                link.onload = function() { this.media = 'all'; };
                document.head.appendChild(link);
              })();
            `
          }}
        />

        <Providers>
          <div className="min-h-screen relative">
            {/* Gradient overlay with new color scheme - removed background image for faster LCP */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-cyan-50/95 via-purple-50/90 to-orange-50/95 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
