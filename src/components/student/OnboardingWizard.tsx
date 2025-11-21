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
import { ServicePreferencesStep } from './ServicePreferencesStep';
import { SafetyComplianceStep } from './SafetyComplianceStep';
import { ReviewSubmitStep } from './ReviewSubmitStep';

export type OnboardingFormData = {
  // Step 1: Basic Profile - Personal Details
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'prefer_not_to_say' | '';
  nationality: string;
  phoneNumber: string;
  email: string;
  city: string;
  campus: string;

  // Step 1: Basic Profile - Academic Details
  institute: string;
  programDegree: string;
  yearOfStudy: string;
  expectedGraduation: string;
  languages: string[];

  // Step 2: Identity Verification
  studentIdFile: File | null;
  studentIdPreview: string;
  studentIdExpiry: string;
  governmentIdFile: File | null;
  governmentIdPreview: string;
  governmentIdExpiry: string;
  selfieFile: File | null;
  selfiePreview: string;
  profilePhotoFile: File | null;
  profilePhotoPreview: string;
  documentsOwnedConfirmation: boolean;
  verificationConsent: boolean;

  // Step 3: Profile Information
  bio: string;
  skills: string[];
  preferredGuideStyle: string;
  coverLetter: string;
  interests: string[];

  // Step 4: Availability
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    note?: string;
  }>;
  unavailabilityExceptions: Array<{
    date: string;
    reason?: string;
  }>;
  timezone: string;
  preferredDurations: string[];

  // Step 5: Service Preferences
  servicesOffered: string[];
  hourlyRate: string;
  onlineServicesAvailable: boolean;

  // Step 6: Safety & Compliance
  termsAccepted: boolean;
  safetyGuidelinesAccepted: boolean;
  independentGuideAcknowledged: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

