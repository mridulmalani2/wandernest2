'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { LiquidSlider } from '@/components/ui/LiquidSlider';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { Map, Calendar, MessageCircle, Coffee, Globe, CheckCircle2, DollarSign, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicePreferencesStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const SERVICE_OPTIONS = [
  { id: 'walk-around', label: 'Walk-around Guide', description: 'Show tourists around on foot', icon: Map },
  { id: 'itinerary', label: 'Itinerary Planning', description: 'Help plan customized itineraries', icon: Calendar },
  { id: 'cultural', label: 'Cultural Explanation', description: 'Explain local culture and customs', icon: MessageCircle },
  { id: 'recommendations', label: 'Local Recommendations', description: 'Provide dining and café suggestions', icon: Coffee },
];

export function ServicePreferencesStep({ formData, updateFormData, errors }: ServicePreferencesStepProps) {
  const toggleService = (serviceId: string) => {
    const services = formData.servicesOffered || [];
    if (services.includes(serviceId)) {
      updateFormData({ servicesOffered: services.filter((s) => s !== serviceId) });
    } else {
      updateFormData({ servicesOffered: [...services, serviceId] });
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Service Preferences
        </h2>
        <p className="text-base font-light text-white/70 max-w-md mx-auto">
          Define what you want to offer
        </p>
      </div>

      {/* Services */}
      <div className="space-y-4">
        <label className="text-sm font-light tracking-wide text-white/80 block">
          Select Services {errors.servicesOffered && <span className="text-ui-error ml-1">*</span>}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SERVICE_OPTIONS.map((service) => {
            const Icon = service.icon;
            const isSelected = formData.servicesOffered.includes(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={cn(
                  'flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 text-left',
                  'border-2',
                  isSelected
                    ? 'bg-white text-liquid-dark-primary border-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                    : 'bg-transparent text-white border-white/20 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.99]'
                )}
              >
                <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                  isSelected ? 'bg-white/20' : 'bg-liquid-light')}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">{service.label}</div>
                  <div className="text-sm opacity-70">{service.description}</div>
                </div>
                {isSelected && <CheckCircle2 className="h-5 w-5 shrink-0 mt-1" />}
              </button>
            );
          })}
        </div>
        {errors.servicesOffered && (
          <p className="text-xs font-light text-ui-error">{errors.servicesOffered}</p>
        )}
      </div>

      {/* Online Services Toggle */}
      <button
        type="button"
        onClick={() => updateFormData({ onlineServicesAvailable: !formData.onlineServicesAvailable })}
        className={cn(
          'w-full flex items-start gap-4 p-5 rounded-3xl transition-all duration-300 text-left',
          'border-2',
          formData.onlineServicesAvailable
            ? 'bg-white text-liquid-dark-primary border-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
            : 'bg-transparent text-white border-white/20 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.99]'
        )}
      >
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center shrink-0',
          formData.onlineServicesAvailable ? 'bg-white/20' : 'bg-liquid-light')}>
          <Globe className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-medium mb-1">Online Services Available</div>
          <div className="text-sm opacity-70">Offer virtual tours and consultations via video call</div>
        </div>
        {formData.onlineServicesAvailable && <CheckCircle2 className="h-5 w-5 shrink-0 mt-1" />}
      </button>

      {/* Pricing */}
      <FlowCard padding="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-light tracking-wide text-white/80">
            <DollarSign className="h-4 w-4" />
            Set Your Rate
          </div>

          <LiquidSlider
            label="Hourly Rate (€)"
            value={[parseInt(formData.hourlyRate) || 15]}
            onValueChange={(values) => updateFormData({ hourlyRate: values[0].toString() })}
            min={0}
            max={50}
            step={1}
            formatValue={(v) => `€${v}`}
          />

          <FlowCard padding="sm" variant="subtle">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between font-light">
                <span className="text-white/60">Your Rate:</span>
                <span className="text-white font-medium">€{formData.hourlyRate || 0}</span>
              </div>
              <div className="flex justify-between text-xs text-white/40">
                <span>Platform Fee (15%):</span>
                <span>-€{((parseInt(formData.hourlyRate) || 0) * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 font-medium">
                <span className="text-white">You Earn:</span>
                <span className="text-white">€{((parseInt(formData.hourlyRate) || 0) * 0.85).toFixed(2)}/hr</span>
              </div>
            </div>
          </FlowCard>

          {errors.hourlyRate && (
            <p className="text-xs font-light text-ui-error">{errors.hourlyRate}</p>
          )}
        </div>
      </FlowCard>

      {/* Guidelines */}
      <FlowCard padding="md" variant="subtle">
        <div className="flex gap-3 items-start">
          <Info className="h-4 w-4 text-liquid-dark-secondary mt-0.5 shrink-0" />
          <div className="space-y-2 text-xs font-light text-white/70">
            <p className="font-medium text-white">Pricing Guidelines</p>
            <ul className="space-y-1">
              <li>• Average student guide rate: <span className="font-medium text-white">€12-20/hr</span></li>
              <li>• Consider your experience and language skills</li>
              <li>• You can adjust your rate later</li>
              <li>• Platform fee covers insurance and support</li>
            </ul>
          </div>
        </div>
      </FlowCard>
    </div>
  );
}
