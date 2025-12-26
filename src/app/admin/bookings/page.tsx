'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

type RequestStatus = 'PENDING' | 'MATCHED' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED'

interface BookingSummary {
  id: string
  travelerName: string
  travelerEmail: string
  city: string
  serviceType: string
  status: RequestStatus
  createdAt: string
  date: string
  assignedStudent?: {
    id: string
    name?: string | null
    email?: string | null
  }
  tripNotes?: string | null
}

interface BookingDetail extends BookingSummary {
  preferredLanguages: string[]
  preferredNationality?: string | null
  preferredGender?: string | null
  preferredTime?: string | null
  groupType?: string | null
  numberOfGuests?: number | null
  contact: {
    phone?: string | null
    whatsapp?: string | null
    contactMethod?: string | null
    meetingPreference?: string | null
  }
  selections: {
    id: string
    studentId: string
    status: string
    studentName?: string | null
    studentEmail?: string | null
  }[]
  recommendedStudents: {
    id: string
    name?: string | null
    email?: string | null
    city?: string | null
    languages: string[]
    averageRating?: number | null
    reliabilityBadge?: string | null
    tripsHosted: number
  }[]
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingSummary[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [assignError, setAssignError] = useState<string | null>(null)
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const isMountedRef = useRef(true)
  const assignAbortRef = useRef<AbortController | null>(null)

  // Helper for auth tokens (Removed as we use cookies now)

  const fetchBookings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingList(true)
      setError(null)

      const response = await fetch('/api/admin/bookings', {
        headers: {
          // No need for Authorization header with cookies
        },
        signal,
      })

      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load bookings')
      }

      const payload = await response.json().catch(() => null)
      const bookingList = Array.isArray(payload?.bookings) ? payload.bookings : []
      setBookings(bookingList)

