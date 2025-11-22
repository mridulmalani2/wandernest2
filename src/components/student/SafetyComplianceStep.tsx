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
      <div className="bg-[hsl(var(--ui-blue-primary)/0.1)] border border-[hsl(var(--ui-blue-primary)/0.3)] rounded-lg p-4">
        <h3 className="font-bold text-[hsl(var(--ui-blue-primary))] mb-2">🛡️ Safety First</h3>
        <p className="text-sm text-[hsl(var(--ui-blue-accent))]">
          TourWiseCo is committed to creating a safe environment for both guides and tourists.
          Please read our policies carefully and provide accurate emergency contact information.
        </p>
      </div>

      {/* Terms & Conditions Checkbox */}
      <div className="space-y-4">
        <div className={`border-2 rounded-lg p-4 ${
          errors.termsAccepted ? 'border-[hsl(var(--ui-error))] bg-[hsl(var(--ui-error)/0.1)]' : 'border-gray-300'
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
                  className="text-[hsl(var(--ui-blue-accent))] underline hover:text-[hsl(var(--ui-blue-primary))]"
                >
                  Terms & Conditions
                </a>
                {' '}and{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--ui-blue-accent))] underline hover:text-[hsl(var(--ui-blue-primary))]"
                >
                  Privacy Policy
                </a>
                {' '}<span className="text-[hsl(var(--ui-error))]">*</span>
              </Label>
            </div>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-[hsl(var(--ui-error))]">{errors.termsAccepted}</p>
        )}

        {/* Independent Guide Acknowledgment */}
        <div className={`border-2 rounded-lg p-4 ${
          errors.independentGuideAcknowledged ? 'border-[hsl(var(--ui-error))] bg-[hsl(var(--ui-error)/0.1)]' : 'border-gray-300'
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
                safety, and conduct during guide sessions. TourWiseCo acts as a connection platform only.
                {' '}<span className="text-[hsl(var(--ui-error))]">*</span>
              </Label>
            </div>
          </div>
        </div>
        {errors.independentGuideAcknowledged && (
          <p className="text-sm text-[hsl(var(--ui-error))]">{errors.independentGuideAcknowledged}</p>
        )}

        {/* Safety Guidelines Checkbox */}
        <div className={`border-2 rounded-lg p-4 ${
          errors.safetyGuidelinesAccepted ? 'border-[hsl(var(--ui-error))] bg-[hsl(var(--ui-error)/0.1)]' : 'border-gray-300'
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
                {' '}<span className="text-[hsl(var(--ui-error))]">*</span>
              </Label>
            </div>
          </div>
        </div>
        {errors.safetyGuidelinesAccepted && (
          <p className="text-sm text-[hsl(var(--ui-error))]">{errors.safetyGuidelinesAccepted}</p>
        )}
      </div>

      {/* Safety Guidelines Details */}
      <div className="bg-[hsl(var(--ui-purple-primary)/0.1)] border border-[hsl(var(--ui-purple-primary)/0.3)] rounded-lg p-4">
        <h3 className="font-bold text-[hsl(var(--ui-purple-primary))] mb-2">📋 Key Safety Guidelines</h3>
        <ul className="text-sm text-[hsl(var(--ui-purple-accent))] space-y-1 list-disc list-inside">
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

        <div className="bg-[hsl(var(--ui-warning)/0.1)] border border-[hsl(var(--ui-warning)/0.3)] rounded-lg p-4">
          <p className="text-sm text-[hsl(var(--ui-warning))]">
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
              className={errors.emergencyContactName ? 'border-[hsl(var(--ui-error))]' : ''}
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-[hsl(var(--ui-error))]">{errors.emergencyContactName}</p>
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
              className={errors.emergencyContactPhone ? 'border-[hsl(var(--ui-error))]' : ''}
            />
            <p className="text-xs text-gray-500">Include country code</p>
            {errors.emergencyContactPhone && (
              <p className="text-sm text-[hsl(var(--ui-error))]">{errors.emergencyContactPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Final Note */}
      <div className="bg-[hsl(var(--ui-success)/0.1)] border border-[hsl(var(--ui-success)/0.3)] rounded-lg p-4">
        <p className="text-sm text-[hsl(var(--ui-success))]">
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
