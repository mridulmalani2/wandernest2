'use client';

import { useState } from 'react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ShieldCheck, UploadCloud, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import { FormProgressHeader } from '@/components/shared/FormProgressHeader';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';

// Dynamically import step components to reduce initial bundle size
// Each step loads only when needed
const BasicProfileStep = dynamic(() => import('./BasicProfileStep').then(mod => ({ default: mod.BasicProfileStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

const StudentVerificationStep = dynamic(() => import('./StudentVerificationStep').then(mod => ({ default: mod.StudentVerificationStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

const CoverLetterStep = dynamic(() => import('./CoverLetterStep').then(mod => ({ default: mod.CoverLetterStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

const AvailabilityStep = dynamic(() => import('./AvailabilityStep').then(mod => ({ default: mod.AvailabilityStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

const ServicePreferencesStep = dynamic(() => import('./ServicePreferencesStep').then(mod => ({ default: mod.ServicePreferencesStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

const SafetyComplianceStep = dynamic(() => import('./SafetyComplianceStep').then(mod => ({ default: mod.SafetyComplianceStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

const ReviewSubmitStep = dynamic(() => import('./ReviewSubmitStep').then(mod => ({ default: mod.ReviewSubmitStep })), {
  loading: () => <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-ui-blue-primary border-t-transparent rounded-full" /></div>
});

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
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
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
      // Mark current step as completed when moving forward
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStepClick = (stepId: number) => {
    // Allow navigation to any step without validation
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStepErrors = (step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    // Step 1: Basic Profile
    if (step === 1) {
      if (!formData.name.trim()) stepErrors.name = 'Name is required';
      if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) stepErrors.gender = 'Gender selection is required';
      if (!formData.nationality.trim()) stepErrors.nationality = 'Nationality is required';
      if (!formData.phoneNumber.trim()) stepErrors.phoneNumber = 'Phone number is required';
      if (!formData.city) stepErrors.city = 'City selection is required';
      if (!formData.campus) stepErrors.campus = 'Campus selection is required';
      if (!formData.institute.trim()) stepErrors.institute = 'University name is required';
      if (!formData.programDegree.trim()) stepErrors.programDegree = 'Program/Degree is required';
      if (!formData.yearOfStudy) stepErrors.yearOfStudy = 'Year of study is required';
      if (!formData.expectedGraduation.trim()) stepErrors.expectedGraduation = 'Expected graduation is required';
      if (formData.languages.length === 0) stepErrors.languages = 'At least one language is required';
    }

    // Step 2: Identity Verification
    if (step === 2) {
      if (!formData.studentIdFile && !formData.studentIdPreview) {
        stepErrors.studentIdFile = 'Student ID card upload is required';
      }
      if (!formData.studentIdExpiry) {
        stepErrors.studentIdExpiry = 'Student ID expiry date is required';
      }
      if (!formData.governmentIdFile && !formData.governmentIdPreview) {
        stepErrors.governmentIdFile = 'Government ID upload is required';
      }
      if (!formData.governmentIdExpiry) {
        stepErrors.governmentIdExpiry = 'Government ID expiry date is required';
      }
      if (!formData.selfieFile && !formData.selfiePreview) {
        stepErrors.selfieFile = 'Selfie upload is required';
      }
      if (!formData.profilePhotoFile && !formData.profilePhotoPreview) {
        stepErrors.profilePhotoFile = 'Profile photo upload is required';
      }
      if (!formData.documentsOwnedConfirmation) {
        stepErrors.documentsOwnedConfirmation = 'You must confirm document ownership';
      }
      if (!formData.verificationConsent) {
        stepErrors.verificationConsent = 'You must consent to verification';
      }
    }

    // Step 3: Profile Information
    if (step === 3) {
      if (!formData.bio.trim()) {
        stepErrors.bio = 'Bio is required';
      } else if (formData.bio.trim().length < 50) {
        stepErrors.bio = 'Bio must be at least 50 characters';
      }
      if (formData.skills.length === 0) {
        stepErrors.skills = 'At least one skill is required';
      }
      if (!formData.coverLetter.trim()) {
        stepErrors.coverLetter = 'Cover letter is required';
      } else if (formData.coverLetter.trim().length < 200) {
        stepErrors.coverLetter = 'Cover letter must be at least 200 characters';
      }
      if (formData.interests.length === 0) {
        stepErrors.interests = 'At least one interest is required';
      }
    }

    // Step 4: Availability
    if (step === 4) {
      if (formData.availability.length === 0) {
        stepErrors.availability = 'At least one availability slot is required';
      } else {
        const hasValidSlot = formData.availability.some((slot) => {
          const start = slot.startTime.split(':').map(Number);
          const end = slot.endTime.split(':').map(Number);
          const duration = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
          return duration >= 180;
        });
        if (!hasValidSlot) {
          stepErrors.availability = 'At least one slot must be 3+ hours';
        }
      }
      if (!formData.timezone) stepErrors.timezone = 'Timezone is required';
      if (formData.preferredDurations.length === 0) {
        stepErrors.preferredDurations = 'At least one preferred duration is required';
      }
    }

    // Step 5: Service Preferences
    if (step === 5) {
      if (formData.servicesOffered.length === 0) {
        stepErrors.servicesOffered = 'At least one service must be selected';
      }
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
        stepErrors.hourlyRate = 'Valid hourly rate is required';
      }
    }

    // Step 6: Safety & Compliance
    if (step === 6) {
      if (!formData.termsAccepted) {
        stepErrors.termsAccepted = 'You must accept the Terms & Conditions';
      }
      if (!formData.independentGuideAcknowledged) {
        stepErrors.independentGuideAcknowledged = 'You must acknowledge independent guide status';
      }
      if (!formData.safetyGuidelinesAccepted) {
        stepErrors.safetyGuidelinesAccepted = 'You must accept safety guidelines';
      }
    }

    return stepErrors;
  };

  const handleSubmit = async () => {
    // Validate ALL steps before final submission
    let allValid = true;
    const incompleteSteps: Array<{ id: number; name: string; errors: string[] }> = [];

    for (let step = 1; step <= STEPS.length - 1; step++) {
      const stepErrors = getStepErrors(step);
      if (Object.keys(stepErrors).length > 0) {
        allValid = false;
        const stepInfo = STEPS.find(s => s.id === step);
        incompleteSteps.push({
          id: step,
          name: stepInfo?.name || `Step ${step}`,
          errors: Object.values(stepErrors),
        });
      }
    }

    if (!allValid) {
      setErrors({
        submit: 'Please complete all required fields in all sections before submitting.',
        incompleteSteps: JSON.stringify(incompleteSteps),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            const errorData = await uploadResponse.json().catch(() => ({}));
            const errorMessage = errorData.error || `Failed to upload ${type.replace('_', ' ')}`;
            console.error(`Upload error for ${type}:`, errorData);
            throw new Error(errorMessage);
          }

          const uploadData = await uploadResponse.json();
          uploadedUrls[type] = uploadData.url;
        } else if (preview) {
          // If preview exists but no file, it might be from a previous upload
          uploadedUrls[type] = preview;
        }
      }

      // Ensure all document URLs are ready before submission
      const requiredUploads: Array<[keyof typeof uploadedUrls, string]> = [
        ['student_id', 'Student ID'],
        ['government_id', 'Government ID'],
        ['selfie', 'Verification selfie'],
        ['profile_photo', 'Profile photo'],
      ];

      const missingUploads = requiredUploads.filter(([key]) => !uploadedUrls[key]);
      if (missingUploads.length > 0) {
        const missingLabels = missingUploads.map(([, label]) => label).join(', ');
        throw new Error(`Please re-upload the following files: ${missingLabels}.`);
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
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ui-purple-accent))]/15 via-[hsl(var(--ui-blue-primary))]/10 to-[hsl(var(--ui-purple-primary))]/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <Navigation variant="student" />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 flex-1">
          <div className="max-w-5xl mx-auto mb-10 sm:mb-12 text-center animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-white text-shadow-lg leading-tight">
              Become a TourWiseCo Guide
            </h1>
            <p className="text-white text-base sm:text-lg lg:text-xl text-shadow max-w-3xl mx-auto leading-relaxed">
              Join our community of student guides and start earning by sharing your city with travelers.
              Complete your profile in just a few steps.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid gap-3 sm:gap-4 sm:grid-cols-3 mb-8 sm:mb-12 animate-fade-in-up delay-150">
            <div className="glass-card rounded-2xl border border-white/30 shadow-premium p-4 flex items-center gap-3 backdrop-blur-md">
              <span className="p-2.5 rounded-xl bg-white/15 text-white">
                <UploadCloud className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className="text-sm text-white/70">Fast uploads</p>
                <p className="text-base font-semibold text-white">Drag, drop, done</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl border border-white/30 shadow-premium p-4 flex items-center gap-3 backdrop-blur-md">
              <span className="p-2.5 rounded-xl bg-white/15 text-white">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className="text-sm text-white/70">Secure & verified</p>
                <p className="text-base font-semibold text-white">Identity protected</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl border border-white/30 shadow-premium p-4 flex items-center gap-3 backdrop-blur-md sm:col-span-1">
              <span className="p-2.5 rounded-xl bg-white/15 text-white">
                <Sparkles className="w-5 h-5" />
              </span>
              <div className="text-left">
                <p className="text-sm text-white/70">Modern intake</p>
                <p className="text-base font-semibold text-white">UI built for speed</p>
              </div>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="max-w-5xl mx-auto mb-8 sm:mb-10">
            <FormProgressHeader
              steps={STEPS}
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Form Steps */}
          <div className="relative max-w-5xl mx-auto animate-fade-in-up delay-200">
            <div className="relative glass-card rounded-3xl border-2 border-white/40 shadow-premium p-6 sm:p-10 lg:p-12 hover-lift transition-all duration-300">
              <div className="relative z-10">
            {/* Step Content with fade transition */}
            <div className="min-h-[600px] transition-opacity duration-300">
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
            </div>

                {/* Navigation Buttons */}
                <div className="mt-10 pt-8 border-t border-white/20 flex flex-col-reverse sm:flex-row justify-between gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1 || isSubmitting}
                    className="hover-lift shadow-soft bg-white/80 hover:bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 px-8 py-6 text-base font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Back
                  </Button>

                  {currentStep < STEPS.length ? (
                    <PrimaryCTAButton
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                      variant="blue"
                      className="px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Continue →
                    </PrimaryCTAButton>
                  ) : (
                    <PrimaryCTAButton
                      type="button"
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                      loadingText="Submitting..."
                      variant="blue"
                      className="px-8 py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      ✓ Submit for Review
                    </PrimaryCTAButton>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="mt-4 space-y-3">
                    <div className="p-4 glass-frosted bg-gradient-to-br from-[hsl(var(--ui-error))]/10 to-[hsl(var(--ui-error))]/20 border-2 border-[hsl(var(--ui-error))] rounded-2xl text-[hsl(var(--ui-error))] text-sm shadow-soft">
                      {errors.submit}
                    </div>

                    {/* Missing Steps Popup */}
                    {errors.incompleteSteps && (() => {
                      try {
                        const incompleteSteps = JSON.parse(errors.incompleteSteps) as Array<{
                          id: number;
                          name: string;
                          errors: string[];
                        }>;

                        return incompleteSteps.length > 0 ? (
                          <div className="p-4 glass-frosted bg-gradient-to-br from-[hsl(var(--ui-error))]/5 to-[hsl(var(--ui-error))]/10 border border-[hsl(var(--ui-error))]/50 rounded-2xl shadow-soft animate-fade-in-up">
                            <h3 className="font-semibold text-[hsl(var(--ui-error))] mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Missing Steps ({incompleteSteps.length})
                            </h3>
                            <div className="space-y-2">
                              {incompleteSteps.map((step) => (
                                <div
                                  key={step.id}
                                  className="p-3 bg-white/10 rounded-lg cursor-pointer hover:bg-white/20 transition-colors"
                                  onClick={() => handleStepClick(step.id)}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="font-medium text-[hsl(var(--ui-error))]">
                                        Step {step.id}: {step.name}
                                      </div>
                                      <div className="text-xs text-[hsl(var(--ui-error))]/80 mt-1">
                                        {step.errors.length} issue{step.errors.length > 1 ? 's' : ''} found
                                      </div>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepClick(step.id);
                                      }}
                                      className="text-xs px-3 py-1 bg-[hsl(var(--ui-error))]/20 hover:bg-[hsl(var(--ui-error))]/30 text-[hsl(var(--ui-error))] rounded-lg transition-colors font-medium"
                                    >
                                      Fix Now
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-[hsl(var(--ui-error))]/70 mt-3 italic">
                              Click on any step above to navigate and complete the missing fields
                            </p>
                          </div>
                        ) : null;
                      } catch {
                        return null;
                      }
                    })()}
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
