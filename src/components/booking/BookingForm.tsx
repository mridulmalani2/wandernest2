'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { TripDetailsStep } from './TripDetailsStep'
import { PreferencesStep } from './PreferencesStep'
import { ContactStep } from './ContactStep'
import { FormProgressHeader } from '@/components/shared/FormProgressHeader'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'

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
  hourlyRate?: number
  totalBudget?: number
  discoveryFeeConsent?: boolean
  callDurationMinutes?: number
  tourDurationHours?: number

  // Step 3: Contact
  email: string
  phone?: string
  whatsapp?: string
  contactMethod: 'email' | 'phone' | 'whatsapp' | 'sms' | ''
  tripNotes?: string
  termsAccepted?: boolean
  referralEmail?: string
}

const STEPS = [
  { id: 1, name: 'Trip Details', description: 'Where and when?' },
  { id: 2, name: 'Preferences', description: 'What are you looking for?' },
  { id: 3, name: 'Contact', description: 'How can we reach you?' },
]

export function BookingForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
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
    discoveryFeeConsent: false,
    email: '',
    contactMethod: 'email',
    preferredGender: 'no_preference',
    hourlyRate: 20, // Default recommended rate
    totalBudget: 0,
    referralEmail: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-fill email from session
  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: session.user.email! }))
    }
  }, [session, formData.email])

  const updateFormData = (data: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const getStepErrors = (step: number, data: BookingFormData): Record<string, string> => {
    const newErrors: Record<string, string> = {}
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (step === 1) {
      if (!data.city) newErrors.city = 'City is required'
      if (!data.dates.start) newErrors.dates = 'Start date is required'
      if (!data.preferredTime) newErrors.preferredTime = 'Time preference is required'
      if (data.dates.start) {
        const startDate = new Date(data.dates.start)
        startDate.setHours(0, 0, 0, 0)
        if (startDate < today) {
          newErrors.dates = 'Start date cannot be in the past'
        }
      }
      if (data.numberOfGuests < 1 || data.numberOfGuests > 10) {
        newErrors.numberOfGuests = 'Guest count must be between 1 and 10'
      }
      if (!data.groupType) newErrors.groupType = 'Group type is required'
    }

    if (step === 2) {
      if (data.preferredLanguages.length === 0) {
        newErrors.preferredLanguages = 'At least one language is required'
      }
      if (!data.serviceType) newErrors.serviceType = 'Service type is required'
      if (data.interests.length === 0) {
        newErrors.interests = 'At least one interest is required'
      }
    }

    if (step === 3) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!data.email) {
        newErrors.email = 'Email is required'
      } else if (!emailRegex.test(data.email)) {
        newErrors.email = 'Invalid email address'
      }
      if (!data.contactMethod) {
        newErrors.contactMethod = 'Contact method is required'
      }
      if (!data.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the terms and conditions'
      }
    }

    return newErrors
  }

  const validateStep = (step: number): boolean => {
    const newErrors = getStepErrors(step, formData)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep])
      }
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setErrors({})
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    const allErrors: Record<string, string> = {}

    for (let step = 1; step <= 3; step++) {
      const stepErrors = getStepErrors(step, formData)
      Object.assign(allErrors, stepErrors)
    }

    if (Object.keys(allErrors).length > 0) {
      setErrors({
        ...allErrors,
        submit: 'Please complete all required fields in all sections before submitting.',
      })
      // If there are errors, ensure we navigate to the first step with errors or stay on current if appropriate.
      // For now, simpler to just show the errors.
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/tourist/request/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          budget: formData.totalBudget,
          discoveryFeeConsent: formData.discoveryFeeConsent,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          contactMethod: formData.contactMethod,
          tripNotes: formData.tripNotes,
          referralEmail: formData.referralEmail,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.requestId) {
        router.push(`/booking/select-guide?requestId=${data.requestId}`)
      } else if (response.status === 401) {
        setErrors({
          submit: 'You must be signed in to create a booking request. Please refresh the page and sign in.',
        })
      } else {
        setErrors({
          submit: data.error || 'Failed to submit booking request. Please try again or contact support.',
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({
        submit: 'A network error occurred. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="mb-6 md:mb-8">
        <FormProgressHeader
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      <div className="relative glass-card-dark rounded-3xl border-2 border-white/10 shadow-premium p-5 md:p-8 hover-lift">
        <div className="relative z-10">
          <div className="animate-fade-in">
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
          </div>

          <div className="mt-8 flex justify-between pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="hover-lift shadow-soft bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
            >
              Back
            </Button>

            <PrimaryCTAButton
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              variant="blue"
            >
              {currentStep === 3 ? (
                isSubmitting ? 'Creating Booking...' : 'Create Booking'
              ) : (
                'Next'
              )}
            </PrimaryCTAButton>
          </div>

          {errors.submit && (
            <div className="mt-4 p-4 glass-frosted bg-gradient-to-br from-ui-error/10 to-ui-error/20 border-2 border-ui-error rounded-2xl text-ui-error text-sm shadow-soft animate-slide-down">
              {errors.submit}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
