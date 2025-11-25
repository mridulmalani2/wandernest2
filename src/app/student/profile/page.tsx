'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  DollarSign,
  Edit,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvailabilityEditor } from '@/components/student/AvailabilityEditor';
import { useRouter } from 'next/navigation';

interface StudentProfile {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  phoneNumber?: string;
  city?: string;
  campus?: string;
  institute?: string;
  programDegree?: string;
  yearOfStudy?: string;
  expectedGraduation?: string;
  profilePhotoUrl?: string;
  bio?: string;
  skills?: string[];
  preferredGuideStyle?: string;
  coverLetter?: string;
  interests?: string[];
  servicesOffered?: string[];
  hourlyRate?: number;
  onlineServicesAvailable?: boolean;
  timezone?: string;
  preferredDurations?: string[];
  availability?: any;
  unavailabilityExceptions?: any;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status?: string;
  profileCompleteness?: number;
  tripsHosted?: number;
  averageRating?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Student Profile Page
 *
 * Displays the student's complete profile with:
 * - Read-only view by default
 * - Edit mode to update all fields
 * - Availability editor
 * - Profile completeness indicator
 * - Stats (trips hosted, rating)
 */
export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/student/profile');

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Profile not found. Please complete onboarding first.');
        }
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data.student);
      setEditedProfile(data.student);

    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile({ ...profile! });
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile({ ...profile! });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedProfile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.student);
      setEditedProfile(data.student);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof StudentProfile, value: any) => {
    setEditedProfile((prev) => ({
      ...prev!,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ui-sand-light via-white to-ui-blue-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-200 rounded" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ui-sand-light via-white to-ui-blue-primary/5 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Error Loading Profile</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <Button
                onClick={() => router.push('/student/dashboard')}
                className="bg-red-600 hover:bg-red-700"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-ui-sand-light via-white to-ui-blue-primary/5 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
            <p className="text-gray-600">
              Manage your information and availability
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="bg-ui-blue-primary hover:bg-ui-blue-secondary"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-ui-blue-primary hover:bg-ui-blue-secondary"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-800 font-medium">{successMessage}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-soft p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ui-blue-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-ui-blue-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Profile Completeness</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentProfile?.profileCompleteness || 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ui-purple-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-ui-purple-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trips Hosted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentProfile?.tripsHosted || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-5 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentProfile?.averageRating?.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-ui-blue-primary" />
            Personal Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={currentProfile?.name || ''}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">{currentProfile?.name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {currentProfile?.email}
              </p>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phoneNumber"
                  value={currentProfile?.phoneNumber || ''}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {currentProfile?.phoneNumber || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={currentProfile?.dateOfBirth || ''}
                  onChange={(e) => updateField('dateOfBirth', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.dateOfBirth || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              {isEditing ? (
                <select
                  id="gender"
                  value={currentProfile?.gender || ''}
                  onChange={(e) => updateField('gender', e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-ui-blue-primary focus:border-ui-blue-primary"
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.gender || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="nationality">Nationality</Label>
              {isEditing ? (
                <Input
                  id="nationality"
                  value={currentProfile?.nationality || ''}
                  onChange={(e) => updateField('nationality', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.nationality || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                <Input
                  id="city"
                  value={currentProfile?.city || ''}
                  onChange={(e) => updateField('city', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Paris, London, Tokyo"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {currentProfile?.city || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              {isEditing ? (
                <Input
                  id="timezone"
                  value={currentProfile?.timezone || ''}
                  onChange={(e) => updateField('timezone', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Europe/Paris"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {currentProfile?.timezone || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Academic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-ui-blue-primary" />
            Academic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="institute">University/Institute</Label>
              {isEditing ? (
                <Input
                  id="institute"
                  value={currentProfile?.institute || ''}
                  onChange={(e) => updateField('institute', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.institute || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="campus">Campus</Label>
              {isEditing ? (
                <Input
                  id="campus"
                  value={currentProfile?.campus || ''}
                  onChange={(e) => updateField('campus', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.campus || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="programDegree">Program/Degree</Label>
              {isEditing ? (
                <Input
                  id="programDegree"
                  value={currentProfile?.programDegree || ''}
                  onChange={(e) => updateField('programDegree', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Bachelor of Computer Science"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.programDegree || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="yearOfStudy">Year of Study</Label>
              {isEditing ? (
                <Input
                  id="yearOfStudy"
                  value={currentProfile?.yearOfStudy || ''}
                  onChange={(e) => updateField('yearOfStudy', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., 2nd Year"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.yearOfStudy || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="expectedGraduation">Expected Graduation</Label>
              {isEditing ? (
                <Input
                  id="expectedGraduation"
                  value={currentProfile?.expectedGraduation || ''}
                  onChange={(e) => updateField('expectedGraduation', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., May 2025"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {currentProfile?.expectedGraduation || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* About & Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-ui-blue-primary" />
            About You
          </h2>

          <div className="space-y-6">
            <div>
              <Label htmlFor="bio">Bio / Short Introduction</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={currentProfile?.bio || ''}
                  onChange={(e) => updateField('bio', e.target.value)}
                  className="mt-1"
                  rows={4}
                  placeholder="Tell tourists about yourself..."
                />
              ) : (
                <p className="mt-1 text-gray-700 whitespace-pre-wrap">
                  {currentProfile?.bio || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="preferredGuideStyle">Preferred Guide Style</Label>
              {isEditing ? (
                <Input
                  id="preferredGuideStyle"
                  value={currentProfile?.preferredGuideStyle || ''}
                  onChange={(e) => updateField('preferredGuideStyle', e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Interactive, Educational, Fun & Casual"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.preferredGuideStyle || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              {isEditing ? (
                <Input
                  id="skills"
                  value={currentProfile?.skills?.join(', ') || ''}
                  onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()))}
                  className="mt-1"
                  placeholder="e.g., Photography, History, Food Tours"
                />
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProfile?.skills && currentProfile.skills.length > 0 ? (
                    currentProfile.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-ui-blue-primary/10 text-ui-blue-primary rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills listed</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="interests">Interests (comma-separated)</Label>
              {isEditing ? (
                <Input
                  id="interests"
                  value={currentProfile?.interests?.join(', ') || ''}
                  onChange={(e) => updateField('interests', e.target.value.split(',').map(s => s.trim()))}
                  className="mt-1"
                  placeholder="e.g., Art, Music, Sports"
                />
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProfile?.interests && currentProfile.interests.length > 0 ? (
                    currentProfile.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-ui-purple-primary/10 text-ui-purple-primary rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests listed</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Service Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-ui-blue-primary" />
            Service Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
              {isEditing ? (
                <Input
                  id="hourlyRate"
                  type="number"
                  value={currentProfile?.hourlyRate || ''}
                  onChange={(e) => updateField('hourlyRate', parseFloat(e.target.value))}
                  className="mt-1"
                  min="0"
                  step="0.01"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  ${currentProfile?.hourlyRate || '0'} / hour
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="servicesOffered">Services Offered (comma-separated)</Label>
              {isEditing ? (
                <Input
                  id="servicesOffered"
                  value={currentProfile?.servicesOffered?.join(', ') || ''}
                  onChange={(e) => updateField('servicesOffered', e.target.value.split(',').map(s => s.trim()))}
                  className="mt-1"
                  placeholder="e.g., City Tours, Food Tours, Museum Visits"
                />
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {currentProfile?.servicesOffered && currentProfile.servicesOffered.length > 0 ? (
                    currentProfile.servicesOffered.map((service, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No services listed</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Availability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-ui-blue-primary" />
            Availability
          </h2>

          <AvailabilityEditor
            value={currentProfile?.availability}
            onChange={(availability) => updateField('availability', availability)}
            disabled={!isEditing}
          />
        </motion.div>

        {/* Emergency Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-soft border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-ui-blue-primary" />
            Emergency Contact
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              {isEditing ? (
                <Input
                  id="emergencyContactName"
                  value={currentProfile?.emergencyContactName || ''}
                  onChange={(e) => updateField('emergencyContactName', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.emergencyContactName || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              {isEditing ? (
                <Input
                  id="emergencyContactPhone"
                  value={currentProfile?.emergencyContactPhone || ''}
                  onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900 font-medium">
                  {currentProfile?.emergencyContactPhone || 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bottom Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pb-6">
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={isSaving}
              size="lg"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="lg"
              className="bg-ui-blue-primary hover:bg-ui-blue-secondary"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
