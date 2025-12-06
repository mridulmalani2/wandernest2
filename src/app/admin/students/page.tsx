'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

interface Student {
  id: string
  email: string
  name: string
  gender: string
  nationality: string
  institute: string
  city: string
  status: string
  tripsHosted: number
  averageRating?: number
  noShowCount: number
  acceptanceRate?: number
  reliabilityBadge?: string
  createdAt: string
}

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '',
    city: '',
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchStudents = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      // Removed localStorage token check

      const params = new URLSearchParams({
        page: page.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.city && { city: filters.city }),
      })

      const response = await fetch(`/api/admin/students?${params}`, {
        // Cookies sent automatically
        signal,
      })

      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data.students)
      setTotalPages(data.pagination.totalPages)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred fetching students')
    } finally {
      if (signal && !signal.aborted) {
        setLoading(false)
      }
    }
  }, [filters, page, router])

  useEffect(() => {
    const controller = new AbortController()
    fetchStudents(controller.signal)
    return () => controller.abort()
  }, [fetchStudents])

  // ... rest of the file ...
  const getStatusBadge = (status: string) => {
    const styles = {
      APPROVED: 'bg-green-100 text-green-800',
      PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  const getBadgeIcon = (badge?: string) => {
    if (!badge) return null
    const icons = {
      bronze: '🥉',
      silver: '🥈',
      gold: '🥇',
    }
    return icons[badge as keyof typeof icons]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
          <p className="mt-2 text-gray-600">Manage all registered students on the platform.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value })
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="APPROVED">Approved</option>
                <option value="PENDING_APPROVAL">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => {
                  setFilters({ ...filters, city: e.target.value })
                  setPage(1)
                }}
                placeholder="Filter by city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => { setError(null); fetchStudents(); }}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Metrics
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {student.name}
                                {student.reliabilityBadge && (
                                  <span title={`${student.reliabilityBadge} badge`}>
                                    {getBadgeIcon(student.reliabilityBadge)}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                              <div className="text-sm text-gray-500">{student.institute}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(student.status)}`}>
                            {student.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Trips: {student.tripsHosted}</div>
                          <div>No-shows: {student.noShowCount}</div>
                          {student.acceptanceRate != null && student.acceptanceRate != undefined && (
                            <div>Accept: {(student.acceptanceRate * 100).toFixed(0)}%</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {student.averageRating ? (
                            <div className="flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span className="text-sm font-medium text-gray-900">
                                {student.averageRating.toFixed(1)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No ratings</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4 rounded-lg shadow">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{page}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
