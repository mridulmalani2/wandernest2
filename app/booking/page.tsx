import Link from 'next/link'
import { BookingForm } from '@/components/booking/BookingForm'

export default function BookingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WanderNest
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Book Your Local Guide</h1>
          <p className="text-gray-600 text-lg">
            Tell us about your trip and we'll match you with the perfect local student
            guide
          </p>
        </div>

        <BookingForm />
      </main>
    </div>
  )
}
