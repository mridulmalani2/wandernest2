'use client'

import { useEffect, useState } from 'react'
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
  priceRange?: any
  createdAt: string
}

export default function ApprovalsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingStudents()
  }, [])

  const fetchPendingStudents = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      if (!token) {
        window.location.href = '/admin/login'
        return
      }

      const response = await fetch('/api/admin/students/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        window.location.href = '/admin/login'
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch students')
      }

      const data = await response.json()
      setStudents(data.students)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (studentId: string) => {
    const token = localStorage.getItem('adminToken')

    const response = await fetch('/api/admin/students/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentId, action: 'approve' }),
    })

    if (!response.ok) {
      throw new Error('Failed to approve student')
    }

    // Refresh the list
    await fetchPendingStudents()
  }

  const handleReject = async (studentId: string) => {
    const token = localStorage.getItem('adminToken')

    const response = await fetch('/api/admin/students/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentId, action: 'reject' }),
    })

    if (!response.ok) {
      throw new Error('Failed to reject student')
    }

    // Refresh the list
    await fetchPendingStudents()
  }

  const handleBulkApprove = async (studentIds: string[], action: 'approve' | 'reject') => {
    const token = localStorage.getItem('adminToken')

    const response = await fetch('/api/admin/students/bulk-approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentIds, action }),
    })

    if (!response.ok) {
      throw new Error(`Failed to ${action} students`)
    }

    // Refresh the list
    await fetchPendingStudents()
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
