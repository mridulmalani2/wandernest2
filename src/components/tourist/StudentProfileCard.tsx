'use client'

import { Star, CheckCircle2, XCircle, Award, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export interface StudentMatch {
  studentId: string
  maskedId: string
  displayName: string
  nationality: string
  languages: string[]
  institute: string
  tripsHosted: number
  averageRating: number | null
  reviewCount: number
  noShowCount: number
  reliabilityBadge: string | null
  tags: string[]
  matchReasons: string[]
  availability?: { dayOfWeek: string; startTime: string; endTime: string }[]
}

interface StudentProfileCardProps {
  student: StudentMatch
  isSelected: boolean
  onToggleSelect: (studentId: string) => void
  showAvailability?: boolean
}

export function StudentProfileCard({
  student,
  isSelected,
  onToggleSelect,
  showAvailability = false,
}: StudentProfileCardProps) {
  const reliabilityColor = {
    gold: 'bg-yellow-500 text-yellow-900',
    silver: 'bg-gray-400 text-gray-900',
    bronze: 'bg-orange-600 text-orange-100',
  }

  const reliabilityBadgeColor =
    student.reliabilityBadge && reliabilityColor[student.reliabilityBadge as keyof typeof reliabilityColor]
      ? reliabilityColor[student.reliabilityBadge as keyof typeof reliabilityColor]
      : 'bg-gray-200 text-gray-700'

  return (
    <Card
      className={`relative transition-all duration-300 hover-lift-lg cursor-pointer group ${
        isSelected
          ? 'ring-4 ring-ui-blue-primary shadow-glow-blue bg-gradient-to-br from-ui-blue-primary/10 to-white'
          : 'shadow-premium hover:shadow-elevated bg-white border-2 border-gray-100 hover:border-ui-blue-secondary'
      }`}
      onClick={() => onToggleSelect(student.studentId)}
    >
      <CardContent className="p-6">
        {/* Selection Checkbox */}
        <div className="absolute top-4 right-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(student.studentId)}
            className="h-5 w-5"
          />
        </div>

        {/* Masked ID */}
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-gray-800">{student.maskedId}</h3>
          <p className="text-sm text-gray-500">{student.displayName}</p>
        </div>

        {/* University & Nationality */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700">{student.institute}</p>
          <p className="text-sm text-gray-600">From: {student.nationality}</p>
        </div>

        {/* Languages */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
            Languages
          </p>
          <div className="flex flex-wrap gap-1">
            {student.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        </div>

        {/* Experience Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-200/50 shadow-soft">
          <div>
            <div className="flex items-center gap-1 text-ui-blue-primary mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-semibold">Experience</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {student.tripsHosted} trips
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 text-amber-600 mb-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold">Rating</span>
            </div>
            {student.averageRating ? (
              <p className="text-lg font-bold text-gray-900">
                {student.averageRating.toFixed(1)}/5
                <span className="text-xs text-gray-600 ml-1 font-medium">
                  ({student.reviewCount})
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-600 font-medium">No ratings yet</p>
            )}
          </div>
        </div>

        {/* Reliability */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {student.noShowCount === 0 && student.tripsHosted > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-ui-success" />
                  <span className="text-sm text-ui-success font-medium">
                    Perfect attendance
                  </span>
                </>
              ) : student.noShowCount > 0 ? (
                <>
                  <XCircle className="h-4 w-4 text-ui-error" />
                  <span className="text-sm text-ui-error">
                    {student.noShowCount} no-show{student.noShowCount > 1 ? 's' : ''}
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">New guide</span>
              )}
            </div>

            {student.reliabilityBadge && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <Badge className={`text-xs ${reliabilityBadgeColor}`}>
                  {student.reliabilityBadge}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        {student.matchReasons.length > 0 && (
          <div className="mb-4 p-4 bg-gradient-to-br from-ui-blue-primary/10 to-ui-blue-secondary/30 rounded-xl border-2 border-ui-blue-secondary shadow-soft">
            <p className="text-xs font-bold text-ui-blue-accent uppercase mb-2 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Why this guide?
            </p>
            <ul className="space-y-1.5">
              {student.matchReasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="text-sm text-ui-blue-accent flex items-start font-medium">
                  <span className="mr-2 text-ui-blue-primary">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags/Strengths */}
        {student.tags.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Specialties
            </p>
            <div className="flex flex-wrap gap-1">
              {student.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs bg-white border-gray-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showAvailability && student.availability && student.availability.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Availability
            </p>
            <div className="grid grid-cols-1 gap-2">
              {student.availability.map((slot, index) => (
                <div
                  key={`${slot.dayOfWeek}-${slot.startTime}-${index}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                >
                  <span className="font-semibold text-gray-800">{slot.dayOfWeek}</span>
                  <span className="text-gray-600">
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
