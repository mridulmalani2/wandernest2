'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { BookingFormData } from './BookingForm'
import { LANGUAGE_OPTIONS } from '@/config/languages'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

const INTERESTS = [
  { value: 'food', label: '🍕 Food & Dining' },
  { value: 'culture', label: '🎭 Culture & Arts' },
  { value: 'history', label: '🏛️ History' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'nightlife', label: '🌃 Nightlife' },
  { value: 'adventure', label: '🏔️ Adventure' },
  { value: 'nature', label: '🌳 Nature' },
  { value: 'photography', label: '📸 Photography' },
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Preferences</h2>
        <p className="text-gray-600">Help us find the perfect guide for you</p>
      </div>

      {/* Nationality Preference */}
      <div className="space-y-2">
        <Label htmlFor="nationality">Preferred Guide Nationality (Optional)</Label>
        <Input
          id="nationality"
          placeholder="e.g., American, Japanese, French..."
          value={data.preferredNationality || ''}
          onChange={(e) => updateData({ preferredNationality: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Prefer a guide from your home country? Many travelers find it adds comfort and cultural familiarity. Or leave blank to explore all options.
        </p>
      </div>

      {/* Languages */}
      <div className="space-y-2">
        <Label>
          Preferred Languages <span className="text-ui-error">*</span>
        </Label>
        <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {LANGUAGE_OPTIONS.map((language) => (
              <div key={language.value} className="flex items-center space-x-2">
                <Checkbox
                  id={language.value}
                  checked={data.preferredLanguages?.includes(language.value)}
                  onCheckedChange={() => toggleLanguage(language.value)}
                />
                <Label
                  htmlFor={language.value}
                  className="font-normal cursor-pointer text-sm"
                >
                  {language.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        {errors.preferredLanguages && (
          <p className="text-sm text-ui-error">{errors.preferredLanguages}</p>
        )}
      </div>

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
            </div>
          </div>
          <div className="flex items-start space-x-2 p-3 border rounded hover:bg-gray-50">
            <RadioGroupItem value="guided_experience" id="guided_experience" />
            <div>
              <Label htmlFor="guided_experience" className="font-medium cursor-pointer">
                Full Guided Experience
              </Label>
              <p className="text-sm text-gray-500">
                Have a local guide accompany you throughout your trip
              </p>
            </div>
          </div>
        </RadioGroup>
        {errors.serviceType && (
          <p className="text-sm text-ui-error">{errors.serviceType}</p>
        )}
      </div>

      {/* Interests */}
      <div className="space-y-2">
        <Label>
          Interests <span className="text-ui-error">*</span>
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {INTERESTS.map((interest) => (
            <div
              key={interest.value}
              className={`flex items-center space-x-2 p-3 border rounded cursor-pointer transition-colors ${
                data.interests?.includes(interest.value)
                  ? 'bg-ui-blue-primary/10 border-ui-blue-primary'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => toggleInterest(interest.value)}
            >
              <Checkbox
                id={interest.value}
                checked={data.interests?.includes(interest.value)}
                onCheckedChange={() => toggleInterest(interest.value)}
              />
              <Label
                htmlFor={interest.value}
                className="font-normal cursor-pointer flex-1"
              >
                {interest.label}
              </Label>
            </div>
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
          </div>
        </div>
      </div>
    </div>
  )
}
