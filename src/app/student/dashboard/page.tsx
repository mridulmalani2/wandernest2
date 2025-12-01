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
import { ModernCard } from '@/components/ui/ModernCard'
import { Calendar, Users, Clock, MapPin, DollarSign, Star, CheckCircle2, XCircle, MessageSquare, Phone, Mail, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    if (status === 'loading') return
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, studentEmail: session.user.email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to accept request')

      alert(
        `Request accepted successfully!\n\nTourist Contact:\nEmail: ${result.touristContact.email}\n` +
        (result.touristContact.phone ? `Phone: ${result.touristContact.phone}\n` : '') +
        (result.touristContact.whatsapp ? `WhatsApp: ${result.touristContact.whatsapp}\n` : '') +
        `\nPreferred Contact: ${result.touristContact.contactMethod || 'email'}`
      )
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
    if (!confirm('Are you sure you want to reject this request?')) return
    setProcessingRequests(prev => new Set(prev).add(requestId))
    setError(null)
    try {
      const response = await fetch('/api/student/requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, studentEmail: session.user.email }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to reject request')
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
    const types: Record<string, { label: string, color: string }> = {
      'itinerary_help': { label: 'Itinerary Planning', color: 'bg-ui-purple-primary/10 text-ui-purple-primary border-ui-purple-primary/20' },
      'guided_experience': { label: 'Guided Experience', color: 'bg-ui-blue-primary/10 text-ui-blue-primary border-ui-blue-primary/20' },
    }
    const type = types[serviceType] || { label: serviceType, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", type.color)}>
        {type.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-50">
        <Navigation variant="student" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-blue-primary"></div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navigation variant="student" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {data.student.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your guide profile today.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2 animate-scale-in">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-100">
          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalBookings}</p>
            </div>
          </ModernCard>

          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.pendingRequests}</p>
            </div>
          </ModernCard>

          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{data.stats.averageRating.toFixed(1)}</p>
            </div>
          </ModernCard>

          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">€{data.stats.totalEarnings.toFixed(2)}</p>
            </div>
          </ModernCard>
        </div>

        {/* Pending Requests */}
        {data.pendingRequests.length > 0 && (
          <section className="mb-12 animate-fade-in-up delay-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-ui-blue-primary" />
              Pending Requests
            </h2>
            <div className="grid gap-6">
              {data.pendingRequests.map((pending) => {
                const request = pending.request
                const isProcessing = processingRequests.has(request.id)
                const isExpired = !!(request.expiresAt && new Date() > new Date(request.expiresAt))

                return (
                  <ModernCard key={pending.id} className="p-6 border-l-4 border-l-ui-blue-primary">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              {request.city}
                              {getServiceTypeBadge(request.serviceType)}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Received {new Date(pending.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(request.dates)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{request.numberOfGuests} Guests ({request.groupType})</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{request.preferredTime}</span>
                          </div>
                          {request.budget && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <span>Budget: €{request.budget}</span>
                            </div>
                          )}
                        </div>

                        {request.interests && (
                          <div className="flex flex-wrap gap-2">
                            {request.interests.map((interest, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}

                        {request.tripNotes && (
                          <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 italic">
                            "{request.tripNotes}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 min-w-[200px] justify-center">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          disabled={isProcessing || isExpired}
                          className="w-full bg-ui-blue-primary hover:bg-ui-blue-accent text-white shadow-lg shadow-ui-blue-primary/20"
                        >
                          {isProcessing ? 'Processing...' : 'Accept Request'}
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={isProcessing || isExpired}
                          variant="outline"
                          className="w-full border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </ModernCard>
                )
              })}
            </div>
          </section>
        )}

        {/* Accepted Bookings */}
        {data.acceptedBookings.length > 0 && (
          <section className="mb-12 animate-fade-in-up delay-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Upcoming Bookings
            </h2>
            <div className="grid gap-6">
              {data.acceptedBookings.map((booking) => {
                const request = booking.request
                return (
                  <ModernCard key={booking.id} className="p-6 border-l-4 border-l-green-500">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-gray-900">{request.city}</h3>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            Confirmed
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(request.dates)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{request.numberOfGuests} Guests</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{request.preferredTime}</span>
                          </div>
                          {booking.pricePaid && (
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                              <DollarSign className="h-4 w-4" />
                              <span>Earned: €{booking.pricePaid}</span>
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                          <h4 className="text-sm font-semibold text-blue-900 mb-3">Tourist Contact Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {request.email && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="h-4 w-4 text-blue-500" />
                                {request.email}
                              </div>
                            )}
                            {request.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="h-4 w-4 text-blue-500" />
                                {request.phone}
                              </div>
                            )}
                            {request.whatsapp && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MessageSquare className="h-4 w-4 text-green-500" />
                                {request.whatsapp} (WhatsApp)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ModernCard>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {data.pendingRequests.length === 0 && data.acceptedBookings.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No activity yet</h3>
            <p className="text-gray-500 mt-2 max-w-sm mx-auto">
              Once tourists start requesting guides in your city, their requests will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
