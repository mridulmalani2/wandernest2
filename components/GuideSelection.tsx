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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding the best guides for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card border border-destructive/20 rounded-lg p-6 text-center">
        <p className="text-destructive font-medium">{error}</p>
        <button
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 shadow-soft hover:shadow-premium transition-all"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (guides.length === 0) {
    return (
      <div className="glass-card border border-accent/20 rounded-lg p-6 text-center">
        <p className="text-foreground">
          No guides found matching your criteria. Please try adjusting your preferences.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-serif">
          Select Your Guides
        </h2>
        <p className="text-muted-foreground text-lg">
          We found {guides.length} guide{guides.length !== 1 ? 's' : ''} for you.
          Select the ones you would like to connect with.
        </p>
        <p className="text-sm text-muted-foreground/80 mt-2 font-medium">
          {selectedGuides.size} guide{selectedGuides.size !== 1 ? 's' : ''} selected
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, index) => (
          <div
            key={guide.id}
            className={`animate-fade-in-up stagger-${Math.min(index % 6 + 1, 6)}`}
          >
            <GuideCard
              guide={guide}
              isSelected={selectedGuides.has(guide.id)}
              onSelect={handleGuideSelect}
            />
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={handleSubmit}
          disabled={selectedGuides.size === 0 || submitting}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white
            ${selectedGuides.size === 0 || submitting
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary hover:bg-primary/90 shadow-premium hover:shadow-elevated hover:-translate-y-0.5'
            }
            transition-all duration-300 active:scale-95
          `}
        >
          {submitting ? 'Saving...' : `Confirm Selection (${selectedGuides.size})`}
        </button>
      </div>
    </div>
  )
}
