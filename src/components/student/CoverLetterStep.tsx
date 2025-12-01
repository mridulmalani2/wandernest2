'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ModernInput } from '@/components/ui/ModernInput';
import { ModernSelect } from '@/components/ui/ModernSelect';
import { Button } from '@/components/ui/button';
import { OnboardingFormData } from './OnboardingWizard';
import { useState } from 'react';
import { Plus, X, Lightbulb, PenTool, Sparkles, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoverLetterStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
  city: string;
}

const COMMON_INTERESTS = [
  'Food & Dining', 'Museums & Art', 'Architecture', 'History', 'Shopping',
  'Nightlife', 'Parks & Nature', 'Photography', 'Local Markets', 'Music',
  'Street Art', 'Cafes & Coffee', 'Wine & Bars', 'Sports', 'Fashion'
];

export function CoverLetterStep({ formData, updateFormData, errors, city }: CoverLetterStepProps) {
  const [customInterest, setCustomInterest] = useState('');
  const [customSkill, setCustomSkill] = useState('');

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

  const charCount = formData.coverLetter.length;
  const minChars = 200;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Profile Information
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Create your guide profile to showcase your expertise and personality to potential tourists.
        </p>
      </div>

      {/* Guidance */}
      <div className="bg-ui-purple-primary/5 border border-ui-purple-primary/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-white rounded-xl shadow-sm text-ui-purple-primary shrink-0">
          <Lightbulb className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-2">What makes a great profile?</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
            <li>Mention specific places, neighborhoods, or hidden gems you love</li>
            <li>Share practical advice (metro tips, local norms)</li>
            <li>Add a personal story that makes you unique</li>
            <li>Explain why you're the perfect guide for someone from your country</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Bio Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-ui-blue-primary/10 flex items-center justify-center text-ui-blue-primary">
              <User className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-gray-800">Short Bio</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="sr-only">Short Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => updateFormData({ bio: e.target.value })}
              placeholder="Hi! I'm a computer science student who loves jazz clubs and vintage shopping..."
              rows={3}
              className={cn(
                "rounded-xl border-2 bg-white/50 resize-none focus-visible:ring-ui-blue-primary",
                errors.bio ? "border-ui-error" : "border-gray-200 hover:border-ui-blue-primary/50"
              )}
            />
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>Minimum 50 characters</span>
              <span className={formData.bio.length < 50 ? "text-ui-warning" : "text-ui-success"}>
                {formData.bio.length} chars
              </span>
            </div>
            {errors.bio && <p className="text-sm text-ui-error animate-slide-down">{errors.bio}</p>}
          </div>
        </div>

        {/* Cover Letter Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-ui-purple-primary/10 flex items-center justify-center text-ui-purple-primary">
              <PenTool className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-gray-800">Cover Letter</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="sr-only">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) => updateFormData({ coverLetter: e.target.value })}
              placeholder={`Example: "As an Indian student studying at Sorbonne, I know all the best spots in Paris for fellow Indians! I'd start with a walk through Le Marais, grab coffee at Café de Flore, then lunch at a hidden gem serving amazing Lebanese food..."`}
              rows={10}
              className={cn(
                "rounded-xl border-2 bg-white/50 resize-y min-h-[200px] focus-visible:ring-ui-purple-primary",
                errors.coverLetter ? "border-ui-error" : "border-gray-200 hover:border-ui-purple-primary/50"
              )}
            />
            <div className="flex justify-between items-center px-1">
              {errors.coverLetter ? (
                <p className="text-sm text-ui-error animate-slide-down">{errors.coverLetter}</p>
              ) : (
                <span className="text-xs text-gray-500">Make it personal and authentic!</span>
              )}
              <p className={`text-xs font-medium ${charCount < minChars ? 'text-ui-warning' : 'text-ui-success'}`}>
                {charCount} / {minChars} chars
              </p>
            </div>
          </div>
        </div>

        {/* Interests & Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interests */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                <MapPin className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-800">City Expertise</h3>
            </div>

            <p className="text-sm text-gray-600">What do you know best about {city || 'the city'}?</p>

            <div className="flex flex-wrap gap-2">
              {COMMON_INTERESTS.map((interest) => {
                const isSelected = formData.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                      isSelected
                        ? "bg-pink-500 text-white border-pink-500 shadow-sm transform scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                    )}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <ModernInput
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add custom interest"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomInterest())}
                className="h-9 text-sm"
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                size="sm"
                className="h-9 px-3 bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {errors.interests && <p className="text-xs text-ui-error">{errors.interests}</p>}
          </div>

          {/* Skills */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-800">Skills</h3>
            </div>

            <p className="text-sm text-gray-600">What specific skills can you offer?</p>

            <div className="flex flex-wrap gap-2">
              {['Photography', 'Translation', 'History Buff', 'Foodie', 'Shopping Guide', 'Nightlife Expert'].map((skill) => {
                const isSelected = formData.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                      isSelected
                        ? "bg-teal-500 text-white border-teal-500 shadow-sm transform scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                    )}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <ModernInput
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom skill"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
                className="h-9 text-sm"
              />
              <Button
                type="button"
                onClick={addCustomSkill}
                size="sm"
                className="h-9 px-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {errors.skills && <p className="text-xs text-ui-error">{errors.skills}</p>}
          </div>
        </div>

        {/* Guide Style */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
          <ModernSelect
            label="Preferred Guide Style"
            value={formData.preferredGuideStyle}
            onValueChange={(value) => updateFormData({ preferredGuideStyle: value })}
            placeholder="Select your guide style..."
            options={[
              { value: 'friendly', label: 'Friendly & Casual' },
              { value: 'structured', label: 'Structured & Organized' },
              { value: 'energetic', label: 'Energetic & Adventurous' },
              { value: 'relaxed', label: 'Relaxed & Flexible' },
              { value: 'educational', label: 'Educational & Informative' },
              { value: 'fun', label: 'Fun & Entertaining' }
            ]}
            icon={Sparkles}
          />
        </div>
      </div>
    </div>
  );
}
