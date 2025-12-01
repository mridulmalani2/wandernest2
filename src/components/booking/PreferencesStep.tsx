'use client'

import { Label } from '@/components/ui/label'
import { ModernInput } from '@/components/ui/ModernInput'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { BookingFormData } from './BookingForm'
import { LANGUAGE_OPTIONS } from '@/config/languages'
import { Globe, User, Map, Calendar, DollarSign, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

const INTERESTS = [
  { value: 'food', label: 'Food & Dining', icon: '🍕' },
  { value: 'culture', label: 'Culture & Arts', icon: '🎭' },
  { value: 'history', label: 'History', icon: '🏛️' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌃' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'nature', label: 'Nature', icon: '🌳' },
  { value: 'photography', label: 'Photography', icon: '📸' },
]

export function PreferencesStep({ data, errors, updateData }: Props) {
  const toggleLanguage = (language: string) => {
    const current = data.preferredLanguages || []
    const updated = current.includes(language)
      ? current.filter((l) => l !== language)
      : [...current, language]
    updateData({ preferredLanguages: updated })
  }

  const toggleInterest = (interest: string) => {
    const current = data.interests || []
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest]
    updateData({ interests: updated })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Your Preferences
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Help us find the perfect guide who matches your interests and needs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Nationality Preference */}
          <ModernInput
            label="Preferred Guide Nationality (Optional)"
            placeholder="e.g., American, Japanese, French..."
            value={data.preferredNationality || ''}
            onChange={(e) => updateData({ preferredNationality: e.target.value })}
            icon={Globe}
          />

          {/* Languages */}
          <div className="space-y-3">
            <Label className={errors.preferredLanguages ? "text-ui-error" : ""}>
              Preferred Languages <span className="text-ui-error">*</span>
            </Label>
            <div className="bg-white/50 border border-gray-200 rounded-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGE_OPTIONS.map((language) => (
                  <div key={language.value} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white transition-colors">
                    <Checkbox
                      id={language.value}
                      checked={data.preferredLanguages?.includes(language.value)}
                      onCheckedChange={() => toggleLanguage(language.value)}
                    />
                    <Label
                      htmlFor={language.value}
                      className="font-normal cursor-pointer text-sm flex-1"
                    >
                      {language.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            {errors.preferredLanguages && (
              <p className="text-xs text-ui-error">{errors.preferredLanguages}</p>
            )}
          </div>

          {/* Gender Preference */}
          <div className="space-y-3">
            <Label>Gender Preference (Optional)</Label>
            <div className="flex gap-2">
              {[
                { value: 'no_preference', label: 'No Preference' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateData({ preferredGender: option.value as any })}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all duration-200 border",
                    data.preferredGender === option.value || (!data.preferredGender && option.value === 'no_preference')
                      ? "bg-gray-900 text-white border-gray-900 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Service Type */}
          <div className="space-y-3">
            <Label className={errors.serviceType ? "text-ui-error" : ""}>
              Service Type <span className="text-ui-error">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  value: 'itinerary_help',
                  label: 'Itinerary Planning Help',
                  desc: 'Get personalized recommendations and planning',
                  icon: Calendar
                },
                {
                  value: 'guided_experience',
                  label: 'Full Guided Experience',
                  desc: 'Have a local guide accompany you',
                  icon: Map
                }
              ].map((type) => {
                const Icon = type.icon;
                const isSelected = data.serviceType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateData({ serviceType: type.value as any })}
                    className={cn(
                      "flex items-start p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group",
                      isSelected
                        ? "border-ui-blue-primary bg-ui-blue-primary/5 shadow-sm"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center mr-4 shrink-0 transition-colors",
                      isSelected ? "bg-ui-blue-primary text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <span className={cn("block font-bold", isSelected ? "text-ui-blue-primary" : "text-gray-700")}>
                        {type.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {type.desc}
                      </span>
                    </div>
                    {isSelected && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-ui-blue-primary" />}
                  </button>
                );
              })}
            </div>
            {errors.serviceType && <p className="text-xs text-ui-error">{errors.serviceType}</p>}
          </div>

          {/* Duration Input */}
          {data.serviceType && (
            <div className="animate-fade-in-up">
              <ModernInput
                label={data.serviceType === 'itinerary_help' ? 'Call Duration (minutes)' : 'Guided Tour Duration (hours)'}
                type="number"
                min={data.serviceType === 'itinerary_help' ? 20 : 1}
                max={data.serviceType === 'itinerary_help' ? 120 : 12}
                placeholder={data.serviceType === 'itinerary_help' ? 'e.g. 30' : 'e.g. 3'}
                value={data.serviceType === 'itinerary_help' ? data.callDurationMinutes || '' : data.tourDurationHours || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined
                  if (data.serviceType === 'itinerary_help') {
                    updateData({ callDurationMinutes: value })
                  } else {
                    updateData({ tourDurationHours: value })
                  }
                }}
              />
            </div>
          )}

          {/* Budget Slider */}
          <div className="bg-white/50 border border-gray-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-ui-success" />
                Total Trip Budget
              </Label>
              <span className="text-lg font-bold text-ui-success">€{data.totalBudget || 150}</span>
            </div>
            <Slider
              min={50}
              max={500}
              step={10}
              value={[data.totalBudget || 150]}
              onValueChange={(values) => updateData({ totalBudget: values[0] })}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              <span>€50</span>
              <span>€500+</span>
            </div>
          </div>
        </div>

        {/* Interests - Full Width */}
        <div className="md:col-span-2 space-y-3">
          <Label className={errors.interests ? "text-ui-error" : ""}>
            Interests <span className="text-ui-error">*</span>
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {INTERESTS.map((interest) => {
              const isSelected = data.interests?.includes(interest.value);
              return (
                <button
                  key={interest.value}
                  type="button"
                  onClick={() => toggleInterest(interest.value)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 gap-2 hover:shadow-sm",
                    isSelected
                      ? "border-ui-purple-primary bg-ui-purple-primary/5 shadow-sm transform scale-105"
                      : "border-gray-100 bg-white hover:border-ui-purple-primary/30 hover:bg-gray-50"
                  )}
                >
                  <span className="text-2xl filter drop-shadow-sm">{interest.icon}</span>
                  <span className={cn("text-xs font-semibold", isSelected ? "text-ui-purple-primary" : "text-gray-600")}>
                    {interest.label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.interests && <p className="text-xs text-ui-error">{errors.interests}</p>}
        </div>
      </div>
    </div>
  )
}
