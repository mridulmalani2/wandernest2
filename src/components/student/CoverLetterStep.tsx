'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { OnboardingFormData } from './OnboardingWizard';

interface CoverLetterStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  city: string;
}

const PRESET_SKILLS = [
  'Photography', 'History', 'Art', 'Architecture', 'Food & Cuisine',
  'Local Culture', 'Hidden Gems', 'Walking Tours', 'Public Transport',
  'Museum Guide', 'Night Life', 'Shopping', 'Family-Friendly', 'Budget Travel'
];

const PRESET_INTERESTS = [
  'History', 'Art & Museums', 'Food & Dining', 'Architecture', 'Music',
  'Theatre & Performing Arts', 'Sports', 'Fashion', 'Photography', 'Literature',
  'Nightlife', 'Local Markets', 'Street Art', 'Parks & Gardens', 'Technology'
];

export function CoverLetterStep({ formData, updateFormData, errors, city }: CoverLetterStepProps) {
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Tell Your Story</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Share what makes you unique and why you'd be a great guide for {city || 'your city'}.
        </p>
      </div>

      {/* Bio Section */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
            ✍️
          </div>
          <h3 className="text-xl font-bold text-blue-900">Your Bio</h3>
        </div>

        <div className="space-y-4">
          <Label htmlFor="bio" className="text-base font-semibold text-gray-700">
            About You <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">
            Write a brief introduction about yourself. What do you study? What do you love about {city || 'your city'}?
          </p>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            placeholder={`Hi! I'm a ${formData.yearOfStudy || 'student'} studying ${formData.programDegree || 'at university'} in ${city || 'the city'}. I love exploring...`}
            rows={6}
            className={`text-base resize-none ${errors.bio ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
          />
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              formData.bio.length < 50
                ? 'text-gray-500'
                : formData.bio.length >= 50
                ? 'text-green-600 font-medium'
                : 'text-gray-600'
            }`}>
              {formData.bio.length} / 50 characters minimum
            </p>
            {formData.bio.length >= 50 && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Complete
              </span>
            )}
          </div>
          {errors.bio && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.bio}
            </p>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="space-y-5">
        <div>
          <Label className="text-xl font-bold text-gray-900">
            Your Guiding Skills <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600 mt-2">Select all skills that apply to you as a guide</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_SKILLS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                formData.skills.includes(skill)
                  ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Custom Skill */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            placeholder="Add a custom skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Button type="button" variant="outline" onClick={addCustomSkill} className="px-6 h-12">
            Add
          </Button>
        </div>

        {/* Selected Skills */}
        {formData.skills.length > 0 && (
          <div className="p-4 bg-white rounded-xl border-2 border-green-200">
            <p className="text-sm font-semibold mb-3 text-gray-700">
              Selected ({formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''}):
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-green-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-green-600 hover:text-green-800 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {errors.skills && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.skills}
          </p>
        )}
      </div>

      {/* Cover Letter Section */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl">
            💌
          </div>
          <h3 className="text-xl font-bold text-purple-900">Your Cover Letter</h3>
        </div>

        <div className="space-y-4">
          <Label htmlFor="coverLetter" className="text-base font-semibold text-gray-700">
            Why do you want to be a guide? <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">
            This is your chance to shine! Tell us why you'd be an amazing guide and what makes you passionate about showing tourists around {city || 'your city'}.
          </p>

          <div className="bg-white/60 border border-purple-200 rounded-xl p-4 text-sm text-purple-800">
            <p className="font-semibold mb-2">💡 Tips for a great cover letter:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Share your favorite spots in {city || 'the city'}</li>
              <li>Mention any previous experience (volunteering, helping friends, etc.)</li>
              <li>Explain what excites you about meeting people from different cultures</li>
              <li>Describe your personality and guiding style</li>
            </ul>
          </div>

          <Textarea
            id="coverLetter"
            value={formData.coverLetter}
            onChange={(e) => updateFormData({ coverLetter: e.target.value })}
            placeholder="I would love to be a guide because..."
            rows={10}
            className={`text-base resize-none ${errors.coverLetter ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
          />
          <div className="flex items-center justify-between">
            <p className={`text-sm ${
              formData.coverLetter.length < 200
                ? 'text-gray-500'
                : formData.coverLetter.length >= 200
                ? 'text-green-600 font-medium'
                : 'text-gray-600'
            }`}>
              {formData.coverLetter.length} / 200 characters minimum
            </p>
            {formData.coverLetter.length >= 200 && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Complete
              </span>
            )}
          </div>
          {errors.coverLetter && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.coverLetter}
            </p>
          )}
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-5">
        <div>
          <Label className="text-xl font-bold text-gray-900">
            Your Interests <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600 mt-2">
            What aspects of {city || 'the city'} do you enjoy most? This helps us match you with like-minded tourists.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESET_INTERESTS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                formData.interests.includes(interest)
                  ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>

        {/* Custom Interest */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Add a custom interest"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Button type="button" variant="outline" onClick={addCustomInterest} className="px-6 h-12">
            Add
          </Button>
        </div>

        {/* Selected Interests */}
        {formData.interests.length > 0 && (
          <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
            <p className="text-sm font-semibold mb-3 text-gray-700">
              Selected ({formData.interests.length} interest{formData.interests.length !== 1 ? 's' : ''}):
            </p>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium flex items-center gap-2 border border-purple-200"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="text-purple-600 hover:text-purple-800 font-bold text-lg leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {errors.interests && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.interests}
          </p>
        )}
      </div>

      {/* Encouragement */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            ⭐
          </div>
          <p className="text-sm text-green-800 leading-relaxed">
            <strong>Be yourself!</strong> Tourists appreciate authentic, passionate guides. Share what genuinely excites you about {city || 'your city'} – your enthusiasm will shine through!
          </p>
        </div>
      </div>
    </div>
  );
}
