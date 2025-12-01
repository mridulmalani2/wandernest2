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
  const rateMin = 10
  const rateMax = 100
  const recommendedRate = 20

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

  const handleDiscoveryFeeConsentChange = (checked: boolean | string) => {
    updateData({ discoveryFeeConsent: !!checked })
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

<<<<<<< HEAD
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
=======
      {/* Service Type */}
      <div className="space-y-2">
        <Label>
          Service Type <span className="text-ui-error">*</span>
        </Label>
        <RadioGroup
          value={data.serviceType}
          onValueChange={(value: string) => updateData({ serviceType: value as 'itinerary_help' | 'guided_experience' })}
          className={errors.serviceType ? 'border border-ui-error rounded p-4' : ''}
        >
          <div className="flex items-start space-x-2 p-3 border rounded hover:bg-gray-50">
            <RadioGroupItem value="itinerary_help" id="itinerary_help" />
            <div>
              <Label htmlFor="itinerary_help" className="font-medium cursor-pointer">
                Itinerary Planning Help
              </Label>
              <p className="text-sm text-gray-500">
                Get personalized recommendations and help planning your trip
              </p>
>>>>>>> c2626a4f409d082306e95fee7ca9a168640a3362
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
<<<<<<< HEAD
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
=======
          ))}
        </div>
        {errors.interests && <p className="text-sm text-ui-error">{errors.interests}</p>}
      </div>

      {/* Duration Input - Conditional on Service Type */}
      {data.serviceType && (
        <div className="space-y-2">
          <Label htmlFor="duration">
            {data.serviceType === 'itinerary_help'
              ? 'Call Duration (minutes)'
              : 'Guided Tour Duration (hours)'}
          </Label>
          <Input
            id="duration"
            type="number"
            min={data.serviceType === 'itinerary_help' ? 20 : 1}
            max={data.serviceType === 'itinerary_help' ? 120 : 12}
            placeholder={data.serviceType === 'itinerary_help' ? 'e.g. 30' : 'e.g. 3'}
            value={
              data.serviceType === 'itinerary_help'
                ? data.callDurationMinutes || ''
                : data.tourDurationHours || ''
            }
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

      {!data.serviceType && (
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            💡 Select a service type above to specify duration
          </p>
        </div>
      )}

      {/* Budget Range */}
      <div className="space-y-2">
        <Label htmlFor="totalBudget">What are you willing to pay the student per hour?</Label>
        <p className="text-sm text-gray-600 mb-3">
          Choose any hourly rate that feels right for you and the student. Subtle guidance is shown below, but the final choice is yours.
        </p>
        <div className="space-y-4">
          <div className="relative pb-8">
            <Slider
              id="totalBudget"
              min={rateMin}
              max={rateMax}
              step={1}
              value={[data.totalBudget || recommendedRate]}
              onValueChange={(values) => updateData({ totalBudget: values[0] })}
              className="w-full"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            >
              <div
                className="flex flex-col items-center text-[10px] text-gray-500"
                style={{
                  left: `${((recommendedRate - rateMin) / (rateMax - rateMin)) * 100}%`,
                  position: 'absolute',
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="block h-8 w-px bg-ui-blue-primary/50" />
                  <span className="block h-2 w-2 rounded-full bg-ui-blue-primary/70 shadow-sm" />
                </div>
                <div className="mt-1 rounded-md bg-white/80 px-2 py-1 border border-gray-200 shadow-sm">
                  Recommended student rate (~€20/hr). Choose what feels right.
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>€10</span>
            <span className="font-bold text-ui-blue-primary text-base">
              {data.totalBudget === rateMax
                ? '€100+/hr'
                : `€${data.totalBudget || recommendedRate}/hr`}
            </span>
            <span>€100+</span>
          </div>
        </div>
      </div>

      {/* Discovery Fee Interest */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <Checkbox
            id="discoveryFeeConsent"
            checked={!!data.discoveryFeeConsent}
            onCheckedChange={handleDiscoveryFeeConsentChange}
          />
          <div className="space-y-1">
            <Label htmlFor="discoveryFeeConsent" className="font-medium cursor-pointer">
              In the future, if TourWiseCo introduces a €2–€3 discovery fee, would you be willing to pay this fee on your next
              bookings if you have a good experience?
            </Label>
            <p className="text-xs text-gray-600">
              This is optional and only helps us plan ahead. Your choice won&apos;t affect current pricing.
            </p>
>>>>>>> c2626a4f409d082306e95fee7ca9a168640a3362
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
