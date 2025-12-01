'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import { ModernCard } from '@/components/ui/ModernCard'
import { Calendar, Users, Clock, MapPin, Star, CheckCircle2, MessageSquare, AlertCircle, Search, User, ArrowRight, Sparkles } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      <Navigation variant="tourist" />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl space-y-12">
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary shadow-premium p-8 md:p-12 text-white animate-fade-in">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                Your Adventures <Sparkles className="h-8 w-8 text-yellow-300" />
              </h1>
              <p className="text-blue-100 text-lg max-w-xl">
                Manage your bookings, connect with local guides, and get ready to explore like a local.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[150px]">
              <p className="text-xs text-blue-100 uppercase tracking-wider font-semibold mb-1">Total Trips</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
          {[
            { label: 'Total Requests', value: stats.total, icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Accepted', value: stats.accepted, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Completed', value: stats.completed, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
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
            <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
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
          <div className="space-y-6 animate-fade-in-up delay-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-ui-blue-primary" />
              Your Trips
            </h2>

            <div className="grid gap-6">
              {requests.map((request) => {
                const dates = request.dates as { start: string; end?: string }
                const isAccepted = request.status === 'ACCEPTED'

                return (
                  <ModernCard
                    key={request.id}
                    className={cn(
                      "p-0 overflow-hidden border-l-4 transition-all duration-300 hover:shadow-xl group",
                      isAccepted ? "border-l-green-500" : "border-l-yellow-500"
                    )}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Left: Trip Info */}
                      <div className="flex-1 p-6 md:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">{request.city}</h3>
                              <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border", getStatusBadge(request.status))}>
                                {request.status}
                              </span>
                            </div>
                            <p className="text-gray-500 capitalize flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                              {request.serviceType.replace('_', ' ')}
                            </p>
                          </div>

                          {/* Guide Info (if matched/accepted) */}
                          {request.selections.length > 0 && (
                            <div className="flex items-center gap-4 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                              <div className="h-10 w-10 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                <User className="h-5 w-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Guide</p>
                                <p className="font-bold text-gray-900">{request.selections[0].student.name}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Dates</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span>
                                {new Date(dates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                {dates.end && ` - ${new Date(dates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Time</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                              <Clock className="h-4 w-4 text-orange-500" />
                              <span className="capitalize">{request.preferredTime}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Guests</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                              <Users className="h-4 w-4 text-purple-500" />
                              <span>{request.numberOfGuests} ({request.groupType})</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Requested On</p>
                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Review Section */}
                        {request.review && (
                          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-purple-500" />
                              <span className="font-bold text-purple-900 text-sm">Your Review</span>
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

                        {/* Next Steps */}
                        {isAccepted && !request.review && (
                          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex gap-3 items-start">
                            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                              <AlertCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-900">Next Steps</p>
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
          </div>
        )}
      </main>
    </div>
  )
}
