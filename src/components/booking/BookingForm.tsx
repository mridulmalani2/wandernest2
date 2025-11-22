'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TripDetailsStep } from './TripDetailsStep'
import { PreferencesStep } from './PreferencesStep'
import { ContactStep } from './ContactStep'
import { FormProgressHeader } from '@/components/shared/FormProgressHeader'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import { useDevAuth } from '@/lib/dev-auth-bypass'

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
  totalBudget?: number
  callDurationMinutes?: number
  tourDurationHours?: number

  // Step 3: Contact
  email: string
  phone?: string
  whatsapp?: string
  contactMethod: 'email' | 'phone' | 'whatsapp' | 'sms' | ''
  tripNotes?: string
  termsAccepted?: boolean
}

const STEPS = [
  { id: 1, name: 'Trip Details', description: 'Where and when?' },
  { id: 2, name: 'Preferences', description: 'What are you looking for?' },
  { id: 3, name: 'Contact', description: 'How can we reach you?' },
]

export function BookingForm() {
  const router = useRouter()
  const devAuth = useDevAuth()
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
    email: '',
    contactMethod: 'email',
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
      // Mark current step as completed when moving forward
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
    // Allow navigation to any step without validation
    setCurrentStep(stepId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    // Validate ALL steps before final submission
    let allValid = true
    const allErrors: Record<string, string> = {}

    for (let step = 1; step <= 3; step++) {
      const stepValid = validateStep(step)
      if (!stepValid) {
        allValid = false
        // Collect errors from all steps
        Object.assign(allErrors, errors)
      }
    }

    if (!allValid) {
      setErrors({
        submit: 'Please complete all required fields in all sections before submitting. Click on any step above to review and complete missing information.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Build headers with dev bypass support
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      // Add dev auth header if bypass is enabled
      if (devAuth.isDevBypassEnabled && devAuth.devUserType) {
        headers['x-dev-user-type'] = devAuth.devUserType
      }

      // Use the new authenticated endpoint
      const response = await fetch('/api/tourist/request/create', {
        method: 'POST',
        headers,
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
          totalBudget: formData.totalBudget,
          callDurationMinutes: formData.callDurationMinutes,
          tourDurationHours: formData.tourDurationHours,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          contactMethod: formData.contactMethod,
          tripNotes: formData.tripNotes,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success && data.requestId) {
        // Redirect to matching page
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
      {/* Step Indicator - Optimized for mobile: reduced bottom margin */}
      <div className="mb-6 md:mb-8">
        <FormProgressHeader
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Form Steps - Optimized for mobile: responsive padding */}
      <div className="relative glass-card rounded-3xl border-2 border-white/40 shadow-premium p-5 md:p-8 hover-lift">
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

        {/* Submit Error */}
        {errors.submit && (
          <div className="mt-4 p-4 glass-frosted bg-gradient-to-br from-ui-error/10 to-ui-error/20 border-2 border-ui-error/30 rounded-2xl text-ui-error text-sm shadow-soft">
            {errors.submit}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