const STEPS = [
  { id: 1, name: 'Basic Profile', description: 'Personal & academic info' },
  { id: 2, name: 'Verification', description: 'Identity verification' },
  { id: 3, name: 'Profile', description: 'Your guide profile' },
  { id: 4, name: 'Availability', description: 'Set your schedule' },
  { id: 5, name: 'Services', description: 'Service preferences' },
  { id: 6, name: 'Safety', description: 'Terms & safety' },
  { id: 7, name: 'Review', description: 'Review and submit' },
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
    // Step 1: Basic Profile
    name: session.user.name || '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    phoneNumber: '',
    email: session.user.email || '',
    city: '',
    campus: '',
    institute: '',
    programDegree: '',
    yearOfStudy: '',
    expectedGraduation: '',
    languages: [],

    // Step 2: Identity Verification
    studentIdFile: null,
    studentIdPreview: '',
    studentIdExpiry: '',
    governmentIdFile: null,
    governmentIdPreview: '',
    governmentIdExpiry: '',
    selfieFile: null,
    selfiePreview: '',
    profilePhotoFile: null,
    profilePhotoPreview: '',
    documentsOwnedConfirmation: false,
    verificationConsent: false,

    // Step 3: Profile Information
    bio: '',
    skills: [],
    preferredGuideStyle: '',
    coverLetter: '',
    interests: [],

    // Step 4: Availability
    availability: [],
    unavailabilityExceptions: [],
    timezone: 'Europe/Paris', // Default to first available option to match dropdown
    preferredDurations: [],

    // Step 5: Service Preferences
    servicesOffered: [],
    hourlyRate: '',
    onlineServicesAvailable: false,

    // Step 6: Safety & Compliance
    termsAccepted: false,
    safetyGuidelinesAccepted: false,
    independentGuideAcknowledged: false,
    emergencyContactName: '',
    emergencyContactPhone: '',
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

    // Step 1: Basic Profile
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender selection is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.city) newErrors.city = 'City selection is required';
      if (!formData.campus) newErrors.campus = 'Campus selection is required';
      if (!formData.institute.trim()) newErrors.institute = 'University name is required';
      if (!formData.programDegree.trim()) newErrors.programDegree = 'Program/Degree is required';
      if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study is required';
      if (!formData.expectedGraduation.trim()) newErrors.expectedGraduation = 'Expected graduation is required';
      if (formData.languages.length === 0) newErrors.languages = 'At least one language is required';
    }

    // Step 2: Identity Verification
    if (step === 2) {
      if (!formData.studentIdFile && !formData.studentIdPreview) {
        newErrors.studentIdFile = 'Student ID card upload is required';
      }
      if (!formData.studentIdExpiry) {
        newErrors.studentIdExpiry = 'Student ID expiry date is required';
      }
      if (!formData.governmentIdFile && !formData.governmentIdPreview) {
        newErrors.governmentIdFile = 'Government ID upload is required';
      }
      if (!formData.governmentIdExpiry) {
        newErrors.governmentIdExpiry = 'Government ID expiry date is required';
      }
      if (!formData.selfieFile && !formData.selfiePreview) {
        newErrors.selfieFile = 'Selfie upload is required';
      }
      if (!formData.profilePhotoFile && !formData.profilePhotoPreview) {
        newErrors.profilePhotoFile = 'Profile photo upload is required';
      }
      if (!formData.documentsOwnedConfirmation) {
        newErrors.documentsOwnedConfirmation = 'You must confirm document ownership';
      }
      if (!formData.verificationConsent) {
        newErrors.verificationConsent = 'You must consent to verification';
      }
    }

    // Step 3: Profile Information
    if (step === 3) {
      if (!formData.bio.trim()) {
        newErrors.bio = 'Bio is required';
      } else if (formData.bio.trim().length < 50) {
        newErrors.bio = 'Bio must be at least 50 characters';
      }
      if (formData.skills.length === 0) {
        newErrors.skills = 'At least one skill is required';
      }
      if (!formData.coverLetter.trim()) {
        newErrors.coverLetter = 'Cover letter is required';
      } else if (formData.coverLetter.trim().length < 200) {
        newErrors.coverLetter = 'Cover letter must be at least 200 characters';
      }
      if (formData.interests.length === 0) {
        newErrors.interests = 'At least one interest is required';
      }
    }

    // Step 4: Availability
    if (step === 4) {
      if (formData.availability.length === 0) {
        newErrors.availability = 'At least one availability slot is required';
      } else {
        const hasValidSlot = formData.availability.some((slot) => {
          const start = slot.startTime.split(':').map(Number);
          const end = slot.endTime.split(':').map(Number);
          const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
          return duration >= 180;
        });
        if (!hasValidSlot) {
          newErrors.availability = 'At least one slot must be 3+ hours';
        }
      }
      if (!formData.timezone) newErrors.timezone = 'Timezone is required';
      if (formData.preferredDurations.length === 0) {
        newErrors.preferredDurations = 'At least one preferred duration is required';
      }
    }

    // Step 5: Service Preferences
    if (step === 5) {
      if (formData.servicesOffered.length === 0) {
        newErrors.servicesOffered = 'At least one service must be selected';
      }
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
        newErrors.hourlyRate = 'Valid hourly rate is required';
      }
    }

    // Step 6: Safety & Compliance
    if (step === 6) {
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = 'You must accept the Terms & Conditions';
      }
      if (!formData.independentGuideAcknowledged) {
        newErrors.independentGuideAcknowledged = 'You must acknowledge independent guide status';
      }
      if (!formData.safetyGuidelinesAccepted) {
        newErrors.safetyGuidelinesAccepted = 'You must accept safety guidelines';
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
      // Upload all files
      const filesToUpload = [
        { file: formData.studentIdFile, type: 'student_id', preview: formData.studentIdPreview },
        { file: formData.governmentIdFile, type: 'government_id', preview: formData.governmentIdPreview },
        { file: formData.selfieFile, type: 'selfie', preview: formData.selfiePreview },
        { file: formData.profilePhotoFile, type: 'profile_photo', preview: formData.profilePhotoPreview },
      ];

      const uploadedUrls: Record<string, string> = {};

      for (const { file, type, preview } of filesToUpload) {
        if (file) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          uploadFormData.append('type', type);

          const uploadResponse = await fetch('/api/student/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${type.replace('_', ' ')}`);
          }

          const uploadData = await uploadResponse.json();
          uploadedUrls[type] = uploadData.url;
        } else if (preview) {
          uploadedUrls[type] = preview;
        }
      }

      // Submit onboarding data with all fields
      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Authentication
          email: session.user.email,
          googleId: session.user.id,

          // Personal Details
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
          campus: formData.campus,

          // Academic Details
          institute: formData.institute,
          programDegree: formData.programDegree,
          yearOfStudy: formData.yearOfStudy,
          expectedGraduation: formData.expectedGraduation,
          languages: formData.languages,

          // Identity Verification
          studentIdUrl: uploadedUrls['student_id'],
          studentIdExpiry: formData.studentIdExpiry,
          governmentIdUrl: uploadedUrls['government_id'],
          governmentIdExpiry: formData.governmentIdExpiry,
          selfieUrl: uploadedUrls['selfie'],
          profilePhotoUrl: uploadedUrls['profile_photo'],
          documentsOwnedConfirmation: formData.documentsOwnedConfirmation,
          verificationConsent: formData.verificationConsent,

          // Profile Information
          bio: formData.bio,
          skills: formData.skills,
          preferredGuideStyle: formData.preferredGuideStyle,
          coverLetter: formData.coverLetter,
          interests: formData.interests,

          // Availability
          availability: formData.availability,
          unavailabilityExceptions: formData.unavailabilityExceptions.length > 0
            ? formData.unavailabilityExceptions
            : undefined,
          timezone: formData.timezone,
          preferredDurations: formData.preferredDurations,

          // Service Preferences
          servicesOffered: formData.servicesOffered,
          hourlyRate: parseFloat(formData.hourlyRate),
          onlineServicesAvailable: formData.onlineServicesAvailable,

          // Safety & Compliance
          termsAccepted: formData.termsAccepted,
          safetyGuidelinesAccepted: formData.safetyGuidelinesAccepted,
          independentGuideAcknowledged: formData.independentGuideAcknowledged,
          emergencyContactName: formData.emergencyContactName || undefined,
          emergencyContactPhone: formData.emergencyContactPhone || undefined,
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
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="absolute inset-0" role="img" aria-label="Students studying and collaborating">
        <Image
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
          alt="Students studying and collaborating"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
        {/* Gradient overlay for visual depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/15 via-blue-600/10 to-pink-600/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b-2 glass-card border-white/40 shadow-premium sticky top-0 z-50 animate-fade-in">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="p-1.5 rounded-lg gradient-ocean text-white group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                WanderNest
              </h1>
            </Link>
            <div className="text-sm text-white font-medium" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
              {session.user.email}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto mb-8 text-center animate-fade-in-up">
            <h1 className="text-4xl font-bold mb-4 text-white text-shadow-lg">Become a WanderNest Guide</h1>
            <p className="text-white text-lg text-shadow">
              Complete your profile to start connecting with travelers from around the world
            </p>
          </div>

          {/* Step Indicator */}
          <div className="max-w-4xl mx-auto mb-8">
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
                <p className="text-sm font-semibold text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                  Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}
                </p>
                <p className="text-xs text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>{STEPS[currentStep - 1].description}</p>
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
                          : 'glass-frosted border-white/60 text-white'
                      }`}
                    >
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className="text-sm font-medium text-white"
                        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>{step.description}</p>
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
          <div className="relative max-w-4xl mx-auto animate-fade-in-up delay-200">
            <div className="relative glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 hover-lift">
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
              <ServicePreferencesStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 6 && (
              <SafetyComplianceStep
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
              />
            )}
            {currentStep === 7 && (
              <ReviewSubmitStep
                formData={formData}
                errors={errors}
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

                  {currentStep < STEPS.length ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      className="gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="gradient-ocean hover:shadow-glow-blue shadow-premium hover-lift"
                    >
                      {isSubmitting ? 'Submitting for Review...' : 'Submit for Review'}
                    </Button>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="mt-4 p-4 glass-frosted bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl text-red-800 text-sm shadow-soft">
                    {errors.submit}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
