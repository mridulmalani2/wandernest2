'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { LiquidSelect } from '@/components/ui/LiquidSelect';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { useState } from 'react';
import { getUniversityOptionsByCity, type UniversityOption } from '@/config/universityOptions';
import { User, Calendar, Globe, Phone, Building, GraduationCap, BookOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const campusOptions: UniversityOption[] = formData.city ? getUniversityOptionsByCity(formData.city) : [];

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
                    'border-2 hover:shadow-md',
                    formData.gender === option
                      ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-liquid-dark-primary/50'
                  )}
                >
                  {option === 'prefer_not_to_say' ? 'Prefer not to say' : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-xs font-light text-ui-error">{errors.gender}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidInput
              label="Nationality"
              value={formData.nationality}
              onChange={(e) => updateFormData({ nationality: e.target.value })}
              placeholder="e.g., Indian, French"
              error={errors.nationality}
              icon={Globe}
            />

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

          {/* Languages - Pills */}
          <div className="space-y-4">
            <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
              Languages You Speak {errors.languages && <span className="text-ui-error ml-1">*</span>}
            </label>

            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map((language) => {
                const isSelected = formData.languages.includes(language);
                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleLanguage(language)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      'border hover:shadow-sm',
                      isSelected
                        ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary'
                        : 'bg-white/60 text-gray-600 border-gray-200 hover:border-liquid-dark-primary/30'
                    )}
                  >
                    {language}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Language */}
            <div className="flex gap-2">
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
                className="px-6 py-3 rounded-full bg-liquid-dark-primary text-white hover:shadow-md transition-all duration-300"
              >
                Add
              </button>
            </div>

            {/* Selected Languages */}
            {formData.languages.length > 0 && (
              <FlowCard padding="sm" variant="subtle">
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-liquid-dark-primary rounded-full text-sm"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className="text-gray-400 hover:text-ui-error transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </FlowCard>
            )}
            {errors.languages && <p className="text-xs font-light text-ui-error">{errors.languages}</p>}
          </div>
        </div>
      </FlowCard>
    </div>
  );
}
