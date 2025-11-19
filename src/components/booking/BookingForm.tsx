'use client'

import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TripDetailsStep } from './TripDetailsStep'
import { PreferencesStep } from './PreferencesStep'
import { ContactStep } from './ContactStep'

export type BookingFormData = {
  // Step 1: Trip Details
  city: string
  dates: { start: string; end?: string }
  preferredTime: 'morning' | 'afternoon' | 'evening' | ''
  numberOfGuests: number
  groupType: 'family' | 'friends' | 'solo' | 'business' | ''
  accessibilityNeeds?: string

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
  termsAccepted?: boolean
}

const STEPS = [
  { id: 1, name: 'Trip Details', description: 'Where and when?' },
  { id: 2, name: 'Preferences', description: 'What are you looking for?' },
  { id: 3, name: 'Contact', description: 'How can we reach you?' },
]

export function BookingForm() {
  // const { data: session } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
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

  // // Pre-fill email from session
  // useEffect(() => {
  //   if (session?.user?.email) {
  //     setFormData((prev) => ({ ...prev, email: session.user.email! }))
  //   }
  // }, [session])

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
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the terms and conditions'
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
      // Use the new authenticated endpoint
      const response = await fetch('/api/tourist/request/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: formData.city,
          dates: formData.dates,
          preferredTime: formData.preferredTime,
          numberOfGuests: formData.numberOfGuests,
          groupType: formData.groupType,
          accessibilityNeeds: formData.accessibilityNeeds,
          preferredNationality: formData.preferredNationality,
          preferredLanguages: formData.preferredLanguages,
          preferredGender: formData.preferredGender,
          serviceType: formData.serviceType,
          interests: formData.interests,
          budget: formData.budget,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          contactMethod: formData.contactMethod,
          tripNotes: formData.tripNotes,
        }),
      })

      const data = await response.json()

      if (data.success && data.requestId) {
        // Redirect to matching page
        router.push(`/booking/select-guide?requestId=${data.requestId}`)
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

  return (
    <div className="relative w-full max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        {/* Mobile Progress - Dots */}
        <div className="md:hidden mb-4">
          <div className="flex justify-center items-center space-x-2 mb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentStep > step.id
                    ? 'bg-green-500 w-2.5'
                    : currentStep === step.id
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 w-2.5'
                }`}
                aria-label={`Step ${step.id}: ${step.name}`}
              />
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-900">
              Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
            </p>
            <p className="text-xs text-gray-600">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Desktop Progress - Full Stepper */}
        <div className="hidden md:flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-soft ${
                    currentStep >= step.id
                      ? 'gradient-ocean border-blue-600 text-white shadow-premium scale-110'
                      : 'glass-frosted border-gray-300 text-gray-700'
                  }`}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-4 rounded transition-all duration-300 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="relative glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 hover-lift">
        <div className="relative z-10">
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
            className="hover-lift shadow-soft"
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift"
          >
            {currentStep === 3 ? (
              isSubmitting ? 'Creating Booking...' : 'Create Booking'
            ) : (
              'Next'
            )}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}
