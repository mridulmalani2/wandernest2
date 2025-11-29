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
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900">Identity Verification</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          Upload required documents to verify your identity and student status.
        </p>
      </div>

      {/* Why we need this */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl flex-shrink-0">
            ℹ️
          </div>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">Why do we need these documents?</h3>
            <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Ensures only verified students can become guides</li>
              <li>Builds trust with tourists and the TourWiseCo community</li>
              <li>Protects both guides and visitors</li>
              <li>Verifies your identity matches your profile</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Student ID Upload */}
      <div className="space-y-4">
        <Label className="text-xl font-bold text-gray-900">
          Student ID Card Upload <span className="text-red-500">*</span>
        </Label>

        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          errors.studentIdFile
            ? 'border-red-300 bg-red-50'
            : formData.studentIdPreview
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        }`}>
          {formData.studentIdPreview ? (
            <div className="space-y-4">
              {formData.studentIdFile?.type === 'application/pdf' ? (
                <div className="flex items-center justify-center p-8 bg-white rounded-xl border-2 border-gray-200">
                  <div className="text-center">
                    <div className="text-5xl mb-3">📄</div>
                    <p className="font-semibold text-gray-900">{formData.studentIdFile?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">PDF Document</p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={formData.studentIdPreview}
                    alt="Student ID preview"
                    className="max-w-full max-h-80 mx-auto rounded-xl border-2 border-gray-200 shadow-md"
                  />
                </div>
              )}
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => studentIdInputRef.current?.click()}
                  className="px-6 h-11"
                >
                  Change File
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveFile('studentId')}
                  className="px-6 h-11"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">🎓</div>
              <div>
                <p className="font-semibold text-gray-900 text-lg mb-2">Upload your student ID card</p>
                <p className="text-sm text-gray-600 mb-1">
                  Clear image or scan where name, photo, and expiry are visible
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Accepted formats: JPG, PNG, WebP, PDF • Max 5MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => studentIdInputRef.current?.click()}
                className="px-8 h-12 text-base font-semibold"
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
          <Label htmlFor="studentIdExpiry" className="text-base font-semibold text-gray-700">
            Student ID Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="studentIdExpiry"
            type="date"
            value={formData.studentIdExpiry}
            onChange={(e) => updateFormData({ studentIdExpiry: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className={`text-base h-12 ${errors.studentIdExpiry ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
          />
          {errors.studentIdExpiry && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.studentIdExpiry}
            </p>
          )}
        </div>

        {errors.studentIdFile && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.studentIdFile}
          </p>
        )}
      </div>

      {/* Government ID Upload */}
      <div className="space-y-4">
        <Label className="text-xl font-bold text-gray-900">
          Government ID Upload (Passport or National ID) <span className="text-red-500">*</span>
        </Label>

        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          errors.governmentIdFile
            ? 'border-red-300 bg-red-50'
            : formData.governmentIdPreview
            ? 'border-green-300 bg-green-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
        }`}>
          {formData.governmentIdPreview ? (
            <div className="space-y-4">
              {formData.governmentIdFile?.type === 'application/pdf' ? (
                <div className="flex items-center justify-center p-8 bg-white rounded-xl border-2 border-gray-200">
                  <div className="text-center">
                    <div className="text-5xl mb-3">📄</div>
                    <p className="font-semibold text-gray-900">{formData.governmentIdFile?.name}</p>
                    <p className="text-sm text-gray-500 mt-1">PDF Document</p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={formData.governmentIdPreview}
                    alt="Government ID preview"
                    className="max-w-full max-h-80 mx-auto rounded-xl border-2 border-gray-200 shadow-md"
                  />
                </div>
              )}
              <div className="flex justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => governmentIdInputRef.current?.click()}
                  className="px-6 h-11"
                >
                  Change File
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleRemoveFile('governmentId')}
                  className="px-6 h-11"
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl">🛂</div>
              <div>
                <p className="font-semibold text-gray-900 text-lg mb-2">Upload your passport or national ID</p>
                <p className="text-sm text-gray-600 mb-1">
                  Clear image where name, photo, and date of birth are visible
                </p>
                <p className="text-xs text-gray-500 mt-3">
                  Accepted formats: JPG, PNG, WebP, PDF • Max 5MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => governmentIdInputRef.current?.click()}
                className="px-8 h-12 text-base font-semibold"
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
          <Label htmlFor="governmentIdExpiry" className="text-base font-semibold text-gray-700">
            Government ID Expiry Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="governmentIdExpiry"
            type="date"
            value={formData.governmentIdExpiry}
            onChange={(e) => updateFormData({ governmentIdExpiry: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className={`text-base h-12 ${errors.governmentIdExpiry ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'}`}
          />
          {errors.governmentIdExpiry && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.governmentIdExpiry}
            </p>
          )}
        </div>

        {errors.governmentIdFile && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.governmentIdFile}
          </p>
        )}
      </div>

      {/* Selfie and Profile Photo - 2 columns on larger screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selfie Upload */}
        <div className="space-y-4">
          <Label className="text-lg font-bold text-gray-900">
            Selfie for Verification <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">Take a selfie holding your student ID card next to your face</p>

          <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            errors.selfieFile
              ? 'border-red-300 bg-red-50'
              : formData.selfiePreview
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}>
            {formData.selfiePreview ? (
              <div className="space-y-3">
                <img
                  src={formData.selfiePreview}
                  alt="Selfie preview"
                  className="max-w-full max-h-64 mx-auto rounded-xl border-2 border-gray-200 shadow-md"
                />
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFile('selfie')}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">🤳</div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Upload selfie with ID</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 5MB</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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

          {errors.selfieFile && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.selfieFile}
            </p>
          )}
        </div>

        {/* Profile Photo Upload */}
        <div className="space-y-4">
          <Label className="text-lg font-bold text-gray-900">
            Profile Photo <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-600">Upload a professional photo for your public guide profile</p>

          <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            errors.profilePhotoFile
              ? 'border-red-300 bg-red-50'
              : formData.profilePhotoPreview
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}>
            {formData.profilePhotoPreview ? (
              <div className="space-y-3">
                <img
                  src={formData.profilePhotoPreview}
                  alt="Profile photo preview"
                  className="max-w-full max-h-64 mx-auto rounded-xl border-2 border-gray-200 shadow-md"
                />
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => profilePhotoInputRef.current?.click()}
                  >
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveFile('profilePhoto')}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-5xl">📸</div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Upload profile photo</p>
                  <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 5MB</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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

          {errors.profilePhotoFile && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.profilePhotoFile}
            </p>
          )}
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="documentsOwnedConfirmation"
            checked={formData.documentsOwnedConfirmation}
            onCheckedChange={(checked) =>
              updateFormData({ documentsOwnedConfirmation: checked === true })
            }
          />
          <div className="flex-1">
            <Label
              htmlFor="documentsOwnedConfirmation"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I confirm these documents are mine and the information is accurate.{' '}
              <span className="text-[hsl(var(--ui-error))]">*</span>
            </Label>
          </div>
          {errors.documentsOwnedConfirmation && (
            <p className="text-sm text-red-600 mt-3 ml-9 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.documentsOwnedConfirmation}
            </p>
          )}
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="verificationConsent"
            checked={formData.verificationConsent}
            onCheckedChange={(checked) =>
              updateFormData({ verificationConsent: checked === true })
            }
          />
          <div className="flex-1">
            <Label
              htmlFor="verificationConsent"
              className="text-sm font-normal cursor-pointer leading-relaxed"
            >
              I consent to verification of these documents by TourWiseCo and understand that false information may result in account suspension.{' '}
              <span className="text-[hsl(var(--ui-error))]">*</span>
            </Label>
          </div>
          {errors.verificationConsent && (
            <p className="text-sm text-red-600 mt-3 ml-9 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.verificationConsent}
            </p>
          )}
        </div>
      </div>

      {/* Upload Requirements and Security Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 border-2 border-gray-300 rounded-2xl p-5">
          <h4 className="font-semibold mb-3 text-gray-900">Document Requirements:</h4>
          <ul className="space-y-1.5 text-sm text-gray-700 list-disc list-inside">
            <li>All documents must be clear and not blurry</li>
            <li>Your full name must be visible on all IDs</li>
            <li>Photos must show your face clearly</li>
            <li>Expiry dates must be valid (not expired)</li>
            <li>All corners of ID cards should be visible</li>
          </ul>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xl flex-shrink-0">
              🔒
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-green-900">Privacy & Security</h4>
              <p className="text-sm text-green-800 leading-relaxed">
                Your documents are encrypted and only used for verification purposes.
                They will not be shared publicly or with tourists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
