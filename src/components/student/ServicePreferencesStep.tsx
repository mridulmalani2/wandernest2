'use client';

import { Label } from '@/components/ui/label';
import { ModernInput } from '@/components/ui/ModernInput';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingFormData } from './OnboardingWizard';
import { Map, Calendar, MessageCircle, Coffee, Globe, CheckCircle2, DollarSign, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServicePreferencesStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

const SERVICE_OPTIONS = [
  {
    id: 'walk-around',
    label: 'Walk-around Guide',
    description: 'Show tourists around the city on foot',
    icon: Map,
    color: 'text-ui-blue-primary',
    bg: 'bg-ui-blue-primary/10',
    border: 'border-ui-blue-primary'
  },
  {
    id: 'itinerary',
    label: 'Itinerary Planning',
    description: 'Help plan customized itineraries and recommendations',
    icon: Calendar,
    color: 'text-ui-purple-primary',
    bg: 'bg-ui-purple-primary/10',
    border: 'border-ui-purple-primary'
  },
  {
    id: 'cultural',
    label: 'Cultural Explanation',
    description: 'Explain local culture, customs, and etiquette',
    icon: MessageCircle,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500'
  },
  {
    id: 'recommendations',
    label: 'Local Recommendations',
    description: 'Provide personalized dining and café suggestions',
    icon: Coffee,
    color: 'text-teal-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500'
  },
];

export function ServicePreferencesStep({ formData, updateFormData, errors }: ServicePreferencesStepProps) {
  const toggleService = (serviceId: string) => {
    const services = formData.servicesOffered || [];
    if (services.includes(serviceId)) {
      updateFormData({
        servicesOffered: services.filter((s) => s !== serviceId),
      });
    } else {
      updateFormData({
        servicesOffered: [...services, serviceId],
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Service Preferences
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          Define what services you want to offer and set your pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Services */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ui-blue-primary"></span>
              Select Services to Offer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICE_OPTIONS.map((service) => {
                const isSelected = formData.servicesOffered.includes(service.id);
                const Icon = service.icon;

                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={cn(
                      "relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-md group",
                      isSelected
                        ? `${service.border} ${service.bg} shadow-sm`
                        : "border-gray-100 bg-white hover:border-gray-200"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-ui-success animate-scale-in">
                        <CheckCircle2 className="h-5 w-5 fill-white" />
                      </div>
                    )}

                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center mb-3 transition-colors",
                      isSelected ? "bg-white" : "bg-gray-50 group-hover:bg-gray-100"
                    )}>
                      <Icon className={cn("h-5 w-5", service.color)} />
                    </div>

                    <h4 className={cn("font-bold mb-1", isSelected ? "text-gray-900" : "text-gray-700")}>
                      {service.label}
                    </h4>
                    <p className={cn("text-xs leading-relaxed", isSelected ? "text-gray-700" : "text-gray-500")}>
                      {service.description}
                    </p>
                  </div>
                );
              })}
            </div>
            {errors.servicesOffered && <p className="text-sm text-ui-error mt-4 text-center">{errors.servicesOffered}</p>}
          </div>

          {/* Online Services */}
          <div
            className={cn(
              "rounded-3xl p-6 border-2 transition-all duration-300 cursor-pointer",
              formData.onlineServicesAvailable
                ? "bg-ui-blue-primary/5 border-ui-blue-primary shadow-sm"
                : "bg-white/50 border-white/60 shadow-lg hover:border-ui-blue-primary/30"
            )}
            onClick={() => updateFormData({ onlineServicesAvailable: !formData.onlineServicesAvailable })}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                formData.onlineServicesAvailable ? "bg-ui-blue-primary text-white" : "bg-gray-100 text-gray-400"
              )}>
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800">Online Services Available</h3>
                  <Checkbox
                    checked={formData.onlineServicesAvailable}
                    onCheckedChange={(checked) => updateFormData({ onlineServicesAvailable: checked as boolean })}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Offer virtual tours, itinerary planning, or cultural consultations via video call.
                  Great for earning extra income from home!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Guidelines */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-ui-success/10 flex items-center justify-center text-ui-success">
                <DollarSign className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-800">Set Your Rate</h3>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <ModernInput
                  label="Hourly Rate (€)"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.hourlyRate}
                  onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
                  placeholder="15"
                  className="pl-8 text-lg font-semibold"
                />
                <span className="absolute left-3 top-[34px] text-gray-400 font-semibold">€</span>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span>Your Rate:</span>
                  <span className="font-semibold">€{formData.hourlyRate || 0}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Platform Fee (15%):</span>
                  <span>-€{((parseInt(formData.hourlyRate) || 0) * 0.15).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-ui-success">
                  <span>You Earn:</span>
                  <span>€{((parseInt(formData.hourlyRate) || 0) * 0.85).toFixed(2)}/hr</span>
                </div>
              </div>

              {errors.hourlyRate && <p className="text-xs text-ui-error text-center">{errors.hourlyRate}</p>}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
              <Info className="h-4 w-4 text-ui-blue-primary" />
              Pricing Guidelines
            </h3>
            <ul className="text-xs text-gray-600 space-y-2 list-disc list-inside leading-relaxed">
              <li>Average student guide rate: <span className="font-semibold text-gray-900">€12-20 per hour</span></li>
              <li>Consider your experience and language skills</li>
              <li>You can adjust your rate later</li>
              <li>Platform fee covers insurance and support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
