'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { ModernInput } from '@/components/ui/ModernInput'
import { ModernSelect } from '@/components/ui/ModernSelect'
import { BookingFormData } from './BookingForm'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Calendar, Users, Briefcase, Sun, Moon, Sunset, User, CheckCircle2 } from 'lucide-react'
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
    { value: 'morning', label: 'Morning', time: '6am - 12pm', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-200' },
    { value: 'afternoon', label: 'Afternoon', time: '12pm - 6pm', icon: Sun, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-200' },
    { value: 'evening', label: 'Evening', time: '6pm - 12am', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-200' },
  ]

  const GROUP_TYPES = [
    { value: 'solo', label: 'Solo Traveler', icon: User, desc: 'Just me' },
    { value: 'friends', label: 'Friends', icon: Users, desc: 'Group of friends' },
    { value: 'family', label: 'Family', icon: Users, desc: 'Family trip' },
    { value: 'business', label: 'Business', icon: Briefcase, desc: 'Work trip' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* City Selection */}
        <div className="md:col-span-2">
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
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
        </div>

        {/* Date Selection */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
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
          </div>
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
            <ModernInput
              label="End Date (Optional)"
              type="date"
              min={data.dates.start || today}
              max={maxDateStr}
              value={data.dates.end || ''}
              onChange={(e) => updateData({ dates: { ...data.dates, end: e.target.value } })}
              icon={Calendar}
            />
          </div>
        </div>

        {/* Number of Guests */}
        <div className="md:col-span-2">
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
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
        </div>

        {/* Group Type */}
        <div className="md:col-span-2 space-y-4">
          <Label className={cn("text-lg font-semibold", errors.groupType ? "text-ui-error" : "text-gray-800")}>
            Who are you traveling with? <span className="text-ui-error">*</span>
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
                    "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 gap-3 group hover:shadow-md",
                    isSelected
                      ? "border-ui-blue-primary bg-ui-blue-primary/5 text-ui-blue-primary shadow-sm scale-[1.02]"
                      : "border-gray-100 bg-white text-gray-600 hover:border-ui-blue-primary/30 hover:bg-gray-50"
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-ui-blue-primary animate-scale-in">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                    isSelected ? "bg-white shadow-sm" : "bg-gray-50 group-hover:bg-gray-100"
                  )}>
                    <Icon className={cn("h-6 w-6", isSelected ? "text-ui-blue-primary" : "text-gray-400")} />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-sm mb-1">{type.label}</span>
                    <span className="text-xs opacity-80">{type.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.groupType && <p className="text-sm text-ui-error font-medium animate-slide-down">{errors.groupType}</p>}
        </div>

        {/* Time Preference */}
        <div className="md:col-span-2 space-y-4">
          <Label className={cn("text-lg font-semibold", errors.preferredTime ? "text-ui-error" : "text-gray-800")}>
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
                    "relative flex items-center p-4 rounded-2xl border-2 transition-all duration-300 gap-4 text-left group hover:shadow-md",
                    isSelected
                      ? `border-current ${option.color} ${option.bg} shadow-sm scale-[1.02]`
                      : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                    isSelected ? "bg-white/60" : "bg-gray-50 group-hover:bg-gray-100"
                  )}>
                    <Icon className={cn("h-6 w-6", isSelected ? "text-current" : "text-gray-400")} />
                  </div>
                  <div>
                    <span className={cn("block font-bold text-lg", isSelected ? "text-gray-900" : "text-gray-700")}>
                      {option.label}
                    </span>
                    <span className={cn("text-sm font-medium", isSelected ? "text-gray-700" : "text-gray-500")}>
                      {option.time}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-4 right-4 animate-scale-in">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.preferredTime && <p className="text-sm text-ui-error font-medium animate-slide-down">{errors.preferredTime}</p>}
        </div>

        {/* Accessibility Needs */}
        <div className="md:col-span-2 space-y-3">
          <Label htmlFor="accessibilityNeeds" className="text-lg font-semibold text-gray-800">
            Accessibility Needs <span className="text-sm font-normal text-gray-500 ml-1">(Optional)</span>
          </Label>
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-1 shadow-lg focus-within:ring-2 focus-within:ring-ui-blue-primary transition-all">
            <Textarea
              id="accessibilityNeeds"
              placeholder="Any special requirements or accessibility needs..."
              value={data.accessibilityNeeds || ''}
              onChange={(e) => updateData({ accessibilityNeeds: e.target.value })}
              rows={4}
              className="rounded-2xl border-0 bg-transparent focus-visible:ring-0 resize-none p-4 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
