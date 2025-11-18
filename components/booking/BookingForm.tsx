'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { TripDetailsStep } from './TripDetailsStep'
import { PreferencesStep } from './PreferencesStep'
import { ContactStep } from './ContactStep'
import { VerificationModal } from './VerificationModal'

export type BookingFormData = {
  // Step 1: Trip Details
  city: string
  dates: { start: string; end?: string }
  preferredTime: 'morning' | 'afternoon' | 'evening' | ''
  numberOfGuests: number
  groupType: 'family' | 'friends' | 'solo' | 'business' | ''

  // Step 2: Preferences
  preferredNationality?: string
  preferredLanguages: string[]
  preferredGender?: 'male' | 'female' | 'no_preference'
  serviceType: 'itinerary_help' | 'guided_experience' | ''
  interests: string[]
  budget?: number

  // Step 3: Contact
  email: string
  phone?: string
  whatsapp?: string
  contactMethod: 'email' | 'phone' | 'whatsapp' | ''
  tripNotes?: string
  accessibilityNeeds?: string
}

const STEPS = [
  { id: 1, name: 'Trip Details', description: 'Where and when?' },
  { id: 2, name: 'Preferences', description: 'What are you looking for?' },
  { id: 3, name: 'Contact', description: 'How can we reach you?' },
]

export function BookingForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showVerification, setShowVerification] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    city: '',
    dates: { start: '' },
    preferredTime: '',
    numberOfGuests: 1,
    groupType: '',
    preferredLanguages: [],
    serviceType: '',
    interests: [],
    email: '',
    contactMethod: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.dates.start) newErrors.dates = 'Start date is required'
      if (!formData.preferredTime) newErrors.preferredTime = 'Time preference is required'
      if (formData.numberOfGuests < 1 || formData.numberOfGuests > 10) {
        newErrors.numberOfGuests = 'Guest count must be between 1 and 10'
      }
      if (!formData.groupType) newErrors.groupType = 'Group type is required'
    }

    if (step === 2) {
      if (formData.preferredLanguages.length === 0) {
        newErrors.preferredLanguages = 'At least one language is required'
      }
      if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
      if (formData.interests.length === 0) {
        newErrors.interests = 'At least one interest is required'
      }
    }

    if (step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email address'
      }
      if (!formData.contactMethod) {
        newErrors.contactMethod = 'Contact method is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tourist/request/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setShowVerification(true)
      } else {
        alert(data.error || 'Failed to submit booking request')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerificationSuccess = (requestId: string) => {
    // Redirect to success page or show success message
    window.location.href = `/booking/success?id=${requestId}`
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                    currentStep >= step.id
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}
                >
                  {step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        {currentStep === 1 && (
          <TripDetailsStep
            data={formData}
            errors={errors}
            updateData={updateFormData}
          />
        )}

        {currentStep === 2 && (
          <PreferencesStep
            data={formData}
            errors={errors}
            updateData={updateFormData}
          />
        )}

        {currentStep === 3 && (
          <ContactStep
            data={formData}
            errors={errors}
            updateData={updateFormData}
          />
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {currentStep === 3 ? (
              isSubmitting ? 'Submitting...' : 'Submit & Verify'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <VerificationModal
          email={formData.email}
          formData={formData}
          onSuccess={handleVerificationSuccess}
          onClose={() => setShowVerification(false)}
        />
      )}
    </div>
  )
}
