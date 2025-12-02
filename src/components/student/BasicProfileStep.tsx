'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { LiquidSelect } from '@/components/ui/LiquidSelect';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { useState, useRef, useEffect } from 'react';
import { getUniversityOptionsByCity, type UniversityOption } from '@/config/universityOptions';
import { User, Calendar, Globe, Phone, Building, GraduationCap, BookOpen, X, Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES } from '@/config/countries';

interface BasicProfileStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  cities: string[];
}

const YEAR_OF_STUDY_OPTIONS = [
  { value: '1st year Undergrad', label: '1st year Undergrad' },
  { value: '2nd year Undergrad', label: '2nd year Undergrad' },
  { value: '3rd year Undergrad', label: '3rd year Undergrad' },
  { value: '4th year Undergrad', label: '4th year Undergrad' },
  { value: '1st year MSc', label: '1st year MSc' },
  { value: '2nd year MSc', label: '2nd year MSc' },
  { value: 'PhD 1st year', label: 'PhD 1st year' },
  { value: 'PhD 2nd year', label: 'PhD 2nd year' },
  { value: 'PhD 3rd year+', label: 'PhD 3rd year+' },
];

const COMMON_LANGUAGES = [
  'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese',
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Bengali', 'Russian', 'Turkish'
];

