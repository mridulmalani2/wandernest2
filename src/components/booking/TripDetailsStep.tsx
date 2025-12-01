'use client'

import { useEffect, useState } from 'react'
import { LiquidInput } from '@/components/ui/LiquidInput'
import { LiquidSelect } from '@/components/ui/LiquidSelect'
import { FlowCard } from '@/components/ui/FlowCard'
import { BookingFormData } from './BookingForm'
import { MapPin, Calendar, Users, Briefcase, Sun, Moon, User, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

export function TripDetailsStep({ data, errors, updateData }: Props) {
  const [cities, setCities] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(data.cities))
      .catch((err) => console.error('Error fetching cities:', err))
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 6)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const TIME_OPTIONS = [
    { value: 'morning', label: 'Morning', time: '6am - 12pm', icon: Sun },
    { value: 'afternoon', label: 'Afternoon', time: '12pm - 6pm', icon: Sun },
    { value: 'evening', label: 'Evening', time: '6pm - 12am', icon: Moon },
  ]

  const GROUP_TYPES = [
    { value: 'solo', label: 'Solo', icon: User, desc: 'Just me' },
    { value: 'friends', label: 'Friends', icon: Users, desc: 'Group' },
    { value: 'family', label: 'Family', icon: Users, desc: 'Family trip' },
    { value: 'business', label: 'Business', icon: Briefcase, desc: 'Work' },
  ]

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Trip Details
        </h2>
        <p className="text-base font-light text-gray-200 max-w-md mx-auto">
          Tell us about your travel plans
        </p>
      </div>

      {/* City & Dates */}
      <FlowCard padding="lg">
        <div className="space-y-8">
          <LiquidSelect
            label="Destination City"
            value={data.city}
            onValueChange={(value) => updateData({ city: value })}
            options={cities}
            placeholder="Where are you headed?"
            error={errors.city}
            icon={MapPin}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidInput
              label="Start Date"
              type="date"
              min={today}
              max={maxDateStr}
              value={data.dates.start}
              onChange={(e) => updateData({ dates: { ...data.dates, start: e.target.value } })}
              error={errors.dates}
              icon={Calendar}
            />

            <LiquidInput
              label="End Date (Optional)"
              type="date"
              min={data.dates.start || today}
              max={maxDateStr}
              value={data.dates.end || ''}
              onChange={(e) => updateData({ dates: { ...data.dates, end: e.target.value } })}
              icon={Calendar}
            />
          </div>

          <LiquidInput
            label="Number of Guests"
            type="number"
            min={1}
            max={10}
            value={data.numberOfGuests}
            onChange={(e) => updateData({ numberOfGuests: parseInt(e.target.value) })}
            error={errors.numberOfGuests}
            icon={Users}
            placeholder="1-10"
          />
        </div>
      </FlowCard>

      {/* Group Type - Compact Pills */}
      <div className="space-y-4">
        <h3 className="text-sm font-light tracking-wide text-white/90">
          Who are you traveling with? {errors.groupType && <span className="text-ui-error ml-1">*</span>}
        </h3>
        <div className="flex flex-wrap gap-3">
          {GROUP_TYPES.map((type) => {
            const Icon = type.icon
            const isSelected = data.groupType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateData({ groupType: type.value as any })}
                className={cn(
                  'relative px-5 py-2.5 rounded-full transition-all duration-300',
                  'flex items-center gap-2',
                  'border-2 text-sm font-medium',
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.98] active:bg-white/5'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{type.label}</span>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                )}
              </button>
            )
          })}
        </div>
        {errors.groupType && (
          <p className="text-xs font-light text-ui-error mt-2">{errors.groupType}</p>
        )}
      </div>

      {/* Time Preference - Compact Pills */}
      <div className="space-y-4">
        <h3 className="text-sm font-light tracking-wide text-white/90">
          Preferred Time of Day {errors.preferredTime && <span className="text-ui-error ml-1">*</span>}
        </h3>
        <div className="flex flex-wrap gap-3">
          {TIME_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = data.preferredTime === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateData({ preferredTime: option.value as any })}
                className={cn(
                  'relative px-5 py-2.5 rounded-full transition-all duration-300',
                  'flex items-center gap-2',
                  'border-2 text-sm font-medium',
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.98] active:bg-white/5'
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex items-center gap-2">
                  <span>{option.label}</span>
                  <span className="text-xs opacity-70">({option.time})</span>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 ml-1" />
                )}
              </button>
            )
          })}
        </div>
        {errors.preferredTime && (
          <p className="text-xs font-light text-ui-error mt-2">{errors.preferredTime}</p>
        )}
      </div>

      {/* Accessibility Needs */}
      <FlowCard padding="lg" variant="subtle">
        <div className="space-y-3">
          <label className="text-sm font-light tracking-wide text-white/90 block">
            Accessibility Needs <span className="text-xs text-white/50 ml-1">(Optional)</span>
          </label>
          <textarea
            value={data.accessibilityNeeds || ''}
            onChange={(e) => updateData({ accessibilityNeeds: e.target.value })}
            rows={3}
            placeholder="Any special requirements..."
            className={cn(
              'w-full bg-transparent px-0 py-2 text-base font-light',
              'text-white placeholder:text-white/30',
              'border-0 border-b border-white/20',
              'focus:outline-none focus:border-b-2 focus:border-white',
              'transition-all duration-300 resize-none'
            )}
          />
        </div>
      </FlowCard>
    </div>
  )
}
