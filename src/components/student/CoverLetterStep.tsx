'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { OnboardingFormData } from './OnboardingWizard';
import { useState } from 'react';

interface CoverLetterStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  city: string;
}

const COMMON_LANGUAGES = [
  'English', 'French', 'Spanish', 'German', 'Italian', 'Portuguese',
  'Chinese (Mandarin)', 'Chinese (Cantonese)', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Bengali', 'Russian', 'Turkish'
];

const COMMON_INTERESTS = [
  'Food & Dining', 'Museums & Art', 'Architecture', 'History', 'Shopping',
  'Nightlife', 'Parks & Nature', 'Photography', 'Local Markets', 'Music',
  'Street Art', 'Cafes & Coffee', 'Wine & Bars', 'Sports', 'Fashion'
];

export function CoverLetterStep({ formData, updateFormData, errors, city }: CoverLetterStepProps) {
  const [customLanguage, setCustomLanguage] = useState('');
  const [customInterest, setCustomInterest] = useState('');

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

  const toggleInterest = (interest: string) => {
    const current = formData.interests || [];
    if (current.includes(interest)) {
      updateFormData({ interests: current.filter((i) => i !== interest) });
    } else {
      updateFormData({ interests: [...current, interest] });
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      updateFormData({ interests: [...formData.interests, customInterest.trim()] });
      setCustomInterest('');
    }
  };

  const charCount = formData.coverLetter.length;
  const minChars = 200;

  const [customSkill, setCustomSkill] = useState('');

  const toggleSkill = (skill: string) => {
    const current = formData.skills || [];
    if (current.includes(skill)) {
      updateFormData({ skills: current.filter((s) => s !== skill) });
    } else {
      updateFormData({ skills: [...current, skill] });
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      updateFormData({ skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
        <p className="text-gray-600">
          Create your guide profile to showcase your expertise and personality.
        </p>
      </div>

      {/* Guidance */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-bold text-purple-900 mb-2">What to Include:</h3>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Specific places, neighborhoods, cafés, or restaurants you'd recommend</li>
          <li>Practical advice (metro tips, tipping culture, local norms)</li>
          <li>At least one personal touch or story that makes it unique</li>
          <li>What makes you the perfect guide for someone from your country</li>
        </ul>
        <p className="text-xs text-purple-700 mt-3">
          💡 AI help is allowed, but make it personal and non-generic. Tourists want authentic recommendations!
        </p>
      </div>

      {/* Cover Letter */}
      <div className="space-y-2">
        <Label htmlFor="coverLetter">
          Cover Letter <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="coverLetter"
          value={formData.coverLetter}
          onChange={(e) => updateFormData({ coverLetter: e.target.value })}
          placeholder={`Example: "As an Indian student studying at Sorbonne, I know all the best spots in Paris for fellow Indians! I'd start with a walk through Le Marais, grab coffee at Café de Flore, then lunch at a hidden gem serving amazing Lebanese food (the closest you'll find to Indian spices!). I'll show you how to navigate the metro like a local, explain French dining etiquette, and take you to my favorite sunset spot at Sacré-Cœur. Having lived here for 2 years, I know exactly what newcomers from India need to know..."`}
          rows={12}
          className={errors.coverLetter ? 'border-red-500' : ''}
        />
        <div className="flex justify-between items-center">
          {errors.coverLetter && <p className="text-sm text-red-500">{errors.coverLetter}</p>}
          <p className={`text-xs ml-auto ${charCount < minChars ? 'text-orange-600' : 'text-green-600'}`}>
            {charCount} / {minChars} characters minimum
          </p>
        </div>
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
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => toggleLanguage(language)}
                    className="text-blue-600 hover:text-blue-800 font-bold"
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

      {/* Interests */}
      <div className="space-y-3">
        <Label>
          Your Interests & Expertise <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">What aspects of {city || 'the city'} are you most knowledgeable about?</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                formData.interests.includes(interest)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>

        {/* Custom Interest */}
        <div className="flex gap-2">
          <Input
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Add another interest"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
          />
          <Button type="button" variant="outline" onClick={addCustomInterest}>
            Add
          </Button>
        </div>

        {/* Selected Interests */}
        {formData.interests.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">Selected ({formData.interests.length}):</p>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="text-purple-600 hover:text-purple-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        {errors.interests && <p className="text-sm text-red-500">{errors.interests}</p>}
      </div>

      {/* Skills / Areas of Interest */}
      <div className="space-y-3">
        <Label>
          Skills or Areas of Interest <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">What skills or areas can you help visitors with?</p>
        <div className="flex flex-wrap gap-2">
          {COMMON_INTERESTS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                formData.skills.includes(skill)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Custom Skill */}
        <div className="flex gap-2">
          <Input
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            placeholder="Add another skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
          />
          <Button type="button" variant="outline" onClick={addCustomSkill}>
            Add
          </Button>
        </div>

        {/* Selected Skills */}
        {formData.skills.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">Selected ({formData.skills.length}):</p>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-green-600 hover:text-green-800 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        {errors.skills && <p className="text-sm text-red-500">{errors.skills}</p>}
      </div>

      {/* Preferred Guide Style */}
      <div className="space-y-2">
        <Label htmlFor="preferredGuideStyle">Preferred Guide Style</Label>
        <select
          id="preferredGuideStyle"
          value={formData.preferredGuideStyle}
          onChange={(e) => updateFormData({ preferredGuideStyle: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        >
          <option value="">Select your guide style...</option>
          <option value="friendly">Friendly & Casual</option>
          <option value="structured">Structured & Organized</option>
          <option value="energetic">Energetic & Adventurous</option>
          <option value="relaxed">Relaxed & Flexible</option>
          <option value="educational">Educational & Informative</option>
          <option value="fun">Fun & Entertaining</option>
        </select>
        <p className="text-xs text-gray-500">
          This helps tourists understand your guiding approach
        </p>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">
          Short Bio <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="bio"
          value={formData.bio}
          onChange={(e) => updateFormData({ bio: e.target.value })}
          placeholder="A brief introduction about yourself (e.g., your major, hobbies, why you love your city...)"
          rows={4}
          className={errors.bio ? 'border-red-500' : ''}
        />
        <p className="text-xs text-gray-500">This will appear on your guide profile (minimum 50 characters)</p>
        {errors.bio && <p className="text-sm text-red-500">{errors.bio}</p>}
      </div>
    </div>
  );
}
