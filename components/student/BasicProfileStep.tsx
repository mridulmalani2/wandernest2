'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingFormData } from './OnboardingWizard';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BasicProfileStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  cities: string[];
}

const CAMPUSES = {
  Paris: ['Sorbonne University', 'Sciences Po', 'HEC Paris', 'ESSEC', 'Panthéon-Sorbonne', 'Paris-Saclay', 'Other'],
  London: ['UCL', 'Imperial College', 'LSE', 'King\'s College', 'Queen Mary', 'City University', 'Other'],
};

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

  const campusOptions = formData.city ? (CAMPUSES[formData.city as keyof typeof CAMPUSES] || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Profile</h2>
        <p className="text-gray-600">Tell us about yourself and your academic background.</p>
      </div>

      {/* Personal Details Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-3">Personal Details</h3>
        <div className="space-y-4">

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Full Name (as on ID) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Enter your full name"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            className={errors.dateOfBirth ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">You must be at least 18 years old</p>
          {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label>
            Gender <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value as any })}
          >
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
              <Label htmlFor="prefer_not_to_say" className="font-normal cursor-pointer">
                Prefer not to say
              </Label>
            </div>
          </RadioGroup>
          {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label htmlFor="nationality">
            Nationality <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => updateFormData({ nationality: e.target.value })}
            placeholder="e.g., Indian, Chinese, French"
            className={errors.nationality ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">
            This helps us match you with visitors from your home country
          </p>
          {errors.nationality && <p className="text-sm text-red-500">{errors.nationality}</p>}
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
            placeholder="+33 6 12 34 56 78"
            className={errors.phoneNumber ? 'border-red-500' : ''}
          />
          <p className="text-xs text-gray-500">Include country code</p>
          {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
        </div>

        {/* Email Address (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled
            className="bg-gray-50"
          />
          <p className="text-xs text-gray-500">Verified from your sign-in</p>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">
            Current City <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.city} onValueChange={(value) => updateFormData({ city: value, campus: '' })}>
            <SelectTrigger className={errors.city ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Where are you currently studying?
          </p>
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        {/* Campus */}
        {formData.city && (
          <div className="space-y-2">
            <Label htmlFor="campus">
              Campus <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.campus} onValueChange={(value) => {
              updateFormData({
                campus: value,
                // Sync institute field with campus selection (unless "Other" is selected)
                institute: value !== 'Other' ? value : formData.institute
              });
            }}>
              <SelectTrigger className={errors.campus ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select your campus/university" />
              </SelectTrigger>
              <SelectContent>
                {campusOptions.map((campus) => (
                  <SelectItem key={campus} value={campus}>
                    {campus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.campus === 'Other' && (
              <Input
                value={formData.institute}
                onChange={(e) => updateFormData({ institute: e.target.value })}
                placeholder="Enter your university name"
                className="mt-2"
              />
            )}
            {errors.campus && <p className="text-sm text-red-500">{errors.campus}</p>}
          </div>
        )}
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-bold text-purple-900 mb-3">Academic Details</h3>
        <div className="space-y-4">

        {/* University Name */}
        <div className="space-y-2">
          <Label htmlFor="institute">
            University Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="institute"
            value={formData.campus === 'Other' ? formData.institute : formData.campus}
            onChange={(e) => updateFormData({ institute: e.target.value })}
            placeholder="e.g., Sorbonne University, Imperial College London"
            className={errors.institute ? 'border-red-500' : ''}
            disabled={formData.campus !== 'Other' && !!formData.campus}
          />
          {errors.institute && <p className="text-sm text-red-500">{errors.institute}</p>}
        </div>

        {/* Program/Degree */}
        <div className="space-y-2">
          <Label htmlFor="programDegree">
            Program/Degree <span className="text-red-500">*</span>
          </Label>
          <Input
            id="programDegree"
            value={formData.programDegree}
            onChange={(e) => updateFormData({ programDegree: e.target.value })}
            placeholder="e.g., MSc Computer Science, BA Economics"
            className={errors.programDegree ? 'border-red-500' : ''}
          />
          {errors.programDegree && <p className="text-sm text-red-500">{errors.programDegree}</p>}
        </div>

        {/* Year of Study */}
        <div className="space-y-2">
          <Label htmlFor="yearOfStudy">
            Year of Study <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.yearOfStudy} onValueChange={(value) => updateFormData({ yearOfStudy: value })}>
            <SelectTrigger className={errors.yearOfStudy ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your year of study" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OF_STUDY_OPTIONS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.yearOfStudy && <p className="text-sm text-red-500">{errors.yearOfStudy}</p>}
        </div>

        {/* Expected Graduation Year */}
        <div className="space-y-2">
          <Label htmlFor="expectedGraduation">
            Expected Graduation Year <span className="text-red-500">*</span>
          </Label>
          <Input
            id="expectedGraduation"
            value={formData.expectedGraduation}
            onChange={(e) => updateFormData({ expectedGraduation: e.target.value })}
            placeholder="e.g., 2025, June 2026"
            className={errors.expectedGraduation ? 'border-red-500' : ''}
          />
          {errors.expectedGraduation && <p className="text-sm text-red-500">{errors.expectedGraduation}</p>}
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label>
            Languages You Speak <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">Select all languages you're comfortable guiding in</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_LANGUAGES.map((language) => (
              <button
                key={language}
                type="button"
                onClick={() => toggleLanguage(language)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  formData.languages.includes(language)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-100'
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
            />
            <Button type="button" variant="outline" onClick={addCustomLanguage}>
              Add
            </Button>
          </div>

          {/* Selected Languages */}
          {formData.languages.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Selected ({formData.languages.length}):</p>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language) => (
                  <span
                    key={language}
                    className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                  >
                    {language}
                    <button
                      type="button"
                      onClick={() => toggleLanguage(language)}
                      className="text-purple-600 hover:text-purple-800 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          {errors.languages && <p className="text-sm text-red-500">{errors.languages}</p>}
        </div>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>Note:</strong> Make sure your name matches your student ID card exactly, as we'll verify this in the next step.
        </p>
      </div>
    </div>
  );
}
