'use client'

import { LiquidInput } from '@/components/ui/LiquidInput'
import { LiquidSlider } from '@/components/ui/LiquidSlider'
import { FlowCard } from '@/components/ui/FlowCard'
import { BookingFormData } from './BookingForm'
import { LANGUAGE_OPTIONS } from '@/config/languages'
import { Globe, Calendar, Map, CheckCircle2, DollarSign, X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

const INTERESTS = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'culture', label: 'Culture & Arts' },
  { value: 'history', label: 'History' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'nature', label: 'Nature' },
  { value: 'photography', label: 'Photography' },
]

export function PreferencesStep({ data, errors, updateData }: Props) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [languageSearch, setLanguageSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const filteredLanguages = LANGUAGE_OPTIONS.filter(lang =>
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  )

  const handleDurationChange = (value: number | undefined) => {
    if (data.serviceType === 'itinerary_help') {
      updateData({ callDurationMinutes: value })
    } else {
      updateData({
        tourDurationHours: value,
        totalBudget: value && data.hourlyRate ? value * data.hourlyRate : 0
      })
    }
  }

  const handleRateChange = (value: number) => {
    updateData({
      hourlyRate: value,
      totalBudget: data.tourDurationHours ? data.tourDurationHours * value : 0
    })
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-liquid-dark-primary">
          Your Preferences
        </h2>
        <p className="text-base font-light text-gray-500 max-w-md mx-auto">
          Help us find your perfect match
        </p>
      </div>

      {/* Basic Preferences */}
      <FlowCard padding="lg">
        <div className="space-y-8">
          <LiquidInput
            label="Preferred Guide Nationality (Optional)"
            placeholder="e.g., American, Japanese, French..."
            value={data.preferredNationality || ''}
            onChange={(e) => updateData({ preferredNationality: e.target.value })}
            icon={Globe}
          />

          {/* Language Multi-Select Dropdown */}
          <div className="space-y-3" ref={dropdownRef}>
            <label className="text-sm font-light tracking-wide text-liquid-dark-secondary">
              Preferred Languages {errors.preferredLanguages && <span className="text-ui-error ml-1">*</span>}
            </label>
            <div className="relative">
              <div
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className={cn(
                  'w-full min-h-[48px] px-0 py-3 cursor-pointer',
                  'border-0 border-b border-gray-300 transition-all duration-300',
                  'flex flex-wrap gap-2 items-center',
                  isLanguageOpen && 'border-b-2 border-liquid-dark-primary',
                  errors.preferredLanguages && 'border-ui-error'
                )}
              >
                {data.preferredLanguages.length > 0 ? (
                  data.preferredLanguages.map((langValue) => {
                    const langLabel = LANGUAGE_OPTIONS.find(l => l.value === langValue)?.label || langValue
                    return (
                      <span
                        key={langValue}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-liquid-dark-primary/5 text-liquid-dark-primary text-sm"
                      >
                        {langLabel}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLanguage(langValue)
                          }}
                          className="hover:bg-liquid-dark-primary/10 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })
                ) : (
                  <span className="text-gray-400 font-light">Select languages...</span>
                )}
                <ChevronDown
                  className={cn(
                    'ml-auto h-4 w-4 text-gray-400 transition-transform duration-200',
                    isLanguageOpen && 'rotate-180'
                  )}
                />
              </div>

              {isLanguageOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-2 text-sm bg-liquid-light rounded-xl focus:outline-none"
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredLanguages.map((language) => {
                      const isSelected = data.preferredLanguages.includes(language.value)
                      return (
                        <div
                          key={language.value}
                          onClick={() => toggleLanguage(language.value)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors',
                            isSelected ? 'bg-liquid-dark-primary/5 font-normal' : 'hover:bg-liquid-light'
                          )}
                        >
                          <span>{language.label}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-liquid-dark-primary" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            {errors.preferredLanguages && (
              <p className="text-xs font-light text-ui-error">{errors.preferredLanguages}</p>
            )}
          </div>

          {/* Gender Preference - Pills */}
          <div className="space-y-3">
            <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
              Gender Preference (Optional)
            </label>
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
                    'flex-1 py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-300',
                    data.preferredGender === option.value || (!data.preferredGender && option.value === 'no_preference')
                      ? 'bg-liquid-dark-primary text-white shadow-md'
                      : 'bg-white/60 text-gray-600 border border-gray-200 hover:border-liquid-dark-primary/30'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FlowCard>

      {/* Service Type */}
      <FlowCard padding="lg">
        <div className="space-y-4">
          <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
            Service Type {errors.serviceType && <span className="text-ui-error ml-1">*</span>}
          </label>
          {[
            { value: 'itinerary_help', label: 'Itinerary Planning', desc: 'Get personalized recommendations', icon: Calendar },
            { value: 'guided_experience', label: 'Guided Experience', desc: 'Have a local guide accompany you', icon: Map },
          ].map((type) => {
            const Icon = type.icon
            const isSelected = data.serviceType === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => updateData({ serviceType: type.value as any })}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-full transition-all duration-300 text-left',
                  'border hover:shadow-md',
                  isSelected
                    ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary shadow-md'
                    : 'bg-white/60 text-gray-600 border-gray-200 hover:border-liquid-dark-primary/30'
                )}
              >
                <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                  isSelected ? 'bg-white/20' : 'bg-gray-100')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm opacity-70">{type.desc}</div>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0" />}
              </button>
            )
          })}
          {errors.serviceType && (
            <p className="text-xs font-light text-ui-error mt-2">{errors.serviceType}</p>
          )}
        </div>
      </FlowCard>

      {/* Guided Tour Pricing */}
      {data.serviceType === 'guided_experience' && (
        <FlowCard padding="lg" variant="subtle">
          <div className="space-y-6">
            <LiquidInput
              label="Hours Needed"
              type="number"
              min={1}
              max={12}
              placeholder="e.g. 3"
              value={data.tourDurationHours || ''}
              onChange={(e) => handleDurationChange(e.target.value ? parseInt(e.target.value) : undefined)}
              helperText="How long do you need the guide?"
            />

            <LiquidSlider
              label="Hourly Rate per Guide"
              value={[data.hourlyRate || 20]}
              onValueChange={(values) => handleRateChange(values[0])}
              min={10}
              max={100}
              step={5}
              recommendedValue={20}
              formatValue={(v) => `€${v}/hr`}
            />

            <div className="pt-4 text-center">
              <div className="text-xs font-light text-gray-500 mb-1">Estimated Total Budget</div>
              <div className="text-3xl font-light text-liquid-dark-primary">
                €{data.totalBudget || 0}
              </div>
              <div className="text-xs font-light text-gray-400 mt-1">
                Based on {data.tourDurationHours || 0} hours at €{data.hourlyRate || 20}/hr
              </div>
            </div>
          </div>
        </FlowCard>
      )}

      {/* Itinerary Help */}
      {data.serviceType === 'itinerary_help' && (
        <FlowCard padding="lg" variant="subtle">
          <div className="space-y-6">
            <LiquidInput
              label="Call Duration (minutes)"
              type="number"
              min={20}
              max={120}
              placeholder="e.g. 30"
              value={data.callDurationMinutes || ''}
              onChange={(e) => handleDurationChange(e.target.value ? parseInt(e.target.value) : undefined)}
            />

            <LiquidSlider
              label="Total Budget"
              value={[data.totalBudget || 50]}
              onValueChange={(values) => updateData({ totalBudget: values[0] })}
              min={20}
              max={200}
              step={5}
              formatValue={(v) => `€${v}`}
            />
          </div>
        </FlowCard>
      )}

      {/* Interests - Pills */}
      <div className="space-y-4">
        <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
          Interests {errors.interests && <span className="text-ui-error ml-1">*</span>}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {INTERESTS.map((interest) => {
            const isSelected = data.interests?.includes(interest.value)
            return (
              <button
                key={interest.value}
                type="button"
                onClick={() => toggleInterest(interest.value)}
                className={cn(
                  'flex items-center justify-center gap-2 px-6 py-3 rounded-full transition-all duration-300',
                  'border hover:shadow-md',
                  isSelected
                    ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary shadow-md'
                    : 'bg-white/60 text-gray-600 border-gray-200 hover:border-liquid-dark-primary/30'
                )}
              >
                <span className="text-sm font-medium">{interest.label}</span>
              </button>
            )
          })}
        </div>
        {errors.interests && (
          <p className="text-xs font-light text-ui-error mt-2">{errors.interests}</p>
        )}
      </div>
    </div>
  )
}
