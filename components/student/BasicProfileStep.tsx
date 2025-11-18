'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingFormData } from './OnboardingWizard';

interface BasicProfileStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  cities: string[];
}

export function BasicProfileStep({ formData, updateFormData, errors, cities }: BasicProfileStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Profile</h2>
        <p className="text-gray-600">Tell us about yourself so we can create your guide profile.</p>
      </div>

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

      {/* Educational Institute */}
      <div className="space-y-2">
        <Label htmlFor="institute">
          Educational Institute <span className="text-red-500">*</span>
        </Label>
        <Input
          id="institute"
          value={formData.institute}
          onChange={(e) => updateFormData({ institute: e.target.value })}
          placeholder="e.g., Sorbonne University, Imperial College London"
          className={errors.institute ? 'border-red-500' : ''}
        />
        {errors.institute && <p className="text-sm text-red-500">{errors.institute}</p>}
      </div>

      {/* City */}
      <div className="space-y-2">
        <Label htmlFor="city">
          City <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.city} onValueChange={(value) => updateFormData({ city: value })}>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Make sure your name matches your student ID card exactly, as we'll verify this in the next step.
        </p>
      </div>
    </div>
  );
}
