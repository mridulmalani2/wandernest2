'use client';

import { ModernInput } from '@/components/ui/ModernInput';
import { ModernSelect } from '@/components/ui/ModernSelect';
import { OnboardingFormData } from './OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getUniversityOptionsByCity, type UniversityOption } from '@/config/universityOptions';
import { User, Calendar, Globe, Phone, Building, GraduationCap, BookOpen, Languages, Plus, X } from 'lucide-react';
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

  const campusOptions: UniversityOption[] = formData.city ? getUniversityOptionsByCity(formData.city) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Basic Profile
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Let's start with the basics. This information helps us verify your student status and match you with the right travelers.
        </p>
      </div>

      {/* Personal Details Section */}
      <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-ui-blue-primary/10 flex items-center justify-center text-ui-blue-primary">
            <User className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Personal Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <ModernInput
            label="Full Name (as on ID)"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Enter your full name"
            error={errors.name}
            icon={User}
          />

          {/* Date of Birth */}
          <ModernInput
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            error={errors.dateOfBirth}
            icon={Calendar}
          />

          {/* Gender */}
          <div className="md:col-span-2 space-y-2">
            <label className={cn("text-sm font-medium leading-none", errors.gender ? "text-ui-error" : "text-gray-700")}>
              Gender
            </label>
            <div className="grid grid-cols-3 gap-4">
              {['male', 'female', 'prefer_not_to_say'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateFormData({ gender: option as any })}
                  className={cn(
                    "flex items-center justify-center py-3 px-4 rounded-xl border-2 transition-all duration-200 font-medium text-sm",
                    formData.gender === option
                      ? "border-ui-blue-primary bg-ui-blue-primary/5 text-ui-blue-primary shadow-sm"
                      : "border-gray-200 bg-white/50 text-gray-600 hover:border-ui-blue-primary/30 hover:bg-white"
                  )}
                >
                  {option === 'prefer_not_to_say' ? 'Prefer not to say' : option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-xs text-ui-error">{errors.gender}</p>}
          </div>

          {/* Nationality */}
          <ModernInput
            label="Nationality"
            value={formData.nationality}
            onChange={(e) => updateFormData({ nationality: e.target.value })}
            placeholder="e.g., Indian, Chinese, French"
            error={errors.nationality}
            icon={Globe}
          />

          {/* Phone Number */}
          <ModernInput
            label="Phone Number"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
            placeholder="+33 6 12 34 56 78"
            error={errors.phoneNumber}
            icon={Phone}
          />

          {/* Email Address (read-only) */}
          <div className="md:col-span-2">
            <ModernInput
              label="Email Address"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-100/50 text-gray-500 border-gray-200"
            />
          </div>

          {/* City */}
          <ModernSelect
            label="Current City"
            value={formData.city}
            onValueChange={(value) => updateFormData({ city: value, campus: '' })}
            placeholder="Select your city"
            options={cities.map(city => ({ value: city, label: city }))}
            error={errors.city}
            icon={Building}
          />

          {/* Campus */}
          {formData.city && (
            <div className="space-y-2">
              <ModernSelect
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
                placeholder="Select your campus"
                options={campusOptions}
                error={errors.campus}
                icon={Building}
              />
              {formData.campus === 'other' && (
                <ModernInput
                  value={formData.institute}
                  onChange={(e) => updateFormData({ institute: e.target.value })}
                  placeholder="Enter your university name"
                  className="mt-2"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 md:p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-ui-purple-primary/10 flex items-center justify-center text-ui-purple-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Academic Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* University Name */}
          <div className="md:col-span-2">
            <ModernInput
              label="University Name"
              value={formData.institute}
              onChange={(e) => updateFormData({ institute: e.target.value })}
              placeholder="e.g., Sorbonne University"
              error={errors.institute}
              disabled={formData.campus !== 'other' && !!formData.campus}
              icon={Building}
              className={formData.campus !== 'other' && !!formData.campus ? "bg-gray-100/50" : ""}
            />
          </div>

          {/* Program/Degree */}
          <ModernInput
            label="Program/Degree"
            value={formData.programDegree}
            onChange={(e) => updateFormData({ programDegree: e.target.value })}
            placeholder="e.g., MSc Computer Science"
            error={errors.programDegree}
            icon={BookOpen}
          />

          {/* Year of Study */}
          <ModernSelect
            label="Year of Study"
            value={formData.yearOfStudy}
            onValueChange={(value) => updateFormData({ yearOfStudy: value })}
            placeholder="Select year"
            options={YEAR_OF_STUDY_OPTIONS}
            error={errors.yearOfStudy}
            icon={Calendar}
          />

          {/* Expected Graduation Year */}
          <ModernInput
            label="Expected Graduation"
            value={formData.expectedGraduation}
            onChange={(e) => updateFormData({ expectedGraduation: e.target.value })}
            placeholder="e.g., 2025"
            error={errors.expectedGraduation}
            icon={GraduationCap}
          />

          {/* Languages */}
          <div className="md:col-span-2 space-y-3">
            <label className={cn("text-sm font-medium leading-none", errors.languages ? "text-ui-error" : "text-gray-700")}>
              Languages You Speak
            </label>

            <div className="flex flex-wrap gap-2 mb-4">
              {COMMON_LANGUAGES.map((language) => {
                const isSelected = formData.languages.includes(language);
                return (
                  <button
                    key={language}
                    type="button"
                    onClick={() => toggleLanguage(language)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
                      isSelected
                        ? "bg-ui-purple-primary text-white border-ui-purple-primary shadow-md transform scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ui-purple-primary/50 hover:bg-ui-purple-primary/5"
                    )}
                  >
                    {language}
                  </button>
                );
              })}
            </div>

            {/* Custom Language Input */}
            <div className="flex gap-2 max-w-md">
              <ModernInput
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Add another language"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLanguage())}
                className="h-10"
              />
              <Button
                type="button"
                onClick={addCustomLanguage}
                className="h-10 px-4 bg-ui-purple-primary hover:bg-ui-purple-accent text-white rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Languages Summary */}
            {formData.languages.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-3">Selected Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-ui-purple-primary rounded-full text-sm font-medium shadow-sm"
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
              </div>
            )}
            {errors.languages && <p className="text-xs text-ui-error">{errors.languages}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
