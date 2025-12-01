'use client'

import { Label } from '@/components/ui/label'
import { ModernInput } from '@/components/ui/ModernInput'
import { Slider } from '@/components/ui/slider'
import { BookingFormData } from './BookingForm'
import { LANGUAGE_OPTIONS } from '@/config/languages'
import { Globe, Calendar, Map, CheckCircle2, DollarSign, X, ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useState, useRef, useEffect } from 'react'

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

          {/* Languages Multi-Select */}
          <div className="space-y-3" ref={dropdownRef}>
            <Label className={errors.preferredLanguages ? "text-ui-error" : ""}>
              Preferred Languages <span className="text-ui-error">*</span>
            </Label>
            <div className="relative">
              <div
                className={cn(
                  "min-h-[48px] w-full rounded-xl border-2 bg-white/50 px-3 py-2 text-sm transition-all duration-200 cursor-pointer flex flex-wrap gap-2 items-center",
                  errors.preferredLanguages
                    ? "border-ui-error"
                    : "border-gray-200 hover:border-ui-blue-primary/50",
                  isLanguageOpen && "ring-2 ring-ui-blue-primary ring-offset-2 border-ui-blue-primary"
                )}
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                {data.preferredLanguages.length > 0 ? (
                  data.preferredLanguages.map((langValue) => {
                    const langLabel = LANGUAGE_OPTIONS.find(l => l.value === langValue)?.label || langValue
                    return (
                      <Badge key={langValue} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                        {langLabel}
                        <div
                          role="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLanguage(langValue)
                          }}
                          className="hover:bg-black/10 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </div>
                      </Badge>
                    )
                  })
                ) : (
                  <span className="text-gray-400">Select languages...</span>
                )}
                <div className="ml-auto">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {isLanguageOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-scale-in origin-top">
                  <div className="p-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search languages..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-ui-blue-primary/20"
                        value={languageSearch}
                        onChange={(e) => setLanguageSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                    {filteredLanguages.length > 0 ? (
                      filteredLanguages.map((language) => {
                        const isSelected = data.preferredLanguages.includes(language.value)
                        return (
                          <div
                            key={language.value}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                              isSelected ? "bg-ui-blue-primary/5 text-ui-blue-primary font-medium" : "hover:bg-gray-50 text-gray-700"
                            )}
                            onClick={() => toggleLanguage(language.value)}
                          >
                            <span>{language.label}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-3 text-center text-sm text-gray-500">No languages found</div>
                    )}
                  </div>
                </div>
              )}
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

          {/* Guided Tour Pricing Flow */}
          {data.serviceType === 'guided_experience' && (
            <div className="space-y-6 animate-fade-in-up">
              {/* 1. Hours Needed */}
              <ModernInput
                label="Hours Needed"
                type="number"
                min={1}
                max={12}
                placeholder="e.g. 3"
                value={data.tourDurationHours || ''}
                onChange={(e) => handleDurationChange(e.target.value ? parseInt(e.target.value) : undefined)}
                helperText="How long do you need the guide for?"
              />

              {/* 2. Per-Hour Rate Slider */}
              <div className="bg-white/50 border border-gray-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-ui-success" />
                    Hourly Rate per Guide
                  </Label>
                  <span className="text-lg font-bold text-ui-success">€{data.hourlyRate || 20}/hr</span>
                </div>
                <div className="relative pt-6 pb-2">
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[data.hourlyRate || 20]}
                    onValueChange={(values) => handleRateChange(values[0])}
                    className="py-4"
                  />
                  {/* Recommended Marker */}
                  <div className="absolute top-0 left-[calc(20%-10px)] flex flex-col items-center">
                    <div className="h-2 w-0.5 bg-gray-300 mb-1"></div>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Rec.</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>€10</span>
                  <span>€100+</span>
                </div>
              </div>

              {/* 3. Auto Total Budget */}
              <div className="bg-ui-blue-primary/5 border border-ui-blue-primary/10 rounded-2xl p-6 text-center space-y-2">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Estimated Total Budget</p>
                <div className="text-4xl font-bold text-ui-blue-primary">
                  €{data.totalBudget || 0}
                </div>
                <p className="text-xs text-gray-400">
                  Based on {data.tourDurationHours || 0} hours at €{data.hourlyRate || 20}/hr.
                  <br />You can negotiate final price with guides.
                </p>
              </div>
            </div>
          )}

          {/* Itinerary Help Flow (Simplified) */}
          {data.serviceType === 'itinerary_help' && (
            <div className="space-y-6 animate-fade-in-up">
              <ModernInput
                label="Call Duration (minutes)"
                type="number"
                min={20}
                max={120}
                placeholder="e.g. 30"
                value={data.callDurationMinutes || ''}
                onChange={(e) => handleDurationChange(e.target.value ? parseInt(e.target.value) : undefined)}
              />

              {/* Simple Budget Slider for Itinerary */}
              <div className="bg-white/50 border border-gray-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-ui-success" />
                    Total Budget
                  </Label>
                  <span className="text-lg font-bold text-ui-success">€{data.totalBudget || 50}</span>
                </div>
                <Slider
                  min={20}
                  max={200}
                  step={5}
                  value={[data.totalBudget || 50]}
                  onValueChange={(values) => updateData({ totalBudget: values[0] })}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-gray-400 font-medium">
                  <span>€20</span>
                  <span>€200+</span>
                </div>
              </div>
            </div>
          )}
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
