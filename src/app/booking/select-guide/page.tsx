'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { StudentProfileCard, StudentMatch } from '@/components/tourist/StudentProfileCard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info } from 'lucide-react'

function SelectGuideContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const requestId = searchParams.get('requestId')

  const [matches, setMatches] = useState<StudentMatch[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedPrice, setSuggestedPrice] = useState<any>(null)

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided')
      setLoading(false)
      return
    }

    fetchMatches()
  }, [requestId])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tourist/request/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      const data = await response.json()

      if (data.success) {
        setMatches(data.matches)
        setSuggestedPrice(data.suggestedPriceRange)
      } else {
        setError(data.error || 'Failed to find matching guides')
      }
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError('Failed to load matching guides')
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-pink-600/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-pink-600/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md glass-card shadow-premium">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-pink-600/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="max-w-md text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Guides Available
            </h2>
            <p className="text-gray-700 mb-6">
              We couldn't find any available guides matching your criteria at the moment.
              This could be due to limited availability in your selected city or dates.
            </p>
            <Button onClick={() => router.push('/booking')} variant="outline" className="hover-lift shadow-soft">
              Modify Your Request
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
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/10 to-pink-600/15" />
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
          <Alert className="max-w-3xl mx-auto mb-6 border-2 border-blue-300 glass-frosted shadow-premium hover-lift animate-fade-in-up delay-100">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-sm text-blue-900 font-medium">
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
            <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
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
            className="w-full sm:w-auto hover-lift border-2 hover:border-blue-400 hover:text-blue-600"
          >
            Modify Request
          </Button>

          <Button
            onClick={handleSubmitSelection}
            disabled={selectedStudents.length === 0 || submitting}
            className="w-full sm:w-auto gradient-ocean hover:shadow-glow-blue shadow-premium text-white font-semibold group"
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
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </>
            )}
          </Button>
        </div>

        {/* Selection Summary */}
        {selectedStudents.length > 0 && (
          <div className="max-w-3xl mx-auto mt-6 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300/60 rounded-xl shadow-soft animate-scale-in">
            <p className="text-sm text-green-900 text-center font-medium">
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
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <SelectGuideContent />
    </Suspense>
  )
}
