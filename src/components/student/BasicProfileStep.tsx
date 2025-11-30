'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingFormData } from './OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { getUniversityOptionsByCity, type UniversityOption } from '@/config/universityOptions';

interface BasicProfileStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  cities: string[];
}

const YEAR_OF_STUDY_OPTIONS = [
  '1st year Undergrad',
  '2nd year Undergrad',
  '3rd year Undergrad',
  '4th year Undergrad',
  '1st year MSc',
  '2nd year MSc',
  'PhD 1st year',
  'PhD 2nd year',
  'PhD 3rd year+',
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Basic Profile</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Tell us about yourself and your academic background.
        </p>
      </div>

      {/* Personal Details Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
            👤
          </div>
          <h3 className="text-xl font-bold text-blue-900">Personal Details</h3>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold text-gray-700">
              Full Name (as on ID) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
              placeholder="Enter your full name"
              className={`text-base h-12 ${errors.name ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Date of Birth and Gender - 2 column on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-base font-semibold text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={`text-base h-12 ${errors.dateOfBirth ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
              />
              <p className="text-sm text-gray-500">You must be at least 18 years old</p>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-700">
                Gender <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.gender}
                onValueChange={(value) => updateFormData({ gender: value as any })}
                className="flex flex-col gap-3 mt-3"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/60 transition-colors">
                  <RadioGroupItem value="male" id="male" className="h-5 w-5" />
                  <Label htmlFor="male" className="font-medium cursor-pointer text-base flex-1">
                    Male
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/60 transition-colors">
                  <RadioGroupItem value="female" id="female" className="h-5 w-5" />
                  <Label htmlFor="female" className="font-medium cursor-pointer text-base flex-1">
                    Female
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/60 transition-colors">
                  <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" className="h-5 w-5" />
                  <Label htmlFor="prefer_not_to_say" className="font-medium cursor-pointer text-base flex-1">
                    Prefer not to say
                  </Label>
                </div>
              </RadioGroup>
              {errors.gender && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.gender}
                </p>
              )}
            </div>
          </div>

          {/* Nationality and Phone - 2 column on larger screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nationality" className="text-base font-semibold text-gray-700">
                Nationality <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => updateFormData({ nationality: e.target.value })}
                placeholder="e.g., Indian, Chinese, French"
                className={`text-base h-12 ${errors.nationality ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
              />
              <p className="text-sm text-gray-500">
                This helps us match you with visitors from your home country
              </p>
              {errors.nationality && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.nationality}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-base font-semibold text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className={`text-base h-12 ${errors.phoneNumber ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
              />
              <p className="text-sm text-gray-500">Include country code</p>
              {errors.phoneNumber && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Email Address (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-semibold text-gray-700">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              disabled
              className="bg-gray-100 text-base h-12 cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified from your sign-in
            </p>
          </div>

          {/* City and Campus */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city" className="text-base font-semibold text-gray-700">
                Current City <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.city} onValueChange={(value) => updateFormData({ city: value, campus: '' })}>
                <SelectTrigger className={`text-base h-12 ${errors.city ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}>
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city} className="text-base">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Where are you currently studying?
              </p>
              {errors.city && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.city}
                </p>
              )}
            </div>

            {formData.city && (
              <div className="space-y-2">
                <Label htmlFor="campus" className="text-base font-semibold text-gray-700">
                  Campus <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.campus} onValueChange={(value) => {
                  const selectedOption = campusOptions.find(opt => opt.value === value);
                  const label = selectedOption?.label || value;
                  updateFormData({
                    campus: value,
                    institute: value !== 'other' ? label : formData.institute
                  });
                }}>
                  <SelectTrigger className={`text-base h-12 ${errors.campus ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}>
                    <SelectValue placeholder="Select your campus/university" />
                  </SelectTrigger>
                  <SelectContent>
                    {campusOptions.map((campus) => (
                      <SelectItem key={campus.value} value={campus.value} className="text-base">
                        {campus.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.campus === 'other' && (
                  <Input
                    value={formData.institute}
                    onChange={(e) => updateFormData({ institute: e.target.value })}
                    placeholder="Enter your university name"
                    className="mt-2 text-base h-12"
                  />
                )}
                {errors.campus && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.campus}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl">
            🎓
          </div>
          <h3 className="text-xl font-bold text-purple-900">Academic Details</h3>
        </div>

        <div className="space-y-6">
          {/* University Name */}
          <div className="space-y-2">
            <Label htmlFor="institute" className="text-base font-semibold text-gray-700">
              University Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="institute"
              value={formData.institute}
              onChange={(e) => updateFormData({ institute: e.target.value })}
              placeholder="e.g., Sorbonne University, Imperial College London"
              className={`text-base h-12 ${errors.institute ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
              disabled={formData.campus !== 'other' && !!formData.campus}
            />
            <p className="text-sm text-gray-500">
              {formData.campus && formData.campus !== 'other'
                ? '✓ Auto-filled from your campus selection'
                : 'This will be used in your profile'}
            </p>
            {errors.institute && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.institute}
              </p>
            )}
          </div>

          {/* Program and Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="programDegree" className="text-base font-semibold text-gray-700">
                Program/Degree <span className="text-red-500">*</span>
              </Label>
              <Input
                id="programDegree"
                value={formData.programDegree}
                onChange={(e) => updateFormData({ programDegree: e.target.value })}
                placeholder="e.g., MSc Computer Science, BA Economics"
                className={`text-base h-12 ${errors.programDegree ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
              />
              {errors.programDegree && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.programDegree}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearOfStudy" className="text-base font-semibold text-gray-700">
                Year of Study <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.yearOfStudy} onValueChange={(value) => updateFormData({ yearOfStudy: value })}>
                <SelectTrigger className={`text-base h-12 ${errors.yearOfStudy ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}>
                  <SelectValue placeholder="Select your year of study" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_OF_STUDY_OPTIONS.map((year) => (
                    <SelectItem key={year} value={year} className="text-base">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.yearOfStudy && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.yearOfStudy}
                </p>
              )}
            </div>
          </div>

          {/* Expected Graduation Year */}
          <div className="space-y-2">
            <Label htmlFor="expectedGraduation" className="text-base font-semibold text-gray-700">
              Expected Graduation Year <span className="text-red-500">*</span>
            </Label>
            <Input
              id="expectedGraduation"
              value={formData.expectedGraduation}
              onChange={(e) => updateFormData({ expectedGraduation: e.target.value })}
              placeholder="e.g., 2025, June 2026"
              className={`text-base h-12 ${errors.expectedGraduation ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
            />
            {errors.expectedGraduation && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.expectedGraduation}
              </p>
            )}
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-700">
              Languages You Speak <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-600">Select all languages you're comfortable guiding in</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => toggleLanguage(language)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    formData.languages.includes(language)
                      ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700 scale-100'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>

            {/* Custom Language */}
            <div className="flex gap-2">
              <Input
                value={customLanguage}
                onChange={(e) => setCustomLanguage(e.target.value)}
                placeholder="Add another language"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomLanguage())}
                className="text-base h-12"
              />
              <Button type="button" variant="outline" onClick={addCustomLanguage} className="px-6 h-12">
                Add
              </Button>
            </div>

            {/* Selected Languages */}
            {formData.languages.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-xl border-2 border-purple-200">
                <p className="text-sm font-semibold mb-3 text-gray-700">
                  Selected ({formData.languages.length} language{formData.languages.length !== 1 ? 's' : ''}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.languages.map((language) => (
                    <span
                      key={language}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-purple-200"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => toggleLanguage(language)}
                        className="text-purple-600 hover:text-purple-800 font-bold text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errors.languages && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.languages}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Important Note */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
            ✓
          </div>
          <p className="text-sm text-green-800 leading-relaxed">
            <strong>Important:</strong> Make sure your name matches your student ID card exactly, as we'll verify this in the next step.
          </p>
        </div>
      </div>
    </div>
  );
}
