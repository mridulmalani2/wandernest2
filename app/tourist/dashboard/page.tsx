'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<TouristRequest[]>([])

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (status === 'unauthenticated') {
      router.push('/tourist/signin?callbackUrl=/tourist/dashboard')
    } else if (status === 'authenticated' && session?.user?.userType === 'tourist') {
      fetchRequests()
    }
  }, [status, session, router])

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
  if (status === 'loading' || (status === 'authenticated' && loading && requests.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  // If not authenticated or not a tourist, show nothing (redirect will handle)
  if (status !== 'authenticated' || session?.user?.userType !== 'tourist') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/tourist" className="flex items-center space-x-2">
                <span className="text-2xl">🌍</span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  WanderNest
                </h1>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/booking">
                <Button>Book New Guide</Button>
              </Link>
              <Link href="/tourist">
                <Button variant="outline">Home</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Bookings</h2>
          <p className="mt-2 text-gray-600">
            Welcome back, <span className="font-medium">{session.user.name || session.user.email}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bookings yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start your adventure by booking a local student guide
            </p>
            <Link href="/booking" className="mt-6 inline-block">
              <Button size="lg">Book Your First Guide</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.city}</h3>
                      <p className="text-sm text-gray-500">
                        {request.serviceType.replace('_', ' ').charAt(0).toUpperCase() +
                         request.serviceType.replace('_', ' ').slice(1)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-500">Time</p>
                      <p className="font-medium text-gray-900">{request.preferredTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Guests</p>
                      <p className="font-medium text-gray-900">{request.numberOfGuests}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Group Type</p>
                      <p className="font-medium text-gray-900 capitalize">{request.groupType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Requested</p>
                      <p className="font-medium text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.selections.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Matched with:</p>
                      {request.selections.map((selection, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-gray-900">{selection.student.name}</p>
                            {selection.student.averageRating && (
                              <div className="flex items-center mt-1">
                                <span className="text-yellow-500 text-sm">★</span>
                                <span className="text-sm text-gray-600 ml-1">
                                  {selection.student.averageRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {request.review && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Review:</p>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < request.review!.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        {request.review.comment && (
                          <p className="text-sm text-gray-700">{request.review.comment}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
