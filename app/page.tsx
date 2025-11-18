import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WanderNest
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/booking">
              <Button>Book a Guide</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Experience{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Authentic Travel
            </span>
            <br />
            with Local Student Guides
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified university students who will show you their city
            through a local's eyes. Get personalized recommendations and authentic
            experiences.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Link href="/booking">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Your Adventure
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">Verified Students</h3>
              <p className="text-gray-600">
                All guides are verified university students with local knowledge
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-2">Personalized Experience</h3>
              <p className="text-gray-600">
                Get custom itineraries based on your interests and preferences
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold mb-2">Authentic Adventures</h3>
              <p className="text-gray-600">
                Discover hidden gems and local favorites off the beaten path
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} WanderNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
