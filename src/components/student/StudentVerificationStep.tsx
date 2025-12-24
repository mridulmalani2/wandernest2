'use client';

import { LiquidInput } from '@/components/ui/LiquidInput';
import { FlowCard } from '@/components/ui/FlowCard';
import { OnboardingFormData } from './OnboardingWizard';
import { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

import { LiquidSelect } from '@/components/ui/LiquidSelect';

interface StudentVerificationStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData> | ((prev: OnboardingFormData) => Partial<OnboardingFormData>)) => void;
  errors: Record<string, string>;
}

export function StudentVerificationStep({ formData, updateFormData, errors }: StudentVerificationStepProps) {
  const [dragStates, setDragStates] = useState({
    studentId: false,
    governmentId: false,
    selfie: false,
    profilePhoto: false
  });

  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const validateFile = (file: File): string | null => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    if (file.size > MAX_SIZE) {
      return 'File size must be less than 10MB';
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WebP files are allowed';
    }
    return null;
  };

  const handleFileChange = useCallback((field: string, file: File | null) => {
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setUploadErrors(prev => ({ ...prev, [field]: error }));
      return;
    }
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      if (typeof preview === 'string' && preview.startsWith('data:image/')) {
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
      }
    };
    reader.onerror = () => {
      setUploadErrors(prev => ({ ...prev, [field]: 'Failed to read file' }));
    };
    reader.onabort = () => {
      setUploadErrors(prev => ({ ...prev, [field]: 'File reading aborted' }));
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
    if (file) {
      handleFileChange(field, file);
    }
  };

  const handleRemove = (field: string) => {
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
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

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
            error={errors.studentIdFile || uploadErrors.studentId}
            isDragging={dragStates.studentId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemove={handleRemove}
            onFileChange={handleFileChange}
          />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <LiquidSelect
              id="studentIdExpiry"
              label="Expiry Month"
              value={formData.studentIdExpiry.includes('/') ? formData.studentIdExpiry.split('/')[0] : ''}
              onValueChange={(month) => {
                const current = formData.studentIdExpiry;
                const year = current && current.includes('/') ? current.split('/')[1] : new Date().getFullYear().toString();
                updateFormData({ studentIdExpiry: `${month}/${year}` });
              }}
              placeholder="Month"
              options={[
                { value: '01', label: 'January' }, { value: '02', label: 'February' },
                { value: '03', label: 'March' }, { value: '04', label: 'April' },
                { value: '05', label: 'May' }, { value: '06', label: 'June' },
                { value: '07', label: 'July' }, { value: '08', label: 'August' },
                { value: '09', label: 'September' }, { value: '10', label: 'October' },
                { value: '11', label: 'November' }, { value: '12', label: 'December' },
              ]}
              error={errors.studentIdExpiry}
            />
            <LiquidSelect
              label="Expiry Year"
              value={formData.studentIdExpiry.includes('/') ? formData.studentIdExpiry.split('/')[1] : ''}
              onValueChange={(year) => {
                const current = formData.studentIdExpiry;
                const month = current && current.includes('/') ? current.split('/')[0] : '01';
                updateFormData({ studentIdExpiry: `${month}/${year}` });
              }}
              placeholder="Year"
              options={Array.from({ length: 11 }, (_, i) => {
                const y = new Date().getFullYear() + i;
                return { value: y.toString(), label: y.toString() };
              })}
            />
          </div>
        </FlowCard>



        <FlowCard padding="md">
          <FileUploadCard
            field="profilePhoto"
            label="Profile Photo"
            preview={formData.profilePhotoPreview}
            file={formData.profilePhotoFile}
            icon={ImageIcon}
            error={errors.profilePhotoFile || uploadErrors.profilePhoto}
            isDragging={dragStates.profilePhoto}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onRemove={handleRemove}
            onFileChange={handleFileChange}
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

interface FileUploadCardProps {
  field: string;
  label: string;
  preview?: string;
  file?: File | null;
  icon?: any;
  error?: string;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent, field: string) => void;
  onDragLeave: (field: string) => void;
  onDrop: (e: React.DragEvent, field: string) => void;
  onRemove: (field: string) => void;
  onFileChange: (field: string, file: File | null) => void;
}

function FileUploadCard({
  field,
  label,
  preview,
  file,
  icon: Icon = FileText,
  error,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onFileChange
}: FileUploadCardProps) {
  const safePreview =
    typeof preview === 'string' &&
    (preview.startsWith('data:image/') || preview.startsWith('/api/files/'))
      ? preview
      : '';

  return (
    <div className="space-y-2">
      <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
        {label} {error && <span className="text-ui-error ml-1">*</span>}
      </label>
      <div
        onDragOver={(e) => onDragOver(e, field)}
        onDragLeave={() => onDragLeave(field)}
        onDrop={(e) => onDrop(e, field)}
        className={cn(
          'relative rounded-2xl border-2 border-dashed transition-all duration-300',
          isDragging && 'border-liquid-dark-primary bg-liquid-dark-primary/5',
          error && 'border-ui-error',
          !error && !isDragging && 'border-gray-300 hover:border-liquid-dark-primary/50'
        )}
      >
        {safePreview ? (
          <div className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={safePreview} alt={label} className="w-full h-48 object-cover rounded-2xl" />
            <button
              type="button"
              onClick={() => onRemove(field)}
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
            <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onFileChange(field, e.target.files?.[0] || null)}
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
}
