'use client'

import { useState, useEffect } from 'react'
// import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tourist Dashboard</h1>
              <p className="mt-2 text-gray-600">Logged in as {session?.user?.email}</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/booking"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                New Booking
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Accepted</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.accepted}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.completed}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-600 mb-6">Start your adventure by booking a local guide!</p>
            <a
              href="/booking"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Book Your First Trip
            </a>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => {
              const dates = request.dates as { start: string; end?: string }
              const isAccepted = request.status === 'ACCEPTED'
              const isPending = request.status === 'PENDING'

              return (
                <div
                  key={request.id}
                  className={`bg-white rounded-lg shadow-lg overflow-hidden border-l-4 ${
                    isAccepted ? 'border-green-500' : isPending ? 'border-yellow-500' : 'border-gray-300'
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
  )
}
