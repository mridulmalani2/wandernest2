'use client'

import { AnonymizedGuide } from '@/types'
import { motion } from 'framer-motion'

interface GuideCardProps {
  guide: AnonymizedGuide
  isSelected: boolean
  onSelect: (guideId: string) => void
}

export default function GuideCard({ guide, isSelected, onSelect }: GuideCardProps) {
  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-400 text-yellow-950 shadow-sm'
      case 'silver':
        return 'bg-slate-400 text-slate-950 shadow-sm'
      case 'bronze':
        return 'bg-amber-600 text-white shadow-sm'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const renderStars = (rating: number) => {
    const stars: JSX.Element[] = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      )
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">⯨</span>
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-400">★</span>
      )
    }

    return stars
  }

  return (
    <motion.div
      className={`
        relative border rounded-lg p-6 cursor-pointer glass-card
        ${isSelected
          ? 'border-primary bg-primary/5 shadow-premium ring-2 ring-primary/20'
          : 'border-border/50 hover:border-primary/30 hover:shadow-soft'
        }
      `}
      onClick={() => onSelect(guide.id)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {/* Selection Checkbox */}
      <motion.div
        className="absolute top-4 right-4"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(guide.id)}
          className="w-5 h-5 text-primary rounded focus:ring-primary transition-all cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      </motion.div>

      {/* Anonymous ID */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-foreground">
          {guide.anonymousId}
        </h3>
      </div>

      {/* University */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">University</p>
        <p className="text-base font-medium text-foreground">{guide.university}</p>
      </div>

      {/* Languages */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">Languages</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {guide.languages.map((lang, index) => (
            <motion.span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-sm rounded border border-primary/20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'hsl(var(--primary) / 0.15)'
              }}
            >
              {lang}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Trips Hosted */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">Trips Hosted</p>
        <p className="text-base font-medium text-foreground">{guide.tripsHosted}</p>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <p className="text-sm text-muted-foreground">Rating</p>
        <div className="flex items-center gap-2">
          <div className="flex text-lg">
            {renderStars(guide.rating)}
          </div>
          <span className="text-sm text-muted-foreground">
            ({guide.rating.toFixed(1)})
          </span>
        </div>
      </div>

      {/* Badge */}
      {guide.badge && guide.badge !== 'none' && (
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-sm font-medium
              ${getBadgeColor(guide.badge)}
            `}
          >
            {guide.badge.charAt(0).toUpperCase() + guide.badge.slice(1)} Badge
          </span>
        </motion.div>
      )}

      {/* Score (for debugging - can be removed in production) */}
      {guide.score !== undefined && (
        <div className="mt-2 text-xs text-muted-foreground/60">
          Match Score: {guide.score}
        </div>
      )}

      {/* Selection indicator overlay */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
        />
      )}
    </motion.div>
  )
}
