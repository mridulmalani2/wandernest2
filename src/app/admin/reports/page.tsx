'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

interface Report {
  id: string
  reason: string
  description: string
  status: string
  createdAt: string
  student: {
    id: string
    name: string
    email: string
    city: string
    status: string
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const isMountedRef = useRef(true)

  const fetchReports = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)

      const params = new URLSearchParams({
        page: page.toString(),
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/reports?${params}`, {
        // Cookies handled automatically
        signal,
      })

      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }

      const data = await response.json().catch(() => null)
      const reportList = Array.isArray(data?.reports) ? data.reports : []
      setReports(reportList)
      const total = typeof data?.pagination?.totalPages === 'number' ? data.pagination.totalPages : 1
      setTotalPages(total)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      if (!isMountedRef.current) return
      setLoading(false)
    }
  }, [page, statusFilter, router])

  useEffect(() => {
    const controller = new AbortController()
    fetchReports(controller.signal)
    return () => controller.abort()
  }, [fetchReports])

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Cookies handled automatically
        },
        body: JSON.stringify({ reportId, status }),
      })

      if (response.status === 401) {
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to update report')
      }

      // Refresh reports
      await fetchReports()
      setSelectedReport(null)
    } catch (err) {
      // Use a toast or set error state instead of alert if possible, or keep alert for now but sanitize
      // For now, simple alert is safer than silent fail, but we were using alert before.
      // Ideally we'd have a UI error state or toast.
      console.error('Update failed', err)
      alert('Failed to update report status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Safety Reports</h1>
          <p className="mt-2 text-gray-600">Review and manage user-submitted reports.</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Reports</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Reports List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
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
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reported
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{report.student.name}</div>
                          <div className="text-sm text-gray-500">{report.student.email}</div>
                          <div className="text-sm text-gray-500">{report.student.city}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{report.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(report.status)}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
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

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={() => setSelectedReport(null)} // Click outside to close
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-sm"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Student Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {selectedReport.student.name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedReport.student.email}</p>
                  <p className="text-sm"><span className="font-medium">City:</span> {selectedReport.student.city}</p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`px-2 py-1 text-xs rounded-full ${selectedReport.student.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      selectedReport.student.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedReport.student.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Report Reason</h3>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4">{selectedReport.reason}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
                <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusBadge(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              {selectedReport.status === 'pending' && (
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'reviewed')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Mark as Reviewed
                </button>
              )}
              {selectedReport.status === 'reviewed' && (
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Mark as Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
