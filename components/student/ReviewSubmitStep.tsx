'use client';

import { OnboardingFormData } from './OnboardingWizard';

interface ReviewSubmitStepProps {
  formData: OnboardingFormData;
  errors: Record<string, string>;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ReviewSubmitStep({ formData, errors }: ReviewSubmitStepProps) {
  const getDayLabel = (dayValue: number) => DAYS_OF_WEEK[dayValue];

  const calculateDuration = (start: string, end: string) => {
    const startArr = start.split(':').map(Number);
    const endArr = end.split(':').map(Number);
    const minutes = (endArr[0] * 60 + endArr[1]) - (startArr[0] * 60 + startArr[1]);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Group availability by day
  const availabilityByDay = DAYS_OF_WEEK.map((day, index) => ({
    day,
    slots: formData.availability.filter((slot) => slot.dayOfWeek === index),
  })).filter((day) => day.slots.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review & Submit</h2>
        <p className="text-gray-600">
          Please review all your information before submitting. You can go back to edit any section.
        </p>
      </div>

      {/* Basic Profile */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-blue-900">📋 Basic Profile</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Name</p>
            <p className="font-medium">{formData.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Gender</p>
            <p className="font-medium capitalize">{formData.gender.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-gray-600">Nationality</p>
            <p className="font-medium">{formData.nationality}</p>
          </div>
          <div>
            <p className="text-gray-600">City</p>
            <p className="font-medium">{formData.city}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Educational Institute</p>
            <p className="font-medium">{formData.institute}</p>
          </div>
        </div>
      </div>

      {/* Student Verification */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-blue-900">🎓 Student Verification</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm font-medium">Student ID Card Uploaded</span>
          </div>
          {formData.idCardPreview && (
            <div className="mt-3">
              {formData.idCardFile?.type === 'application/pdf' ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-sm font-medium">{formData.idCardFile?.name}</p>
                    <p className="text-xs text-gray-500">PDF Document</p>
                  </div>
                </div>
              ) : (
                <img
                  src={formData.idCardPreview}
                  alt="Student ID preview"
                  className="max-w-sm max-h-48 rounded border"
                />
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <span className="text-sm">Enrollment Status Confirmed</span>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
          <p className="text-sm text-yellow-900">
            <strong>Pending Review:</strong> Your student ID will be verified by our team before approval.
          </p>
        </div>
      </div>

      {/* Cover Letter */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-blue-900">📝 Cover Letter & Expertise</h3>

        <div>
          <p className="text-sm text-gray-600 mb-2">Cover Letter Preview:</p>
          <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
            {formData.coverLetter}
          </div>
          <p className="text-xs text-gray-500 mt-1">{formData.coverLetter.length} characters</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Languages ({formData.languages.length}):</p>
          <div className="flex flex-wrap gap-2">
            {formData.languages.map((lang) => (
              <span key={lang} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {lang}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Interests ({formData.interests.length}):</p>
          <div className="flex flex-wrap gap-2">
            {formData.interests.map((interest) => (
              <span key={interest} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {formData.bio && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Bio:</p>
            <p className="text-sm bg-gray-50 p-3 rounded border">{formData.bio}</p>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-blue-900">📅 Availability Schedule</h3>
        <p className="text-sm text-gray-600">
          {formData.availability.length} time slot{formData.availability.length !== 1 ? 's' : ''} configured
        </p>

        <div className="space-y-3">
          {availabilityByDay.map((dayData) => (
            <div key={dayData.day} className="bg-gray-50 rounded p-3">
              <p className="font-bold text-sm mb-2">{dayData.day}</p>
              <div className="space-y-1">
                {dayData.slots.map((slot, index) => (
                  <div key={index} className="text-sm flex items-center justify-between">
                    <span>
                      {slot.startTime} - {slot.endTime}
                      <span className="text-gray-600 ml-2">
                        ({calculateDuration(slot.startTime, slot.endTime)})
                      </span>
                    </span>
                    {slot.note && (
                      <span className="text-xs text-gray-500 italic">Note: {slot.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {formData.unavailableNotes && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Unavailability Notes:</p>
            <p className="text-sm bg-yellow-50 border border-yellow-200 p-3 rounded">
              {formData.unavailableNotes}
            </p>
          </div>
        )}
      </div>

      {/* What Happens Next */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-bold">✨ What Happens Next?</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <div>
              <p className="font-medium">Application Review</p>
              <p className="text-gray-600">
                Our team will verify your student ID and review your cover letter (usually within 1-2 business days)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Discussion Session</p>
              <p className="text-gray-600">
                We'll schedule a brief discussion to answer your questions and ensure you're ready to guide
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Approval & Activation</p>
              <p className="text-gray-600">
                Once approved, you'll be activated as a guide and can start receiving booking requests
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Final Confirmation */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <p className="text-sm text-center">
          By submitting this application, you confirm that all information provided is accurate and truthful.
          You understand that WanderNest is a marketplace connector and you'll arrange services and payments
          directly with tourists.
        </p>
      </div>

      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {errors.submit}
        </div>
      )}
    </div>
  );
}
