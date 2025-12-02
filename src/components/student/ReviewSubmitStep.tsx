'use client';

import { OnboardingFormData } from './OnboardingWizard';
import { FlowCard } from '@/components/ui/FlowCard';
import { User, GraduationCap, Shield, FileText, Calendar, Briefcase, CheckCircle2 } from 'lucide-react';

interface ReviewSubmitStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ReviewSubmitStep({ formData, errors }: ReviewSubmitStepProps) {
  const calculateDuration = (start: string, end: string) => {
    const startArr = start.split(':').map(Number);
    const endArr = end.split(':').map(Number);
    const minutes = (endArr[0] * 60 + endArr[1]) - (startArr[0] * 60 + startArr[1]);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const availabilityByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    slots: formData.availability.filter((slot) => slot.dayOfWeek === index),
  })).filter((day) => day.slots.length > 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Review & Submit
        </h2>
        <p className="text-base font-light text-white/70">
          Please verify your information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal */}
        <FlowCard padding="md" variant="dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">Personal Details</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/50">Name</p>
                <p className="text-white">{formData.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Nationality</p>
                <p className="text-white">{formData.nationality}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Gender</p>
                <p className="text-white capitalize">{formData.gender.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">City</p>
                <p className="text-white">{formData.city}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-white/50 mb-1">Contact</p>
              <p className="text-white text-xs">{formData.email}</p>
              <p className="text-white text-xs">{formData.phoneNumber}</p>
            </div>
          </div>
        </FlowCard>

        {/* Academic */}
        <FlowCard padding="md" variant="dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">Academic Profile</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div>
              <p className="text-xs text-white/50">University</p>
              <p className="text-white">{formData.institute}</p>
              <p className="text-xs text-white/70">{formData.campus}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/50">Program</p>
                <p className="text-white text-xs">{formData.programDegree}</p>
              </div>
              <div>
                <p className="text-xs text-white/50">Year</p>
                <p className="text-white text-xs">{formData.yearOfStudy}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-2">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {formData.languages.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-white/10 text-white rounded-full text-xs border border-white/10">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FlowCard>

        {/* Profile Content */}
        <FlowCard padding="md" className="md:col-span-2" variant="dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">Profile Content</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-light">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/50 mb-1">Bio</p>
                <div className="bg-white/5 p-3 rounded-2xl text-xs max-h-24 overflow-y-auto text-white/90 border border-white/10">
                  {formData.bio}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.interests.map((interest) => (
                    <span key={interest} className="px-2 py-0.5 bg-white/10 text-white rounded-full text-xs border border-white/10">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/50 mb-1">Cover Letter</p>
                <div className="bg-white/5 p-3 rounded-2xl text-xs max-h-24 overflow-y-auto text-white/90 border border-white/10">
                  {formData.coverLetter}
                </div>
              </div>
              <div>
                <p className="text-xs text-white/50 mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-white/10 text-white rounded-full text-xs border border-white/10">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FlowCard>

        {/* Service */}
        <FlowCard padding="md" variant="dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">Service Details</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/10">
              <span className="text-white/70">Hourly Rate</span>
              <span className="text-xl font-medium text-white">€{formData.hourlyRate}</span>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-2">Services Offered</p>
              {formData.servicesOffered.map((service) => (
                <div key={service} className="flex items-center gap-2 text-xs mb-1 text-white/90">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                  <span className="capitalize">{service.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-white/50">Online Services</p>
              <p className="text-white">{formData.onlineServicesAvailable ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
        </FlowCard>

        {/* Availability */}
        <FlowCard padding="md" variant="dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">Availability</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div className="flex justify-between text-xs text-white/50">
              <span>Timezone: {formData.timezone}</span>
              <span>{formData.availability.length} Slots</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availabilityByDay.map((dayData) => (
                <div key={dayData.day} className="bg-white/5 rounded-2xl p-2 border border-white/10">
                  <p className="font-medium text-white text-xs mb-1">{dayData.day}</p>
                  <div className="space-y-0.5">
                    {dayData.slots.map((slot, index) => (
                      <div key={index} className="flex justify-between text-xs"> <span className="text-white/80">{slot.startTime} - {slot.endTime}</span>
                        <span className="text-white/50">{calculateDuration(slot.startTime, slot.endTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FlowCard>

        {/* Verification */}
        <FlowCard padding="md" className="md:col-span-2" variant="dark">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-medium text-white">Verification & Compliance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs">
                <p className="font-medium text-white">Documents</p>
                <p className="text-white/50">ID, Student Card, Photo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
              <div className="text-xs">
                <p className="font-medium text-white">Terms Accepted</p>
                <p className="text-white/50">Platform Policies</p>
              </div>
            </div>
            {formData.emergencyContactName && (
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="text-xs">
                  <p className="font-medium text-white">Emergency Contact</p>
                  <p className="text-white/50">Provided</p>
                </div>
              </div>
            )}
          </div>
        </FlowCard>
      </div>

      {errors.submit && (
        <div className="bg-ui-error/10 border border-ui-error/20 rounded-2xl p-4 flex items-center gap-3 text-ui-error">
          <Shield className="h-5 w-5 shrink-0" />
          <p className="text-sm font-light">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}
