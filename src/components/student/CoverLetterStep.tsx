'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { LiquidSelect } from '@/components/ui/LiquidSelect';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { useState } from 'react';
import { FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverLetterStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const INTEREST_OPTIONS = [
  'Art & Museums', 'Food & Dining', 'History', 'Photography', 'Nightlife',
  'Nature & Parks', 'Shopping', 'Sports', 'Architecture', 'Music & Concerts'
];

const SKILL_OPTIONS = [
  'Local Knowledge', 'Photography', 'Language Teaching', 'Cultural Insight',
  'Event Planning', 'Food Tours', 'Navigation', 'Public Speaking', 'First Aid'
];

export function CoverLetterStep({ formData, updateFormData, errors }: CoverLetterStepProps) {
  const [customInterest, setCustomInterest] = useState('');
  const [customSkill, setCustomSkill] = useState('');

  const toggleInterest = (interest: string) => {
    const current = formData.interests || [];
    updateFormData({
      interests: current.includes(interest)
        ? current.filter((i) => i !== interest)
        : [...current, interest]
    });
  };

  const toggleSkill = (skill: string) => {
    const current = formData.skills || [];
    updateFormData({
      skills: current.includes(skill)
        ? current.filter((s) => s !== skill)
        : [...current, skill]
    });
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      updateFormData({ interests: [...formData.interests, customInterest.trim()] });
      setCustomInterest('');
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      updateFormData({ skills: [...formData.skills, customSkill.trim()] });
      setCustomSkill('');
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-liquid-dark-primary">
          Tell Your Story
        </h2>
        <p className="text-base font-light text-gray-500 max-w-md mx-auto">
          Help travelers get to know you
        </p>
      </div>

      {/* Bio */}
      <FlowCard padding="lg">
        <div className="space-y-3">
          <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
            Bio {errors.bio && <span className="text-ui-error ml-1">*</span>}
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => updateFormData({ bio: e.target.value })}
            rows={4}
            maxLength={500}
            placeholder="Tell us about yourself, your city, and why you'd make a great guide..."
            className={cn(
              'w-full bg-transparent px-0 py-2 text-base font-light',
              'text-liquid-dark-primary placeholder:text-gray-400',
              'border-0 border-b border-gray-300 focus:border-b-2 focus:border-liquid-dark-primary',
              'transition-all duration-300 resize-none focus:outline-none',
              errors.bio && 'border-ui-error focus:border-ui-error'
            )}
          />
          <div className="flex justify-between text-xs font-light">
            <span className={errors.bio ? 'text-ui-error' : 'text-gray-500'}>
              {errors.bio || 'Share your passion for your city'}
            </span>
            <span className="text-gray-400">{formData.bio.length}/500</span>
          </div>
        </div>
      </FlowCard>

      {/* Cover Letter */}
      <FlowCard padding="lg">
        <div className="space-y-3">
          <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Cover Letter {errors.coverLetter && <span className="text-ui-error ml-1">*</span>}
          </label>
          <textarea
            value={formData.coverLetter}
            onChange={(e) => updateFormData({ coverLetter: e.target.value })}
            rows={6}
            maxLength={1000}
            placeholder="Why do you want to be a student guide? What makes you unique? What experiences can you offer?"
            className={cn(
              'w-full bg-transparent px-0 py-2 text-base font-light',
              'text-liquid-dark-primary placeholder:text-gray-400',
              'border-0 border-b border-gray-300 focus:border-b-2 focus:border-liquid-dark-primary',
              'transition-all duration-300 resize-none focus:outline-none',
              errors.coverLetter && 'border-ui-error focus:border-ui-error'
            )}
          />
          <div className="flex justify-between text-xs font-light">
            <span className={errors.coverLetter ? 'text-ui-error' : 'text-gray-500'}>
              {errors.coverLetter || 'This is your chance to stand out'}
            </span>
            <span className="text-gray-400">{formData.coverLetter.length}/1000</span>
          </div>
        </div>
      </FlowCard>

      {/* Interests */}
      <div className="space-y-4">
        <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
          Your Interests {errors.interests && <span className="text-ui-error ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const isSelected = formData.interests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  'border hover:shadow-sm',
                  isSelected
                    ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary'
                    : 'bg-gray-100 text-gray-800 border-gray-400 hover:border-liquid-dark-primary hover:bg-gray-50'
                )}
              >
                {interest}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <LiquidInput
            value={customInterest}
            onChange={(e) => setCustomInterest(e.target.value)}
            placeholder="Add custom interest"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
            containerClassName="flex-1"
          />
          <button
            type="button"
            onClick={addCustomInterest}
            className="px-6 py-3 rounded-full bg-liquid-dark-primary text-white hover:shadow-md transition-all duration-300"
          >
            Add
          </button>
        </div>

        {formData.interests.length > 0 && (
          <FlowCard padding="sm" variant="subtle">
            <div className="flex flex-wrap gap-2">
              {formData.interests.filter(i => !INTEREST_OPTIONS.includes(i)).map((interest) => (
                <span
                  key={interest}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-liquid-dark-primary rounded-full text-sm"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className="text-gray-400 hover:text-ui-error transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </FlowCard>
        )}
        {errors.interests && <p className="text-xs font-light text-ui-error">{errors.interests}</p>}
      </div>

      {/* Skills */}
      <div className="space-y-4">
        <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
          Your Skills {errors.skills && <span className="text-ui-error ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => {
            const isSelected = formData.skills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  'border hover:shadow-sm',
                  isSelected
                    ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary'
                    : 'bg-gray-100 text-gray-800 border-gray-400 hover:border-liquid-dark-primary hover:bg-gray-50'
                )}
              >
                {skill}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <LiquidInput
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            placeholder="Add custom skill"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
            containerClassName="flex-1"
          />
          <button
            type="button"
            onClick={addCustomSkill}
            className="px-6 py-3 rounded-full bg-liquid-dark-primary text-white hover:shadow-md transition-all duration-300"
          >
            Add
          </button>
        </div>

        {formData.skills.length > 0 && (
          <FlowCard padding="sm" variant="subtle">
            <div className="flex flex-wrap gap-2">
              {formData.skills.filter(s => !SKILL_OPTIONS.includes(s)).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-liquid-dark-primary rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className="text-gray-400 hover:text-ui-error transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </FlowCard>
        )}
        {errors.skills && <p className="text-xs font-light text-ui-error">{errors.skills}</p>}
      </div>
    </div>
  );
}
