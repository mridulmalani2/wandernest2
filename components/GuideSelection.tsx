'use client'

import { useState, useEffect } from 'react'
import GuideCard from './GuideCard'
import { AnonymizedGuide, MatchResponse } from '@/types'

interface GuideSelectionProps {
  requestId: string
  onSelectionComplete?: (selectedGuides: string[]) => void
}

export default function GuideSelection({
  requestId,
  onSelectionComplete
}: GuideSelectionProps) {
  const [guides, setGuides] = useState<AnonymizedGuide[]>([])
  const [selectedGuides, setSelectedGuides] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMatches()
  }, [requestId])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/matches?requestId=${requestId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data: MatchResponse = await response.json()
      setGuides(data.matches)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGuideSelect = (guideId: string) => {
    setSelectedGuides(prev => {
      const newSet = new Set(prev)
      if (newSet.has(guideId)) {
        newSet.delete(guideId)
      } else {
        newSet.add(guideId)
      }
      return newSet
    })
  }

  const handleSubmit = async () => {
    if (selectedGuides.size === 0) {
      alert('Please select at least one guide')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch('/api/matches/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          selectedGuideIds: Array.from(selectedGuides)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save selections')
      }

      const data = await response.json()

      if (data.success) {
        alert('Your guide selections have been saved!')
        if (onSelectionComplete) {
          onSelectionComplete(Array.from(selectedGuides))
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save selections')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Finding the best guides for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (guides.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">
          No guides found matching your criteria. Please try adjusting your preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Your Guides
        </h2>
        <p className="text-gray-600">
          We found {guides.length} guide{guides.length !== 1 ? 's' : ''} for you.
          Select the ones you would like to connect with.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {selectedGuides.size} guide{selectedGuides.size !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map(guide => (
          <GuideCard
            key={guide.id}
            guide={guide}
            isSelected={selectedGuides.has(guide.id)}
            onSelect={handleGuideSelect}
          />
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleSubmit}
          disabled={selectedGuides.size === 0 || submitting}
          className={`
            px-8 py-3 rounded-lg font-medium text-white
            ${selectedGuides.size === 0 || submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
            transition-colors
          `}
        >
          {submitting ? 'Saving...' : `Confirm Selection (${selectedGuides.size})`}
        </button>
      </div>
    </div>
  )
}
