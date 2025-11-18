'use client';

import { useRef, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { OnboardingFormData } from './OnboardingWizard';

interface StudentVerificationStepProps {
  formData: OnboardingFormData;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  errors: Record<string, string>;
}

export function StudentVerificationStep({ formData, updateFormData, errors }: StudentVerificationStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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

      updateFormData({
        idCardFile: file,
        idCardPreview: previewUrl,
      });
    }
  };

  const handleRemoveFile = () => {
    if (formData.idCardPreview) {
      URL.revokeObjectURL(formData.idCardPreview);
    }
    updateFormData({
      idCardFile: null,
      idCardPreview: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Student Verification</h2>
        <p className="text-gray-600">Upload your student ID to verify your enrollment status.</p>
      </div>

      {/* Why we need this */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">Why do we need this?</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Ensures only verified students can become guides</li>
          <li>Builds trust with tourists and the WanderNest community</li>
          <li>Protects both guides and visitors</li>
          <li>Verifies your name matches your profile</li>
        </ul>
      </div>

      {/* Upload Section */}
      <div className="space-y-4">
        <Label>
          Student ID Card Upload <span className="text-red-500">*</span>
        </Label>

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          errors.idCardFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          {formData.idCardPreview ? (
            <div className="space-y-4">
              {formData.idCardFile?.type === 'application/pdf' ? (
                <div className="flex items-center justify-center p-8 bg-gray-100 rounded">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="font-medium">{formData.idCardFile?.name}</p>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
              ) : (
                <img
                  src={formData.idCardPreview}
                  alt="Student ID preview"
                  className="max-w-full max-h-64 mx-auto rounded border"
                />
              )}
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change File
                </Button>
                <Button type="button" variant="destructive" onClick={handleRemoveFile}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">🎓</div>
              <div>
                <p className="font-medium mb-1">Upload your student ID card</p>
                <p className="text-sm text-gray-500">
                  Clear image or scan where name, photo, and expiry are visible
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Accepted formats: JPG, PNG, WebP, PDF (Max 5MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {errors.idCardFile && <p className="text-sm text-red-500">{errors.idCardFile}</p>}

        {/* Upload Requirements */}
        <div className="bg-gray-50 border rounded-lg p-4 text-sm">
          <p className="font-medium mb-2">Upload Requirements:</p>
          <ul className="space-y-1 text-gray-700 list-disc list-inside">
            <li>Your full name must be clearly visible</li>
            <li>Photo on the ID card should be visible</li>
            <li>Expiry date should be shown (if applicable)</li>
            <li>Image should be clear and not blurry</li>
            <li>All corners of the ID card should be visible</li>
          </ul>
        </div>
      </div>

      {/* Confirmation Checkbox */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="studentConfirmation"
            checked={formData.studentConfirmation}
            onCheckedChange={(checked) =>
              updateFormData({ studentConfirmation: checked as boolean })
            }
          />
          <div className="flex-1">
            <Label
              htmlFor="studentConfirmation"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I confirm that I am currently enrolled as a student at the educational institution
              mentioned in my profile, and the information provided is accurate.{' '}
              <span className="text-red-500">*</span>
            </Label>
          </div>
        </div>
        {errors.studentConfirmation && (
          <p className="text-sm text-red-500">{errors.studentConfirmation}</p>
        )}
      </div>

      {/* Security Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>🔒 Privacy & Security:</strong> Your student ID is only used for verification purposes
          and will be reviewed by our team. It will not be shared publicly or with tourists.
        </p>
      </div>
    </div>
  );
}
