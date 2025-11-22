'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type hljs from 'highlight.js'

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

interface ApprovalQueueProps {
  students: Student[]
  onApprove: (studentId: string) => Promise<void>
  onReject: (studentId: string) => Promise<void>
  onBulkApprove: (studentIds: string[], action: 'approve' | 'reject') => Promise<void>
}

export default function ApprovalQueue({ students, onApprove, onReject, onBulkApprove }: ApprovalQueueProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)
  const [highlighter, setHighlighter] = useState<typeof hljs | null>(null)

  // Dynamically load highlight.js only when needed (when modal is opened)
  useEffect(() => {
    if (selectedStudent && !highlighter) {
      Promise.all([
        import('highlight.js/lib/core'),
        import('highlight.js/lib/languages/markdown'),
        import('highlight.js/styles/github-dark.css')
      ]).then(([hljsModule, markdownModule]) => {
        const hljs = hljsModule.default
        hljs.registerLanguage('markdown', markdownModule.default)
        setHighlighter(hljs)
      })
    }
  }, [selectedStudent, highlighter])

  const handleApprove = async (studentId: string) => {
    setLoading(studentId)
    try {
      await onApprove(studentId)
      setSelectedStudent(null)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async (studentId: string) => {
    setLoading(studentId)
    try {
      await onReject(studentId)
      setSelectedStudent(null)
    } finally {
      setLoading(null)
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedStudents.size === 0) return

    setLoading('bulk')
    try {
      await onBulkApprove(Array.from(selectedStudents), action)
      setSelectedStudents(new Set())
    } finally {
      setLoading(null)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents)
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId)
    } else {
      newSelection.add(studentId)
    }
    setSelectedStudents(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedStudents.size === students.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(students.map(s => s.id)))
    }
  }

  const highlightCoverLetter = (text: string) => {
    if (!highlighter) {
      // Return plain text while highlight.js is loading
      return text
    }
    try {
      return highlighter.highlight(text, { language: 'markdown' }).value
    } catch {
      return text
    }
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedStudents.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedStudents.size} student(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction('approve')}
              disabled={loading === 'bulk'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={loading === 'bulk'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {/* Student List */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === students.length && students.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institute
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudentSelection(student.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.nationality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.institute}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Student Application Review</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Personal Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedStudent.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedStudent.email}</p>
                    <p><span className="font-medium">Gender:</span> {selectedStudent.gender}</p>
                    <p><span className="font-medium">Nationality:</span> {selectedStudent.nationality}</p>
                    <p><span className="font-medium">City:</span> {selectedStudent.city}</p>
                    <p><span className="font-medium">Institute:</span> {selectedStudent.institute}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Languages & Interests</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Languages:</span></p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.languages.map((lang, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {lang}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2"><span className="font-medium">Interests:</span></p>
                    <div className="flex flex-wrap gap-1">
                      {selectedStudent.interests.map((interest, idx) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {selectedStudent.idCardUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Student ID Card</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden relative w-full" style={{ minHeight: '300px' }}>
                    <Image
                      src={selectedStudent.idCardUrl}
                      alt="Student ID"
                      width={800}
                      height={600}
                      className="w-full h-auto"
                      sizes="(max-width: 768px) 100vw, 800px"
                      quality={90}
                    />
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h3>
                <div
                  className="bg-gray-900 rounded-lg p-4 overflow-x-auto"
                  dangerouslySetInnerHTML={{
                    __html: highlightCoverLetter(selectedStudent.coverLetter),
                  }}
                />
              </div>

              {selectedStudent.bio && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedStudent.bio}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleReject(selectedStudent.id)}
                disabled={loading === selectedStudent.id}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {loading === selectedStudent.id ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedStudent.id)}
                disabled={loading === selectedStudent.id}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading === selectedStudent.id ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
