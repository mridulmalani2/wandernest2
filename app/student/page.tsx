import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function StudentLanding() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              WanderNest
            </h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/student/register">
              <Button>Become a Guide</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Earn Money{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sharing Your City
            </span>
            <br />
            as a Local Student Guide
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your local knowledge into income. Help travelers discover authentic experiences
            while earning money on your own schedule.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Link href="/student/register">
              <Button size="lg" className="text-lg px-8 py-6 bg-purple-600 hover:bg-purple-700">
                Get Started as a Guide
              </Button>
            </Link>
          </div>

          {/* Important Notice */}
          <div className="bg-purple-50 border-2 border-purple-400 rounded-xl p-6 mt-8 max-w-3xl mx-auto">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-bold text-purple-900 mb-2">How It Works</h3>
                <p className="text-sm text-purple-800">
                  <strong>WanderNest connects you with tourists</strong> looking for local guides. As an independent guide, you:
                </p>
                <ul className="list-disc list-inside text-sm text-purple-800 mt-2 space-y-1">
                  <li>Set your own schedule and rates</li>
                  <li>Receive payment directly from tourists</li>
                  <li>Work independently - you're not an employee</li>
                  <li>Maintain full control over your services</li>
                </ul>
                <p className="text-sm text-purple-800 mt-2">
                  WanderNest facilitates connections only. All service agreements and payments are between you and the tourist.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 pt-16">
            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Flexible Income</h3>
              <p className="text-gray-600">
                Earn money on your own schedule while studying
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-4xl mb-4">🌎</div>
              <h3 className="text-xl font-bold mb-2">Meet People</h3>
              <p className="text-gray-600">
                Connect with travelers from around the world
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">Build Skills</h3>
              <p className="text-gray-600">
                Develop communication and entrepreneurial skills
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
