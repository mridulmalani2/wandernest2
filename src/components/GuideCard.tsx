// Visual: Using design system border radii, shadows, and typography for consistency
'use client'

import { AnonymizedGuide } from '@/types'

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
    <div
      className={`
        relative border rounded-xl p-6 cursor-pointer transition-all glass-card hover-lift
        ${isSelected
          ? 'border-primary bg-primary/5 shadow-premium ring-2 ring-primary/20'
          : 'border-border/50 hover:border-primary/30 hover:shadow-soft'
        }
      `}
      onClick={() => onSelect(guide.id)}
    >
      {/* Selection Checkbox */}
      <div className="absolute top-4 right-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(guide.id)}
          className="w-5 h-5 text-primary rounded-md focus:ring-primary"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Anonymous ID */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold font-serif text-foreground">
          {guide.anonymousId}
        </h3>
      </div>

      {/* University */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">University</p>
        <p className="text-base font-medium text-foreground">{guide.university}</p>
      </div>

      {/* Languages */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Languages</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {guide.languages.map((lang, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-md border border-primary/20"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Trips Hosted */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Trips Hosted</p>
        <p className="text-base font-medium text-foreground">{guide.tripsHosted}</p>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Rating</p>
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
        <div className="mt-4">
          <span
            className={`
              inline-block px-3 py-1.5 rounded-full text-xs font-semibold
              ${getBadgeColor(guide.badge)}
            `}
          >
            {guide.badge.charAt(0).toUpperCase() + guide.badge.slice(1)} Badge
          </span>
        </div>
      )}

      {/* Score (for debugging - can be removed in production) */}
      {guide.score !== undefined && (
        <div className="mt-2 text-xs text-muted-foreground/60">
          Match Score: {guide.score}
        </div>
      )}
    </div>
  )
}
