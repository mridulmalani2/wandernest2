'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BasicProfileStep } from './BasicProfileStep';
import { StudentVerificationStep } from './StudentVerificationStep';
import { CoverLetterStep } from './CoverLetterStep';
import { AvailabilityStep } from './AvailabilityStep';
import { ReviewSubmitStep } from './ReviewSubmitStep';

export type OnboardingFormData = {
  // Step 1: Basic Profile
  name: string;
  gender: 'male' | 'female' | 'prefer_not_to_say' | '';
  nationality: string;
  institute: string;
  city: string;

  // Step 2: Student Verification
  idCardFile: File | null;
  idCardPreview: string;
  studentConfirmation: boolean;

  // Step 3: Cover Letter
  coverLetter: string;
  languages: string[];
  interests: string[];
  bio?: string;

  // Step 4: Availability
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    note?: string;
  }>;
  unavailableNotes?: string;
};

const STEPS = [
  { id: 1, name: 'Basic Profile', description: 'Tell us about yourself' },
  { id: 2, name: 'Verification', description: 'Verify student status' },
  { id: 3, name: 'Cover Letter', description: 'Describe your expertise' },
  { id: 4, name: 'Availability', description: 'Set your schedule' },
  { id: 5, name: 'Review', description: 'Review and submit' },
];

const CITIES = ['Paris', 'London'];

interface OnboardingWizardProps {
  session: Session;
}

export function OnboardingWizard({ session }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: session.user.name || '',
    gender: '',
    nationality: '',
    institute: '',
    city: '',
    idCardFile: null,
    idCardPreview: '',
    studentConfirmation: false,
    coverLetter: '',
    languages: [],
    interests: [],
    availability: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const newErrors = { ...errors };
    Object.keys(data).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.gender) newErrors.gender = 'Gender selection is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.institute.trim()) newErrors.institute = 'Educational institute is required';
      if (!formData.city) newErrors.city = 'City selection is required';
    }

    if (step === 2) {
      if (!formData.idCardFile && !formData.idCardPreview) {
        newErrors.idCardFile = 'Student ID card upload is required';
      }
      if (!formData.studentConfirmation) {
        newErrors.studentConfirmation = 'You must confirm your enrollment status';
      }
    }

    if (step === 3) {
      if (!formData.coverLetter.trim()) {
        newErrors.coverLetter = 'Cover letter is required';
      } else if (formData.coverLetter.trim().length < 200) {
        newErrors.coverLetter = 'Cover letter must be at least 200 characters';
      }
      if (formData.languages.length === 0) {
        newErrors.languages = 'At least one language is required';
      }
      if (formData.interests.length === 0) {
        newErrors.interests = 'At least one interest is required';
      }
    }

    if (step === 4) {
      if (formData.availability.length === 0) {
        newErrors.availability = 'At least one availability slot is required';
      } else {
        // Check if any slot is at least 3 hours
        const hasValidSlot = formData.availability.some((slot) => {
          const start = slot.startTime.split(':').map(Number);
          const end = slot.endTime.split(':').map(Number);
          const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
          return duration >= 180; // 3 hours in minutes
        });
        if (!hasValidSlot) {
          newErrors.availability = 'At least one slot must be 3+ hours (most experiences are 3-4 hours)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload the ID card if there's a file
      let idCardUrl = formData.idCardPreview;

      if (formData.idCardFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', formData.idCardFile);
        uploadFormData.append('type', 'student_id');

        const uploadResponse = await fetch('/api/student/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload student ID');
        }

        const uploadData = await uploadResponse.json();
        idCardUrl = uploadData.url;
      }

      // Submit onboarding data
      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          googleId: session.user.id,
          name: formData.name,
          gender: formData.gender,
          nationality: formData.nationality,
          institute: formData.institute,
          city: formData.city,
          idCardUrl: idCardUrl,
          coverLetter: formData.coverLetter,
          languages: formData.languages,
          interests: formData.interests,
          bio: formData.bio,
          availability: formData.availability,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit onboarding');
      }

      // Redirect to confirmation page
      router.push('/student/onboarding/success');
    } catch (error) {
      console.error('Onboarding submission error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit onboarding. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/30 backdrop-blur-md sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 rounded-lg gradient-vibrant text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-premium">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gradient-vibrant">
              WanderNest
            </h1>
          </Link>
          <div className="text-sm text-gray-600 font-medium">
            {session.user.email}
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Students background"
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
        <div className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
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
            <div className="hidden md:flex items-center justify-between mb-2">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-all duration-300 ${
                        currentStep > step.id
                          ? 'bg-green-500 text-white shadow-lg'
                          : currentStep === step.id
                          ? 'bg-blue-600 text-white shadow-lg scale-110'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium">{step.name}</div>
                      <div className="text-xs text-gray-500">{step.description}</div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 mb-8 rounded transition-all duration-300 ${
                        currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl border shadow-lg p-8">
            <div className="absolute inset-0 opacity-10">
              <Image
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80"
                alt="Student life background"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-white/85 backdrop-blur-sm" />
            <div className="relative z-10">
            {/* Step Content */}
            {currentStep === 1 && (
              <BasicProfileStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                cities={CITIES}
              />
            )}
            {currentStep === 2 && (
              <StudentVerificationStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 3 && (
              <CoverLetterStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                city={formData.city}
              />
            )}
            {currentStep === 4 && (
              <AvailabilityStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 5 && (
              <ReviewSubmitStep
                formData={formData}
                errors={errors}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                Back
              </Button>
              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                </Button>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {errors.submit}
              </div>
            )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
