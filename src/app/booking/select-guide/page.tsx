'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { StudentProfileCard, StudentMatch } from '@/components/tourist/StudentProfileCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

/**
 * FEATURE FLAG: Student Selection UI
 *
 * This feature has been DISABLED per business requirements.
 * Tourist-facing student selection has been replaced with admin-led matching.
 *
 * When ENABLE_STUDENT_SELECTION = false:
 * - Tourists cannot select guides from the UI
 * - Admin dashboard handles all matching manually
 * - Tourists see success message after booking creation
 *
 * To re-enable this feature in the future, set this to true.
 */
const ENABLE_STUDENT_SELECTION = false

function SelectGuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [matches, setMatches] = useState<StudentMatch[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'network' | 'server' | 'notfound' | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState<any>(null)

  // Feature flag: Show disabled message if student selection is turned off
  if (!ENABLE_STUDENT_SELECTION) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
            alt="Students working together"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 shadow-premium border-2 border-ui-blue-accent/30 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-ui-success to-ui-success/80 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Booking Request Created!
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Your booking request has been successfully created. Our admin team will now match you with the best student guides and follow up with you by email.
              </p>
              <p className="text-sm text-gray-600 mb-6">
                You should have received a confirmation email with your request ID and next steps.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/booking')}
                  className="hover-lift shadow-soft"
                >
                  Create Another Booking
                </Button>
                <PrimaryCTAButton
                  onClick={() => router.push('/')}
                  variant="blue"
                  className="hover-lift"
                >
                  Return to Home
                </PrimaryCTAButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided. Please start a new booking from the booking page.')
      setErrorType('notfound')
      setLoading(false)
      return
    }

    fetchMatches()
  }, [requestId])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      setErrorType(null)

      const response = await fetch('/api/tourist/request/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      // Check if response is OK before parsing JSON
      if (!response.ok) {
        // Handle HTTP errors (404, 500, etc.) - these are server-side issues, not network issues
        let errorMessage = 'Unable to load your booking request.'
        let errType: 'server' | 'notfound' = 'server'

        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
          if (response.status === 404) {
            errType = 'notfound'
            errorMessage = 'Booking request not found. It may have expired or been deleted.'
          }
        } catch {
          // Failed to parse error response
          if (response.status === 404) {
            errType = 'notfound'
            errorMessage = 'Booking request not found. It may have expired or been deleted.'
          } else {
            errorMessage = `Server error (${response.status}). Please try again later.`
          }
        }

        setError(errorMessage)
        setErrorType(errType)
        setLoading(false)
        return
      }

      const data = await response.json()

      // Important: "No matches found" (empty array) is a SUCCESS state, not an error
      // The backend returns { success: true, hasMatches: false, matches: [] } for this case
      if (data.success) {
        setMatches(data.matches || [])
        setSuggestedPrice(data.suggestedPriceRange)
        setError(null)
        setErrorType(null)
      } else {
        // Only set error for actual failures (database errors, etc.)
        setError(data.error || 'Unable to process your request. Please try again.')
        setErrorType('server')
      }
    } catch (err) {
      console.error('Error fetching matches:', err)
      // True network error (fetch threw before getting a response)
      setError('Unable to connect to the server. This might be a network issue - please check your connection and try again.')
      setErrorType('network')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSubmitSelection = async () => {
    if (selectedStudents.length === 0) {
      alert('Please select at least one guide')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/tourist/request/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          selectedStudentIds: selectedStudents,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to confirmation page
        router.push(`/booking/pending?requestId=${requestId}`)
      } else {
        alert(data.error || 'Failed to submit selection')
      }
    } catch (err) {
      console.error('Error submitting selection:', err)
      alert('Failed to submit selection')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
            alt="Students working together"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-ui-blue-primary mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Finding the best guides for you...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
            alt="Students working together"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full glass-card rounded-3xl p-8 shadow-premium border-2 border-ui-error/30 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-ui-error/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-ui-error" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {errorType === 'notfound' ? 'Request Not Found' :
                 errorType === 'network' ? 'Connection Issue' :
                 'Something Went Wrong'}
              </h2>
              <p className="text-gray-700 mb-6">{error}</p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => router.push('/booking')}
                  className="hover-lift shadow-soft"
                >
                  Back to Booking
                </Button>
                {errorType !== 'notfound' && (
                  <PrimaryCTAButton
                    onClick={fetchMatches}
                    variant="blue"
                    className="hover-lift"
                  >
                    Try Again
                  </PrimaryCTAButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
            alt="Students working together"
            fill
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-success/15 via-ui-success/10 to-ui-success/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in border-2 border-ui-success/30">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-ui-success to-ui-success/80 flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Request Successfully Created!
            </h2>
            <p className="text-lg font-medium text-ui-success mb-6">
              Your request has been generated, please check inbox for further details
            </p>
            <p className="text-gray-700 text-sm mb-6">
              We've saved your request and will notify you as soon as suitable student guides become available in your selected city.
            </p>
            <Button onClick={() => router.push('/')} className="hover-lift shadow-soft bg-ui-success hover:bg-ui-success/90 text-white">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Students working together and networking">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
          alt="Students working together and networking"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow-lg mb-4">
            Choose Your Student Guide
          </h1>
          <p className="text-lg md:text-xl text-white text-shadow mb-6 font-medium">
            We've found {matches.length} guide{matches.length > 1 ? 's' : ''} that match
            your preferences
          </p>

          {/* Important Note */}
          <Alert className="max-w-3xl mx-auto mb-6 border-2 border-ui-blue-accent glass-frosted shadow-premium hover-lift animate-fade-in-up delay-100">
            <Info className="h-5 w-5 text-ui-blue-primary" />
            <AlertDescription className="text-sm text-ui-blue-primary font-medium">
              <strong>How it works:</strong> Select one or more guides you're comfortable
              with. We'll notify them about your request, and the first one to accept will
              be your guide. Student identities are partially hidden for privacy until they
              accept.
            </AlertDescription>
          </Alert>
        </div>

        {/* Suggested Price Range */}
        {suggestedPrice && (
          <div className="max-w-3xl mx-auto mb-8 p-6 glass-card rounded-2xl border-2 border-white/40 shadow-premium hover-lift animate-fade-in-up delay-200">
            <h3 className="font-bold text-gray-900 mb-2 text-lg">
              Suggested Price Range
            </h3>
            <p className="text-3xl font-bold bg-gradient-to-r from-ui-purple-primary to-ui-purple-accent bg-clip-text text-transparent mb-2">
              {suggestedPrice.min}-{suggestedPrice.max} {suggestedPrice.currency}
              {suggestedPrice.type === 'hourly' && (
                <span className="text-sm font-normal text-gray-600">/hour</span>
              )}
            </p>
            <p className="text-sm text-gray-700 font-medium">{suggestedPrice.note}</p>
            <p className="text-xs text-gray-600 mt-2">
              Note: Rates are suggested based on student job benchmarks and city pricing.
              You agree on the final price directly with the student.
            </p>
          </div>
        )}

        {/* Student Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-300">
          {matches.map((student) => (
            <StudentProfileCard
              key={student.studentId}
              student={student}
              isSelected={selectedStudents.includes(student.studentId)}
              onToggleSelect={handleToggleStudent}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-500">
          <Button
            variant="outline"
            onClick={() => router.push('/booking')}
            disabled={submitting}
            className="w-full sm:w-auto hover-lift border-2 hover:border-ui-blue-accent hover:text-ui-blue-primary"
          >
            Modify Request
          </Button>

          <PrimaryCTAButton
            onClick={handleSubmitSelection}
            disabled={selectedStudents.length === 0 || submitting}
            variant="blue"
            className="w-full sm:w-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Requests...
              </>
            ) : (
              <>
                Confirm & Send Request
                {selectedStudents.length > 0 && ` (${selectedStudents.length})`}
              </>
            )}
          </PrimaryCTAButton>
        </div>

        {/* Selection Summary */}
        {selectedStudents.length > 0 && (
          <div className="max-w-3xl mx-auto mt-6 p-5 bg-gradient-to-br from-ui-success/10 to-ui-success/5 border-2 border-ui-success/60 rounded-xl shadow-soft animate-scale-in">
            <p className="text-sm text-ui-success text-center font-medium">
              You've selected <strong>{selectedStudents.length}</strong> guide
              {selectedStudents.length > 1 ? 's' : ''}. They will all receive your request,
              and the first to accept will become your guide.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SelectGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-ui-blue-primary" />
        </div>
      }
    >
      <SelectGuideContent />
    </Suspense>
  )
}
