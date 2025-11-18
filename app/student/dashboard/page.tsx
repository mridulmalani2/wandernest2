'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Request {
  id: string
  city: string
  dates: any
  numberOfGuests: number
  groupType: string
  serviceType: string
  interests: string[]
  preferredTime: string
  tripNotes?: string
  budget?: number
  expiresAt?: string
  email?: string
  phone?: string
  whatsapp?: string
  contactMethod?: string
  status?: string
}

interface PendingRequest {
  id: string
  requestId: string
  status: string
  createdAt: string
  request: Request
}

interface AcceptedBooking {
  id: string
  requestId: string
  status: string
  pricePaid?: number
  acceptedAt?: string
  request: Request
}

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  wasNoShow: boolean
  request: {
    city: string
    dates: any
    serviceType: string
  }
}

interface DashboardData {
  student: {
    id: string
    name: string
    email: string
    city: string
    institute: string
    averageRating?: number
    tripsHosted: number
    status: string
  }
  stats: {
    totalBookings: number
    pendingRequests: number
    totalEarnings: number
    averageRating: number
    tripsHosted: number
  }
  acceptedBookings: AcceptedBooking[]
  pendingRequests: PendingRequest[]
  reviews: Review[]
}

export default function StudentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('student_token')
    if (!token) {
      router.push('/student/signin')
      return
    }
    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('student_token')
          router.push('/student/signin')
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    const token = localStorage.getItem('student_token')
    if (!token) return

    setProcessingRequests(prev => new Set(prev).add(requestId))
    setError(null)

    try {
      const response = await fetch('/api/student/requests/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to accept request')
      }

      // Show success message with tourist contact info
      alert(
        `Request accepted successfully!\n\nTourist Contact:\nEmail: ${result.touristContact.email}\n` +
        (result.touristContact.phone ? `Phone: ${result.touristContact.phone}\n` : '') +
        (result.touristContact.whatsapp ? `WhatsApp: ${result.touristContact.whatsapp}\n` : '') +
        `\nPreferred Contact: ${result.touristContact.contactMethod || 'email'}`
      )

      // Refresh dashboard data
      await fetchDashboardData(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept request')
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const token = localStorage.getItem('student_token')
    if (!token) return

    if (!confirm('Are you sure you want to reject this request?')) {
      return
    }

    setProcessingRequests(prev => new Set(prev).add(requestId))
    setError(null)

    try {
      const response = await fetch('/api/student/requests/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject request')
      }

      // Refresh dashboard data
      await fetchDashboardData(token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request')
    } finally {
      setProcessingRequests(prev => {
        const next = new Set(prev)
        next.delete(requestId)
        return next
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('student_token')
    router.push('/student/signin')
  }

  const formatDate = (dates: any) => {
    if (!dates) return 'N/A'
    if (typeof dates === 'string') return dates
    if (dates.start && dates.end) {
      return `${new Date(dates.start).toLocaleDateString()} - ${new Date(dates.end).toLocaleDateString()}`
    }
    return 'N/A'
  }

  const getServiceTypeBadge = (serviceType: string) => {
    const colors: Record<string, string> = {
      'local_guide': 'bg-blue-100 text-blue-800',
      'accommodation': 'bg-green-100 text-green-800',
      'both': 'bg-purple-100 text-purple-800',
    }
    return colors[serviceType] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load dashboard data</p>
          <Button onClick={() => router.push('/student/signin')} className="mt-4">
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Welcome back, <span className="font-semibold">{data.student.name}</span>
            </p>
            <p className="text-sm text-gray-500">{data.student.email}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{data.stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold text-gray-900">
                  {data.stats.averageRating.toFixed(1)}
                </span>
                <span className="text-yellow-500 text-2xl ml-2">★</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ${data.stats.totalEarnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Section */}
        {data.pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Requests</h2>
            <div className="grid gap-6">
              {data.pendingRequests.map((pending) => {
                const request = pending.request
                const isProcessing = processingRequests.has(request.id)
                const isExpired = request.expiresAt && new Date() > new Date(request.expiresAt)

                return (
                  <Card key={pending.id} className="bg-white">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{request.city}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Received {new Date(pending.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getServiceTypeBadge(request.serviceType)}>
                          {request.serviceType.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">Dates</p>
                          <p className="font-medium text-gray-900">{formatDate(request.dates)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Guests</p>
                          <p className="font-medium text-gray-900">{request.numberOfGuests}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="font-medium text-gray-900">{request.preferredTime}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Group Type</p>
                          <p className="font-medium text-gray-900 capitalize">{request.groupType}</p>
                        </div>
                      </div>

                      {request.interests && request.interests.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {request.interests.map((interest, idx) => (
                              <Badge key={idx} variant="secondary">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {request.tripNotes && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">Trip Notes</p>
                          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                            {request.tripNotes}
                          </p>
                        </div>
                      )}

                      {request.budget && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="font-medium text-gray-900">${request.budget}</p>
                        </div>
                      )}

                      {isExpired && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-600 font-medium">This request has expired</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={isProcessing || isExpired}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {isProcessing ? 'Processing...' : 'Accept Request'}
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={isProcessing || isExpired}
                          variant="outline"
                          className="flex-1"
                        >
                          {isProcessing ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Accepted Bookings Section */}
        {data.acceptedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Accepted Bookings</h2>
            <div className="grid gap-6">
              {data.acceptedBookings.map((booking) => {
                const request = booking.request

                return (
                  <Card key={booking.id} className="bg-white border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{request.city}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Accepted {booking.acceptedAt ? new Date(booking.acceptedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">ACCEPTED</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">Dates</p>
                          <p className="font-medium text-gray-900">{formatDate(request.dates)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Guests</p>
                          <p className="font-medium text-gray-900">{request.numberOfGuests}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Time</p>
                          <p className="font-medium text-gray-900">{request.preferredTime}</p>
                        </div>
                        {booking.pricePaid && (
                          <div>
                            <p className="text-gray-500">Earnings</p>
                            <p className="font-medium text-green-600">${booking.pricePaid.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Tourist Contact Information</p>
                        <div className="space-y-1 text-sm">
                          {request.email && (
                            <p className="text-gray-700">
                              <span className="font-medium">Email:</span> {request.email}
                            </p>
                          )}
                          {request.phone && (
                            <p className="text-gray-700">
                              <span className="font-medium">Phone:</span> {request.phone}
                            </p>
                          )}
                          {request.whatsapp && (
                            <p className="text-gray-700">
                              <span className="font-medium">WhatsApp:</span> {request.whatsapp}
                            </p>
                          )}
                          {request.contactMethod && (
                            <p className="text-gray-700">
                              <span className="font-medium">Preferred Contact:</span> {request.contactMethod}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        {data.reviews.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Reviews</h2>
            <div className="grid gap-6">
              {data.reviews.map((review) => (
                <Card key={review.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.request.city} - {review.request.serviceType.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{review.comment}</p>
                    )}

                    {review.wasNoShow && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-600 font-medium">Marked as no-show</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {data.pendingRequests.length === 0 &&
         data.acceptedBookings.length === 0 &&
         data.reviews.length === 0 && (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                You will see your requests and bookings here once tourists start matching with you.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
