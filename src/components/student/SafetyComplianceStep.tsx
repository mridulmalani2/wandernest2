'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { Shield, Phone, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SafetyComplianceStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData> | ((prev: OnboardingFormData) => Partial<OnboardingFormData>)) => void;
  errors: Record<string, string>;
}

export function SafetyComplianceStep({ formData, updateFormData, errors }: SafetyComplianceStepProps) {
  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Safety & Compliance
        </h2>
        <p className="text-base font-light text-white/70 max-w-md mx-auto">
          Your safety is our priority
        </p>
      </div>

      {/* Emergency Contact */}
      <FlowCard padding="lg" variant="dark">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-light tracking-wide text-white/80">
            <Phone className="h-4 w-4" />
            Emergency Contact <span className="text-xs text-white/50 ml-1">(Optional but recommended)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LiquidInput
              label="Contact Name"
              value={formData.emergencyContactName || ''}
              onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
              placeholder="Full name"
            />

            <LiquidInput
              label="Contact Phone"
              type="tel"
              value={formData.emergencyContactPhone || ''}
              onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
              icon={Phone}
            />
          </div>
        </div>
      </FlowCard>

      {/* Safety Guidelines */}
      <FlowCard padding="md" variant="subtle">
        <div className="flex gap-3 items-start">
          <AlertTriangle className="h-5 w-5 text-liquid-dark-secondary mt-0.5 shrink-0" />
          <div className="space-y-2 text-sm font-light">
            <p className="font-medium text-white">Safety Guidelines</p>
            <ul className="space-y-1 text-gray-300 text-xs">
              <li>• Always meet tourists in public places</li>
              <li>• Share your itinerary with a friend/family member</li>
              <li>• Trust your instincts - you can decline any request</li>
              <li>• Use the platform's messaging system for communication</li>
              <li>• Report any concerning behavior immediately</li>
            </ul>
          </div>
        </div>
      </FlowCard>

      {/* Terms Acceptance */}
      <FlowCard padding="lg" variant="dark">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={formData.termsAccepted || false}
              onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
              className={cn(
                'mt-1 h-5 w-5 rounded border-gray-300 focus:ring-white',
                formData.termsAccepted ? 'text-white' : '',
                errors.termsAccepted && 'border-ui-error'
              )}
            />
            <div className="text-sm font-light text-white/80">
              <label htmlFor="termsAccepted" className="cursor-pointer">
                I agree to the{' '}
              </label>
              <Link href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline" onClick={(e) => e.stopPropagation()}>
                Terms of Service
              </Link>
              <label htmlFor="termsAccepted" className="cursor-pointer">
                {' '}and{' '}
              </label>
              <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline" onClick={(e) => e.stopPropagation()}>
                Privacy Policy
              </Link>
              .
            </div>
          </div>
          {errors.termsAccepted && (
            <p className="text-xs font-light text-ui-error flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {errors.termsAccepted}
            </p>
          )}

          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="safetyGuidelinesAccepted"
              checked={formData.safetyGuidelinesAccepted || false}
              onChange={(e) => updateFormData({ safetyGuidelinesAccepted: e.target.checked })}
              className={cn(
                'mt-1 h-5 w-5 rounded border-gray-300 focus:ring-white',
                formData.safetyGuidelinesAccepted ? 'text-white' : '',
                errors.safetyGuidelinesAccepted && 'border-ui-error'
              )}
            />
            <label htmlFor="safetyGuidelinesAccepted" className="text-sm font-light cursor-pointer">
              <p className="text-white/80">
                I have read and agree to the <Link href="/safety" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline" onClick={(e) => e.stopPropagation()}>Safety Guidelines</Link> and <Link href="/conduct" target="_blank" rel="noopener noreferrer" className="font-medium text-white hover:underline" onClick={(e) => e.stopPropagation()}>Code of Conduct</Link>.
              </p>
            </label>
          </div>
          {errors.safetyGuidelinesAccepted && (
            <p className="text-xs font-light text-ui-error flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {errors.safetyGuidelinesAccepted}
            </p>
          )}

          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="independentGuideAcknowledged"
              checked={formData.independentGuideAcknowledged || false}
              onChange={(e) => updateFormData({ independentGuideAcknowledged: e.target.checked })}
              className={cn(
                'mt-1 h-5 w-5 rounded border-gray-300 focus:ring-white',
                formData.independentGuideAcknowledged ? 'text-white' : '',
                errors.independentGuideAcknowledged && 'border-ui-error'
              )}
            />
            <label htmlFor="independentGuideAcknowledged" className="text-sm font-light cursor-pointer">
              <p className="text-white/80">
                I acknowledge that I am acting as an independent student guide and not as an employee of WanderNest.
              </p>
            </label>
          </div>
          {errors.independentGuideAcknowledged && (
            <p className="text-xs font-light text-ui-error flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {errors.independentGuideAcknowledged}
            </p>
          )}
        </div>
      </FlowCard>

      {/* Disclaimer */}
      <div className="bg-white/10 rounded-2xl p-4 flex gap-3 items-start border border-white/20">
        <Shield className="h-5 w-5 text-white/80 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-medium text-white text-sm">Background Verification</h3>
          <p className="text-xs font-light text-white/70 leading-relaxed">
            Your documents will be verified within 2-3 business days. You'll be notified once your profile is approved and you can start accepting bookings.
          </p>
        </div>
      </div>
    </div>
  );
}