      // Only set selectedBookingId if none is selected and we have bookings
      // To avoid overriding user selection if this is a refresh
      if (bookingList.length > 0) {
        // If we want to auto-select the first one:
        // But creating a race condition if user selects one while loading?
        // We'll trust the user's selection unless it's empty.
        setSelectedBookingId(prev => prev ?? bookingList[0].id)
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Failed to load bookings', err)
      setError(err instanceof Error ? err.message : 'Unable to load bookings')
    } finally {
      // Check if aborted before state update?
      if (!isMountedRef.current) return
      setLoadingList(false)
    }
  }, [router])

  const fetchBookingDetail = useCallback(async (bookingId: string, signal?: AbortSignal) => {
    try {
      setLoadingDetail(true)
      setDetailError(null)

      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        headers: {
          // Cookies handled automatically
        },
        signal,
      })

      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to load booking')
      }

      const payload = await response.json().catch(() => null)
      if (!payload?.booking || typeof payload.booking !== 'object') {
        throw new Error('Booking details unavailable')
      }
      const booking = payload.booking as BookingDetail
      const normalizedBooking: BookingDetail = {
        ...booking,
        preferredLanguages: Array.isArray(booking.preferredLanguages) ? booking.preferredLanguages : [],
        contact: booking.contact ?? {},
        selections: Array.isArray(booking.selections) ? booking.selections : [],
        recommendedStudents: Array.isArray(booking.recommendedStudents) ? booking.recommendedStudents : [],
      }
      setSelectedBooking(normalizedBooking)
      setSelectedStudentId(normalizedBooking.assignedStudent?.id || '')
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Failed to load booking detail', err)
      setDetailError(err instanceof Error ? err.message : 'Unable to load booking')
    } finally {
      if (!isMountedRef.current) return
      setLoadingDetail(false)
    }
  }, [router])

  useEffect(() => {
    const controller = new AbortController()
    fetchBookings(controller.signal)
    return () => controller.abort()
  }, [fetchBookings])

  useEffect(() => {
    if (selectedBookingId) {
      const controller = new AbortController()
      fetchBookingDetail(selectedBookingId, controller.signal)
      return () => controller.abort()
    }
  }, [selectedBookingId, fetchBookingDetail])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
      assignAbortRef.current?.abort()
    }
  }, [])

  // This function is still triggered interactively, so signal is less critical but good for robustness if we wanted to support cancellation.
  const handleAssign = async () => {
    if (!selectedBookingId || !selectedStudentId) {
      setAssignError('Select a student to assign to this booking')
      return
    }
    const allowedStudentIds = selectedBooking?.recommendedStudents?.map((student) => student.id) ?? []
    if (!allowedStudentIds.includes(selectedStudentId)) {
      setAssignError('Selected student is not eligible for this booking')
      return
    }

    try {
      setAssigning(true)
      setAssignError(null)

      const response = await fetch('/api/admin/bookings/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Cookies auto-sent
        },
        body: JSON.stringify({ requestId: selectedBookingId, studentId: selectedStudentId }),
      })

      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to assign student')
      }

      // Refresh both list and detail
      // Note: we don't pass signal here as we want these to complete even if user navigates away quickly?
      // Actually normally we would want them tied to the component. 
      // For now, simpler await is fine.
      assignAbortRef.current?.abort()
      const refreshController = new AbortController()
      assignAbortRef.current = refreshController
      await Promise.all([
        fetchBookings(refreshController.signal),
        selectedBookingId ? fetchBookingDetail(selectedBookingId, refreshController.signal) : Promise.resolve()
      ])
    } catch (err) {
      console.error('Failed to assign student', err)
      setAssignError(err instanceof Error ? err.message : 'Unable to assign student')
    } finally {
      setAssigning(false)
    }
  }

  const statusBadge = (status: RequestStatus) => {
    const styles: Record<RequestStatus, string> = {
      PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
      MATCHED: 'bg-blue-50 text-blue-700 border-blue-200',
      ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
      EXPIRED: 'bg-gray-100 text-gray-600 border-gray-200',
      CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    }

    const labels: Record<RequestStatus, string> = {
      PENDING: 'Pending',
      MATCHED: 'Matched',
      ACCEPTED: 'Approved',
      EXPIRED: 'Expired',
      CANCELLED: 'Cancelled',
    }

    return (
      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const formattedSelections = useMemo(() => {
    if (!selectedBooking) return []

    return selectedBooking.selections.map((selection) => ({
      ...selection,
      label: selection.studentName || selection.studentEmail || selection.studentId,
    }))
  }, [selectedBooking])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600">Review tourist requests, assign students, and approve bookings.</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <p className="font-semibold">Unable to load bookings</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <section className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Tourist bookings</h2>
                {loadingList && <span className="text-xs text-gray-500">Refreshing...</span>}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                {loadingList ? (
                  <div className="p-6 text-center text-gray-500">Loading bookings...</div>
                ) : bookings.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">No bookings available</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <li key={booking.id}>
                        <button
                          onClick={() => setSelectedBookingId(booking.id)}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${selectedBookingId === booking.id ? 'bg-blue-50/70 border-l-4 border-blue-500' : ''
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{booking.travelerName}</p>
                                {statusBadge(booking.status)}
                              </div>
                              <p className="text-sm text-gray-600">{booking.city}</p>
                              <p className="text-xs text-gray-500">
                                {booking.serviceType} · {booking.date}
                              </p>
                              {booking.tripNotes && (
                                <p className="text-xs text-gray-500 line-clamp-1">{booking.tripNotes}</p>
                              )}
                            </div>
                            <div className="text-right text-xs text-gray-500 space-y-1">
                              <p>{new Date(booking.createdAt).toLocaleDateString()}</p>
                              <p>
                                {booking.assignedStudent
                                  ? booking.assignedStudent.name || booking.assignedStudent.email || 'Assigned'
                                  : 'Unassigned'}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 min-h-[520px]">
                {detailError ? (
                  <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-4">{detailError}</div>
                ) : loadingDetail || !selectedBooking ? (
                  <div className="text-center text-gray-500">Select a booking to view details</div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Tourist</p>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedBooking.travelerName}</h3>
                        <p className="text-sm text-gray-600">{selectedBooking.travelerEmail}</p>
                      </div>
                      {statusBadge(selectedBooking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoTile label="Destination" value={selectedBooking.city} />
                      <InfoTile label="Service type" value={selectedBooking.serviceType} />
                      <InfoTile label="Date" value={selectedBooking.date} />
                      <InfoTile label="Guests" value={selectedBooking.numberOfGuests?.toString() || 'Not provided'} />
                      <InfoTile label="Preferred time" value={selectedBooking.preferredTime || 'Not provided'} />
                      <InfoTile label="Group type" value={selectedBooking.groupType || 'Not provided'} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoTile
                        label="Language preferences"
                        value={selectedBooking.preferredLanguages.length > 0 ? selectedBooking.preferredLanguages.join(', ') : 'No preference'}
                      />
                      <InfoTile
                        label="Guide preference"
                        value={
                          selectedBooking.preferredGender ||
                          selectedBooking.preferredNationality ||
                          selectedBooking.preferredTime ||
                          'No preference'
                        }
                      />
                      <InfoTile
                        label="Contact"
                        value={
                          selectedBooking.contact?.phone ||
                          selectedBooking.contact?.whatsapp ||
                          selectedBooking.contact?.contactMethod ||
                          'Not provided'
                        }
                      />
                      <InfoTile label="Meeting preference" value={selectedBooking.contact?.meetingPreference || 'Not provided'} />
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Trip notes</p>
                      <p className="text-sm text-gray-700 min-h-[40px]">
                        {selectedBooking.tripNotes || 'No special notes provided by the tourist.'}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Assign student</p>
                          <p className="text-xs text-gray-600">Select an approved student to assign and approve this booking.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full sm:w-72 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select a student</option>
                            {selectedBooking.recommendedStudents.length > 0 ? selectedBooking.recommendedStudents.map((student) => (
                              <option key={student.id} value={student.id}>
                                {student.name || student.email || student.id} · {student.city || 'No city'} · Trips hosted:
                                {' '}
                                {student.tripsHosted}
                              </option>
                            )) : null}
                          </select>
                          <button
                            onClick={handleAssign}
                            disabled={assigning}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                          >
                            {assigning ? 'Assigning...' : 'Assign & approve'}
                          </button>
                        </div>
                      </div>
                      {assignError && <p className="text-sm text-red-600">{assignError}</p>}

                      {selectedBooking.assignedStudent && (
                        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
                          Assigned to {selectedBooking.assignedStudent.name || selectedBooking.assignedStudent.email}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900">Prior selections</p>
                      {formattedSelections.length === 0 ? (
                        <p className="text-sm text-gray-500">No student selections yet.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
                          {formattedSelections.map((selection) => (
                            <li key={selection.id} className="px-3 py-2 text-sm flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{selection.label}</p>
                                <p className="text-gray-500 text-xs">{selection.studentEmail}</p>
                              </div>
                              <span className="text-xs font-semibold text-gray-600 uppercase">{selection.status}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-1">{value}</p>
    </div>
  )
}
