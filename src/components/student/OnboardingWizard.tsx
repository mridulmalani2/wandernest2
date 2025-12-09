'use client';

import { useState, useEffect } from 'react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import { AlertTriangle } from 'lucide-react';

// Static imports for single page flow
import { BasicProfileStep } from './BasicProfileStep';
import { StudentVerificationStep } from './StudentVerificationStep';
import { SafetyComplianceStep } from './SafetyComplianceStep';

export type OnboardingFormData = {
  // Personal Details
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'prefer_not_to_say' | '';
  nationality: string;
  phoneNumber: string;
  email: string;
  city: string;
  campus: string;

  // Academic Details
  institute: string;
  programDegree: string;
  yearOfStudy: string;
  expectedGraduation: string;
  languages: string[];

  // Identity Verification
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

  // Security (Optional)
  password?: string;
  confirmPassword?: string;

  // Safety & Compliance
  termsAccepted: boolean;
  safetyGuidelinesAccepted: boolean;
  independentGuideAcknowledged: boolean;
  emergencyContactName: string;
  emergencyContactPhone: string;
};

const CITIES = ['Paris', 'London'];

interface OnboardingWizardProps {
  session: Session;
}

export function OnboardingWizard({ session }: OnboardingWizardProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<OnboardingFormData>({
    // Basic Profile
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

    // Identity Verification (Files not persisted in localStorage)
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

    // Safety & Compliance
    termsAccepted: false,
    safetyGuidelinesAccepted: false,
    independentGuideAcknowledged: false,
    emergencyContactName: '',
    emergencyContactPhone: '',


  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);

  // REMOVED LocalStorage logic as per user request to "not keep data"

  const updateFormData = (data: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      Object.keys(data).forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Basic Profile Validations
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else {
      const GENERIC_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com'];
      const domain = formData.email.split('@')[1];
      // Allow generic domains in development
      if (domain && GENERIC_DOMAINS.includes(domain.toLowerCase()) && process.env.NODE_ENV !== 'development') {
        newErrors.email = 'Institutional email required. Please sign out and use your university email.';
      }
    }

    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.campus) newErrors.campus = 'Campus is required';
    if (!formData.institute) newErrors.institute = 'Institute is required';
    if (!formData.programDegree) newErrors.programDegree = 'Program/Degree is required';
    if (!formData.yearOfStudy) newErrors.yearOfStudy = 'Year of study is required';
    if (!formData.expectedGraduation) newErrors.expectedGraduation = 'Expected graduation is required';
    if (!formData.languages || formData.languages.length === 0) newErrors.languages = 'Select at least one language';

    // Password Validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    // Verification Validations
    if (!formData.studentIdFile && !formData.studentIdPreview) newErrors.studentIdFile = 'Student ID card upload is required';
    if (!formData.studentIdExpiry) {
      newErrors.studentIdExpiry = 'Student ID expiry date is required';
    } else {
      const [m, y] = formData.studentIdExpiry.split('/').map(Number);
      // Check if date is valid
      if (m && y) {
        const lastDay = new Date(y, m, 0); // Last day of that month
        const today = new Date();
        if (lastDay < today) {
          newErrors.studentIdExpiry = 'Student ID must be valid (future date)';
        }
      }
    }

    if (!formData.profilePhotoFile && !formData.profilePhotoPreview) newErrors.profilePhotoFile = 'Profile photo upload is required';
    if (!formData.documentsOwnedConfirmation) newErrors.documentsOwnedConfirmation = 'You must confirm document ownership';
    if (!formData.verificationConsent) newErrors.verificationConsent = 'You must consent to verification';

    // Safety Validations
    if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms & Conditions';
    if (!formData.independentGuideAcknowledged) newErrors.independentGuideAcknowledged = 'You must acknowledge independent guide status';
    if (!formData.safetyGuidelinesAccepted) newErrors.safetyGuidelinesAccepted = 'You must accept safety guidelines';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      console.log('Form validation failed:', newErrors);
      const firstError = Object.keys(newErrors)[0];
      const element = document.getElementById(firstError);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return false;
    }
    return true;
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear the form? This will remove all your progress.')) {
      localStorage.removeItem('wandernest_onboarding_draft');
      window.location.reload();
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // 1. Upload Files
      const filesToUpload = [
        { file: formData.studentIdFile, type: 'student_id', preview: formData.studentIdPreview },
        { file: formData.profilePhotoFile, type: 'profile_photo', preview: formData.profilePhotoPreview },
        // Removed Government ID and Selfie
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

          if (!uploadResponse.ok) throw new Error(`Failed to upload ${type.replace('_', ' ')}`);
          const uploadData = await uploadResponse.json();
          uploadedUrls[type] = uploadData.url;
        } else if (preview) {
          uploadedUrls[type] = preview;
        }
      }

      // 2. Submit Data (Injecting Defaults for Hidden Fields)
      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Personal & Academic
          email: formData.email,
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          phoneNumber: formData.phoneNumber,
          city: formData.city,
          campus: formData.campus,
          institute: formData.institute,
          programDegree: formData.programDegree,
          yearOfStudy: formData.yearOfStudy,
          expectedGraduation: formData.expectedGraduation,
          languages: formData.languages,
          password: formData.password || undefined,


          // Files
          studentIdUrl: uploadedUrls['student_id'],
          studentIdExpiry: formData.studentIdExpiry,
          profilePhotoUrl: uploadedUrls['profile_photo'],
          documentsOwnedConfirmation: formData.documentsOwnedConfirmation,
          verificationConsent: formData.verificationConsent,

          // Safety
          termsAccepted: formData.termsAccepted,
          safetyGuidelinesAccepted: formData.safetyGuidelinesAccepted,
          independentGuideAcknowledged: formData.independentGuideAcknowledged,
          emergencyContactName: formData.emergencyContactName || undefined,
          emergencyContactPhone: formData.emergencyContactPhone || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle Zod validation errors from backend
        if (errorData.details && Array.isArray(errorData.details)) {
          const backendErrors: Record<string, string> = {};

          errorData.details.forEach((err: any) => {
            // Handle Zod path format (e.g., 'email' or 'availability.0.startTime')
            // For simple fields, use the last part or join with dot
            const field = err.path;
            // Map backend field names to frontend if different? 
            // Mostly they match. 'availability' might be tricky but let's just show it.
            backendErrors[field] = err.message;
          });

          setErrors(backendErrors);

          // If we have specific field errors, throw with generic message to trigger catch block cleanup
          // but the errors state is already set with specifics.
          // Actually, let's include the first validation error in the main message for visibility
          const firstDetail = errorData.details[0];
          const detailedMessage = `${errorData.error} (${firstDetail.path}: ${firstDetail.message})`;
          throw new Error(detailedMessage);
        }

        throw new Error(errorData.error || 'Failed to submit onboarding');
      }

      localStorage.removeItem('wandernest_onboarding_draft');
      router.push('/student/onboarding/success');
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Submission failed.' });
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=80"
          alt="Background"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 w-full space-y-12">
        <div className="text-center space-y-4 relative">
          <Button
            variant="ghost"
            onClick={handleReset}
            className="absolute -top-10 right-0 text-white/50 hover:text-white hover:bg-white/10"
          >
            Reset Form
          </Button>

          <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow-lg">
            Become a Student Guide
          </h1>

          {/* Global Error Banner */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 max-w-2xl mx-auto backdrop-blur-sm">
              <div className="flex items-center gap-2 text-red-500 mb-2 font-medium">
                <AlertTriangle className="h-5 w-5" />
                <span>Please correct the following errors:</span>
              </div>
              <ul className="text-left text-sm text-red-400 list-disc pl-5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                {Object.values(errors).map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xl text-gray-300">
            Complete your profile in one step to start connecting with travelers.
          </p>
        </div>

        {/* Single Page Form Container */}
        <div className="space-y-12 pb-24">
          <BasicProfileStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            cities={CITIES}
          />

          <StudentVerificationStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />

          <SafetyComplianceStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />

          {/* Submit Action */}
          <div className="glass-card-dark p-8 rounded-3xl border border-white/10 text-center space-y-4">
            {errors.submit && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                {errors.submit}
              </div>
            )}

            <PrimaryCTAButton
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full md:w-auto md:min-w-[300px] text-lg py-6"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Profile'}
            </PrimaryCTAButton>

            <p className="text-sm text-gray-400">
              By clicking Submit, you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
