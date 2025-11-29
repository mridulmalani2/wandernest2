'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingFormData } from './OnboardingWizard';

interface SafetyComplianceStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function SafetyComplianceStep({ formData, updateFormData, errors }: SafetyComplianceStepProps) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Safety & Platform Compliance</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Please read and accept our terms, and provide emergency contact information.
        </p>
      </div>

      {/* Platform Terms */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            🛡️
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">Safety First</h3>
            <p className="text-sm text-blue-800 leading-relaxed">
              TourWiseCo is committed to creating a safe environment for both guides and tourists.
              Please read our policies carefully and provide accurate emergency contact information.
            </p>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Checkboxes */}
      <div className="space-y-5">
        {/* Terms & Conditions */}
        <div className={`border-2 rounded-2xl p-5 sm:p-6 transition-all ${
          errors.termsAccepted
            ? 'border-red-300 bg-red-50'
            : formData.termsAccepted
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-4">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) =>
                updateFormData({ termsAccepted: checked as boolean })
              }
              className="mt-1 h-5 w-5"
            />
            <div className="flex-1">
              <Label
                htmlFor="termsAccepted"
                className="text-base font-medium cursor-pointer leading-relaxed text-gray-900"
              >
                I agree to the platform's{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 font-semibold"
                >
                  Terms & Conditions
                </a>
                {' '}and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 font-semibold"
                >
                  Privacy Policy
                </a>
                {' '}<span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
          {errors.termsAccepted && (
            <p className="text-sm text-red-600 mt-3 ml-9 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.termsAccepted}
            </p>
          )}
        </div>

        {/* Independent Guide Acknowledgment */}
        <div className={`border-2 rounded-2xl p-5 sm:p-6 transition-all ${
          errors.independentGuideAcknowledged
            ? 'border-red-300 bg-red-50'
            : formData.independentGuideAcknowledged
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-4">
            <Checkbox
              id="independentGuideAcknowledged"
              checked={formData.independentGuideAcknowledged}
              onCheckedChange={(checked) =>
                updateFormData({ independentGuideAcknowledged: checked as boolean })
              }
              className="mt-1 h-5 w-5"
            />
            <div className="flex-1">
              <Label
                htmlFor="independentGuideAcknowledged"
                className="text-base font-medium cursor-pointer leading-relaxed text-gray-900"
              >
                I understand that I am an independent guide and responsible for my own interactions,
                safety, and conduct during guide sessions. TourWiseCo acts as a connection platform only.
                {' '}<span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
          {errors.independentGuideAcknowledged && (
            <p className="text-sm text-red-600 mt-3 ml-9 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.independentGuideAcknowledged}
            </p>
          )}
        </div>

        {/* Safety Guidelines */}
        <div className={`border-2 rounded-2xl p-5 sm:p-6 transition-all ${
          errors.safetyGuidelinesAccepted
            ? 'border-red-300 bg-red-50'
            : formData.safetyGuidelinesAccepted
            ? 'border-green-300 bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <div className="flex items-start gap-4">
            <Checkbox
              id="safetyGuidelinesAccepted"
              checked={formData.safetyGuidelinesAccepted}
              onCheckedChange={(checked) =>
                updateFormData({ safetyGuidelinesAccepted: checked as boolean })
              }
              className="mt-1 h-5 w-5"
            />
            <div className="flex-1">
              <Label
                htmlFor="safetyGuidelinesAccepted"
                className="text-base font-medium cursor-pointer leading-relaxed text-gray-900"
              >
                I agree to follow platform safety guidelines, including meeting in public places,
                sharing trip details with emergency contacts, and maintaining professional conduct at all times.
                {' '}<span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
          {errors.safetyGuidelinesAccepted && (
            <p className="text-sm text-red-600 mt-3 ml-9 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.safetyGuidelinesAccepted}
            </p>
          )}
        </div>
      </div>

      {/* Safety Guidelines Details */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            📋
          </div>
          <h3 className="text-lg font-bold text-purple-900">Key Safety Guidelines</h3>
        </div>
        <ul className="text-sm text-purple-800 space-y-2 list-disc list-inside ml-1 leading-relaxed">
          <li>Always meet tourists in public, well-lit areas</li>
          <li>Share your itinerary with your emergency contact before each session</li>
          <li>Maintain professional boundaries and respectful communication</li>
          <li>Trust your instincts - if something feels unsafe, remove yourself from the situation</li>
          <li>Report any concerning behavior to the platform immediately</li>
          <li>Never share personal financial information or accept payments outside the platform</li>
        </ul>
      </div>

      {/* Emergency Contact Information */}
      <div className="space-y-5">
        <div>
          <h3 className="text-xl font-bold mb-2 text-gray-900">Emergency Contact</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Provide a trusted person we can contact in case of emergency (Optional but highly recommended)
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              <strong>Recommended:</strong> While optional, providing emergency contact information
              is strongly recommended for your safety and allows us to reach someone if needed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName" className="text-base font-semibold text-gray-700">
              Emergency Contact Name
            </Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
              placeholder="e.g., Parent, Sibling, Close Friend"
              className={`text-base h-12 ${errors.emergencyContactName ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.emergencyContactName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone" className="text-base font-semibold text-gray-700">
              Emergency Contact Phone
            </Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              className={`text-base h-12 ${errors.emergencyContactPhone ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
            />
            <p className="text-sm text-gray-500">Include country code</p>
            {errors.emergencyContactPhone && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.emergencyContactPhone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Final Notes */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xl flex-shrink-0">
              ✓
            </div>
            <p className="text-sm text-green-800 leading-relaxed">
              <strong>Almost Done!</strong> After submitting, our team will review your application
              within 2-3 business days. You'll receive an email once approved.
            </p>
          </div>
        </div>

        <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong>Privacy Note:</strong> Your emergency contact information is stored securely
              and will only be used in genuine emergency situations. It will never be shared with
              tourists or used for marketing purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