export function BasicProfileStep({ formData, updateFormData, errors, cities }: BasicProfileStepProps) {
  const [customLanguage, setCustomLanguage] = useState('');
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const campusOptions: UniversityOption[] = formData.city ? getUniversityOptionsByCity(formData.city) : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = COMMON_LANGUAGES.filter(lang =>
    lang.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const toggleLanguage = (language: string) => {
    const current = formData.languages || [];
    if (current.includes(language)) {
      updateFormData({ languages: current.filter((l) => l !== language) });
    } else {
      updateFormData({ languages: [...current, language] });
    }
  };

  const addCustomLanguage = () => {
    if (customLanguage.trim() && !formData.languages.includes(customLanguage.trim())) {
      updateFormData({ languages: [...formData.languages, customLanguage.trim()] });
      setCustomLanguage('');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-liquid-dark-primary">
          Basic Profile
        </h2>
        <p className="text-base font-light text-gray-500 max-w-md mx-auto">
          Let's start with the basics
        </p>
      </div>

      {/* Personal Details */}
      <FlowCard padding="lg">
        <div className="space-y-6">
          <h3 className="text-sm font-light tracking-wide text-liquid-dark-secondary flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidInput
              label="Full Name (as on ID)"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Your name"
              error={errors.name}
              icon={User}
            />

            <LiquidInput
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
              error={errors.dateOfBirth}
              icon={Calendar}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
              Gender {errors.gender && <span className="text-ui-error ml-1">*</span>}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['male', 'female', 'prefer_not_to_say'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateFormData({ gender: option as any })}
                  className={cn(
                    'py-3 px-4 rounded-full text-sm font-medium transition-all duration-300',
                    'border-2',
                    formData.gender === option
                      ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-liquid-dark-primary hover:shadow-md hover:bg-liquid-light active:scale-[0.98] active:bg-gray-100'
                  )}
                >
                  {option === 'prefer_not_to_say' ? 'Prefer not to say' : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-xs font-light text-ui-error">{errors.gender}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <LiquidSelect
                label="Nationality"
                value={COUNTRIES.includes(formData.nationality) ? formData.nationality : (formData.nationality ? 'other' : '')}
                onValueChange={(value) => {
                  if (value === 'other') {
                    updateFormData({ nationality: '' });
                  } else {
                    updateFormData({ nationality: value });
                  }
                }}
                placeholder="Select your nationality"
                options={[
                  ...COUNTRIES.map(c => ({ value: c, label: c })),
                  { value: 'other', label: 'Other' }
                ]}
                error={errors.nationality}
                icon={Globe}
              />
              {(!COUNTRIES.includes(formData.nationality) && formData.nationality !== '') || (formData.nationality === '' && !COUNTRIES.includes(formData.nationality)) ? (
                // This logic is getting complicated. Let's simplify:
                // If it's NOT in the list, we assume it's 'other' or custom.
                // But wait, if it's empty, it could be unselected.
                // Let's use a local state or just check if it's in the list.
                // If user selects 'other', we set it to '' (empty string) but we need to show the input.
                // If user selects a country, we set it to that country.
                // So if it is NOT in COUNTRIES, we show the input?
                // But initially it is empty.
                // Let's assume if it is NOT in COUNTRIES, we show the input, UNLESS it is strictly empty AND the user hasn't selected 'other' yet?
                // Actually, simpler: If the value passed to Select is 'other' (which happens if it's not in list but not empty, OR if we explicitly track 'other'), show input.
                // But here we mapped `formData.nationality ? 'other' : ''` for unknown values.
                // So if `formData.nationality` is "Martian", Select sees "other".
                // And we should show the input with value "Martian".
                // If `formData.nationality` is "", Select sees "".
                // If user selects "other", `formData.nationality` becomes "". Select sees "".
                // This is the problem. If user selects "other", we clear the value, so Select sees "", so it deselects "other".
                // We need a way to persist "other" selection even if value is empty.
                // But `LiquidSelect` is controlled.

                // Alternative: If user selects 'other', set value to 'Other' (temporary string)? No, that would be a valid nationality.
                // Let's just check if it's NOT in COUNTRIES.
                // If it's not in countries, show the input.
                // But if it's empty?
                // If it's empty, we might just show the select.
                // But if user clicks "Other", we want to show input.
                // Maybe we can check if `formData.nationality` is NOT in COUNTRIES.
                // If it is NOT in COUNTRIES, we show the input.
                // But initially it is empty (not in countries). We don't want to show input initially.
                // We only want to show input if user explicitly selected 'other' OR if they already have a custom value.

                // Let's use a local state `isCustomNationality`?
                // Or just check: `!COUNTRIES.includes(formData.nationality) && formData.nationality !== ''`.
                // But what if user clicks "Other"? We set it to ''. Then the condition fails.
                // We should set it to 'Other' temporarily? Or use a separate state.

                // Let's try this:
                // If user selects 'other', set `nationality` to 'Other'.
                // Then in input, if value is 'Other', show placeholder?
                // No, 'Other' is a valid word.

                // Let's use a local state for "show custom input".
                // But `BasicProfileStep` re-renders.

                // Let's just use the `LiquidInput` when `!COUNTRIES.includes(formData.nationality)`.
                // And if it is empty?
                // If it is empty, we show the Select.
                // If user selects 'other', we set `nationality` to 'Custom'.
                // Then the input shows 'Custom'. User deletes it and types.
                // If user types, it updates.
                // If user clears it, it becomes empty.
                // If it becomes empty, does it go back to Select?
                // Yes, if we use `!COUNTRIES.includes`.

                // Let's try:
                // If `!COUNTRIES.includes(formData.nationality)` AND `formData.nationality !== ''`.
                // But how to trigger it?
                // When user selects 'other', set `nationality` to 'Custom'.
                // Then input appears with value 'Custom'. User clears it. Value becomes ''. Input disappears.
                // That's annoying.

                // Better:
                // Always show Select.
                // If `!COUNTRIES.includes(formData.nationality)` (and not empty), show Input BELOW it?
                // Or replace it?

                // Let's follow the pattern used for Campus/Institute in the same file (lines 181-200).
                // It checks `formData.campus === 'other'`.
                // So we should store 'other' in `nationality`?
                // But `nationality` is the final value.
                // For Campus, `campus` is a separate field from `institute` (which is the actual text?).
                // No, `institute` is the text. `campus` is the selection.
                // Here we only have `nationality`.

                // Let's use a local state `showCustomNationality`.

                <div className="space-y-2">
                  <LiquidSelect
                    label="Nationality"
                    value={COUNTRIES.includes(formData.nationality) ? formData.nationality : (formData.nationality ? 'other' : '')}
                    onValueChange={(value) => {
                      if (value === 'other') {
                        updateFormData({ nationality: 'Other' }); // Set a temp value to trigger custom mode
                      } else {
                        updateFormData({ nationality: value });
                      }
                    }}
                    placeholder="Select your nationality"
                    options={[
                      ...COUNTRIES.map(c => ({ value: c, label: c })),
                      { value: 'other', label: 'Other' }
                    ]}
                    error={errors.nationality}
                    icon={Globe}
                  />
                  {!COUNTRIES.includes(formData.nationality) && formData.nationality !== '' && (
                    <LiquidInput
                      value={formData.nationality === 'Other' ? '' : formData.nationality}
                      onChange={(e) => updateFormData({ nationality: e.target.value })}
                      placeholder="Enter your nationality"
                      autoFocus
                    />
                  )}
                </div>
              ) : null}
            </div>

            <LiquidInput
              label="Phone Number"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              error={errors.phoneNumber}
              icon={Phone}
            />
          </div>

          <LiquidInput
            label="Email Address"
            type="email"
            value={formData.email}
            disabled
            containerClassName="opacity-60"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidSelect
              label="Current City"
              value={formData.city}
              onValueChange={(value) => updateFormData({ city: value, campus: '' })}
              placeholder="Select your city"
              options={cities.map(city => ({ value: city, label: city }))}
              error={errors.city}
              icon={Building}
            />

            {formData.city && (
              <div className="space-y-2">
                <LiquidSelect
                  label="Campus"
                  value={formData.campus}
                  onValueChange={(value) => {
                    const selectedOption = campusOptions.find(opt => opt.value === value);
                    const label = selectedOption?.label || value;
                    updateFormData({
                      campus: value,
                      institute: value !== 'other' ? label : formData.institute
                    });
                  }}
                  placeholder="Select campus"
                  options={campusOptions}
                  error={errors.campus}
                  icon={Building}
                />
                {formData.campus === 'other' && (
                  <LiquidInput
                    value={formData.institute}
                    onChange={(e) => updateFormData({ institute: e.target.value })}
                    placeholder="Enter university name"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </FlowCard>

      {/* Academic Details */}
      <FlowCard padding="lg">
        <div className="space-y-6">
          <h3 className="text-sm font-light tracking-wide text-liquid-dark-secondary flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic Details
          </h3>

          <LiquidInput
            label="University Name"
            value={formData.institute}
            onChange={(e) => updateFormData({ institute: e.target.value })}
            placeholder="e.g., Sorbonne University"
            error={errors.institute}
            disabled={formData.campus !== 'other' && !!formData.campus}
            icon={Building}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidInput
              label="Program/Degree"
              value={formData.programDegree}
              onChange={(e) => updateFormData({ programDegree: e.target.value })}
              placeholder="e.g., MSc Computer Science"
              error={errors.programDegree}
              icon={BookOpen}
            />

            <LiquidSelect
              label="Year of Study"
              value={formData.yearOfStudy}
              onValueChange={(value) => updateFormData({ yearOfStudy: value })}
              placeholder="Select year"
              options={YEAR_OF_STUDY_OPTIONS}
              error={errors.yearOfStudy}
              icon={Calendar}
            />
          </div>

          <LiquidInput
            label="Expected Graduation"
            value={formData.expectedGraduation}
            onChange={(e) => updateFormData({ expectedGraduation: e.target.value })}
            placeholder="e.g., 2025"
            error={errors.expectedGraduation}
            icon={GraduationCap}
          />

          {/* Languages - Multi-Select Dropdown */}
          <div className="space-y-3" ref={dropdownRef}>
            <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
              Languages You Speak {errors.languages && <span className="text-ui-error ml-1">*</span>}
            </label>

            <div className="relative">
              <div
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className={cn(
                  'w-full min-h-[48px] px-0 py-3 cursor-pointer',
                  'border-0 border-b border-gray-300 transition-all duration-300',
                  'flex flex-wrap gap-2 items-center',
                  isLanguageOpen && 'border-b-2 border-liquid-dark-primary',
                  errors.languages && 'border-ui-error'
                )}
              >
                {formData.languages.length > 0 ? (
                  formData.languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-liquid-dark-primary text-white text-sm font-medium shadow-sm"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLanguage(language);
                        }}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
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
                      const isSelected = formData.languages.includes(language);
                      return (
                        <div
                          key={language}
                          onClick={() => toggleLanguage(language)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-all',
                            isSelected
                              ? 'bg-liquid-dark-primary/10 font-medium text-liquid-dark-primary'
                              : 'hover:bg-liquid-light text-gray-700'
                          )}
                        >
                          <span>{language}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-liquid-dark-primary" />}
                        </div>
                      );
                    })}
                    {filteredLanguages.length === 0 && (
                      <div className="p-3 text-center text-sm text-gray-500">
                        No languages found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add Custom Language */}
            <div className="flex gap-2 mt-2">
              <LiquidInput
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Add another language"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLanguage())}
                containerClassName="flex-1"
              />
              <button
                type="button"
                onClick={addCustomLanguage}
                className="px-6 py-3 rounded-full bg-liquid-dark-primary text-white border-2 border-liquid-dark-primary shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                Add
              </button>
            </div>

            {errors.languages && <p className="text-xs font-light text-ui-error">{errors.languages}</p>}
          </div>
        </div>
      </FlowCard>
    </div>
  );
}
