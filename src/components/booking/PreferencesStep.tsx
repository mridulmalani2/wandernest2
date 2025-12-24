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
  updateData: (data: Partial<BookingFormData> | ((prev: BookingFormData) => Partial<BookingFormData>)) => void
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
    updateData((prev) => {
      const current = prev.preferredLanguages || []
      const updated = current.includes(language)
        ? current.filter((l) => l !== language)
        : [...current, language]
      return { preferredLanguages: updated }
    })
  }

  const toggleInterest = (interest: string) => {
    const normalized = interest.trim()
    if (!normalized) return
    updateData((prev) => {
      const current = prev.interests || []
      const updated = current.includes(normalized)
        ? current.filter((i) => i !== normalized)
        : [...current, normalized]
      return { interests: updated }
    })
  }

  const filteredLanguages = LANGUAGE_OPTIONS.filter(lang =>
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  )

  const handleDurationChange = (value: number | undefined) => {
    const safeValue = typeof value === 'number' && Number.isFinite(value) && value >= 0
      ? value
      : undefined
    if (data.serviceType === 'itinerary_help') {
      updateData({ callDurationMinutes: safeValue })
    } else {
      updateData({
        tourDurationHours: safeValue,
        totalBudget: safeValue && data.hourlyRate ? safeValue * data.hourlyRate : 0
      })
    }
  }

  const handleRateChange = (value: number) => {
    if (!Number.isFinite(value) || value < 0) return
    updateData({
      hourlyRate: value,
      totalBudget: data.tourDurationHours ? data.tourDurationHours * value : 0
    })
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Your Preferences
        </h2>
        <p className="text-base font-light text-gray-200 max-w-md mx-auto">
          Help us find your perfect match
        </p>
      </div>

      {/* Basic Preferences */}
      <FlowCard padding="lg" className={cn("transition-all duration-200", isLanguageOpen ? "relative z-20" : "")}>
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
            <label className="text-sm font-light tracking-wide text-white/90">
              Preferred Languages {errors.preferredLanguages && <span className="text-ui-error ml-1">*</span>}
            </label>
            <div className="relative">
              <div
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsLanguageOpen(!isLanguageOpen)
                  }
                }}
                role="combobox"
                aria-expanded={isLanguageOpen}
                aria-haspopup="listbox"
                aria-controls="language-listbox"
                tabIndex={0}
                className={cn(
                  'w-full min-h-[48px] px-0 py-3 cursor-pointer focus:outline-none focus:border-white',
                  'border-0 border-b border-white/20 transition-all duration-300',
                  'flex flex-wrap gap-2 items-center',
                  isLanguageOpen && 'border-b-2 border-white',
                  errors.preferredLanguages && 'border-ui-error'
                )}
              >
                {(data.preferredLanguages || []).length > 0 ? (
                  (data.preferredLanguages || []).map((langValue) => {
                    const langLabel = LANGUAGE_OPTIONS.find(l => l.value === langValue)?.label || langValue
                    return (
                      <span
                        key={langValue}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-black text-sm font-medium shadow-sm"
                      >
                        {langLabel}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLanguage(langValue)
                          }}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })
                ) : (
                  <span className="text-white/50 font-light">Select languages...</span>
                )}
                <ChevronDown
                  className={cn(
                    'ml-auto h-4 w-4 text-gray-400 transition-transform duration-200',
                    isLanguageOpen && 'rotate-180'
                  )}
                />
              </div>

              {isLanguageOpen && (
                <div
                  id="language-listbox"
                  className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-scale-in"
                  role="listbox"
                >
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-8 pr-3 py-2 text-sm bg-liquid-light rounded-xl focus:outline-none text-gray-900 placeholder:text-gray-500"
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredLanguages.map((language) => {
                      const isSelected = (data.preferredLanguages || []).includes(language.value)
                      return (
                        <div
                          key={language.value}
                          onClick={() => toggleLanguage(language.value)}
                          role="option"
                          aria-selected={isSelected}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-all',
                            isSelected
                              ? 'bg-liquid-dark-primary/10 font-medium text-liquid-dark-primary'
                              : 'hover:bg-liquid-light text-gray-700'
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

          <div className="space-y-3">
            <label className="text-sm font-light tracking-wide text-white/90 block">
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
                    'border-2',
                    data.preferredGender === option.value || (!data.preferredGender && option.value === 'no_preference')
                      ? 'bg-white text-black border-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-transparent text-white border-white/30 hover:border-white hover:shadow-md hover:bg-white/10 active:scale-[0.98] active:bg-white/5'
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
          <label className="text-sm font-light tracking-wide text-white/90 block">
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
                  'border-2',
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.99] active:bg-white/5'
                )}
              >
                <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                  isSelected ? 'bg-black/10' : 'bg-white/10')}>
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
              onChange={(e) => {
                const parsed = e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                handleDurationChange(Number.isFinite(parsed) ? parsed : undefined)
              }}
              helperText="How long do you need the guide?"
            />

            <div className="space-y-1">
              <LiquidSlider
                label="How much would you like to pay per hour?"
                value={[data.hourlyRate || 20]}
                onValueChange={(values) => handleRateChange(values[0])}
                min={10}
                max={100}
                step={5}
                formatValue={(v) => `€${v}/hr`}
              />
              <p className="text-xs font-light text-gray-300 text-center">
                We recommend a 3-4 hour guided walk, with a 20-25 Euro/hour payment.
              </p>
            </div>

            <div className="pt-4 text-center border-t border-white/10 mt-4">
              <div className="text-xs font-light text-gray-300 mb-1">Estimated Total Budget</div>
              <div className="text-3xl font-light text-white">
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
              onChange={(e) => {
                const parsed = e.target.value ? Number.parseInt(e.target.value, 10) : undefined
                handleDurationChange(Number.isFinite(parsed) ? parsed : undefined)
              }}
            />

            <div className="space-y-1">
              <LiquidSlider
                label="How much would you be willing to pay for the consultation + itinerary?"
                value={[data.totalBudget || 50]}
                onValueChange={(values) => updateData({ totalBudget: values[0] })}
                min={20}
                max={200}
                step={5}
                formatValue={(v) => `€${v}`}
              />
              <p className="text-xs font-light text-gray-300 text-center">
                We recommend a 45 minute session to share preferences for the itinerary, with a 20-25 Euro payment.
              </p>
            </div>
          </div>
        </FlowCard>
      )}

      {/* Interests - Pills */}
      <div className="space-y-4">
        <label className="text-sm font-light tracking-wide text-white/90 block">
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
                  'border-2',
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.98] active:bg-white/5'
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-light tracking-wide text-white/90">Specific event or highlight (optional)</label>
          <span className="text-[11px] text-gray-400">Tell us what you’re excited to experience</span>
        </div>
        <textarea
          value={data.interestHighlights || ''}
          onChange={(e) => updateData({ interestHighlights: e.target.value })}
          placeholder="e.g., Oktoberfest, a local food festival, or a landmark you've dreamed of visiting"
          className="w-full rounded-2xl bg-white/5 border border-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all text-sm text-white placeholder:text-white/50 px-4 py-3 min-h-[80px]"
        />
      </div>
    </div>
  )
}
