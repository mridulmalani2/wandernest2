'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { StudentProfileCard, StudentMatch } from '@/components/tourist/StudentProfileCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Filter, Globe2, Languages, CalendarClock } from 'lucide-react'

interface RequestSummary {
  id: string
  city: string
  status: string
  serviceType: string
  preferredLanguages: string[]
  preferredNationality: string | null
  preferredTime: string | null
  dates: unknown
  createdAt: string
  travelerName?: string | null
  email?: string | null
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestSummary[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [requestError, setRequestError] = useState<string | null>(null)

  const [activeRequestId, setActiveRequestId] = useState<string | null>(null)
  const [matches, setMatches] = useState<StudentMatch[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [filters, setFilters] = useState<{ nationality: string; languages: string[]; availabilityDay: string }>({
    nationality: 'all',
    languages: [],
    availabilityDay: 'all',
  })

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoadingRequests(true)
        const response = await fetch('/api/admin/requests', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Unable to load requests')
        }

        const data = await response.json()
        setRequests(data.requests || [])
      } catch (error) {
        console.error('Failed to load requests', error)
        setRequestError('Unable to load booking requests. Please try again.')
      } finally {
        setLoadingRequests(false)
      }
    }

    loadRequests()
  }, [])

  const loadMatches = async (requestId: string) => {
    try {
      setActiveRequestId(requestId)
      setMatchLoading(true)
      setMatchError(null)
      setSelectedStudents([])

      const response = await fetch('/api/tourist/request/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      })

      if (!response.ok) {
        throw new Error('Failed to load matches')
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Match lookup failed')
      }

      setMatches(data.matches || [])
      setFilters({ nationality: 'all', languages: [], availabilityDay: 'all' })
    } catch (error) {
      console.error('Error loading matches', error)
      setMatchError('Could not fetch recommendations for this request.')
    } finally {
      setMatchLoading(false)
    }
  }

  const filteredMatches = useMemo(() => {
    return matches.filter((student) => {
      const nationalityPasses =
        filters.nationality === 'all' || student.nationality === filters.nationality

      const languagesPass =
        filters.languages.length === 0 || filters.languages.every((lang) => student.languages.includes(lang))

      const availabilityPass =
        filters.availabilityDay === 'all' ||
        (student.availability || []).some((slot) => slot.dayOfWeek === filters.availabilityDay)

      return nationalityPasses && languagesPass && availabilityPass
    })
  }, [filters, matches])

  const availableNationalities = useMemo(() => {
    return Array.from(new Set(matches.map((m) => m.nationality).filter(Boolean)))
  }, [matches])

  const availableLanguages = useMemo(() => {
    return Array.from(new Set(matches.flatMap((m) => m.languages || []))).sort()
  }, [matches])

  const availabilityDays = useMemo(() => {
    return Array.from(
      new Set(
        matches.flatMap((m) => (m.availability || []).map((slot) => slot.dayOfWeek))
      )
    )
  }, [matches])

  const toggleLanguage = (language: string) => {
    setFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter((lang) => lang !== language)
        : [...prev.languages, language],
    }))
  }

  const clearFilters = () => {
    setFilters({ nationality: 'all', languages: [], availabilityDay: 'all' })
  }

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleAssign = async () => {
    if (!activeRequestId || selectedStudents.length === 0) return

    try {
      const response = await fetch('/api/tourist/request/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: activeRequestId, selectedStudentIds: selectedStudents }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to send match invites')
      }

      alert('Selections sent to students. You will be notified when someone accepts.')
    } catch (error) {
      console.error('Assign error', error)
      alert('Unable to send selections. Please retry.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Tourist requests</h1>
          <p className="text-gray-600">Review incoming requests and privately match them with students based on nationality, language, and availability.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Requests</h2>
              <Badge variant="secondary">{requests.length} loaded</Badge>
            </div>

            <div className="space-y-3">
              {loadingRequests && (
                <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading requests...</div>
              )}
              {requestError && (
                <p className="text-sm text-red-600">{requestError}</p>
              )}
              {!loadingRequests && requests.length === 0 && (
                <p className="text-sm text-gray-500">No recent requests found.</p>
              )}
              {requests.map((req) => (
                <button
                  key={req.id}
                  onClick={() => loadMatches(req.id)}
                  className={`w-full text-left rounded-xl border px-4 py-3 bg-white shadow-sm transition hover:shadow-md ${
                    activeRequestId === req.id ? 'border-ui-blue-primary ring-2 ring-ui-blue-primary/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</p>
                      <p className="text-lg font-semibold text-gray-900">{req.city || 'Unknown city'}</p>
                      <p className="text-sm text-gray-600">{req.serviceType}</p>
                    </div>
                    <Badge variant={activeRequestId === req.id ? 'default' : 'secondary'} className="capitalize">{req.status.toLowerCase()}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                    {req.preferredNationality && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        <Globe2 className="h-3 w-3" /> {req.preferredNationality}
                      </span>
                    )}
                    {req.preferredLanguages?.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                        <Languages className="h-3 w-3" /> {req.preferredLanguages.join(', ')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recommended students</h2>
                <p className="text-sm text-gray-600">Pulled from the match engine using nationality, language, and availability data.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" /> Filters
              </div>
            </div>

            {!activeRequestId && (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
                Select a request to view recommendations.
              </div>
            )}

            {activeRequestId && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3 items-center bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Globe2 className="h-4 w-4 text-ui-blue-primary" />
                    <span className="font-semibold">Nationality</span>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={filters.nationality}
                      onChange={(e) => setFilters((prev) => ({ ...prev, nationality: e.target.value }))}
                    >
                      <option value="all">Any</option>
                      {availableNationalities.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Languages className="h-4 w-4 text-ui-purple-primary" />
                    <span className="font-semibold">Languages</span>
                    <div className="flex flex-wrap gap-2">
                      {availableLanguages.map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => toggleLanguage(lang)}
                          className={`px-3 py-1 rounded-full border text-sm transition ${
                            filters.languages.includes(lang)
                              ? 'bg-ui-purple-primary text-white border-ui-purple-primary'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-ui-purple-primary'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <CalendarClock className="h-4 w-4 text-ui-blue-primary" />
                    <span className="font-semibold">Availability</span>
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={filters.availabilityDay}
                      onChange={(e) => setFilters((prev) => ({ ...prev, availabilityDay: e.target.value }))}
                    >
                      <option value="all">Any day</option>
                      {availabilityDays.map((day) => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  {(filters.languages.length > 0 || filters.nationality !== 'all' || filters.availabilityDay !== 'all') && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>

                {matchLoading && (
                  <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading recommendations...</div>
                )}
                {matchError && <p className="text-sm text-red-600">{matchError}</p>}

                {!matchLoading && !matchError && filteredMatches.length === 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
                    No students match these filters yet. Try broadening availability or language requirements.
                  </div>
                )}

                {!matchLoading && !matchError && filteredMatches.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMatches.map((student) => (
                      <StudentProfileCard
                        key={student.studentId}
                        student={student}
                        isSelected={selectedStudents.includes(student.studentId)}
                        onToggleSelect={handleToggleStudent}
                        showAvailability
                      />
                    ))}
                  </div>
                )}

                {selectedStudents.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-ui-blue-primary/30 bg-ui-blue-primary/5 px-4 py-3">
                    <p className="text-sm text-gray-800">
                      {selectedStudents.length} student{selectedStudents.length === 1 ? '' : 's'} selected for this request.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setSelectedStudents([])}>Reset</Button>
                      <Button onClick={handleAssign}>Send invites</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
