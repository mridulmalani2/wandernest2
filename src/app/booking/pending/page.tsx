'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Clock, CheckCircle2, Mail, Phone, MessageCircle } from 'lucide-react'

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

function PendingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [status, setStatus] = useState<RequestStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided')
      setLoading(false)
      return
    }

    fetchStatus()
    // Poll every 10 seconds for status updates
    const interval = setInterval(fetchStatus, 10000)

    return () => clearInterval(interval)
  }, [requestId])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/tourist/request/status?requestId=${requestId}`)
      const data = await response.json()

      if (data.success) {
        setStatus(data.status)
      } else {
        setError(data.error)
      }
    } catch (err) {
      console.error('Error fetching status:', err)
      setError('Failed to load request status')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-ui-blue-primary" />
      </div>
    )
  }

  if (error || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || 'Request not found'}</AlertDescription>
        </Alert>
      </div>
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
      <div className="min-h-screen bg-gradient-to-b from-ui-success/10 to-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-ui-success rounded-full mb-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Guide Has Accepted!
            </h1>
            <p className="text-lg text-gray-600">
              Get ready for an amazing experience in {status.city}
            </p>
          </div>

          {/* Student Details Card */}
          <Card className="mb-6 border-2 border-ui-success">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-ui-success mb-4">
                Your Student Guide
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{student.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">University</p>
                  <p className="text-lg text-gray-900">{student.institute}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="text-lg text-gray-900">{student.nationality}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Languages</p>
                  <p className="text-lg text-gray-900">{student.languages.join(', ')}</p>
                </div>

                {student.averageRating && (
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-lg text-gray-900">
                      {student.averageRating.toFixed(1)}/5 ({student.tripsHosted} trips
                      hosted)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6 bg-ui-blue-primary/10 border-ui-blue-accent">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-ui-blue-primary mb-4">
                Contact Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-ui-blue-primary" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a
                      href={`mailto:${student.email}`}
                      className="text-ui-blue-primary hover:underline font-medium"
                    >
                      {student.email}
                    </a>
                  </div>
                </div>

                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-ui-blue-primary" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <a
                        href={`tel:${student.phone}`}
                        className="text-ui-blue-primary hover:underline font-medium"
                      >
                        {student.phone}
                      </a>
                    </div>
                  </div>
                )}

                {student.whatsapp && (
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-ui-blue-primary" />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <a
                        href={`https://wa.me/${student.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ui-blue-primary hover:underline font-medium"
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
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Reach out to your guide within the next 24-48 hours</li>
                <li>Confirm the exact meeting point and time for {startDate}</li>
                <li>Discuss and agree on the final payment amount and method</li>
                <li>Stay in touch and confirm details 24 hours before your trip</li>
                <li>Enjoy your experience and leave a review afterward!</li>
              </ol>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Alert className="mb-6 border-ui-warning bg-ui-warning/10">
            <AlertDescription className="text-sm text-ui-warning">
              <strong>Important:</strong> TourWiseCo is a connector platform only. All
              payments and service arrangements are made directly between you and the
              student guide. We recommend meeting in public places for safety.
            </AlertDescription>
          </Alert>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={() => router.push('/tourist/dashboard')}
              className="bg-ui-blue-primary hover:bg-ui-blue-accent"
            >
              View My Requests
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // If still pending, show waiting page
  const timeRemaining = Math.ceil(
    (new Date(status.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60)
  )

  if (status.status === 'EXPIRED') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Expired</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, no guide accepted your request within the time window. You can
            try creating a new request with different criteria or dates.
          </p>
          <Button onClick={() => router.push('/booking')} className="bg-ui-blue-primary">
            Create New Request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Notification */}
        <div className="mb-8 animate-fade-in-up">
          <Alert className="border-2 border-ui-success bg-gradient-to-br from-ui-success/10 to-ui-success/5 shadow-premium">
            <CheckCircle2 className="h-5 w-5 text-ui-success" />
            <AlertDescription className="text-ui-success font-medium">
              <strong>Booking Request Initiated!</strong> Your request has been sent to {status.selectionsCount} guide
              {status.selectionsCount > 1 ? 's' : ''}. Check your email for further details and updates.
            </AlertDescription>
          </Alert>
        </div>

        {/* Waiting Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-ui-blue-primary/20 rounded-full mb-4">
            <Clock className="h-12 w-12 text-ui-blue-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Waiting for Response
          </h1>
          <p className="text-lg text-gray-600">
            We'll notify you as soon as a guide accepts
          </p>
        </div>

        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Request Details</h2>

            <div className="space-y-3 text-gray-700">
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
                <span className="px-3 py-1 bg-ui-warning/20 text-ui-warning rounded-full text-sm font-medium">
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
        <Alert className="mb-6 border-ui-blue-accent bg-ui-blue-primary/10">
          <AlertDescription className="text-sm text-ui-blue-primary">
            <strong>How it works:</strong> Your request was sent to multiple student guides.
            The first one to accept will be assigned to you. You'll receive an email
            notification as soon as a guide accepts. This page will automatically update.
          </AlertDescription>
        </Alert>

        {/* Refresh Button */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Page auto-refreshes every 10 seconds
          </p>
          <Button
            onClick={fetchStatus}
            variant="outline"
            className="mr-4"
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Refresh Now
          </Button>
          <Button
            onClick={() => router.push('/tourist/dashboard')}
            variant="outline"
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
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
