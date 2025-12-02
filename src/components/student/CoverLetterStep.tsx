'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { LiquidSelect } from '@/components/ui/LiquidSelect';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { useState, useRef, useEffect } from 'react';
import { FileText, X, Search, ChevronDown, CheckCircle2, Sparkles, Lightbulb } from 'lucide-react';
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

  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [interestSearch, setInterestSearch] = useState('');
  const interestDropdownRef = useRef<HTMLDivElement>(null);

  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (interestDropdownRef.current && !interestDropdownRef.current.contains(event.target as Node)) {
        setIsInterestOpen(false);
      }
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setIsSkillOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const filteredInterests = INTEREST_OPTIONS.filter(i =>
    i.toLowerCase().includes(interestSearch.toLowerCase())
  );

  const filteredSkills = SKILL_OPTIONS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Tell Your Story
        </h2>
        <p className="text-base font-light text-gray-300 max-w-md mx-auto">
          Help travelers get to know you
        </p>
      </div>

      {/* Bio */}
      <FlowCard padding="lg">
        <div className="space-y-3">
          <label className="text-sm font-light tracking-wide text-white/90 block">
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
              'text-white placeholder:text-white/30',
              'border-0 border-b border-white/20 focus:border-b-2 focus:border-white',
              'transition-all duration-300 resize-none focus:outline-none',
              errors.bio && 'border-ui-error focus:border-ui-error'
            )}
          />
          <div className="flex justify-between text-xs font-light">
            <span className={errors.bio ? 'text-ui-error' : 'text-white/50'}>
              {errors.bio || 'Share your passion for your city'}
            </span>
            <span className="text-white/50">{formData.bio.length}/500</span>
          </div>
        </div>
      </FlowCard>

      {/* Cover Letter */}
      <FlowCard padding="lg">
        <div className="space-y-3">
          <label className="text-sm font-light tracking-wide text-white/90 block flex items-center gap-2">
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
              'text-white placeholder:text-white/30',
              'border-0 border-b border-white/20 focus:border-b-2 focus:border-white',
              'transition-all duration-300 resize-none focus:outline-none',
              errors.coverLetter && 'border-ui-error focus:border-ui-error'
            )}
          />
          <div className="flex justify-between text-xs font-light">
            <span className={errors.coverLetter ? 'text-ui-error' : 'text-white/50'}>
              {errors.coverLetter || 'This is your chance to stand out'}
            </span>
            <span className="text-white/50">{formData.coverLetter.length}/1000</span>
          </div>
        </div>
      </FlowCard>

      {/* Interests & Skills Section */}
      <FlowCard padding="lg" className={cn("transition-all duration-200", (isInterestOpen || isSkillOpen) ? "relative z-20" : "")}>
        <div className="space-y-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-white/80" />
            <h3 className="text-lg font-medium text-white">Interests & Skills</h3>
          </div>

          {/* Interests Dropdown */}
          <div className="space-y-3" ref={interestDropdownRef}>
            <label className="text-sm font-light tracking-wide text-white/90 block">
              Your Interests {errors.interests && <span className="text-ui-error ml-1">*</span>}
            </label>

            <div className="relative">
              <div
                onClick={() => setIsInterestOpen(!isInterestOpen)}
                className={cn(
                  'w-full min-h-[48px] px-0 py-3 cursor-pointer',
                  'border-0 border-b border-white/20 transition-all duration-300',
                  'flex flex-wrap gap-2 items-center',
                  isInterestOpen && 'border-b-2 border-white',
                  errors.interests && 'border-ui-error'
                )}
              >
                {formData.interests.length > 0 ? (
                  formData.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-light backdrop-blur-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleInterest(interest);
                        }}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-white/30 font-light">Select interests...</span>
                )}
                <ChevronDown
                  className={cn(
                    'ml-auto h-4 w-4 text-white/50 transition-transform duration-200',
                    isInterestOpen && 'rotate-180'
                  )}
                />
              </div>

              {isInterestOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-white/10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        placeholder="Search interests..."
                        className="w-full pl-8 pr-3 py-2 text-sm bg-white/5 text-white rounded-xl focus:outline-none placeholder:text-white/30"
                        value={interestSearch}
                        onChange={(e) => setInterestSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredInterests.map((interest) => {
                      const isSelected = formData.interests.includes(interest);
                      return (
                        <div
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-all',
                            isSelected
                              ? 'bg-white/20 font-medium text-white'
                              : 'hover:bg-white/10 text-white/80'
                          )}
                        >
                          <span>{interest}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Add Custom Interest */}
            <div className="flex gap-2 mt-2">
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
                className="px-6 py-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
              >
                Add
              </button>
            </div>
          </div>

          {/* Skills Dropdown */}
          <div className="space-y-3" ref={skillDropdownRef}>
            <label className="text-sm font-light tracking-wide text-white/90 block flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Your Skills {errors.skills && <span className="text-ui-error ml-1">*</span>}
            </label>

            <div className="relative">
              <div
                onClick={() => setIsSkillOpen(!isSkillOpen)}
                className={cn(
                  'w-full min-h-[48px] px-0 py-3 cursor-pointer',
                  'border-0 border-b border-white/20 transition-all duration-300',
                  'flex flex-wrap gap-2 items-center',
                  isSkillOpen && 'border-b-2 border-white',
                  errors.skills && 'border-ui-error'
                )}
              >
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-sm font-light backdrop-blur-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSkill(skill);
                        }}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-white/30 font-light">Select skills...</span>
                )}
                <ChevronDown
                  className={cn(
                    'ml-auto h-4 w-4 text-white/50 transition-transform duration-200',
                    isSkillOpen && 'rotate-180'
                  )}
                />
              </div>

              {isSkillOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-50 overflow-hidden animate-scale-in">
                  <div className="p-3 border-b border-white/10">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                      <input
                        type="text"
                        placeholder="Search skills..."
                        className="w-full pl-8 pr-3 py-2 text-sm bg-white/5 text-white rounded-xl focus:outline-none placeholder:text-white/30"
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {filteredSkills.map((skill) => {
                      const isSelected = formData.skills.includes(skill);
                      return (
                        <div
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={cn(
                            'flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-all',
                            isSelected
                              ? 'bg-white/20 font-medium text-white'
                              : 'hover:bg-white/10 text-white/80'
                          )}
                        >
                          <span>{skill}</span>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Add Custom Skill */}
            <div className="flex gap-2 mt-2">
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
                className="px-6 py-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </FlowCard>
    </div>
  );
}
