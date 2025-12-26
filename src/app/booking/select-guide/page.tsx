'use client'

import { useEffect, useMemo, useState, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { StudentProfileCard, StudentMatch } from '@/components/tourist/StudentProfileCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info } from 'lucide-react'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import Navigation from '@/components/Navigation'

const STUDENT_GROUP_IMAGE_URL = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&q=80'

function SelectGuideContent() {
  const searchParams = useSearchParams()
  // ... rest of the component

  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [matches, setMatches] = useState<StudentMatch[]>([])
  const [filteredMatches, setFilteredMatches] = useState<StudentMatch[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<'network' | 'server' | 'notfound' | 'auth' | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState<any>(null)
  const [nationalityFilter, setNationalityFilter] = useState<string>('all')
  const [languageFilters, setLanguageFilters] = useState<string[]>([])
  const [requestPreferences, setRequestPreferences] = useState<{
    preferredNationality: string | null
    preferredLanguages: string[]
  }>({ preferredNationality: null, preferredLanguages: [] })

  const errorTitle = useMemo(() => {
    switch (errorType) {
      case 'notfound': return 'Request Not Found'
      case 'network': return 'Connection Issue'
      case 'auth': return 'Authentication Session Expired'
      default: return 'Something Went Wrong'
    }
  }, [errorType])

  const fetchMatches = useCallback(async (signal?: AbortSignal) => {
    if (!requestId) return

    try {
      setLoading(true)
      setError(null)
      setErrorType(null)

      const response = await fetch('/api/tourist/request/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId }),
        signal,
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setErrorType('auth');
          setError('Your session has expired. Please log in again to view this request.');
          setLoading(false);
          return;
        }

        let errorMessage = 'Unable to load your booking request.'
        let errType: 'server' | 'notfound' = 'server'

        try {
          const data = await response.json()
          // Sanitize: Don't show raw server errors if they assume internal knowledge
          // But allow "friendly" errors from our API
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
        setMatches(data.matches || [])
        setSuggestedPrice(data.suggestedPriceRange)
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
    } catch (err: any) {
      if (err.name === 'AbortError') return

      console.error('Error fetching matches:', err)
      setError('Unable to connect to the server. This might be a network issue - please check your connection and try again.')
      setErrorType('network')
    } finally {
      if (signal?.aborted) return
      setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided. Please start a new booking from the booking page.')
      setErrorType('notfound')
      setLoading(false)
      return
    }

    const controller = new AbortController()
    fetchMatches(controller.signal)

    return () => controller.abort()
  }, [requestId, fetchMatches])

  const handleToggleStudent = (selectionToken: string) => {
    setSelectedStudents((prev) =>
      prev.includes(selectionToken)
        ? prev.filter((id) => id !== selectionToken)
        : [...prev, selectionToken]
    )
  }

  const availableNationalities = useMemo(() => {
    return Array.from(
      new Set(matches.map((student) => student.nationality).filter(Boolean))
    )
  }, [matches])

  const availableLanguages = useMemo(() => {
    return Array.from(
      new Set(matches.flatMap((student) => student.languages || []))
    ).sort()
  }, [matches])

  const recommendedMatches = useMemo(() => {
    const { preferredNationality, preferredLanguages } = requestPreferences

    return matches
      .map((student) => {
        const nationalityMatch =
          preferredNationality && student.nationality === preferredNationality
        const languageOverlap = (preferredLanguages || []).filter((language) =>
          (student.languages || []).includes(language)
        )

        const recommendationScore = (nationalityMatch ? 2 : 0) +
          (languageOverlap.length > 0 ? 1 : 0)

        return { student, recommendationScore, languageOverlap, nationalityMatch }
      })
      .filter(({ recommendationScore }) => recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 3)
      .map(({ student }) => student)
  }, [matches, requestPreferences])

  const recommendationSummary = useMemo(() => {
    const { preferredNationality, preferredLanguages } = requestPreferences
    const parts: string[] = []

    if (preferredNationality) {
      parts.push(`from ${preferredNationality}`)
    }

    if (preferredLanguages.length > 0) {
      parts.push(`who speak ${preferredLanguages.join(', ')}`)
    }

    if (parts.length === 0) {
      return 'that align with your background and preferences'
    }

    if (parts.length === 1) {
      return parts[0]
    }

    return `${parts[0]} and ${parts[1]}`
  }, [requestPreferences])

  useEffect(() => {
    const filtered = matches.filter((student) => {
      const nationalityPasses =
        nationalityFilter === 'all' || student.nationality === nationalityFilter

      const languagePasses =
        languageFilters.length === 0 ||
        languageFilters.every((lang) => (student.languages || []).includes(lang))

      return nationalityPasses && languagePasses
    })

    setFilteredMatches(filtered)
  }, [languageFilters, matches, nationalityFilter])

  const toggleLanguageFilter = (language: string) => {
    setLanguageFilters((prev) =>
      prev.includes(language)
        ? prev.filter((lang) => lang !== language)
        : [...prev, language]
    )
  }

  const clearFilters = () => {
    setNationalityFilter('all')
    setLanguageFilters([])
  }

  const handleSubmitSelection = async () => {
    setSubmitError(null)
    if (selectedStudents.length === 0) {
      setSubmitError('Please select at least one guide')
      return
    }
    if (!requestId) {
      setSubmitError('Missing booking request ID. Please refresh and try again.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/tourist/request/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          selectedStudentTokens: selectedStudents,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to confirmation page
        router.push(`/booking/pending?requestId=${encodeURIComponent(requestId)}`)
      } else {
        setSubmitError(data.error || 'Failed to submit selection')
      }
    } catch (err) {
      console.error('Error submitting selection:', err)
      setSubmitError('Failed to submit selection due to a network error.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
          <div className="absolute inset-0">
            <Image
              src={STUDENT_GROUP_IMAGE_URL}
              alt="Students working together"
              fill
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          <div className="absolute inset-0 pattern-dots opacity-5" />

          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="text-center glass-card-dark rounded-3xl p-8 shadow-premium animate-fade-in">
              <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300 font-medium">Finding the best guides for you...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
          <div className="absolute inset-0">
            <Image
              src={STUDENT_GROUP_IMAGE_URL}
              alt="Students working together"
              fill
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          <div className="absolute inset-0 pattern-dots opacity-5" />

          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full glass-card-dark rounded-3xl p-8 shadow-premium border-2 border-red-500/20 animate-fade-in">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  {errorTitle}
                </h2>
                <p className="text-gray-300 mb-6">{error}</p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/booking')}
                    className="hover-lift shadow-soft bg-transparent text-white border-white/20 hover:bg-white/10"
                  >
                    Back to Booking
                  </Button>
                  {errorType !== 'notfound' && (
                    <PrimaryCTAButton
                      onClick={() => fetchMatches()}
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
      </>
    )
  }

  if (matches.length === 0) {
    return (
      <>
        <Navigation variant="tourist" />
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
          <div className="absolute inset-0">
            <Image
              src={STUDENT_GROUP_IMAGE_URL}
              alt="Students working together"
              fill
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>
          <div className="absolute inset-0 pattern-dots opacity-5" />

          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div className="max-w-md text-center glass-card-dark rounded-3xl p-8 shadow-premium animate-fade-in border-2 border-green-500/20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Request Successfully Created!
              </h2>
              <p className="text-lg font-medium text-green-400 mb-6">
                Your request has been generated, please check inbox for further details
              </p>
              <p className="text-gray-300 text-sm mb-6">
                We've saved your request and will notify you as soon as suitable student guides become available in your selected city.
              </p>
              <Button onClick={() => router.push('/')} className="hover-lift shadow-soft bg-green-600 hover:bg-green-700 text-white">
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation variant="tourist" />
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-5" />

        <div className="relative z-10 max-w-6xl mx-auto py-12 px-4">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow-lg mb-4">
              Choose Your Student Guide
            </h1>
            <p className="text-lg md:text-xl text-white text-shadow mb-6 font-medium">
              We've found {filteredMatches.length} guide
              {filteredMatches.length === 1 ? '' : 's'} that match your preferences
            </p>

            {/* Important Note */}
            <Alert className="max-w-3xl mx-auto mb-6 border-2 border-blue-500/20 glass-card-dark shadow-premium hover-lift animate-fade-in-up delay-100">
              <Info className="h-5 w-5 text-blue-400" />
              <AlertDescription className="text-sm text-blue-300 font-medium">
                <strong>How it works:</strong> Select one or more guides you're comfortable
                with. We'll notify them about your request, and the first one to accept will
                be your guide. Student identities are partially hidden for privacy until they
                accept.
              </AlertDescription>
            </Alert>
          </div>

          {/* Recommendations */}
          {recommendedMatches.length > 0 && (
            <div className="max-w-5xl mx-auto mb-8 animate-fade-in-up delay-150">
              <div className="glass-card-dark rounded-2xl border-2 border-white/10 shadow-premium p-6 backdrop-blur">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-400 font-bold mb-1">
                      Recommended for you
                    </p>
                    <h3 className="text-xl font-bold text-white">
                      Guides {recommendationSummary}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Based on your nationality and preferred languages, these guides are most likely
                      to understand your background and communicate effortlessly.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-blue-300 font-semibold bg-blue-500/10 border border-blue-500/30 rounded-full px-3 py-1">
                    <Info className="h-4 w-4" />
                    Personalized picks
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedMatches.map((student) => (
                    <StudentProfileCard
                      key={`recommended-${student.selectionToken}`}
                      student={student}
                      isSelected={selectedStudents.includes(student.selectionToken)}
                      onToggleSelect={handleToggleStudent}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Suggested Price Range */}
          {suggestedPrice && (
            <div className="max-w-3xl mx-auto mb-8 p-6 glass-card-dark rounded-2xl border-2 border-white/10 shadow-premium hover-lift animate-fade-in-up delay-200">
              <h3 className="font-bold text-white mb-2 text-lg">
                Suggested Price Range
              </h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                {suggestedPrice.min}-{suggestedPrice.max} {suggestedPrice.currency}
                {suggestedPrice.type === 'hourly' && (
                  <span className="text-sm font-normal text-gray-400">/hour</span>
                )}
              </p>
              <p className="text-sm text-gray-300 font-medium">{suggestedPrice.note}</p>
              <p className="text-xs text-gray-400 mt-2">
                Note: Rates are suggested based on student job benchmarks and city pricing.
                You agree on the final price directly with the student.
              </p>
            </div>
          )}

          {/* Filters */}
          <div className="max-w-6xl mx-auto mb-8 animate-fade-in-up delay-200">
            <div className="glass-card-dark rounded-2xl border-2 border-white/10 shadow-premium p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-3 md:space-y-2">
                  <h3 className="text-lg font-bold text-white">Filter your matches</h3>
                  <p className="text-sm text-gray-400">
                    Prioritize guides who share your nationality or speak the languages you prefer.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Nationality
                    </label>
                    <select
                      className="border rounded-lg px-3 py-2 bg-white/10 text-white border-white/20 text-sm min-w-[180px]"
                      value={nationalityFilter}
                      onChange={(e) => setNationalityFilter(e.target.value)}
                    >
                      <option value="all" className="bg-gray-900">All nationalities</option>
                      {availableNationalities.map((nationality) => (
                        <option key={nationality} value={nationality} className="bg-gray-900">
                          {nationality}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Languages
                    </span>
                    <div className="flex flex-wrap gap-2 max-w-xl">
                      {availableLanguages.map((language) => (
                        <button
                          key={language}
                          type="button"
                          onClick={() => toggleLanguageFilter(language)}
                          className={`px-3 py-1 rounded-full border text-sm transition-colors ${languageFilters.includes(language)
                            ? 'bg-blue-600 text-white border-blue-500'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-blue-400'
                            }`}
                        >
                          {language}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(languageFilters.length > 0 || nationalityFilter !== 'all') && (
                    <Button variant="outline" onClick={clearFilters} className="self-start bg-transparent text-white border-white/20 hover:bg-white/10">
                      Clear filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          {filteredMatches.length === 0 ? (
            <div className="max-w-3xl mx-auto mb-8 p-6 glass-card-dark rounded-2xl border-2 border-amber-500/20 bg-amber-900/20 shadow-soft text-center animate-fade-in-up delay-300">
              <p className="text-lg font-semibold text-amber-300 mb-2">No guides match these filters</p>
              <p className="text-sm text-amber-200 mb-4">
                Try adjusting the nationality or languages to see more guide options.
              </p>
              <Button variant="outline" onClick={clearFilters} className="hover-lift bg-transparent text-white border-white/20 hover:bg-white/10">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-300">
              {filteredMatches.map((student) => (
                <StudentProfileCard
                  key={student.selectionToken}
                  student={student}
                  isSelected={selectedStudents.includes(student.selectionToken)}
                  onToggleSelect={handleToggleStudent}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-4 animate-fade-in-up delay-500">
            {submitError && (
              <div className="w-full text-center p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm mb-2">
                {submitError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Button
                variant="outline"
                onClick={() => router.push('/booking')}
                disabled={submitting}
                className="w-full sm:w-auto hover-lift border-2 border-white/20 text-white bg-transparent hover:bg-white/10"
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
          </div>

          {/* Selection Summary */}
          {selectedStudents.length > 0 && (
            <div className="max-w-3xl mx-auto mt-6 p-5 bg-green-900/20 border-2 border-green-500/20 rounded-xl shadow-soft animate-scale-in">
              <p className="text-sm text-green-300 text-center font-medium">
                You've selected <strong>{selectedStudents.length}</strong> guide
                {selectedStudents.length > 1 ? 's' : ''}. They will all receive your request,
                and the first to accept will become your guide.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function SelectGuidePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      }
    >
      <SelectGuideContent />
    </Suspense>
  )
}
