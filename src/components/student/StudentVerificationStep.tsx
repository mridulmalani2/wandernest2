'use client';

import { useRef, ChangeEvent } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { OnboardingFormData } from './OnboardingWizard';

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
      if (formData.studentIdPreview) {
        URL.revokeObjectURL(formData.studentIdPreview);
      }
      updateFormData({
        studentIdFile: null,
        studentIdPreview: '',
      });
      if (studentIdInputRef.current) {
        studentIdInputRef.current.value = '';
      }
    } else if (fileType === 'governmentId') {
      if (formData.governmentIdPreview) {
        URL.revokeObjectURL(formData.governmentIdPreview);
      }
      updateFormData({
        governmentIdFile: null,
        governmentIdPreview: '',
      });
      if (governmentIdInputRef.current) {
        governmentIdInputRef.current.value = '';
      }
    } else if (fileType === 'selfie') {
      if (formData.selfiePreview) {
        URL.revokeObjectURL(formData.selfiePreview);
      }
      updateFormData({
        selfieFile: null,
        selfiePreview: '',
      });
      if (selfieInputRef.current) {
        selfieInputRef.current.value = '';
      }
    } else if (fileType === 'profilePhoto') {
      if (formData.profilePhotoPreview) {
        URL.revokeObjectURL(formData.profilePhotoPreview);
      }
      updateFormData({
        profilePhotoFile: null,
        profilePhotoPreview: '',
      });
      if (profilePhotoInputRef.current) {
        profilePhotoInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Identity Verification</h2>
        <p className="text-gray-600">Upload required documents to verify your identity and student status.</p>
      </div>

      {/* Why we need this */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">Why do we need these documents?</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Ensures only verified students can become guides</li>
          <li>Builds trust with tourists and the WanderNest community</li>
          <li>Protects both guides and visitors</li>
          <li>Verifies your identity matches your profile</li>
        </ul>
      </div>

      {/* Student ID Upload */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>
            Student ID Card Upload <span className="text-red-500">*</span>
          </Label>
        </div>

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          errors.studentIdFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          {formData.studentIdPreview ? (
            <div className="space-y-4">
              {formData.studentIdFile?.type === 'application/pdf' ? (
                <div className="flex items-center justify-center p-8 bg-gray-100 rounded">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="font-medium">{formData.studentIdFile?.name}</p>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
              ) : (
                <img
                  src={formData.studentIdPreview}
                  alt="Student ID preview"
                  className="max-w-full max-h-64 mx-auto rounded border"
                />
              )}
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => studentIdInputRef.current?.click()}
                >
                  Change File
                </Button>
                <Button type="button" variant="destructive" onClick={() => handleRemoveFile('studentId')}>
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
                onClick={() => studentIdInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>

        <input
          ref={studentIdInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={(e) => handleFileChange(e, 'studentId')}
          className="hidden"
        />

        {/* Student ID Expiry */}
        <div className="space-y-2">
          <Label htmlFor="studentIdExpiry">
            Student ID Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="studentIdExpiry"
            type="date"
            value={formData.studentIdExpiry}
            onChange={(e) => updateFormData({ studentIdExpiry: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className={errors.studentIdExpiry ? 'border-red-500' : ''}
          />
          {errors.studentIdExpiry && <p className="text-sm text-red-500">{errors.studentIdExpiry}</p>}
        </div>

        {errors.studentIdFile && <p className="text-sm text-red-500">{errors.studentIdFile}</p>}
      </div>

      {/* Government ID Upload */}
      <div className="space-y-4">
        <Label>
          Government ID Upload (Passport or National ID) <span className="text-red-500">*</span>
        </Label>

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          errors.governmentIdFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          {formData.governmentIdPreview ? (
            <div className="space-y-4">
              {formData.governmentIdFile?.type === 'application/pdf' ? (
                <div className="flex items-center justify-center p-8 bg-gray-100 rounded">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="font-medium">{formData.governmentIdFile?.name}</p>
                    <p className="text-sm text-gray-500">PDF Document</p>
                  </div>
                </div>
              ) : (
                <img
                  src={formData.governmentIdPreview}
                  alt="Government ID preview"
                  className="max-w-full max-h-64 mx-auto rounded border"
                />
              )}
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => governmentIdInputRef.current?.click()}
                >
                  Change File
                </Button>
                <Button type="button" variant="destructive" onClick={() => handleRemoveFile('governmentId')}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">🛂</div>
              <div>
                <p className="font-medium mb-1">Upload your passport or national ID</p>
                <p className="text-sm text-gray-500">
                  Clear image where name, photo, and date of birth are visible
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Accepted formats: JPG, PNG, WebP, PDF (Max 5MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => governmentIdInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          )}
        </div>

        <input
          ref={governmentIdInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          onChange={(e) => handleFileChange(e, 'governmentId')}
          className="hidden"
        />

        {/* Government ID Expiry */}
        <div className="space-y-2">
          <Label htmlFor="governmentIdExpiry">
            Government ID Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="governmentIdExpiry"
            type="date"
            value={formData.governmentIdExpiry}
            onChange={(e) => updateFormData({ governmentIdExpiry: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className={errors.governmentIdExpiry ? 'border-red-500' : ''}
          />
          {errors.governmentIdExpiry && <p className="text-sm text-red-500">{errors.governmentIdExpiry}</p>}
        </div>

        {errors.governmentIdFile && <p className="text-sm text-red-500">{errors.governmentIdFile}</p>}
      </div>

      {/* Selfie Upload */}
      <div className="space-y-4">
        <Label>
          Selfie for Verification <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">Take a selfie holding your student ID card next to your face</p>

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          errors.selfieFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          {formData.selfiePreview ? (
            <div className="space-y-4">
              <img
                src={formData.selfiePreview}
                alt="Selfie preview"
                className="max-w-full max-h-64 mx-auto rounded border"
              />
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => selfieInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                <Button type="button" variant="destructive" onClick={() => handleRemoveFile('selfie')}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">🤳</div>
              <div>
                <p className="font-medium mb-1">Upload a selfie with your ID</p>
                <p className="text-sm text-gray-500">
                  Both your face and student ID should be clearly visible
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Accepted formats: JPG, PNG, WebP (Max 5MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => selfieInputRef.current?.click()}
              >
                Choose Photo
              </Button>
            </div>
          )}
        </div>

        <input
          ref={selfieInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileChange(e, 'selfie')}
          className="hidden"
        />

        {errors.selfieFile && <p className="text-sm text-red-500">{errors.selfieFile}</p>}
      </div>

      {/* Profile Photo Upload */}
      <div className="space-y-4">
        <Label>
          Profile Photo <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-600">Upload a professional photo for your public guide profile</p>

        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
          errors.profilePhotoFile ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}>
          {formData.profilePhotoPreview ? (
            <div className="space-y-4">
              <img
                src={formData.profilePhotoPreview}
                alt="Profile photo preview"
                className="max-w-full max-h-64 mx-auto rounded border"
              />
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profilePhotoInputRef.current?.click()}
                >
                  Change Photo
                </Button>
                <Button type="button" variant="destructive" onClick={() => handleRemoveFile('profilePhoto')}>
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-4xl">📸</div>
              <div>
                <p className="font-medium mb-1">Upload your profile photo</p>
                <p className="text-sm text-gray-500">
                  A friendly, professional photo that tourists will see
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Accepted formats: JPG, PNG, WebP (Max 5MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => profilePhotoInputRef.current?.click()}
              >
                Choose Photo
              </Button>
            </div>
          )}
        </div>

        <input
          ref={profilePhotoInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={(e) => handleFileChange(e, 'profilePhoto')}
          className="hidden"
        />

        {errors.profilePhotoFile && <p className="text-sm text-red-500">{errors.profilePhotoFile}</p>}
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
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
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I confirm these documents are mine and the information is accurate.{' '}
              <span className="text-red-500">*</span>
            </Label>
          </div>
        </div>
        {errors.documentsOwnedConfirmation && (
          <p className="text-sm text-red-500">{errors.documentsOwnedConfirmation}</p>
        )}

        <div className="flex items-start space-x-3 p-4 border rounded-lg">
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
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I consent to verification of these documents by WanderNest and understand that false information may result in account suspension.{' '}
              <span className="text-red-500">*</span>
            </Label>
          </div>
        </div>
        {errors.verificationConsent && (
          <p className="text-sm text-red-500">{errors.verificationConsent}</p>
        )}
      </div>

      {/* Upload Requirements */}
      <div className="bg-gray-50 border rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Document Requirements:</p>
        <ul className="space-y-1 text-gray-700 list-disc list-inside">
          <li>All documents must be clear and not blurry</li>
          <li>Your full name must be visible on all IDs</li>
          <li>Photos must show your face clearly</li>
          <li>Expiry dates must be valid (not expired)</li>
          <li>All corners of ID cards should be visible</li>
        </ul>
      </div>

      {/* Security Note */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-900">
          <strong>🔒 Privacy & Security:</strong> Your documents are encrypted and only used for verification purposes.
          They will be reviewed by our team and will not be shared publicly or with tourists.
        </p>
      </div>
    </div>
  );
}
