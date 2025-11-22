'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Navigation from '@/components/Navigation'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

interface Request {
  id: string
  city: string
  dates: unknown
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
    dates: unknown
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
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData | null>(null)
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') {
      return
    }

    // If not authenticated, redirect to signin
    if (!session?.user?.email) {
      router.push('/student/signin')
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    if (!session?.user?.email) return

    try {
      setLoading(true)
      const response = await fetch(`/api/student/dashboard?email=${encodeURIComponent(session.user.email)}`)

      if (!response.ok) {
        if (response.status === 401) {
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
    if (!session?.user?.email) return

    setProcessingRequests(prev => new Set(prev).add(requestId))
    setError(null)

    try {
      const response = await fetch('/api/student/requests/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          studentEmail: session.user.email,
        }),
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
      await fetchDashboardData()
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
    if (!session?.user?.email) return

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
        },
        body: JSON.stringify({
          requestId,
          studentEmail: session.user.email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject request')
      }

      // Refresh dashboard data
      await fetchDashboardData()
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

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/student/signin' })
  }

  const formatDate = (dates: unknown) => {
    if (!dates) return 'N/A'
    if (typeof dates === 'string') return dates
    if (typeof dates === 'object' && dates !== null && 'start' in dates && 'end' in dates) {
      const datesObj = dates as { start: string; end: string }
      return `${new Date(datesObj.start).toLocaleDateString()} - ${new Date(datesObj.end).toLocaleDateString()}`
    }
    return 'N/A'
  }

  const getServiceTypeBadge = (serviceType: string) => {
    const colors: Record<string, string> = {
      'local_guide': 'bg-ui-blue-primary/10 text-ui-blue-primary',
      'accommodation': 'bg-ui-success/10 text-ui-success',
      'both': 'bg-ui-purple-primary/10 text-ui-purple-primary',
    }
    return colors[serviceType] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Students collaborating"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-pink-600/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-blue-primary mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Students collaborating"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-pink-600/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <p className="text-ui-error font-semibold mb-4">Failed to load dashboard data</p>
            <PrimaryCTAButton onClick={() => router.push('/student/signin')} variant="blue">
              Back to Sign In
            </PrimaryCTAButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Students collaborating and learning together">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students collaborating and learning together"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-pink-600/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="student" />

        {/* Optimized for mobile: better responsive padding */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 w-full">

        {/* Error Alert - Optimized for mobile: responsive padding */}
        {error && (
          <div className="glass-card bg-ui-error/10 border-2 border-ui-error/30 rounded-2xl p-3 md:p-4 mb-4 md:mb-6 shadow-premium animate-scale-in">
            <p className="text-ui-error font-semibold text-sm md:text-base">{error}</p>
          </div>
        )}

        {/* Stats Cards - Optimized for mobile: reduced gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in-up delay-100">
          <Card className="glass-card border border-white/40 hover-lift shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-blue-accent bg-clip-text text-transparent">{data.stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-white/40 hover-lift shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ui-warning">{data.stats.pendingRequests}</div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-white/40 hover-lift shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  {data.stats.averageRating.toFixed(1)}
                </span>
                <span className="text-yellow-500 text-2xl ml-2">★</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-white/40 hover-lift shadow-premium">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-700">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-ui-success">
                ${data.stats.totalEarnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Section - Optimized for mobile: responsive spacing */}
        {data.pendingRequests.length > 0 && (
          <div className="mb-6 md:mb-8 animate-fade-in-up delay-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 md:mb-4 text-shadow">Pending Requests</h2>
            <div className="grid gap-4 md:gap-6">
              {data.pendingRequests.map((pending) => {
                const request = pending.request
                const isProcessing = processingRequests.has(request.id)
                const isExpired = !!(request.expiresAt && new Date() > new Date(request.expiresAt))

                return (
                  <Card key={pending.id} className="glass-card border-2 border-white/40 shadow-premium hover-lift animate-fade-in">
                    {/* Optimized for mobile: responsive padding */}
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{request.city}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Received {new Date(pending.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getServiceTypeBadge(request.serviceType)}>
                          {request.serviceType.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      {/* Optimized for mobile: single column on small screens */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4 text-sm">
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
                        <div className="bg-ui-error/10 border border-ui-error/30 rounded-lg p-3 mb-4">
                          <p className="text-sm text-ui-error font-medium">This request has expired</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <PrimaryCTAButton
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={isProcessing || isExpired}
                          variant="blue"
                          className="flex-1"
                        >
                          {isProcessing ? 'Processing...' : 'Accept Request'}
                        </PrimaryCTAButton>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={isProcessing || isExpired}
                          variant="outline"
                          className="flex-1 hover-lift shadow-soft"
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

        {/* Accepted Bookings Section - Optimized for mobile: responsive spacing */}
        {data.acceptedBookings.length > 0 && (
          <div className="mb-6 md:mb-8 animate-fade-in-up delay-300">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 md:mb-4 text-shadow">Accepted Bookings</h2>
            <div className="grid gap-4 md:gap-6">
              {data.acceptedBookings.map((booking) => {
                const request = booking.request

                return (
                  <Card key={booking.id} className="glass-card border-2 border-white/40 border-l-4 border-l-ui-success shadow-premium hover-lift animate-fade-in">
                    {/* Optimized for mobile: responsive padding */}
                    <CardContent className="p-4 sm:p-5 md:p-6">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{request.city}</h3>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            Accepted {booking.acceptedAt ? new Date(booking.acceptedAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <Badge className="bg-ui-success/10 text-ui-success text-xs sm:text-sm">ACCEPTED</Badge>
                      </div>

                      {/* Optimized for mobile: single column on small screens */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-4 text-sm">
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
                            <p className="font-medium text-ui-success">${booking.pricePaid.toFixed(2)}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-ui-blue-primary/10 rounded-lg p-4 mt-4">
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

        {/* Reviews Section - Optimized for mobile: responsive spacing */}
        {data.reviews.length > 0 && (
          <div className="mb-6 md:mb-8 animate-fade-in-up delay-400">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 md:mb-4 text-shadow">Your Reviews</h2>
            <div className="grid gap-4 md:gap-6">
              {data.reviews.map((review) => (
                <Card key={review.id} className="glass-card border-2 border-white/40 shadow-premium hover-lift animate-fade-in">
                  {/* Optimized for mobile: responsive padding */}
                  <CardContent className="p-4 sm:p-5 md:p-6">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
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
                      <div className="bg-ui-error/10 border border-ui-error/30 rounded-lg p-3 mt-3">
                        <p className="text-sm text-ui-error font-medium">Marked as no-show</p>
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
          <Card className="glass-card border-2 border-white/40 shadow-premium animate-fade-in">
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
              <h2 className="mt-2 text-sm font-medium text-gray-900">No activity yet</h2>
              <p className="mt-1 text-sm text-gray-500">
                You will see your requests and bookings here once tourists start matching with you.
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  )
}
