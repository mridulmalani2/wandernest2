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
        <h2 className="text-4xl font-light tracking-tight text-liquid-dark-primary">
          Review & Submit
        </h2>
        <p className="text-base font-light text-gray-500">
          Please verify your information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal */}
        <FlowCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-liquid-dark-primary" />
            </div>
            <h3 className="text-sm font-medium text-liquid-dark-primary">Personal Details</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-liquid-dark-primary">{formData.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nationality</p>
                <p className="text-liquid-dark-primary">{formData.nationality}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gender</p>
                <p className="text-liquid-dark-primary capitalize">{formData.gender.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">City</p>
                <p className="text-liquid-dark-primary">{formData.city}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Contact</p>
              <p className="text-liquid-dark-primary text-xs">{formData.email}</p>
              <p className="text-liquid-dark-primary text-xs">{formData.phoneNumber}</p>
            </div>
          </div>
        </FlowCard>

        {/* Academic */}
        <FlowCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-liquid-dark-primary" />
            </div>
            <h3 className="text-sm font-medium text-liquid-dark-primary">Academic Profile</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div>
              <p className="text-xs text-gray-500">University</p>
              <p className="text-liquid-dark-primary">{formData.institute}</p>
              <p className="text-xs text-gray-600">{formData.campus}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Program</p>
                <p className="text-liquid-dark-primary text-xs">{formData.programDegree}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Year</p>
                <p className="text-liquid-dark-primary text-xs">{formData.yearOfStudy}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Languages</p>
              <div className="flex flex-wrap gap-1.5">
                {formData.languages.map((lang) => (
                  <span key={lang} className="px-2 py-0.5 bg-liquid-dark-primary/5 text-liquid-dark-primary rounded-full text-xs">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FlowCard>

        {/* Profile Content */}
        <FlowCard padding="md" className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-liquid-dark-primary" />
            </div>
            <h3 className="text-sm font-medium text-liquid-dark-primary">Profile Content</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-light">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Bio</p>
                <div className="bg-liquid-light/50 p-3 rounded-2xl text-xs max-h-24 overflow-y-auto">
                  {formData.bio}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.interests.map((interest) => (
                    <span key={interest} className="px-2 py-0.5 bg-liquid-dark-primary/5 text-liquid-dark-primary rounded-full text-xs">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                <div className="bg-liquid-light/50 p-3 rounded-2xl text-xs max-h-24 overflow-y-auto">
                  {formData.coverLetter}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="px-2 py-0.5 bg-liquid-dark-primary/5 text-liquid-dark-primary rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </FlowCard>

        {/* Service */}
        <FlowCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-liquid-dark-primary" />
            </div>
            <h3 className="text-sm font-medium text-liquid-dark-primary">Service Details</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div className="flex justify-between items-center bg-liquid-light p-3 rounded-2xl">
              <span className="text-gray-600">Hourly Rate</span>
              <span className="text-xl font-medium text-liquid-dark-primary">€{formData.hourlyRate}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Services Offered</p>
              {formData.servicesOffered.map((service) => (
                <div key={service} className="flex items-center gap-2 text-xs mb-1">
                  <CheckCircle2 className="h-3 w-3 text-liquid-dark-primary" />
                  <span className="capitalize">{service.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">Online Services</p>
              <p className="text-liquid-dark-primary">{formData.onlineServicesAvailable ? 'Available' : 'Not Available'}</p>
            </div>
          </div>
        </FlowCard>

        {/* Availability */}
        <FlowCard padding="md">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-liquid-dark-primary" />
            </div>
            <h3 className="text-sm font-medium text-liquid-dark-primary">Availability</h3>
          </div>
          <div className="space-y-3 text-sm font-light">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Timezone: {formData.timezone}</span>
              <span>{formData.availability.length} Slots</span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availabilityByDay.map((dayData) => (
                <div key={dayData.day} className="bg-liquid-light rounded-2xl p-2 border border-gray-100">
                  <p className="font-medium text-liquid-dark-primary text-xs mb-1">{dayData.day}</p>
                  <div className="space-y-0.5">
                    {dayData.slots.map((slot, index) => (
                      <div key={index} className="flex justify-between text-xs"> <span className="text-gray-600">{slot.startTime} - {slot.endTime}</span>
                        <span className="text-gray-400">{calculateDuration(slot.startTime, slot.endTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FlowCard>

        {/* Verification */}
        <FlowCard padding="md" className="md:col-span-2" variant="subtle">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-liquid-dark-primary" />
            </div>
            <h3 className="text-sm font-medium text-liquid-dark-primary">Verification & Compliance</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
              <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-liquid-dark-primary" />
              </div>
              <div className="text-xs">
                <p className="font-medium text-liquid-dark-primary">Documents</p>
                <p className="text-gray-500">ID, Student Card, Photo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
              <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4 text-liquid-dark-primary" />
              </div>
              <div className="text-xs">
                <p className="font-medium text-liquid-dark-primary">Terms Accepted</p>
                <p className="text-gray-500">Platform Policies</p>
              </div>
            </div>
            {formData.emergencyContactName && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100">
                <div className="h-8 w-8 rounded-full bg-liquid-dark-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-liquid-dark-primary" />
                </div>
                <div className="text-xs">
                  <p className="font-medium text-liquid-dark-primary">Emergency Contact</p>
                  <p className="text-gray-500">Provided</p>
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
