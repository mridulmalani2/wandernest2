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

      {/* Personal Details */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-blue-900">👤 Personal Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Full Name</p>
            <p className="font-medium">{formData.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Date of Birth</p>
            <p className="font-medium">
              {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : '-'}
            </p>
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
            <p className="text-gray-600">Phone Number</p>
            <p className="font-medium">{formData.phoneNumber}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-medium">{formData.email}</p>
          </div>
          <div>
            <p className="text-gray-600">City</p>
            <p className="font-medium">{formData.city}</p>
          </div>
          <div>
            <p className="text-gray-600">Campus</p>
            <p className="font-medium">{formData.campus}</p>
          </div>
        </div>
      </div>

      {/* Academic Details */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-purple-900">🎓 Academic Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <p className="text-gray-600">University</p>
            <p className="font-medium">{formData.institute}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600">Program/Degree</p>
            <p className="font-medium">{formData.programDegree}</p>
          </div>
          <div>
            <p className="text-gray-600">Year of Study</p>
            <p className="font-medium">{formData.yearOfStudy}</p>
          </div>
          <div>
            <p className="text-gray-600">Expected Graduation</p>
            <p className="font-medium">{formData.expectedGraduation}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 mb-2">Languages ({formData.languages.length})</p>
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang) => (
                <span key={lang} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Identity Verification */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-green-900">🔐 Identity Verification</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium">Student ID Card</span>
              </div>
              <p className="text-xs text-gray-600">
                Expiry: {formData.studentIdExpiry ? new Date(formData.studentIdExpiry).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium">Government ID</span>
              </div>
              <p className="text-xs text-gray-600">
                Expiry: {formData.governmentIdExpiry ? new Date(formData.governmentIdExpiry).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium">Verification Selfie</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm font-medium">Profile Photo</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-green-600">✓</span>
              <span>Documents ownership confirmed</span>
            </div>
            <div className="flex items-start gap-2 text-sm mt-1">
              <span className="text-green-600">✓</span>
              <span>Verification consent provided</span>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
          <p className="text-sm text-yellow-900">
            <strong>Pending Review:</strong> Your documents will be verified by our team before approval.
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-indigo-900">📝 Profile Information</h3>

        <div>
          <p className="text-sm text-gray-600 mb-2">Bio ({formData.bio.length} characters):</p>
          <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
            {formData.bio}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Skills ({formData.skills.length}):</p>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {formData.preferredGuideStyle && (
          <div>
            <p className="text-sm text-gray-600">Preferred Guide Style:</p>
            <p className="font-medium text-sm capitalize">{formData.preferredGuideStyle}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-2">Cover Letter ({formData.coverLetter.length} characters):</p>
          <div className="bg-gray-50 p-4 rounded border text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
            {formData.coverLetter}
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
      </div>

      {/* Availability */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-blue-900">📅 Availability Schedule</h3>

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-600">Timezone</p>
            <p className="font-medium">{formData.timezone}</p>
          </div>
          <div>
            <p className="text-gray-600">Total Slots</p>
            <p className="font-medium">
              {formData.availability.length} slot{formData.availability.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Preferred Durations:</p>
          <div className="flex flex-wrap gap-2">
            {formData.preferredDurations.map((duration) => (
              <span key={duration} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {duration}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <p className="text-sm font-medium">Weekly Schedule:</p>
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

        {formData.unavailabilityExceptions.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Unavailability Exceptions ({formData.unavailabilityExceptions.length}):</p>
            <div className="space-y-2">
              {formData.unavailabilityExceptions.map((exception, index) => (
                <div key={index} className="bg-yellow-50 border border-yellow-200 p-2 rounded text-sm">
                  <p className="font-medium">
                    {new Date(exception.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  {exception.reason && <p className="text-xs text-gray-600 mt-1">Reason: {exception.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service Preferences */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-orange-900">💼 Service Preferences</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="col-span-2">
            <p className="text-gray-600 mb-2">Services Offered:</p>
            <div className="space-y-1">
              {formData.servicesOffered.map((service) => (
                <div key={service} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="capitalize">{service.replace('-', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-gray-600">Hourly Rate</p>
            <p className="font-medium text-lg">€{formData.hourlyRate}/hour</p>
          </div>
          <div>
            <p className="text-gray-600">Online Services</p>
            <p className="font-medium">
              {formData.onlineServicesAvailable ? (
                <span className="text-green-600">✓ Available</span>
              ) : (
                <span className="text-gray-500">Not available</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Safety & Compliance */}
      <div className="border rounded-lg p-6 space-y-3">
        <h3 className="text-lg font-bold text-red-900">🛡️ Safety & Compliance</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Terms & Conditions accepted</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Safety guidelines accepted</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Independent guide status acknowledged</span>
          </div>
        </div>

        {(formData.emergencyContactName || formData.emergencyContactPhone) && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">Emergency Contact:</p>
            <div className="bg-gray-50 p-3 rounded text-sm">
              {formData.emergencyContactName && (
                <p><span className="text-gray-600">Name:</span> {formData.emergencyContactName}</p>
              )}
              {formData.emergencyContactPhone && (
                <p><span className="text-gray-600">Phone:</span> {formData.emergencyContactPhone}</p>
              )}
            </div>
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
                Our team will verify your documents and review your profile (usually within 2-3 business days)
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <div>
              <p className="font-medium">Approval Notification</p>
              <p className="text-gray-600">
                You'll receive an email once your profile is approved and activated
              </p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <div>
              <p className="font-medium">Start Guiding</p>
              <p className="text-gray-600">
                Once approved, you can start receiving booking requests from tourists
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Final Confirmation */}
      <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
        <p className="text-sm text-center">
          By submitting this application, you confirm that all information provided is accurate and truthful.
          You understand that you are an independent guide and responsible for your interactions during guide sessions.
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
