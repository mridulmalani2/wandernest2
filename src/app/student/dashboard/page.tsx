'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import { ModernCard } from '@/components/ui/ModernCard'
import { Calendar, Users, Clock, MapPin, DollarSign, Star, CheckCircle2, Mail, Phone, MessageSquare, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react'
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
      return `${new Date(datesObj.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(datesObj.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    }
    return 'N/A'
  }

  const getServiceTypeBadge = (serviceType: string) => {
    const types: Record<string, { label: string, color: string }> = {
      'itinerary_help': { label: 'Itinerary Planning', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      'guided_experience': { label: 'Guided Experience', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    }
    const type = types[serviceType] || { label: serviceType, color: 'bg-gray-100 text-gray-800' }
    return (
      <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border shadow-sm", type.color)}>
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
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      <Navigation variant="student" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary shadow-premium p-8 md:p-12 text-white animate-fade-in">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {data.student.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100 text-lg max-w-xl">
                You have <span className="font-bold text-white">{data.stats.pendingRequests} new requests</span> waiting for your response.
                Keep up the great work!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold">Profile Status</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span className="font-bold">{data.student.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-3 animate-scale-in shadow-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
          {[
            { label: 'Total Bookings', value: data.stats.totalBookings, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending Requests', value: data.stats.pendingRequests, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Average Rating', value: data.stats.averageRating.toFixed(1), icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
            { label: 'Total Earnings', value: `€${data.stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat, idx) => (
            <ModernCard key={idx} className="p-6 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                <stat.icon className="h-7 w-7" />
              </div>
            </ModernCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Pending Requests */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="h-6 w-6 text-ui-blue-primary" />
                Pending Requests
              </h2>
              <span className="bg-ui-blue-primary/10 text-ui-blue-primary px-3 py-1 rounded-full text-xs font-bold">
                {data.pendingRequests.length} New
              </span>
            </div>

            {data.pendingRequests.length === 0 ? (
              <ModernCard className="p-12 text-center border-dashed border-2 border-gray-200 bg-gray-50/50">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CheckCircle2 className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">All caught up!</h3>
                <p className="text-gray-500 mt-2">No pending requests at the moment.</p>
              </ModernCard>
            ) : (
              <div className="space-y-4">
                {data.pendingRequests.map((pending) => {
                  const request = pending.request
                  const isProcessing = processingRequests.has(request.id)
                  const isExpired = !!(request.expiresAt && new Date() > new Date(request.expiresAt))

                  return (
                    <div key={pending.id} className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-premium hover:shadow-xl transition-all duration-300">
                      {/* Status Strip */}
                      <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-gradient-to-b from-ui-blue-primary to-ui-purple-primary rounded-r-full"></div>

                      <div className="pl-6 flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-xl font-bold text-gray-900">{request.city}</h3>
                                {getServiceTypeBadge(request.serviceType)}
                              </div>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                Received {new Date(pending.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {request.budget && (
                              <div className="text-right">
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Budget</p>
                                <p className="text-xl font-bold text-green-600">€{request.budget}</p>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-4 border-y border-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Calendar className="h-4 w-4" /></div>
                              <div>
                                <p className="text-xs text-gray-400 font-medium">Dates</p>
                                <p className="text-sm font-semibold text-gray-700">{formatDate(request.dates)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Users className="h-4 w-4" /></div>
                              <div>
                                <p className="text-xs text-gray-400 font-medium">Guests</p>
                                <p className="text-sm font-semibold text-gray-700">{request.numberOfGuests} ({request.groupType})</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Clock className="h-4 w-4" /></div>
                              <div>
                                <p className="text-xs text-gray-400 font-medium">Time</p>
                                <p className="text-sm font-semibold text-gray-700 capitalize">{request.preferredTime}</p>
                              </div>
                            </div>
                          </div>

                          {request.tripNotes && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Trip Notes</p>
                              <p className="text-sm text-gray-600 italic">"{request.tripNotes}"</p>
                            </div>
                          )}

                          {request.interests && (
                            <div className="flex flex-wrap gap-2">
                              {request.interests.map((interest, i) => (
                                <span key={i} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium border border-gray-200">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 min-w-[180px] justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            disabled={isProcessing || isExpired}
                            className="w-full h-12 bg-ui-blue-primary hover:bg-ui-blue-accent text-white shadow-lg shadow-ui-blue-primary/20 rounded-xl font-semibold transition-all hover:scale-105"
                          >
                            {isProcessing ? 'Processing...' : 'Accept Request'}
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={isProcessing || isExpired}
                            variant="ghost"
                            className="w-full h-12 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl font-medium"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Bookings */}
          <div className="space-y-6 animate-fade-in-up delay-300">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Upcoming
            </h2>

            {data.acceptedBookings.length === 0 ? (
              <ModernCard className="p-8 text-center bg-white/50">
                <p className="text-gray-500 text-sm">No upcoming bookings yet.</p>
              </ModernCard>
            ) : (
              <div className="space-y-4">
                {data.acceptedBookings.map((booking) => {
                  const request = booking.request
                  return (
                    <ModernCard key={booking.id} className="p-5 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-900">{request.city}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(request.dates)}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded-full">
                            Confirmed
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            {request.numberOfGuests} Guests
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {request.preferredTime}
                          </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                          <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">Tourist Contact</p>
                          <div className="space-y-2 text-sm">
                            {request.email && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Mail className="h-3.5 w-3.5 text-blue-500" />
                                <span className="truncate">{request.email}</span>
                              </div>
                            )}
                            {request.whatsapp && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                                <span>{request.whatsapp}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button variant="outline" className="w-full text-xs h-9 rounded-lg border-gray-200">
                          View Details <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </ModernCard>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

