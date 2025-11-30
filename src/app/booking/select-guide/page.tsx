'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info, Shield } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

function SelectGuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'network' | 'server' | 'notfound' | null>(null)
  const [requestPreferences, setRequestPreferences] = useState<{
    preferredNationality: string | null
    preferredLanguages: string[]
  }>({ preferredNationality: null, preferredLanguages: [] })

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

      if (!response.ok) {
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

      if (data.success) {
        setRequestPreferences({
          preferredNationality: data.preferredNationality || null,
          preferredLanguages: data.preferredLanguages || [],
        })
        setError(null)
        setErrorType(null)
      } else {
        setError(data.error || 'Unable to process your request. Please try again.')
        setErrorType('server')
      }
    } catch (err) {
      console.error('Error loading request metadata:', err)
      setError('Unable to connect to the server. Please check your connection and try again.')
      setErrorType('network')
    } finally {
      setLoading(false)
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
            <p className="text-gray-700 font-medium">Loading your booking request...</p>
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

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0" role="img" aria-label="Students collaborating">
        <Image
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80"
          alt="Students collaborating"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/20" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      <div className="relative z-10 max-w-4xl mx-auto py-14 px-4">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 shadow-premium border border-white/60 mb-4">
            <Shield className="h-5 w-5 text-ui-blue-primary" />
            <span className="text-sm font-semibold text-gray-700">Private matching enabled</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow-lg mb-4">
            Your request is being matched privately
          </h1>
          <p className="text-lg md:text-xl text-white/90 text-shadow font-medium max-w-3xl mx-auto">
            Our admin team will handle student recommendations internally to protect everyone’s privacy.
            We’ll reach out once the best student confirms availability.
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl border-2 border-white/40 shadow-premium p-6 bg-white/75 backdrop-blur animate-fade-in-up delay-100">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-ui-blue-primary font-semibold">
                <Info className="h-4 w-4" />
                How matching works now
              </div>
              <ul className="space-y-2 text-gray-700 text-base">
                <li>• Your request details are shared privately with our admin team.</li>
                <li>• Admins will pair you with students who match your nationality/language preferences and availability.</li>
                <li>• Once a student accepts, you’ll receive a confirmation email with next steps.</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-150">
            <div className="glass-card rounded-2xl border border-ui-blue-primary/30 p-5 bg-white/70">
              <p className="text-sm font-semibold text-ui-blue-primary uppercase mb-2">Your preferences</p>
              <ul className="space-y-2 text-gray-800">
                <li>
                  <span className="font-semibold">Nationality preference:</span>{' '}
                  {requestPreferences.preferredNationality || 'No specific preference'}
                </li>
                <li>
                  <span className="font-semibold">Languages:</span>{' '}
                  {requestPreferences.preferredLanguages.length > 0
                    ? requestPreferences.preferredLanguages.join(', ')
                    : 'Any'}
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl border border-ui-purple-primary/30 p-5 bg-white/70">
              <p className="text-sm font-semibold text-ui-purple-primary uppercase mb-2">What happens next</p>
              <ul className="space-y-2 text-gray-800">
                <li>• We’ll share the request internally and check student availability.</li>
                <li>• You’ll only see confirmed details once a student is assigned.</li>
                <li>• Need to change something? You can update or restart your booking anytime.</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-200">
            <Button
              variant="outline"
              onClick={() => router.push('/booking')}
              className="w-full sm:w-auto hover-lift border-2 hover:border-ui-blue-accent hover:text-ui-blue-primary"
            >
              Update booking details
            </Button>
            <PrimaryCTAButton
              onClick={() => router.push('/')}
              variant="blue"
              className="w-full sm:w-auto"
            >
              Return home
            </PrimaryCTAButton>
          </div>
        </div>
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
