'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { BookingFormData } from './BookingForm'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' },
  { value: 'german', label: 'German' },
  { value: 'italian', label: 'Italian' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'arabic', label: 'Arabic' },
]

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LANGUAGES.map((language) => (
            <div key={language.value} className="flex items-center space-x-2">
              <Checkbox
                id={language.value}
                checked={data.preferredLanguages?.includes(language.value)}
                onCheckedChange={() => toggleLanguage(language.value)}
              />
              <Label
                htmlFor={language.value}
                className="font-normal cursor-pointer"
              >
                {language.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.preferredLanguages && (
          <p className="text-sm text-ui-error">{errors.preferredLanguages}</p>
        )}
      </div>

      {/* Gender Preference */}
      <div className="space-y-2">
        <Label>Gender Preference (Optional)</Label>
        <RadioGroup
          value={data.preferredGender || 'no_preference'}
          onValueChange={(value: string) => updateData({ preferredGender: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no_preference" id="no_preference" />
            <Label htmlFor="no_preference" className="font-normal cursor-pointer">
              No Preference
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="male" id="male" />
            <Label htmlFor="male" className="font-normal cursor-pointer">
              Male
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="female" id="female" />
            <Label htmlFor="female" className="font-normal cursor-pointer">
              Female
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Service Type */}
      <div className="space-y-2">
        <Label>
          Service Type <span className="text-ui-error">*</span>
        </Label>
        <RadioGroup
          value={data.serviceType}
          onValueChange={(value: string) => updateData({ serviceType: value })}
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

      {/* Budget Range */}
      <div className="space-y-2">
        <Label htmlFor="budget">
          Budget per Day (USD) - Optional
        </Label>
        <div className="space-y-4">
          <Slider
            id="budget"
            min={50}
            max={500}
            step={10}
            value={[data.budget || 150]}
            onValueChange={(values) => updateData({ budget: values[0] })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>$50</span>
            <span className="font-bold text-ui-blue-primary">
              ${data.budget || 150}
            </span>
            <span>$500+</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          This helps us match you with guides in your price range
        </p>
      </div>
    </div>
  )
}
