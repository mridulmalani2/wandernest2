'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { ModernInput } from '@/components/ui/ModernInput'
import { ModernSelect } from '@/components/ui/ModernSelect'
import { BookingFormData } from './BookingForm'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Calendar, Users, Briefcase, Sun, Moon, Sunset, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

export function TripDetailsStep({ data, errors, updateData }: Props) {
  const [cities, setCities] = useState<{ value: string; label: string }[]>([])

  useEffect(() => {
    // Fetch cities from API
    fetch('/api/cities')
      .then((res) => res.json())
      .then((data) => setCities(data.cities))
      .catch((err) => console.error('Error fetching cities:', err))
  }, [])

  // Calculate min and max dates
  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 6)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const TIME_OPTIONS = [
    { value: 'morning', label: 'Morning', time: '6am - 12pm', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { value: 'afternoon', label: 'Afternoon', time: '12pm - 6pm', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { value: 'evening', label: 'Evening', time: '6pm - 12am', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ]

  const GROUP_TYPES = [
    { value: 'solo', label: 'Solo Traveler', icon: User },
    { value: 'friends', label: 'Friends', icon: Users },
    { value: 'family', label: 'Family', icon: Users },
    { value: 'business', label: 'Business', icon: Briefcase },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Trip Details
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Tell us about your travel plans so we can find the perfect guide for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City Selection */}
        <div className="md:col-span-2">
          <ModernSelect
            label="Destination City"
            value={data.city}
            onValueChange={(value) => updateData({ city: value })}
            options={cities}
            placeholder="Select a city"
            error={errors.city}
            icon={MapPin}
          />
        </div>

        {/* Date Selection */}
        <ModernInput
          label="Start Date"
          type="date"
          min={today}
          max={maxDateStr}
          value={data.dates.start}
          onChange={(e) => updateData({ dates: { ...data.dates, start: e.target.value } })}
          error={errors.dates}
          icon={Calendar}
        />

        <ModernInput
          label="End Date (Optional)"
          type="date"
          min={data.dates.start || today}
          max={maxDateStr}
          value={data.dates.end || ''}
          onChange={(e) => updateData({ dates: { ...data.dates, end: e.target.value } })}
          icon={Calendar}
        />

        {/* Number of Guests */}
        <div className="md:col-span-2">
          <ModernInput
            label="Number of Guests"
            type="number"
            min={1}
            max={10}
            value={data.numberOfGuests}
            onChange={(e) => updateData({ numberOfGuests: parseInt(e.target.value) })}
            error={errors.numberOfGuests}
            icon={Users}
            placeholder="1-10 guests"
          />
        </div>

        {/* Group Type */}
        <div className="md:col-span-2 space-y-3">
          <Label className={errors.groupType ? "text-ui-error" : ""}>
            Group Type <span className="text-ui-error">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GROUP_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = data.groupType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateData({ groupType: type.value as any })}
                  className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2",
                    isSelected
                      ? "border-ui-blue-primary bg-ui-blue-primary/5 text-ui-blue-primary shadow-sm"
                      : "border-gray-100 bg-white text-gray-600 hover:border-ui-blue-primary/30 hover:bg-gray-50"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isSelected ? "text-ui-blue-primary" : "text-gray-400")} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
          {errors.groupType && <p className="text-xs text-ui-error">{errors.groupType}</p>}
        </div>

        {/* Time Preference */}
        <div className="md:col-span-2 space-y-3">
          <Label className={errors.preferredTime ? "text-ui-error" : ""}>
            Preferred Time of Day <span className="text-ui-error">*</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = data.preferredTime === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateData({ preferredTime: option.value as any })}
                  className={cn(
                    "flex items-center p-4 rounded-2xl border-2 transition-all duration-200 gap-4 text-left group",
                    isSelected
                      ? `border-current ${option.color} ${option.bg} shadow-sm`
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "bg-white/50" : "bg-gray-50 group-hover:bg-gray-100"
                  )}>
                    <Icon className={cn("h-5 w-5", isSelected ? "text-current" : "text-gray-400")} />
                  </div>
                  <div>
                    <span className={cn("block font-semibold", isSelected ? "text-gray-900" : "text-gray-700")}>
                      {option.label}
                    </span>
                    <span className={cn("text-xs", isSelected ? "text-gray-700" : "text-gray-500")}>
                      {option.time}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.preferredTime && <p className="text-xs text-ui-error">{errors.preferredTime}</p>}
        </div>

        {/* Accessibility Needs */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="accessibilityNeeds">Accessibility Needs (Optional)</Label>
          <Textarea
            id="accessibilityNeeds"
            placeholder="Any special requirements or accessibility needs..."
            value={data.accessibilityNeeds || ''}
            onChange={(e) => updateData({ accessibilityNeeds: e.target.value })}
            rows={3}
            className="rounded-xl border-2 border-gray-200 bg-white/50 focus-visible:ring-ui-blue-primary resize-none"
          />
        </div>
      </div>
    </div>
  )
}
