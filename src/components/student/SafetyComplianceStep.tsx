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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Safety & Platform Compliance</h2>
        <p className="text-gray-600">
          Please read and accept our terms, and provide emergency contact information.
        </p>
      </div>

      {/* Platform Terms */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">🛡️ Safety First</h3>
        <p className="text-sm text-blue-800">
          WanderNest is committed to creating a safe environment for both guides and tourists.
          Please read our policies carefully and provide accurate emergency contact information.
        </p>
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className="space-y-4">
        <div className={`border-2 rounded-lg p-4 ${
          errors.termsAccepted ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="termsAccepted"
              checked={formData.termsAccepted}
              onCheckedChange={(checked) =>
                updateFormData({ termsAccepted: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label
                htmlFor="termsAccepted"
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                I agree to the platform's{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Terms & Conditions
                </a>
                {' '}and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Privacy Policy
                </a>
                {' '}<span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-red-500">{errors.termsAccepted}</p>
        )}

        {/* Independent Guide Acknowledgment */}
        <div className={`border-2 rounded-lg p-4 ${
          errors.independentGuideAcknowledged ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="independentGuideAcknowledged"
              checked={formData.independentGuideAcknowledged}
              onCheckedChange={(checked) =>
                updateFormData({ independentGuideAcknowledged: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label
                htmlFor="independentGuideAcknowledged"
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                I understand that I am an independent guide and responsible for my own interactions,
                safety, and conduct during guide sessions. WanderNest acts as a connection platform only.
                {' '}<span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
        </div>
        {errors.independentGuideAcknowledged && (
          <p className="text-sm text-red-500">{errors.independentGuideAcknowledged}</p>
        )}

        {/* Safety Guidelines Checkbox */}
        <div className={`border-2 rounded-lg p-4 ${
          errors.safetyGuidelinesAccepted ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="safetyGuidelinesAccepted"
              checked={formData.safetyGuidelinesAccepted}
              onCheckedChange={(checked) =>
                updateFormData({ safetyGuidelinesAccepted: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label
                htmlFor="safetyGuidelinesAccepted"
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                I agree to follow platform safety guidelines, including meeting in public places,
                sharing trip details with emergency contacts, and maintaining professional conduct at all times.
                {' '}<span className="text-red-500">*</span>
              </Label>
            </div>
          </div>
        </div>
        {errors.safetyGuidelinesAccepted && (
          <p className="text-sm text-red-500">{errors.safetyGuidelinesAccepted}</p>
        )}
      </div>

      {/* Safety Guidelines Details */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-bold text-purple-900 mb-2">📋 Key Safety Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Always meet tourists in public, well-lit areas</li>
          <li>Share your itinerary with your emergency contact before each session</li>
          <li>Maintain professional boundaries and respectful communication</li>
          <li>Trust your instincts - if something feels unsafe, remove yourself from the situation</li>
          <li>Report any concerning behavior to the platform immediately</li>
          <li>Never share personal financial information or accept payments outside the platform</li>
        </ul>
      </div>

      {/* Emergency Contact Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold mb-1">Emergency Contact</h3>
          <p className="text-sm text-gray-600">
            Provide a trusted person we can contact in case of emergency (Optional but highly recommended)
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-900">
            <strong>⚠️ Recommended:</strong> While optional, providing emergency contact information
            is strongly recommended for your safety and allows us to reach someone if needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">
              Emergency Contact Name
            </Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
              placeholder="e.g., Parent, Sibling, Close Friend"
              className={errors.emergencyContactName ? 'border-red-500' : ''}
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-red-500">{errors.emergencyContactName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">
              Emergency Contact Phone
            </Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone}
              onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              className={errors.emergencyContactPhone ? 'border-red-500' : ''}
            />
            <p className="text-xs text-gray-500">Include country code</p>
            {errors.emergencyContactPhone && (
              <p className="text-sm text-red-500">{errors.emergencyContactPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Final Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>✓ Almost Done!</strong> After submitting, our team will review your application
          within 2-3 business days. You'll receive an email once approved.
        </p>
      </div>

      {/* Privacy Note */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
        <p className="text-xs text-gray-700">
          <strong>Privacy Note:</strong> Your emergency contact information is stored securely
          and will only be used in genuine emergency situations. It will never be shared with
          tourists or used for marketing purposes.
        </p>
      </div>
    </div>
  );
}
