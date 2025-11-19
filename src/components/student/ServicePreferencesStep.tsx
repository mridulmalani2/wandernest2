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
  },
  {
    id: 'itinerary',
    label: 'Itinerary Planning',
    description: 'Help plan customized itineraries and recommendations',
  },
  {
    id: 'cultural',
    label: 'Cultural Explanation Sessions',
    description: 'Explain local culture, customs, and etiquette',
  },
  {
    id: 'recommendations',
    label: 'Restaurant/Café Recommendations',
    description: 'Provide personalized dining and café suggestions',
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Service Preferences</h2>
        <p className="text-gray-600">
          Define what services you want to offer and set your pricing.
        </p>
      </div>

      {/* Services Offered */}
      <div className="space-y-4">
        <Label>
          Services You Want to Offer <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">Select at least one service type</p>

        <div className="space-y-3">
          {SERVICE_OPTIONS.map((service) => (
            <div
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                formData.servicesOffered.includes(service.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => toggleService(service.id)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={service.id}
                  checked={formData.servicesOffered.includes(service.id)}
                  onCheckedChange={() => toggleService(service.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={service.id}
                    className="text-base font-semibold cursor-pointer"
                  >
                    {service.label}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.servicesOffered.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              ✓ {formData.servicesOffered.length} service
              {formData.servicesOffered.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {errors.servicesOffered && (
          <p className="text-sm text-red-500">{errors.servicesOffered}</p>
        )}
      </div>

      {/* Hourly Rate */}
      <div className="space-y-2">
        <Label htmlFor="hourlyRate">
          Your Hourly Guide Rate (€) <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-600">€</span>
          <Input
            id="hourlyRate"
            type="number"
            min="0"
            step="1"
            value={formData.hourlyRate}
            onChange={(e) => updateFormData({ hourlyRate: e.target.value })}
            placeholder="15"
            className={`max-w-xs ${errors.hourlyRate ? 'border-red-500' : ''}`}
          />
          <span className="text-gray-600">per hour</span>
        </div>
        <p className="text-xs text-gray-500">
          Set a fair rate considering your expertise and local market rates
        </p>
        {errors.hourlyRate && <p className="text-sm text-red-500">{errors.hourlyRate}</p>}
      </div>

      {/* Pricing Guidelines */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-bold text-purple-900 mb-2">💰 Pricing Guidelines</h3>
        <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
          <li>Average student guide rate: €12-20 per hour</li>
          <li>Consider your experience, language skills, and local knowledge</li>
          <li>You can adjust your rate later in your dashboard</li>
          <li>Platform takes a 15% service fee to cover operational costs</li>
        </ul>
      </div>

      {/* Online Services */}
      <div className="space-y-3">
        <Label>Online Services</Label>
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="onlineServicesAvailable"
              checked={formData.onlineServicesAvailable}
              onCheckedChange={(checked) =>
                updateFormData({ onlineServicesAvailable: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label
                htmlFor="onlineServicesAvailable"
                className="text-base font-medium cursor-pointer"
              >
                I'm available for online-only services
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Offer virtual tours, itinerary planning, or cultural consultations via video call
              </p>
            </div>
          </div>
        </div>
        {formData.onlineServicesAvailable && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💻 Great! You'll be visible to tourists looking for remote guide services
            </p>
          </div>
        )}
      </div>

      {/* Service Commitment Note */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h3 className="font-bold text-orange-900 mb-2">📌 Important</h3>
        <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
          <li>Commit only to services you're genuinely comfortable providing</li>
          <li>Once you accept a booking, you're expected to honor it</li>
          <li>Cancellations affect your reliability rating</li>
          <li>Start small and expand your services as you gain confidence</li>
        </ul>
      </div>
    </div>
  );
}
