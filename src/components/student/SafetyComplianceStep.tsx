'use client';

import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/ModernInput';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingFormData } from './OnboardingWizard';
import { Shield, AlertTriangle, CheckCircle2, Phone, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafetyComplianceStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function SafetyComplianceStep({ formData, updateFormData, errors }: SafetyComplianceStepProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Safety & Compliance
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Please review our safety guidelines and provide emergency contact details.
        </p>
      </div>

      {/* Platform Terms */}
      <div className="bg-ui-blue-primary/5 border border-ui-blue-primary/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="bg-ui-blue-primary/10 p-2 rounded-full shrink-0">
          <Shield className="h-6 w-6 text-ui-blue-primary" />
        </div>
        <div>
          <h3 className="font-bold text-ui-blue-primary mb-1">Safety First Commitment</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            TourWiseCo is committed to creating a safe environment. We require all guides to adhere to our safety standards and code of conduct.
          </p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-4">
        {[
          {
            id: 'termsAccepted',
            label: (
              <>
                I agree to the platform's <a href="/terms" className="text-ui-blue-primary hover:underline font-medium">Terms & Conditions</a> and <a href="/privacy" className="text-ui-blue-primary hover:underline font-medium">Privacy Policy</a>.
              </>
            ),
            error: errors.termsAccepted
          },
          {
            id: 'independentGuideAcknowledged',
            label: "I understand that I am an independent guide responsible for my own safety and conduct. TourWiseCo is a marketplace connector only.",
            error: errors.independentGuideAcknowledged
          },
          {
            id: 'safetyGuidelinesAccepted',
            label: "I agree to follow safety guidelines: meeting in public places, sharing trip details with contacts, and maintaining professional conduct.",
            error: errors.safetyGuidelinesAccepted
          }
        ].map((item) => (
          <div
            key={item.id}
            className={cn(
              "border-2 rounded-xl p-4 transition-all duration-200 hover:bg-gray-50",
              item.error ? "border-ui-error bg-ui-error/5" : "border-gray-100 bg-white"
            )}
          >
            <div className="flex items-start space-x-3">
              <Checkbox
                id={item.id}
                checked={formData[item.id as keyof OnboardingFormData] as boolean}
                onCheckedChange={(checked) =>
                  updateFormData({ [item.id]: checked as boolean })
                }
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={item.id}
                  className="text-sm font-normal cursor-pointer leading-relaxed text-gray-700 block"
                >
                  {item.label} <span className="text-ui-error">*</span>
                </Label>
              </div>
            </div>
            {item.error && (
              <p className="text-xs text-ui-error mt-2 ml-7">{item.error}</p>
            )}
          </div>
        ))}
      </div>

      {/* Key Safety Guidelines */}
      <div className="bg-ui-purple-primary/5 border border-ui-purple-primary/20 rounded-2xl p-6">
        <h3 className="font-bold text-ui-purple-primary mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Key Safety Guidelines
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Always meet in public, well-lit areas",
            "Share itinerary with emergency contact",
            "Maintain professional boundaries",
            "Trust your instincts & report issues",
            "No off-platform payments",
            "Verify tourist identity if needed"
          ].map((guideline, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="h-1.5 w-1.5 rounded-full bg-ui-purple-primary shrink-0" />
              {guideline}
            </li>
          ))}
        </ul>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
            <p className="text-sm text-gray-500">Optional but highly recommended</p>
          </div>
          <div className="bg-ui-warning/10 text-ui-warning px-3 py-1 rounded-full text-xs font-bold border border-ui-warning/20 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Recommended
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ModernInput
            label="Contact Name"
            placeholder="e.g., Parent, Sibling"
            value={formData.emergencyContactName || ''}
            onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
            icon={User}
            error={errors.emergencyContactName}
          />
          <ModernInput
            label="Contact Phone"
            placeholder="+1 234 567 8900"
            value={formData.emergencyContactPhone || ''}
            onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
            icon={Phone}
            error={errors.emergencyContactPhone}
            helperText="Include country code"
          />
        </div>
      </div>

      {/* Privacy Note */}
      <div className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600">
        <Lock className="h-5 w-5 text-gray-400 shrink-0" />
        <p>
          <strong>Privacy Assurance:</strong> Your emergency contact information is stored securely and encrypted. It will only be accessed in genuine emergency situations and never shared with tourists.
        </p>
      </div>
    </div>
  );
}
