'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentVerificationStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function StudentVerificationStep({ formData, updateFormData, errors }: StudentVerificationStepProps) {
  const [dragStates, setDragStates] = useState({
    studentId: false,
    governmentId: false,
    selfie: false,
    profilePhoto: false
  });

  const handleFileChange = useCallback((field: string, file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;

      switch (field) {
        case 'studentId':
          updateFormData({ studentIdFile: file, studentIdPreview: preview });
          break;
        case 'governmentId':
          updateFormData({ governmentIdFile: file, governmentIdPreview: preview });
          break;
        case 'selfie':
          updateFormData({ selfieFile: file, selfiePreview: preview });
          break;
        case 'profilePhoto':
          updateFormData({ profilePhotoFile: file, profilePhotoPreview: preview });
          break;
      }
    };
    reader.readAsDataURL(file);
  }, [updateFormData]);

  const handleDragOver = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [field]: true }));
  };

  const handleDragLeave = (field: string) => {
    setDragStates(prev => ({ ...prev, [field]: false }));
  };

  const handleDrop = (e: React.DragEvent, field: string) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [field]: false }));
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(field, file);
    }
  };

  const FileUploadCard = ({
    field,
    label,
    preview,
    file,
    icon: Icon = FileText,
    error
  }: {
    field: string;
    label: string;
    preview?: string;
    file?: File | null;
    icon?: any;
    error?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
        {label} {error && <span className="text-ui-error ml-1">*</span>}
      </label>
      <div
        onDragOver={(e) => handleDragOver(e, field)}
        onDragLeave={() => handleDragLeave(field)}
        onDrop={(e) => handleDrop(e, field)}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-300',
          dragStates[field as keyof typeof dragStates] && 'border-liquid-dark-primary bg-liquid-dark-primary/5',
          error && 'border-ui-error',
          !error && !dragStates[field as keyof typeof dragStates] && 'border-gray-300 hover:border-liquid-dark-primary/50'
        )}
      >
        {preview ? (
          <div className="relative group">
            <img src={preview} alt={label} className="w-full h-48 object-cover rounded-2xl" />
            <button
              type="button"
              onClick={() => {
                switch (field) {
                  case 'studentId':
                    updateFormData({ studentIdFile: null, studentIdPreview: '' });
                    break;
                  case 'governmentId':
                    updateFormData({ governmentIdFile: null, governmentIdPreview: '' });
                    break;
                  case 'selfie':
                    updateFormData({ selfieFile: null, selfiePreview: '' });
                    break;
                  case 'profilePhoto':
                    updateFormData({ profilePhotoFile: null, profilePhotoPreview: '' });
                    break;
                }
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
            <div className="absolute bottom-2 left-2 bg-liquid-dark-primary/90 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Uploaded
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-liquid-light flex items-center justify-center mb-3">
              <Icon className="h-6 w-6 text-liquid-dark-secondary" />
            </div>
            <p className="text-sm font-medium text-liquid-dark-primary mb-1">
              Drop file here or click to upload
            </p>
            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
            />
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs font-light text-ui-error flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-12 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-white">
          Identity Verification
        </h2>
        <p className="text-base font-light text-white/70 max-w-md mx-auto">
          We need to verify your identity and student status
        </p>
      </div>

      {/* Document Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FlowCard padding="md">
          <FileUploadCard
            field="studentId"
            label="Student ID Card"
            preview={formData.studentIdPreview}
            file={formData.studentIdFile}
            icon={FileText}
            error={errors.studentIdFile}
          />
          <div className="mt-4">
            <LiquidInput
              label="Student ID Expiry Date"
              type="date"
              value={formData.studentIdExpiry}
              onChange={(e) => updateFormData({ studentIdExpiry: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </FlowCard>

        <FlowCard padding="md">
          <FileUploadCard
            field="governmentId"
            label="Government ID (Passport/Driver's License)"
            preview={formData.governmentIdPreview}
            file={formData.governmentIdFile}
            icon={FileText}
            error={errors.governmentIdFile}
          />
          <div className="mt-4">
            <LiquidInput
              label="ID Expiry Date"
              type="date"
              value={formData.governmentIdExpiry}
              onChange={(e) => updateFormData({ governmentIdExpiry: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </FlowCard>

        <FlowCard padding="md">
          <FileUploadCard
            field="selfie"
            label="Selfie with ID"
            preview={formData.selfiePreview}
            file={formData.selfieFile}
            icon={ImageIcon}
            error={errors.selfieFile}
          />
          <p className="text-xs text-white/70 mt-2">Hold your ID next to your face</p>
        </FlowCard>

        <FlowCard padding="md">
          <FileUploadCard
            field="profilePhoto"
            label="Profile Photo"
            preview={formData.profilePhotoPreview}
            file={formData.profilePhotoFile}
            icon={ImageIcon}
            error={errors.profilePhotoFile}
          />
          <p className="text-xs text-white/70 mt-2">This will be shown to tourists</p>
        </FlowCard>
      </div>

      {/* Consent Checkboxes */}
      <FlowCard padding="lg" variant="dark">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="documentsOwned"
              checked={formData.documentsOwnedConfirmation || false}
              onChange={(e) => updateFormData({ documentsOwnedConfirmation: e.target.checked })}
              className={cn(
                'mt-1 h-5 w-5 rounded border-gray-300 focus:ring-white',
                formData.documentsOwnedConfirmation ? 'text-white' : '',
                errors.documentsOwnedConfirmation && 'border-ui-error'
              )}
            />
            <label htmlFor="documentsOwned" className="text-sm font-light cursor-pointer text-white/80">
              I confirm that all uploaded documents are authentic and belong to me.
            </label>
          </div>
          {errors.documentsOwnedConfirmation && (
            <p className="text-xs font-light text-ui-error">{errors.documentsOwnedConfirmation}</p>
          )}

          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="verificationConsent"
              checked={formData.verificationConsent || false}
              onChange={(e) => updateFormData({ verificationConsent: e.target.checked })}
              className={cn(
                'mt-1 h-5 w-5 rounded border-gray-300 focus:ring-white',
                formData.verificationConsent ? 'text-white' : '',
                errors.verificationConsent && 'border-ui-error'
              )}
            />
            <label htmlFor="verificationConsent" className="text-sm font-light cursor-pointer text-white/80">
              I consent to background verification and understand documents will be securely stored and used only for verification purposes.
            </label>
          </div>
          {errors.verificationConsent && (
            <p className="text-xs font-light text-ui-error">{errors.verificationConsent}</p>
          )}
        </div>
      </FlowCard>

      {/* Info Notice */}
      <div className="bg-liquid-light/50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
        <FileText className="h-5 w-5 text-liquid-dark-secondary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-medium text-liquid-dark-primary text-sm">Verification Process</h3>
          <p className="text-xs font-light text-gray-600 leading-relaxed">
            Your documents will be reviewed within 2-3 business days. We use bank-level encryption to protect your data. Documents are only visible to our verification team and are never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
}
