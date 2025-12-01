'use client';

import { OnboardingFormData } from './OnboardingWizard';
import { ModernCard } from '@/components/ui/ModernCard';
import { User, GraduationCap, Shield, FileText, Calendar, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Review & Submit
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Please verify your information before submitting your application.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <User className="h-5 w-5" />
            </div>
            Personal Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Full Name</p>
                <p className="font-medium text-gray-900">{formData.name}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Nationality</p>
                <p className="font-medium text-gray-900">{formData.nationality}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Gender</p>
                <p className="font-medium text-gray-900 capitalize">{formData.gender.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">City</p>
                <p className="font-medium text-gray-900">{formData.city}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Contact</p>
              <p className="font-medium text-gray-900">{formData.email}</p>
              <p className="font-medium text-gray-900">{formData.phoneNumber}</p>
            </div>
          </div>
        </ModernCard>

        {/* Academic Details */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            Academic Profile
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">University</p>
              <p className="font-medium text-gray-900">{formData.institute}</p>
              <p className="text-gray-600">{formData.campus}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Program</p>
                <p className="font-medium text-gray-900">{formData.programDegree}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Year</p>
                <p className="font-medium text-gray-900">{formData.yearOfStudy}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang) => (
                  <span key={lang} className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-100">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Profile Content */}
        <ModernCard className="p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <FileText className="h-5 w-5" />
            </div>
            Profile Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Bio</p>
                <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700 border border-gray-100 max-h-32 overflow-y-auto">
                  {formData.bio}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest) => (
                    <span key={interest} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium border border-orange-100">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Cover Letter</p>
                <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-700 border border-gray-100 max-h-32 overflow-y-auto">
                  {formData.coverLetter}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ModernCard>

        {/* Service & Availability */}
        <ModernCard className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
              <Briefcase className="h-5 w-5" />
            </div>
            Service Details
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl border border-green-100">
              <span className="font-medium text-green-900">Hourly Rate</span>
              <span className="text-lg font-bold text-green-700">€{formData.hourlyRate}</span>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-2">Services Offered</p>
              <div className="space-y-2">
                {formData.servicesOffered.map((service) => (
                  <div key={service} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="capitalize">{service.replace('-', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-2">
              <p className="text-gray-500 text-xs uppercase tracking-wider font-medium mb-1">Online Services</p>
              <p className="font-medium text-gray-900">
                {formData.onlineServicesAvailable ? 'Available' : 'Not Available'}
              </p>
            </div>
          </div>
        </ModernCard>

        <ModernCard className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
              <Calendar className="h-5 w-5" />
            </div>
            Availability
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Timezone: {formData.timezone}</span>
              <span>{formData.availability.length} Slots</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {availabilityByDay.map((dayData) => (
                <div key={dayData.day} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="font-bold text-gray-900 text-xs uppercase mb-2">{dayData.day}</p>
                  <div className="space-y-1">
                    {dayData.slots.map((slot, index) => (
                      <div key={index} className="flex justify-between text-gray-700 text-xs">
                        <span>{slot.startTime} - {slot.endTime}</span>
                        <span className="text-gray-500">{calculateDuration(slot.startTime, slot.endTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModernCard>

        {/* Verification Status */}
        <ModernCard className="p-6 md:col-span-2 bg-gradient-to-br from-gray-50 to-white">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="bg-gray-200 p-2 rounded-lg text-gray-700">
              <Shield className="h-5 w-5" />
            </div>
            Verification & Compliance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Documents Uploaded</p>
                <p className="text-xs text-gray-500">ID, Student Card, Photo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Terms Accepted</p>
                <p className="text-xs text-gray-500">Platform Policies</p>
              </div>
            </div>
            {formData.emergencyContactName && (
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">Emergency Contact</p>
                  <p className="text-xs text-gray-500">Provided</p>
                </div>
              </div>
            )}
          </div>
        </ModernCard>
      </div>

      {/* Final Submit Error */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 animate-scale-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">{errors.submit}</p>
        </div>
      )}
    </div>
  );
}
