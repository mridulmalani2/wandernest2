'use client'

import { useState, useEffect } from 'react'
// import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'

// AUTH DISABLED FOR DEVELOPMENT - DATABASE_URL not configured

interface TouristRequest {
  id: string
  city: string
  dates: any
  preferredTime: string
  numberOfGuests: number
  groupType: string
  serviceType: string
  status: string
  createdAt: string
  selections: Array<{
    id: string
    status: string
    student: {
      id: string
      name: string
      averageRating?: number
    }
  }>
  review?: {
    rating: number
    comment: string
  }
}

export default function TouristDashboard() {
  // const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<TouristRequest[]>([])

  // DEV MODE: Mock session data
  const session = { user: { email: 'dev@example.com', userType: 'tourist' } }
  const status = 'authenticated'

  useEffect(() => {
    // // Redirect to signin if not authenticated
    // if (status === 'unauthenticated') {
    //   router.push('/tourist/signin?callbackUrl=/tourist/dashboard')
    // } else if (status === 'authenticated' && session?.user?.userType === 'tourist') {
    //   fetchRequests()
    // }

    // DEV MODE: Always fetch requests
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/tourist/bookings')

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setRequests(data.bookings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // await signOut({ callbackUrl: '/tourist/signin' })
    // DEV MODE: Just redirect
    router.push('/tourist/signin')
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      MATCHED: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  // Show loading state while checking authentication
  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
            alt="Group of travelers"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-purple-600/15" />
        </div>
        <div className="absolute inset-0 pattern-grid opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading your bookings...</p>
          </div>
        </div>
      </div>
    )
  }

  // // If not authenticated or not a tourist, show nothing (redirect will handle)
  // if (status !== 'authenticated' || session?.user?.userType !== 'tourist') {
  //   return null
  // }

  // Calculate stats
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    accepted: requests.filter(r => r.status === 'ACCEPTED').length,
    completed: requests.filter(r => r.review).length,
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Group of travelers exploring together">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Group of travelers exploring together"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-purple-600/15" />
      </div>
      <div className="absolute inset-0 pattern-grid opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="tourist" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up delay-100">
          <div className="glass-card rounded-2xl shadow-premium p-6 border-2 border-white/40 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Total Requests</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 gradient-ocean rounded-full flex items-center justify-center shadow-soft">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-premium p-6 border-2 border-white/40 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Pending</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent mt-2">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-soft">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-premium p-6 border-2 border-white/40 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Accepted</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">{stats.accepted}</p>
              </div>
              <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-soft">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl shadow-premium p-6 border-2 border-white/40 hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Reviewed</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mt-2">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 gradient-vibrant rounded-full flex items-center justify-center shadow-soft">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-card bg-red-50/90 border-2 border-red-300 rounded-2xl p-4 mb-6 shadow-premium animate-scale-in">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="glass-card rounded-3xl shadow-premium p-12 text-center border-2 border-white/40 animate-fade-in hover-lift">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No requests yet</h2>
            <p className="text-gray-700 mb-6">Start your adventure by booking a local guide!</p>
            <a
              href="/booking"
              className="inline-block px-6 py-3 gradient-ocean text-white rounded-lg hover:shadow-glow-blue shadow-soft transition-all hover-lift"
            >
              Book Your First Trip
            </a>
          </div>
        ) : (
          <div className="grid gap-6 animate-fade-in-up delay-200">
            {requests.map((request) => {
              const dates = request.dates as { start: string; end?: string }
              const isAccepted = request.status === 'ACCEPTED'
              const isPending = request.status === 'PENDING'

              return (
                <div
                  key={request.id}
                  className={`glass-card rounded-2xl shadow-premium overflow-hidden border-2 border-white/40 border-l-4 hover-lift animate-fade-in ${
                    isAccepted ? 'border-l-green-500' : isPending ? 'border-l-yellow-500' : 'border-l-gray-400'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">{request.city}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.serviceType.replace('_', ' ').charAt(0).toUpperCase() +
                           request.serviceType.replace('_', ' ').slice(1)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-gray-500 font-medium">📅 Dates</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(dates.start).toLocaleDateString()}
                          {dates.end && ` - ${new Date(dates.end).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">⏰ Time</p>
                        <p className="font-semibold text-gray-900 capitalize">{request.preferredTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">👥 Guests</p>
                        <p className="font-semibold text-gray-900">
                          {request.numberOfGuests} ({request.groupType})
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">📝 Requested</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {request.selections.length > 0 && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span>🎓</span>
                          {isAccepted ? 'Your Guide:' : 'Matched Guides:'}
                        </p>
                        <div className="space-y-2">
                          {request.selections.map((selection, idx) => (
                            <div key={idx} className={`flex items-center justify-between rounded-lg p-4 ${
                              isAccepted ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border border-gray-200'
                            }`}>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-lg">{selection.student.name}</p>
                                {selection.student.averageRating && (
                                  <div className="flex items-center mt-1">
                                    <div className="flex">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <span
                                          key={i}
                                          className={i < Math.round(selection.student.averageRating!) ? 'text-yellow-500' : 'text-gray-300'}
                                        >
                                          ⭐
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-600 ml-2 font-medium">
                                      {selection.student.averageRating.toFixed(1)} / 5.0
                                    </span>
                                  </div>
                                )}
                              </div>
                              {isAccepted && (
                                <div className="ml-4">
                                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                                    Confirmed
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {request.review && (
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <span>💬</span>
                          Your Review:
                        </p>
                        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                          <div className="flex items-center mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`text-2xl ${
                                  i < request.review!.rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="ml-2 font-bold text-gray-900">{request.review.rating}/5</span>
                          </div>
                          {request.review.comment && (
                            <p className="text-gray-700 mt-2 italic">"{request.review.comment}"</p>
                          )}
                        </div>
                      </div>
                    )}

                    {isAccepted && !request.review && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm text-blue-800 mb-2">
                            <strong>📌 Next Steps:</strong> Contact your guide to finalize details and payment arrangements.
                          </p>
                          <p className="text-xs text-blue-600">
                            After your trip, you can leave a review to help other travelers!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
