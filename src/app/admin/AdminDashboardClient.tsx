'use client'

import { useEffect, useMemo, useState } from 'react'
import AdminNav from '@/components/admin/AdminNav'
import { CheckCircle2, Clock3, HelpCircle, UserPlus2 } from 'lucide-react'

interface UpcomingBooking {
  id: string
  city: string
  date: string
  service: string
  travelerName: string
  assignment: {
    studentName?: string
    status: 'Assigned' | 'Unassigned'
  }
  approval: 'Approved' | 'Pending' | 'Needs Attention'
  notes?: string
}

interface DashboardSnapshot {
  totalBookings: number
  totalStudents: number
  approvedBookings: number
  pendingApprovals: number
  upcomingBookings: UpcomingBooking[]
}

const statusColors: Record<UpcomingBooking['approval'], string> = {
  Approved: 'bg-green-50 text-green-700 border-green-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'Needs Attention': 'bg-red-50 text-red-700 border-red-200',
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<DashboardSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to load dashboard data')
        }

        const payload = (await response.json()) as DashboardSnapshot
        setData(payload)
      } catch (err) {
        console.error('Failed to fetch dashboard data', err)
        setError('Unable to load dashboard data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const totals = useMemo(
    () => ({
      bookings: data?.totalBookings ?? 0,
      students: data?.totalStudents ?? 0,
      approved: data?.approvedBookings ?? 0,
      pending: data?.pendingApprovals ?? 0,
    }),
    [data]
  )

  if (loading || (!data && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-lg text-center space-y-3">
          <h2 className="text-xl font-semibold">Dashboard unavailable</h2>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
              TW
            </span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor bookings, students, and upcoming assignments at a glance.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 shadow-sm border border-gray-200">
              <Clock3 className="h-4 w-4 mr-2" />
              Updated just now
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 shadow-sm border border-gray-200">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              Auto-checks assignment readiness
            </span>
          </div>
        </header>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Core Metrics</h2>
            <p className="text-sm text-gray-500">High-level view of bookings and student supply.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Bookings"
              value={totals.bookings}
              subtext="Received across all destinations"
              accent="bg-blue-50 text-blue-700 border-blue-200"
            />
            <MetricCard
              title="Registered Students"
              value={totals.students}
              subtext="Available to be assigned"
              accent="bg-indigo-50 text-indigo-700 border-indigo-200"
            />
            <MetricCard
              title="Approved Bookings"
              value={totals.approved}
              subtext="Ready for fulfilment"
              accent="bg-green-50 text-green-700 border-green-200"
            />
            <MetricCard
              title="Pending Approvals"
              value={totals.pending}
              subtext="Awaiting admin review"
              accent="bg-amber-50 text-amber-700 border-amber-200"
            />
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming bookings</h2>
            <p className="text-sm text-gray-500">Assignment and approval status for imminent trips.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="hidden lg:grid grid-cols-12 bg-gray-50 px-6 py-3 text-xs font-semibold uppercase text-gray-500 tracking-wide">
              <div className="col-span-2">Booking</div>
              <div className="col-span-2">Traveler</div>
              <div className="col-span-2">Destination</div>
              <div className="col-span-2">Service</div>
              <div className="col-span-2">Assignment</div>
              <div className="col-span-2">Approval</div>
            </div>
            <div className="divide-y divide-gray-200">
              {data.upcomingBookings.map((booking) => (
                <article key={booking.id} className="grid grid-cols-1 lg:grid-cols-12 px-6 py-4 gap-3">
                  <div className="lg:col-span-2 flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-semibold">
                      {booking.id.replace('BK-', '')}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{booking.id}</p>
                      <p className="text-sm text-gray-500">{booking.date}</p>
                    </div>
                  </div>

                  <div className="lg:col-span-2 text-gray-900">
                    <p className="font-medium">{booking.travelerName}</p>
                    <p className="text-sm text-gray-500">{booking.city}</p>
                  </div>

                  <div className="lg:col-span-2 text-gray-900">
                    <p className="font-medium">{booking.city}</p>
                    <p className="text-sm text-gray-500">{booking.date}</p>
                  </div>

                  <div className="lg:col-span-2 text-gray-900">
                    <p className="font-medium">{booking.service}</p>
                    <p className="text-sm text-gray-500">{booking.notes || 'No special notes'}</p>
                  </div>

                  <div className="lg:col-span-2">
                    {booking.assignment.status === 'Assigned' ? (
                      <div className="inline-flex items-center gap-2 rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-sm">
                        <UserPlus2 className="h-4 w-4" />
                        {booking.assignment.studentName}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1 text-sm">
                        <HelpCircle className="h-4 w-4" />
                        Unassigned
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-2 flex flex-col gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium ${statusColors[booking.approval]}`}>
                      {booking.approval === 'Approved' && <CheckCircle2 className="h-4 w-4" />}
                      {booking.approval === 'Pending' && <Clock3 className="h-4 w-4" />}
                      {booking.approval === 'Needs Attention' && <HelpCircle className="h-4 w-4" />}
                      {booking.approval}
                    </span>
                    <p className="text-xs text-gray-500">{booking.notes ? booking.notes : 'Awaiting action'}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  subtext: string
  accent: string
}

function MetricCard({ title, value, subtext, accent }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-3">
      <div className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${accent}`}>
        {title}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtext}</p>
    </div>
  )
}
