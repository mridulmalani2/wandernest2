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
        return 'bg-yellow-400 text-yellow-900'
      case 'silver':
        return 'bg-gray-300 text-gray-900'
      case 'bronze':
        return 'bg-amber-600 text-white'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
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
        <span key={`empty-${i}`} className="text-gray-300">★</span>
      )
    }

    return stars
  }

  return (
    <div
      className={`
        relative border rounded-lg p-6 cursor-pointer transition-all
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Anonymous ID */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {guide.anonymousId}
        </h3>
      </div>

      {/* University */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">University</p>
        <p className="text-base font-medium text-gray-900">{guide.university}</p>
      </div>

      {/* Languages */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">Languages</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {guide.languages.map((lang, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
            >
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Trips Hosted */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">Trips Hosted</p>
        <p className="text-base font-medium text-gray-900">{guide.tripsHosted}</p>
      </div>

      {/* Rating */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">Rating</p>
        <div className="flex items-center gap-2">
          <div className="flex text-lg">
            {renderStars(guide.rating)}
          </div>
          <span className="text-sm text-gray-600">
            ({guide.rating.toFixed(1)})
          </span>
        </div>
      </div>

      {/* Badge */}
      {guide.badge && guide.badge !== 'none' && (
        <div className="mt-4">
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-sm font-medium
              ${getBadgeColor(guide.badge)}
            `}
          >
            {guide.badge.charAt(0).toUpperCase() + guide.badge.slice(1)} Badge
          </span>
        </div>
      )}

      {/* Score (for debugging - can be removed in production) */}
      {guide.score !== undefined && (
        <div className="mt-2 text-xs text-gray-400">
          Match Score: {guide.score}
        </div>
      )}
    </div>
  )
}
