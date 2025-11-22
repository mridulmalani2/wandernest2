'use client'

import { useState, useEffect } from 'react'
import GuideCard from './GuideCard'
import { AnonymizedGuide, MatchResponse } from '@/types'
import { motion } from 'framer-motion'

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
      <motion.div
        className="flex items-center justify-center py-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          <motion.div
            className="rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground">Finding the best guides for you...</p>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="glass-card border border-destructive/20 rounded-lg p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-destructive font-medium">{error}</p>
        <motion.button
          onClick={fetchMatches}
          className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg shadow-soft"
          whileHover={{ scale: 1.05, boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          Try Again
        </motion.button>
      </motion.div>
    )
  }

  if (guides.length === 0) {
    return (
      <motion.div
        className="glass-card border border-accent/20 rounded-lg p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-foreground">
          No guides found matching your criteria. Please try adjusting your preferences.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-serif">
          Select Your Guides
        </h2>
        <p className="text-muted-foreground text-lg">
          We found {guides.length} guide{guides.length !== 1 ? 's' : ''} for you.
          Select the ones you would like to connect with.
        </p>
        <motion.p
          className="text-sm text-muted-foreground/80 mt-2 font-medium"
          key={selectedGuides.size}
          initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
          animate={{ scale: 1, color: 'hsl(var(--muted-foreground) / 0.8)' }}
          transition={{ duration: 0.3 }}
        >
          {selectedGuides.size} guide{selectedGuides.size !== 1 ? 's' : ''} selected
        </motion.p>
      </motion.div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, index) => (
          <motion.div
            key={guide.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <GuideCard
              guide={guide}
              isSelected={selectedGuides.has(guide.id)}
              onSelect={handleGuideSelect}
            />
          </motion.div>
        ))}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-6">
        <motion.button
          onClick={handleSubmit}
          disabled={selectedGuides.size === 0 || submitting}
          className={`
            px-8 py-3 rounded-lg font-semibold text-white
            ${selectedGuides.size === 0 || submitting
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary shadow-premium'
            }
          `}
          whileHover={
            selectedGuides.size > 0 && !submitting
              ? {
                  scale: 1.05,
                  y: -2,
                  boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.2)',
                }
              : {}
          }
          whileTap={
            selectedGuides.size > 0 && !submitting ? { scale: 0.95 } : {}
          }
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20
          }}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <motion.span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              Saving...
            </span>
          ) : (
            `Confirm Selection (${selectedGuides.size})`
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
