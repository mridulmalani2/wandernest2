import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Tourists - Find Local Student Guides',
  description: 'Experience authentic travel with verified local student guides. Discover hidden gems, get personalized recommendations, and explore cities like a local. Book your student guide today.',
  keywords: ['tourist guide', 'local guides', 'travel experiences', 'authentic travel', 'student guides', 'city tours', 'personalized tours', 'local insights'],
  openGraph: {
    title: 'For Tourists - Find Local Student Guides | TourWiseCo',
    description: 'Experience authentic travel with verified local student guides. Discover hidden gems and explore cities like a local.',
    url: 'https://tourwiseco.vercel.app/tourist',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Tourists exploring a city with local guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Tourists - Find Local Student Guides | TourWiseCo',
    description: 'Experience authentic travel with verified local student guides. Discover hidden gems and explore cities like a local.',
  },
}

export default function TouristLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
