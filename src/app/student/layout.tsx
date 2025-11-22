import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Students - Become a Local Travel Guide',
  description: 'Earn flexible income as a student guide. Share your city with travelers, set your own schedule, and make more than typical campus jobs. Join TourWiseCo today.',
  keywords: ['student jobs', 'flexible income', 'local guide jobs', 'student guides', 'earn money', 'part-time work', 'student employment', 'travel guide work', 'cultural exchange'],
  openGraph: {
    title: 'For Students - Become a Local Travel Guide | TourWiseCo',
    description: 'Earn flexible income as a student guide. Share your city with travelers and make more than typical campus jobs.',
    url: 'https://tourwiseco.vercel.app/student',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: 'University students sharing their city with travelers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'For Students - Become a Local Travel Guide | TourWiseCo',
    description: 'Earn flexible income as a student guide. Share your city with travelers and make more than typical campus jobs.',
  },
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
