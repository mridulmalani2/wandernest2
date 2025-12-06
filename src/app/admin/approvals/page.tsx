'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ApprovalQueue from '@/components/admin/ApprovalQueue'
import AdminNav from '@/components/admin/AdminNav'

interface Student {
  id: string
  email: string
  name: string
  gender: string
  nationality: string
  institute: string
  idCardUrl?: string
  coverLetter: string
  languages: string[]
  interests: string[]
  bio?: string
  city: string
  priceRange?: { min: number; max: number }
  createdAt: string
}

export default function ApprovalsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingStudents = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      if (!token) {
        router.replace('/admin/login')
        return
      }

      const response = await fetch('/api/admin/students/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal,
      })

      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data.students)
    } catch (err: any) {
      if (err.name === 'AbortError') return
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred fetching approvals')
    } finally {
      if (signal && !signal.aborted) {
        setLoading(false)
      }
    }
  }, [router])

  useEffect(() => {
    const controller = new AbortController()
    fetchPendingStudents(controller.signal)
    return () => controller.abort()
  }, [fetchPendingStudents])

  const handleApprove = async (studentId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.replace('/admin/login')
        return
      }

      const response = await fetch('/api/admin/students/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId, action: 'approve' }),
      })

      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to approve student')
      }

      // Refresh the list
      await fetchPendingStudents()
    } catch (err) {
      console.error('Approve error:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve student')
    }
  }

  const handleReject = async (studentId: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.replace('/admin/login')
        return
      }

      const response = await fetch('/api/admin/students/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId, action: 'reject' }),
      })

      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to reject student')
      }

      // Refresh the list
      await fetchPendingStudents()
    } catch (err) {
      console.error('Reject error:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject student')
    }
  }

  const handleBulkApprove = async (studentIds: string[], action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        router.replace('/admin/login')
        return
      }

      const response = await fetch('/api/admin/students/bulk-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ studentIds, action }),
      })

      if (response.status === 401) {
        localStorage.removeItem('adminToken')
        router.replace('/admin/login')
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to ${action} students`)
      }

      // Refresh the list
      await fetchPendingStudents()
    } catch (err) {
      console.error('Bulk action error:', err)
      setError(err instanceof Error ? err.message : `Failed to ${action} students`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => { setError(null); fetchPendingStudents(); }}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Approval Queue</h1>
          <p className="mt-2 text-gray-600">
            Review and approve student applications. {students.length} pending approval(s).
          </p>
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="mt-2 text-sm font-medium text-gray-900">All caught up!</h2>
            <p className="mt-1 text-sm text-gray-500">No pending student applications to review.</p>
          </div>
        ) : (
          <ApprovalQueue
            students={students}
            onApprove={handleApprove}
            onReject={handleReject}
            onBulkApprove={handleBulkApprove}
          />
        )}
      </div>
    </div>
  )
}
