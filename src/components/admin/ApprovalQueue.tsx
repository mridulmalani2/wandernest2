'use client'

import { useState } from 'react'
import Image from 'next/image'
import { sanitizeText } from '@/lib/sanitization'

interface Student {
  id: string
  email: string
  name: string
  gender: string
  nationality: string
  institute: string
  campus?: string
  phoneNumber?: string
  dateOfBirth?: string
  // Legacy field
  idCardUrl?: string
  // New verification document URLs from Vercel Blob storage
  studentIdUrl?: string
  studentIdExpiry?: string
  governmentIdUrl?: string
  governmentIdExpiry?: string
  selfieUrl?: string
  profilePhotoUrl?: string
  coverLetter: string
  languages: string[]
  interests: string[]
  bio?: string
  city: string
  priceRange?: { min: number; max: number }
  approvalReminderSentAt?: string
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
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())
  const [isBulkLoading, setIsBulkLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleApprove = async (studentId: string) => {
    setActionError(null)
    setLoadingIds((prev) => new Set(prev).add(studentId))
    try {
      await onApprove(studentId)
      setSelectedStudent(null)
    } catch {
      setActionError('Failed to approve student. Please try again.')
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(studentId)
        return next
      })
    }
  }

  const handleReject = async (studentId: string) => {
    setActionError(null)
    setLoadingIds((prev) => new Set(prev).add(studentId))
    try {
      await onReject(studentId)
      setSelectedStudent(null)
    } catch {
      setActionError('Failed to reject student. Please try again.')
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev)
        next.delete(studentId)
        return next
      })
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedStudents.size === 0) return

    setActionError(null)
    setIsBulkLoading(true)
    try {
      await onBulkApprove(Array.from(selectedStudents), action)
      setSelectedStudents(new Set())
    } catch {
      setActionError('Bulk action failed. Please try again.')
    } finally {
      setIsBulkLoading(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev)
      if (next.has(studentId)) {
        next.delete(studentId)
      } else {
        next.add(studentId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelectedStudents((prev) => {
      const allSelected = students.length > 0 && students.every((student) => prev.has(student.id))
      return allSelected ? new Set() : new Set(students.map((student) => student.id))
    })
  }

  const highlightCoverLetter = (text: string) => {
    return sanitizeText(text, 5000)
  }

  const allStudentsSelected =
    students.length > 0 && students.every((student) => selectedStudents.has(student.id))

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
              disabled={isBulkLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              Approve Selected
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              disabled={isBulkLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              Reject Selected
            </button>
          </div>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {actionError}
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
                      checked={allStudentsSelected}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.approvalReminderSentAt ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          🔔 Reminder Sent
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(student.approvalReminderSentAt).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
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
                    {selectedStudent.campus && (
                      <p><span className="font-medium">Campus:</span> {selectedStudent.campus}</p>
                    )}
                    <p><span className="font-medium">Institute:</span> {selectedStudent.institute}</p>
                    {selectedStudent.phoneNumber && (
                      <p><span className="font-medium">Phone:</span> {selectedStudent.phoneNumber}</p>
                    )}
                    {selectedStudent.dateOfBirth && (
                      <p><span className="font-medium">Date of Birth:</span> {new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                    )}
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

              {/* Verification Documents */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Verification Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student ID Card */}
                  {(selectedStudent.studentIdUrl || selectedStudent.idCardUrl) && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">
                        Student ID Card
                        {selectedStudent.studentIdExpiry && (
                          <span className="ml-2 text-gray-500">
                            (Expires: {new Date(selectedStudent.studentIdExpiry).toLocaleDateString()})
                          </span>
                        )}
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '200px' }}>
                        <Image
                          src={selectedStudent.studentIdUrl || selectedStudent.idCardUrl || ''}
                          alt="Student ID"
                          width={400}
                          height={300}
                          className="w-full h-auto"
                          sizes="(max-width: 768px) 100vw, 400px"
                          quality={85}
                        />
                      </div>
                    </div>
                  )}

                  {/* Government ID */}
                  {selectedStudent.governmentIdUrl && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">
                        Government ID
                        {selectedStudent.governmentIdExpiry && (
                          <span className="ml-2 text-gray-500">
                            (Expires: {new Date(selectedStudent.governmentIdExpiry).toLocaleDateString()})
                          </span>
                        )}
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '200px' }}>
                        <Image
                          src={selectedStudent.governmentIdUrl}
                          alt="Government ID"
                          width={400}
                          height={300}
                          className="w-full h-auto"
                          sizes="(max-width: 768px) 100vw, 400px"
                          quality={85}
                        />
                      </div>
                    </div>
                  )}

                  {/* Selfie with ID */}
                  {selectedStudent.selfieUrl && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Verification Selfie</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '200px' }}>
                        <Image
                          src={selectedStudent.selfieUrl}
                          alt="Verification Selfie"
                          width={400}
                          height={300}
                          className="w-full h-auto"
                          sizes="(max-width: 768px) 100vw, 400px"
                          quality={85}
                        />
                      </div>
                    </div>
                  )}

                  {/* Profile Photo */}
                  {selectedStudent.profilePhotoUrl && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">Profile Photo</h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden relative" style={{ minHeight: '200px' }}>
                        <Image
                          src={selectedStudent.profilePhotoUrl}
                          alt="Profile Photo"
                          width={400}
                          height={300}
                          className="w-full h-auto"
                          sizes="(max-width: 768px) 100vw, 400px"
                          quality={85}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h3>
                <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap text-sm text-gray-100">
                  {highlightCoverLetter(selectedStudent.coverLetter)}
                </pre>
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
                disabled={loadingIds.has(selectedStudent.id)}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {loadingIds.has(selectedStudent.id) ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedStudent.id)}
                disabled={loadingIds.has(selectedStudent.id)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loadingIds.has(selectedStudent.id) ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
