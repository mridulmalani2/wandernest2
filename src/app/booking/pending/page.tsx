'use client'

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Clock, CheckCircle2, Mail, Phone, MessageCircle } from 'lucide-react'
import Navigation from '@/components/Navigation'

interface RequestStatus {
  status: 'PENDING' | 'MATCHED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'
  assignedStudent: {
    name: string
    email: string
    phone: string | null
    whatsapp: string | null
    institute: string
    nationality: string
    languages: string[]
    averageRating: number | null
    tripsHosted: number
  } | null
  city: string
  dates: { start: string; end?: string }
  numberOfGuests: number
  expiresAt: string
  selectionsCount: number
}

const isValidStatusPayload = (payload: any): payload is RequestStatus => {
  if (!payload || typeof payload !== 'object') return false
  if (typeof payload.status !== 'string') return false
  if (!payload.city || typeof payload.city !== 'string') return false
  if (!payload.dates || typeof payload.dates.start !== 'string') return false
  if (typeof payload.numberOfGuests !== 'number') return false
  if (typeof payload.expiresAt !== 'string') return false
  return true
}

function PendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [status, setStatus] = useState<RequestStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const isFetchingRef = useRef(false)

  const fetchStatus = useCallback(async () => {
    if (!requestId || isFetchingRef.current) return
    isFetchingRef.current = true
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await fetch(`/api/tourist/request/status?requestId=${encodeURIComponent(requestId)}`, {
        signal: controller.signal,
      })

      if (!response.ok) {
        setError('Unable to load request status')
        return
      }

      const data = await response.json()

      if (data?.success && isValidStatusPayload(data.status)) {
        setStatus(data.status)
      } else {
        setError('Unable to load request status')
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error fetching status:', err)
        setError('Failed to load request status')
      }
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [requestId])

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided')
      setLoading(false)
      return
    }

    if (!/^[a-z0-9]+$/i.test(requestId)) {
      setError('Invalid request ID provided')
      setLoading(false)
      return
    }

    fetchStatus()
    // Poll every 10 seconds for status updates
    const interval = setInterval(fetchStatus, 10000)

    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [requestId, fetchStatus])

  if (loading) {
    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      </>
    )
  }

  if (error || !status) {
    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
          <Alert variant="destructive" className="max-w-md glass-card-dark border-red-500/20 bg-red-900/20 text-red-300">
            <AlertDescription>{error || 'Request not found'}</AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  // If request is accepted, show success page
  if (status.status === 'ACCEPTED' && status.assignedStudent) {
    const student = status.assignedStudent
    const startDate = new Date(status.dates.start).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })

    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen bg-black py-12 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-400" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Your Guide Has Accepted!
              </h1>
              <p className="text-lg text-gray-300">
                Get ready for an amazing experience in {status.city}
              </p>
            </div>

            {/* Student Details Card */}
            <Card className="mb-6 border-2 border-green-500/20 glass-card-dark">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-green-400 mb-4">
                  Your Student Guide
                </h2>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-lg font-semibold text-white">{student.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">University</p>
                    <p className="text-lg text-white">{student.institute}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">From</p>
                    <p className="text-lg text-white">{student.nationality}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Languages</p>
                    <p className="text-lg text-white">{student.languages.join(', ')}</p>
                  </div>

                  {student.averageRating && (
                    <div>
                      <p className="text-sm text-gray-400">Rating</p>
                      <p className="text-lg text-white">
                        {student.averageRating.toFixed(1)}/5 ({student.tripsHosted} trips
                        hosted)
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="mb-6 bg-blue-900/20 border-blue-500/20 glass-card-dark">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                  Contact Information
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <a
                        href={`mailto:${student.email}`}
                        className="text-blue-400 hover:underline font-medium"
                      >
                        {student.email}
                      </a>
                    </div>
                  </div>

                  {student.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">Phone</p>
                        <a
                          href={`tel:${student.phone}`}
                          className="text-blue-400 hover:underline font-medium"
                        >
                          {student.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {student.whatsapp && (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">WhatsApp</p>
                        <a
                          href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-medium"
                        >
                          {student.whatsapp}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-6 glass-card-dark border-white/10">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Next Steps</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Reach out to your guide within the next 24-48 hours</li>
                  <li>Confirm the exact meeting point and time for {startDate}</li>
                  <li>Discuss and agree on the final payment amount and method</li>
                  <li>Stay in touch and confirm details 24 hours before your trip</li>
                  <li>Enjoy your experience and leave a review afterward!</li>
                </ol>
              </CardContent>
            </Card>

            {/* Important Notice */}
            <Alert className="mb-6 border-amber-500/20 bg-amber-900/20 glass-card-dark">
              <AlertDescription className="text-sm text-amber-300">
                <strong>Important:</strong> TourWiseCo is a connector platform only. All
                payments and service arrangements are made directly between you and the
                student guide. We recommend meeting in public places for safety.
              </AlertDescription>
            </Alert>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={() => router.push('/tourist/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                View My Requests
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // If still pending, show waiting page
  const timeRemaining = Math.ceil(
    (new Date(status.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)
  )

  if (status.status === 'EXPIRED') {
    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen flex items-center justify-center p-4 bg-black">
          <div className="max-w-md text-center">
            <Clock className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Request Expired</h2>
            <p className="text-gray-300 mb-6">
              Unfortunately, no guide accepted your request within the time window. You can
              try creating a new request with different criteria or dates.
            </p>
            <Button onClick={() => router.push('/booking')} className="bg-blue-600 hover:bg-blue-700 text-white">
              Create New Request
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation variant="tourist" />
      <div className="min-h-screen bg-black py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Notification */}
          <div className="mb-8 animate-fade-in-up">
            <Alert className="border-2 border-green-500/20 bg-green-900/20 shadow-premium glass-card-dark">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <AlertDescription className="text-green-300 font-medium">
                <strong>Booking Request Initiated!</strong> Your request has been sent to {status.selectionsCount} guide
                {status.selectionsCount > 1 ? 's' : ''}. Check your email for further details and updates.
              </AlertDescription>
            </Alert>
          </div>

          {/* Waiting Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-full mb-4">
              <Clock className="h-12 w-12 text-blue-400 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Waiting for Response
            </h1>
            <p className="text-lg text-gray-300">
              We'll notify you as soon as a guide accepts
            </p>
          </div>

          {/* Status Card */}
          <Card className="mb-6 glass-card-dark border-white/10">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Request Details</h2>

              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between">
                  <span className="font-medium">Destination:</span>
                  <span>{status.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Guests:</span>
                  <span>{status.numberOfGuests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="px-3 py-1 bg-amber-900/20 text-amber-300 rounded-full text-sm font-medium">
                    Waiting for acceptance
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Guides notified:</span>
                  <span>{status.selectionsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time remaining:</span>
                  <span>
                    {timeRemaining > 24
                      ? `${Math.floor(timeRemaining / 24)} days`
                      : `${timeRemaining} hours`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert className="mb-6 border-blue-500/20 bg-blue-900/20 glass-card-dark">
            <AlertDescription className="text-sm text-blue-300">
              <strong>How it works:</strong> Your request was sent to multiple student guides.
              The first one to accept will be assigned to you. You'll receive an email
              notification as soon as a guide accepts. This page will automatically update.
            </AlertDescription>
          </Alert>

          {/* Refresh Button */}
          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">
              Page auto-refreshes every 10 seconds
            </p>
            <Button
              onClick={fetchStatus}
              variant="outline"
              className="mr-4 bg-transparent text-white border-white/20 hover:bg-white/10"
            >
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh Now
            </Button>
            <Button
              onClick={() => router.push('/tourist/dashboard')}
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-white/10"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function PendingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-ui-blue-primary" />
        </div>
      }
    >
      <PendingContent />
    </Suspense>
  )
}
