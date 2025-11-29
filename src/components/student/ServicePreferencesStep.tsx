'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingFormData } from './OnboardingWizard';

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
    icon: '🚶',
  },
  {
    id: 'itinerary',
    label: 'Itinerary Planning',
    description: 'Help plan customized itineraries and recommendations',
    icon: '📝',
  },
  {
    id: 'cultural',
    label: 'Cultural Explanation Sessions',
    description: 'Explain local culture, customs, and etiquette',
    icon: '🎭',
  },
  {
    id: 'recommendations',
    label: 'Restaurant/Café Recommendations',
    description: 'Provide personalized dining and café suggestions',
    icon: '🍽️',
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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Service Preferences</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Define what services you want to offer and set your pricing.
        </p>
      </div>

      {/* Services Offered */}
      <div className="space-y-5">
        <div>
          <Label className="text-xl font-bold text-gray-900">
            Services You Want to Offer <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600 mt-2">Select at least one service type</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICE_OPTIONS.map((service) => (
            <div
              key={service.id}
              className={`group relative border-2 rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 ${
                formData.servicesOffered.includes(service.id)
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
              }`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                  formData.servicesOffered.includes(service.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 group-hover:bg-blue-100'
                }`}>
                  {service.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <Label
                        htmlFor={service.id}
                        className="text-base font-bold cursor-pointer text-gray-900"
                      >
                        {service.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{service.description}</p>
                    </div>
                    <Checkbox
                      id={service.id}
                      checked={formData.servicesOffered.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                      className="mt-1 h-5 w-5"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.servicesOffered.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4">
            <p className="text-sm text-green-800 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {formData.servicesOffered.length} service{formData.servicesOffered.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {errors.servicesOffered && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.servicesOffered}
          </p>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="space-y-3">
        <Label htmlFor="hourlyRate" className="text-xl font-bold text-gray-900">
          Your Hourly Guide Rate (€) <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-3 max-w-md">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-3xl font-bold text-gray-700">€</span>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              step="1"
              value={formData.hourlyRate}
              onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
              placeholder="15"
              className={`text-xl font-semibold h-14 ${errors.hourlyRate ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
            />
            <span className="text-gray-600 font-medium">per hour</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Set a fair rate considering your expertise and local market rates
        </p>
        {errors.hourlyRate && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.hourlyRate}
          </p>
        )}
      </div>

      {/* Pricing Guidelines */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200 rounded-2xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            💰
          </div>
          <h3 className="text-lg font-bold text-purple-900">Pricing Guidelines</h3>
        </div>
        <ul className="text-sm text-purple-800 space-y-2 list-disc list-inside ml-1">
          <li>Average student guide rate: €12-20 per hour</li>
          <li>Consider your experience, language skills, and local knowledge</li>
          <li>You can adjust your rate later in your dashboard</li>
          <li>Platform takes a 15% service fee to cover operational costs</li>
        </ul>
      </div>

      {/* Online Services */}
      <div className="space-y-4">
        <Label className="text-xl font-bold text-gray-900">Online Services</Label>
        <div className="border-2 border-gray-200 hover:border-blue-300 rounded-2xl p-5 sm:p-6 transition-all">
          <div className="flex items-start gap-4">
            <Checkbox
              id="onlineServicesAvailable"
              checked={formData.onlineServicesAvailable}
              onCheckedChange={(checked) =>
                updateFormData({ onlineServicesAvailable: checked as boolean })
              }
              className="mt-1 h-5 w-5"
            />
            <div className="flex-1">
              <Label
                htmlFor="onlineServicesAvailable"
                className="text-base font-semibold cursor-pointer text-gray-900"
              >
                I'm available for online-only services
              </Label>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Offer virtual tours, itinerary planning, or cultural consultations via video call
              </p>
            </div>
          </div>
        </div>
        {formData.onlineServicesAvailable && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <span className="text-xl">💻</span>
              Great! You'll be visible to tourists looking for remote guide services
            </p>
          </div>
        )}
      </div>

      {/* Service Commitment Note */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-amber-900">Important Guidelines</h3>
        </div>
        <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside ml-1">
          <li>Commit only to services you're genuinely comfortable providing</li>
          <li>Once you accept a booking, you're expected to honor it</li>
          <li>Cancellations affect your reliability rating</li>
          <li>Start small and expand your services as you gain confidence</li>
        </ul>
      </div>
    </div>
  );
}
