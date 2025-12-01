'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import { ModernCard } from '@/components/ui/ModernCard'
import { Calendar, Users, Clock, MapPin, Star, CheckCircle2, MessageSquare, AlertCircle, Search, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TouristRequest {
  id: string
  city: string
  dates: unknown
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
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.push('/tourist/signin?callbackUrl=/tourist/dashboard')
      return
    }
    if (status === 'authenticated' && session?.user) {
      fetchRequests()
    }
  }, [status, session, router])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/tourist/bookings')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to fetch bookings')
      }
      const data = await response.json()
      if (!data.success) throw new Error(data.error || 'Failed to fetch bookings')
      setRequests(data.bookings || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load your bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      MATCHED: 'bg-blue-100 text-blue-700 border-blue-200',
      ACCEPTED: 'bg-green-100 text-green-700 border-green-200',
      EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    accepted: requests.filter(r => r.status === 'ACCEPTED').length,
    completed: requests.filter(r => r.review).length,
  }

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-50">
        <Navigation variant="tourist" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-blue-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navigation variant="tourist" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">
            Your Adventures 🌍
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your bookings and connect with local guides.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up delay-100">
          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </ModernCard>

          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </ModernCard>

          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
          </ModernCard>

          <ModernCard className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </ModernCard>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2 animate-scale-in">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Unable to load bookings</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRequests} className="ml-auto bg-white hover:bg-red-50 text-red-600 border-red-200">
              Try Again
            </Button>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-10 w-10 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Start your journey by finding a local guide to show you around their city.
            </p>
            <PrimaryCTAButton href="/booking" variant="blue">
              Book Your First Trip
            </PrimaryCTAButton>
          </div>
        ) : (
          <div className="grid gap-6 animate-fade-in-up delay-200">
            {requests.map((request) => {
              const dates = request.dates as { start: string; end?: string }
              const isAccepted = request.status === 'ACCEPTED'

              return (
                <ModernCard
                  key={request.id}
                  className={cn(
                    "p-6 border-l-4 transition-all duration-300 hover:shadow-lg",
                    isAccepted ? "border-l-green-500" : "border-l-yellow-500"
                  )}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            {request.city}
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border", getStatusBadge(request.status))}>
                              {request.status}
                            </span>
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 capitalize">
                            {request.serviceType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {new Date(dates.start).toLocaleDateString()}
                            {dates.end && ` - ${new Date(dates.end).toLocaleDateString()}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="capitalize">{request.preferredTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{request.numberOfGuests} Guests ({request.groupType})</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Requested {new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {request.selections.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {isAccepted ? 'Your Guide' : 'Matched Guides'}
                          </h4>
                          <div className="space-y-3">
                            {request.selections.map((selection, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                <div>
                                  <p className="font-semibold text-gray-900">{selection.student.name}</p>
                                  {selection.student.averageRating && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                      <span className="text-xs text-gray-600 font-medium">
                                        {selection.student.averageRating.toFixed(1)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {isAccepted && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200">
                                    Confirmed
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {request.review && (
                        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-4 w-4 text-purple-500" />
                            <span className="font-semibold text-purple-900 text-sm">Your Review</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn("h-4 w-4", i < request.review!.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}
                              />
                            ))}
                          </div>
                          {request.review.comment && (
                            <p className="text-sm text-gray-600 italic">"{request.review.comment}"</p>
                          )}
                        </div>
                      )}

                      {isAccepted && !request.review && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex gap-3">
                          <div className="bg-blue-100 rounded-full p-1 h-fit">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-blue-900">Next Steps</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Contact your guide to finalize details. You can leave a review after your trip!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </ModernCard>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
