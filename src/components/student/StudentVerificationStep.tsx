'use client';

import { useRef, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ModernInput } from '@/components/ui/ModernInput';
import { OnboardingFormData } from './OnboardingWizard';
import { Upload, X, Shield, FileText, User, Camera, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentVerificationStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function StudentVerificationStep({ formData, updateFormData, errors }: StudentVerificationStepProps) {
  const studentIdInputRef = useRef<HTMLInputElement>(null);
  const governmentIdInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    fileType: 'studentId' | 'governmentId' | 'selfie' | 'profilePhoto'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, WebP) or PDF');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      if (fileType === 'studentId') {
        updateFormData({
          studentIdFile: file,
          studentIdPreview: previewUrl,
        });
      } else if (fileType === 'governmentId') {
        updateFormData({
          governmentIdFile: file,
          governmentIdPreview: previewUrl,
        });
      } else if (fileType === 'selfie') {
        updateFormData({
          selfieFile: file,
          selfiePreview: previewUrl,
        });
      } else if (fileType === 'profilePhoto') {
        updateFormData({
          profilePhotoFile: file,
          profilePhotoPreview: previewUrl,
        });
      }
    }
  };

  const handleRemoveFile = (fileType: 'studentId' | 'governmentId' | 'selfie' | 'profilePhoto') => {
    if (fileType === 'studentId') {
      if (formData.studentIdPreview) URL.revokeObjectURL(formData.studentIdPreview);
      updateFormData({ studentIdFile: null, studentIdPreview: '' });
      if (studentIdInputRef.current) studentIdInputRef.current.value = '';
    } else if (fileType === 'governmentId') {
      if (formData.governmentIdPreview) URL.revokeObjectURL(formData.governmentIdPreview);
      updateFormData({ governmentIdFile: null, governmentIdPreview: '' });
      if (governmentIdInputRef.current) governmentIdInputRef.current.value = '';
    } else if (fileType === 'selfie') {
      if (formData.selfiePreview) URL.revokeObjectURL(formData.selfiePreview);
      updateFormData({ selfieFile: null, selfiePreview: '' });
      if (selfieInputRef.current) selfieInputRef.current.value = '';
    } else if (fileType === 'profilePhoto') {
      if (formData.profilePhotoPreview) URL.revokeObjectURL(formData.profilePhotoPreview);
      updateFormData({ profilePhotoFile: null, profilePhotoPreview: '' });
      if (profilePhotoInputRef.current) profilePhotoInputRef.current.value = '';
    }
  };

  const FileUploadCard = ({
    title,
    description,
    file,
    preview,
    error,
    inputRef,
    accept = "image/jpeg,image/jpg,image/png,image/webp",
    onChange,
    onRemove,
    icon: Icon
  }: {
    title: string;
    description: string;
    file: File | null;
    preview: string;
    error?: string;
    inputRef: React.RefObject<HTMLInputElement>;
    accept?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    icon: any;
  }) => (
    <div className={cn(
      "relative group border-2 border-dashed rounded-3xl p-6 transition-all duration-300",
      error ? "border-ui-error bg-ui-error/5" : "border-gray-200 hover:border-ui-blue-primary/50 hover:bg-ui-blue-primary/5",
      preview ? "border-solid border-ui-success/50 bg-ui-success/5" : ""
    )}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative">
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1.5 bg-white rounded-full shadow-md text-gray-400 hover:text-ui-error transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center">
            {file?.type === 'application/pdf' ? (
              <div className="w-full h-48 bg-white rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-sm">
                <FileText className="h-12 w-12 text-ui-blue-primary mb-3" />
                <p className="font-medium text-gray-900 px-4 text-center truncate max-w-full">{file.name}</p>
                <p className="text-sm text-gray-500">PDF Document</p>
              </div>
            ) : (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mt-4 flex items-center text-ui-success font-medium">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Uploaded Successfully
            </div>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center text-center cursor-pointer py-8"
          onClick={() => inputRef.current?.click()}
        >
          <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-8 w-8 text-ui-blue-primary/60 group-hover:text-ui-blue-primary" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-500 max-w-xs">{description}</p>
          <Button variant="outline" className="mt-6 pointer-events-none">
            <Upload className="h-4 w-4 mr-2" />
            Select File
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-ui-error mt-2 text-center font-medium animate-slide-down">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Identity Verification
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          We need to verify your student status to maintain a safe and trusted community.
        </p>
      </div>

      {/* Why we need this */}
      <div className="bg-ui-blue-primary/5 border border-ui-blue-primary/20 rounded-2xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-white rounded-xl shadow-sm text-ui-blue-primary shrink-0">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Why verification matters</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            TourWiseCo is built on trust. By verifying your student status and identity, we ensure safety for both you and the tourists you'll be guiding. Your documents are encrypted and handled securely.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student ID Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-ui-blue-primary/10 flex items-center justify-center text-ui-blue-primary">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-gray-800">Student ID</h3>
          </div>

          <FileUploadCard
            title="Upload Student ID"
            description="Clear scan/photo showing name & expiry"
            file={formData.studentIdFile}
            preview={formData.studentIdPreview}
            error={errors.studentIdFile}
            inputRef={studentIdInputRef}
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={(e) => handleFileChange(e, 'studentId')}
            onRemove={() => handleRemoveFile('studentId')}
            icon={FileText}
          />

          <ModernInput
            label="Expiry Date"
            type="date"
            value={formData.studentIdExpiry}
            onChange={(e) => updateFormData({ studentIdExpiry: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            error={errors.studentIdExpiry}
          />
        </div>

        {/* Government ID Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-ui-purple-primary/10 flex items-center justify-center text-ui-purple-primary">
              <User className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-gray-800">Government ID</h3>
          </div>

          <FileUploadCard
            title="Upload ID / Passport"
            description="Passport or National ID card"
            file={formData.governmentIdFile}
            preview={formData.governmentIdPreview}
            error={errors.governmentIdFile}
            inputRef={governmentIdInputRef}
            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
            onChange={(e) => handleFileChange(e, 'governmentId')}
            onRemove={() => handleRemoveFile('governmentId')}
            icon={User}
          />

          <ModernInput
            label="Expiry Date"
            type="date"
            value={formData.governmentIdExpiry}
            onChange={(e) => updateFormData({ governmentIdExpiry: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            error={errors.governmentIdExpiry}
          />
        </div>

        {/* Selfie Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
              <Camera className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-gray-800">Verification Selfie</h3>
          </div>

          <FileUploadCard
            title="Take a Selfie"
            description="Hold your Student ID next to your face"
            file={formData.selfieFile}
            preview={formData.selfiePreview}
            error={errors.selfieFile}
            inputRef={selfieInputRef}
            onChange={(e) => handleFileChange(e, 'selfie')}
            onRemove={() => handleRemoveFile('selfie')}
            icon={Camera}
          />
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-500">
              <User className="h-4 w-4" />
            </div>
            <h3 className="font-bold text-gray-800">Public Profile Photo</h3>
          </div>

          <FileUploadCard
            title="Profile Photo"
            description="Friendly, professional photo for tourists"
            file={formData.profilePhotoFile}
            preview={formData.profilePhotoPreview}
            error={errors.profilePhotoFile}
            inputRef={profilePhotoInputRef}
            onChange={(e) => handleFileChange(e, 'profilePhoto')}
            onRemove={() => handleRemoveFile('profilePhoto')}
            icon={User}
          />
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => updateFormData({ documentsOwnedConfirmation: !formData.documentsOwnedConfirmation })}>
          <Checkbox
            id="documentsOwnedConfirmation"
            checked={formData.documentsOwnedConfirmation}
            onCheckedChange={(checked) =>
              updateFormData({ documentsOwnedConfirmation: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label
              htmlFor="documentsOwnedConfirmation"
              className="text-sm font-medium cursor-pointer leading-relaxed text-gray-700"
            >
              I confirm these documents are mine and the information is accurate.
            </Label>
          </div>
        </div>
        {errors.documentsOwnedConfirmation && (
          <p className="text-sm text-ui-error px-4">{errors.documentsOwnedConfirmation}</p>
        )}

        <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => updateFormData({ verificationConsent: !formData.verificationConsent })}>
          <Checkbox
            id="verificationConsent"
            checked={formData.verificationConsent}
            onCheckedChange={(checked) =>
              updateFormData({ verificationConsent: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label
              htmlFor="verificationConsent"
              className="text-sm font-medium cursor-pointer leading-relaxed text-gray-700"
            >
              I consent to verification of these documents by TourWiseCo and understand that false information may result in account suspension.
            </Label>
          </div>
        </div>
        {errors.verificationConsent && (
          <p className="text-sm text-ui-error px-4">{errors.verificationConsent}</p>
        )}
      </div>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" />
        <span>Your data is encrypted and secure.</span>
      </div>
    </div>
  );
}
