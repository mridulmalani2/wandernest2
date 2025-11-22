'use client'

import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookingFormData } from './BookingForm'
import { Textarea } from '@/components/ui/textarea'

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Trip Details</h2>
        <p className="text-gray-600">Tell us about your travel plans</p>
      </div>

      {/* City Selection */}
      <div className="space-y-2">
        <Label htmlFor="city">
          Destination City <span className="text-ui-error">*</span>
        </Label>
        <Select value={data.city} onValueChange={(value) => updateData({ city: value })}>
          <SelectTrigger id="city" className={errors.city ? 'border-ui-error' : ''}>
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.value} value={city.value}>
                {city.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.city && <p className="text-sm text-ui-error">{errors.city}</p>}
      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            Start Date <span className="text-ui-error">*</span>
          </Label>
          <Input
            id="startDate"
            type="date"
            min={today}
            max={maxDateStr}
            value={data.dates.start}
            onChange={(e) =>
              updateData({ dates: { ...data.dates, start: e.target.value } })
            }
            className={errors.dates ? 'border-ui-error' : ''}
          />
          {errors.dates && <p className="text-sm text-ui-error">{errors.dates}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date (Optional)</Label>
          <Input
            id="endDate"
            type="date"
            min={data.dates.start || today}
            max={maxDateStr}
            value={data.dates.end || ''}
            onChange={(e) =>
              updateData({ dates: { ...data.dates, end: e.target.value } })
            }
          />
        </div>
      </div>

      {/* Time Preference */}
      <div className="space-y-2">
        <Label>
          Preferred Time of Day <span className="text-ui-error">*</span>
        </Label>
        <RadioGroup
          value={data.preferredTime}
          onValueChange={(value: string) => updateData({ preferredTime: value })}
          className={errors.preferredTime ? 'border border-ui-error rounded p-4' : ''}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning" className="font-normal cursor-pointer">
              Morning (6am - 12pm)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="afternoon" id="afternoon" />
            <Label htmlFor="afternoon" className="font-normal cursor-pointer">
              Afternoon (12pm - 6pm)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening" />
            <Label htmlFor="evening" className="font-normal cursor-pointer">
              Evening (6pm - 12am)
            </Label>
          </div>
        </RadioGroup>
        {errors.preferredTime && (
          <p className="text-sm text-ui-error">{errors.preferredTime}</p>
        )}
      </div>

      {/* Number of Guests */}
      <div className="space-y-2">
        <Label htmlFor="numberOfGuests">
          Number of Guests (1-10) <span className="text-ui-error">*</span>
        </Label>
        <Input
          id="numberOfGuests"
          type="number"
          min={1}
          max={10}
          value={data.numberOfGuests}
          onChange={(e) => updateData({ numberOfGuests: parseInt(e.target.value) })}
          className={errors.numberOfGuests ? 'border-ui-error' : ''}
        />
        {errors.numberOfGuests && (
          <p className="text-sm text-ui-error">{errors.numberOfGuests}</p>
        )}
      </div>

      {/* Group Type */}
      <div className="space-y-2">
        <Label>
          Group Type <span className="text-ui-error">*</span>
        </Label>
        <Select
          value={data.groupType}
          onValueChange={(value: string) => updateData({ groupType: value })}
        >
          <SelectTrigger className={errors.groupType ? 'border-ui-error' : ''}>
            <SelectValue placeholder="Select group type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family">Family</SelectItem>
            <SelectItem value="friends">Friends</SelectItem>
            <SelectItem value="solo">Solo Traveler</SelectItem>
            <SelectItem value="business">Business Trip</SelectItem>
          </SelectContent>
        </Select>
        {errors.groupType && <p className="text-sm text-ui-error">{errors.groupType}</p>}
      </div>

      {/* Accessibility Needs */}
      <div className="space-y-2">
        <Label htmlFor="accessibilityNeeds">Accessibility Needs (Optional)</Label>
        <Textarea
          id="accessibilityNeeds"
          placeholder="Any special requirements or accessibility needs..."
          value={data.accessibilityNeeds || ''}
          onChange={(e) => updateData({ accessibilityNeeds: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  )
}
