import type { Metadata } from 'next'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'How TourWiseCo Works - Student-Led Local Travel Experiences',
  description: 'Discover how TourWiseCo connects tourists with verified local student guides for authentic travel experiences. Learn how students earn flexible income sharing their cities, and how travelers find personalized, affordable tours.',
  keywords: [
    'how TourWiseCo works',
    'student guides',
    'local student guides',
    'student-led tours',
    'how it works',
    'authentic travel experiences',
    'student travel guide',
    'local travel guide',
    'personalized tours',
    'affordable travel',
    'cultural exchange',
    'student earnings',
    'flexible student jobs'
  ],
  openGraph: {
    title: 'How TourWiseCo Works - Student-Led Local Travel Experiences',
    description: 'Learn how TourWiseCo connects tourists with verified local student guides. Discover authentic travel experiences and flexible earning opportunities for students.',
    url: 'https://tourwiseco.vercel.app/how-it-works',
    images: [
      {
        url: '/images/backgrounds/cafe-ambiance.jpg',
        width: 1200,
        height: 630,
        alt: 'Students and tourists exploring a city together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How TourWiseCo Works - Student-Led Local Travel Experiences',
    description: 'Learn how TourWiseCo connects tourists with verified local student guides for authentic, personalized travel experiences.',
  },
  alternates: {
    canonical: 'https://tourwiseco.vercel.app/how-it-works',
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

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navigation variant="default" />
      {children}
    </>
  )
}
