'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
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
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AvailabilityEditor } from '@/components/student/AvailabilityEditor';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import { InfoRow, SectionCard, StatCard, SkillChip } from '@/components/student/ProfileComponents';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

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
 * Student Profile Page - Modernized UI
 *
 * Premium glassmorphism design matching landing page aesthetic
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
    setEditedProfile((prev) => {
      if (!prev) {
        console.warn('updateField called before profile loaded');
        return prev;
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background with Image and Overlays */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Students collaborating"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-accent/15 via-ui-blue-primary/10 to-ui-purple-primary/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ui-blue-accent mx-auto" />
            <p className="mt-4 text-gray-700 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Students collaborating"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-accent/15 via-ui-blue-primary/10 to-ui-purple-primary/15" />
        </div>
        <div className="absolute inset-0 pattern-dots opacity-10" />

        <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
          <div className="glass-card rounded-3xl p-8 shadow-premium max-w-lg w-full">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h3>
                <p className="text-gray-700 mb-6">{error}</p>
                <PrimaryCTAButton
                  onClick={() => router.push('/student/dashboard')}
                  variant="blue"
                  showArrow
                >
                  Return to Dashboard
                </PrimaryCTAButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <>
      <Navigation variant="student" />
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&q=80"
            alt="Students collaborating on campus"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[4px]" />
          {/* Gradient overlay for brand colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-ui-purple-accent/15 via-ui-blue-primary/10 to-ui-purple-primary/15" />
        </div>
        {/* Dot pattern */}
        <div className="absolute inset-0 pattern-dots opacity-10" />

        {/* Content Container */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Header Section - Profile Hero */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-3xl shadow-premium border border-white/60 backdrop-blur-lg overflow-hidden"
            >
              {/* Subtle gradient background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/5 via-transparent to-ui-purple-accent/5 pointer-events-none" />

              <div className="relative px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
                  {/* Left: Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-ui-blue-accent via-ui-purple-accent to-ui-purple-primary bg-clip-text text-transparent mb-2">
                      Your Profile
                    </h1>
                    <p className="text-gray-600/90 text-base sm:text-lg leading-relaxed font-medium">
                      Manage your information and availability
                    </p>
                  </div>

                  {/* Right: Edit/Save Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!isEditing ? (
                      <PrimaryCTAButton
                        onClick={handleEdit}
                        icon={Edit}
                        variant="blue"
                        showArrow
                      >
                        Edit Profile
                      </PrimaryCTAButton>
                    ) : (
                      <>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isSaving}
                          className="border-2 border-gray-300 hover:border-gray-400 bg-white/80 backdrop-blur transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <PrimaryCTAButton
                          onClick={handleSave}
                          disabled={isSaving}
                          icon={Save}
                          variant="purple"
                          isLoading={isSaving}
                          loadingText="Saving..."
                        >
                          Save Changes
                        </PrimaryCTAButton>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-2xl p-5 border border-green-200/60 bg-gradient-to-br from-green-50 to-green-100/50 backdrop-blur-lg shadow-premium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-green-800 font-semibold">{successMessage}</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card rounded-2xl p-5 border border-red-200/60 bg-gradient-to-br from-red-50 to-red-100/50 backdrop-blur-lg shadow-premium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <StatCard
                label="Profile Completeness"
                value={`${currentProfile?.profileCompleteness || 0}%`}
                icon={CheckCircle}
                accentColor="blue"
              />
              <StatCard
                label="Trips Hosted"
                value={currentProfile?.tripsHosted || 0}
                icon={MapPin}
                accentColor="purple"
              />
              <StatCard
                label="Average Rating"
                value={currentProfile?.averageRating?.toFixed(1) || 'N/A'}
                icon={Star}
                accentColor="yellow"
              />
            </div>

            {/* Personal Information */}
            <SectionCard
              title="Personal Information"
              icon={User}
              delay={0.1}
              accentGradient="from-blue-400 via-blue-500 to-purple-500"
              subtitle="Your basic contact and personal details"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label htmlFor="name" className="text-gray-700 font-semibold mb-2 block">
                    Full Name *
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={currentProfile?.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="" icon={User}>
                      {currentProfile?.name || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-2 block">Email</Label>
                  <InfoRow label="" icon={Mail}>
                    {currentProfile?.email}
                  </InfoRow>
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-gray-700 font-semibold mb-2 block">
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      value={currentProfile?.phoneNumber || ''}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="" icon={Phone}>
                      {currentProfile?.phoneNumber || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-gray-700 font-semibold mb-2 block">
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={currentProfile?.dateOfBirth || ''}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="" icon={Calendar}>
                      {currentProfile?.dateOfBirth || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="gender" className="text-gray-700 font-semibold mb-2 block">
                    Gender
                  </Label>
                  {isEditing ? (
                    <select
                      id="gender"
                      value={currentProfile?.gender || ''}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="w-full px-3 py-2 bg-white/80 border border-gray-300 rounded-md focus:ring-2 focus:ring-ui-blue-accent focus:border-ui-blue-accent"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <InfoRow label="">
                      {currentProfile?.gender || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationality" className="text-gray-700 font-semibold mb-2 block">
                    Nationality
                  </Label>
                  {isEditing ? (
                    <Input
                      id="nationality"
                      value={currentProfile?.nationality || ''}
                      onChange={(e) => updateField('nationality', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="" icon={Globe}>
                      {currentProfile?.nationality || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="city" className="text-gray-700 font-semibold mb-2 block">
                    City
                  </Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={currentProfile?.city || ''}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Paris, London, Tokyo"
                    />
                  ) : (
                    <InfoRow label="" icon={MapPin}>
                      {currentProfile?.city || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="timezone" className="text-gray-700 font-semibold mb-2 block">
                    Timezone
                  </Label>
                  {isEditing ? (
                    <Input
                      id="timezone"
                      value={currentProfile?.timezone || ''}
                      onChange={(e) => updateField('timezone', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Europe/Paris"
                    />
                  ) : (
                    <InfoRow label="" icon={Clock}>
                      {currentProfile?.timezone || 'Not provided'}
                    </InfoRow>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Academic Information */}
            <SectionCard
              title="Academic Information"
              icon={GraduationCap}
              delay={0.2}
              accentGradient="from-purple-400 via-purple-500 to-pink-500"
              subtitle="Your university and academic credentials"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label htmlFor="institute" className="text-gray-700 font-semibold mb-2 block">
                    University/Institute
                  </Label>
                  {isEditing ? (
                    <Input
                      id="institute"
                      value={currentProfile?.institute || ''}
                      onChange={(e) => updateField('institute', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="">
                      {currentProfile?.institute || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="campus" className="text-gray-700 font-semibold mb-2 block">
                    Campus
                  </Label>
                  {isEditing ? (
                    <Input
                      id="campus"
                      value={currentProfile?.campus || ''}
                      onChange={(e) => updateField('campus', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="">
                      {currentProfile?.campus || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="programDegree" className="text-gray-700 font-semibold mb-2 block">
                    Program/Degree
                  </Label>
                  {isEditing ? (
                    <Input
                      id="programDegree"
                      value={currentProfile?.programDegree || ''}
                      onChange={(e) => updateField('programDegree', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Bachelor of Computer Science"
                    />
                  ) : (
                    <InfoRow label="">
                      {currentProfile?.programDegree || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="yearOfStudy" className="text-gray-700 font-semibold mb-2 block">
                    Year of Study
                  </Label>
                  {isEditing ? (
                    <Input
                      id="yearOfStudy"
                      value={currentProfile?.yearOfStudy || ''}
                      onChange={(e) => updateField('yearOfStudy', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., 2nd Year"
                    />
                  ) : (
                    <InfoRow label="">
                      {currentProfile?.yearOfStudy || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="expectedGraduation" className="text-gray-700 font-semibold mb-2 block">
                    Expected Graduation
                  </Label>
                  {isEditing ? (
                    <Input
                      id="expectedGraduation"
                      value={currentProfile?.expectedGraduation || ''}
                      onChange={(e) => updateField('expectedGraduation', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., May 2025"
                    />
                  ) : (
                    <InfoRow label="" icon={Calendar}>
                      {currentProfile?.expectedGraduation || 'Not provided'}
                    </InfoRow>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* About You */}
            <SectionCard
              title="About You"
              icon={FileText}
              delay={0.3}
              accentGradient="from-pink-400 via-purple-400 to-blue-400"
              subtitle="Tell tourists about yourself, your skills, and interests"
            >
              <div className="space-y-6">
                <div>
                  <Label htmlFor="bio" className="text-gray-700 font-semibold mb-2 block">
                    Bio / Short Introduction
                  </Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={currentProfile?.bio || ''}
                      onChange={(e) => updateField('bio', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent min-h-[120px]"
                      rows={5}
                      placeholder="Tell tourists about yourself..."
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white/40 rounded-xl p-4 border border-gray-200">
                      {currentProfile?.bio || 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="preferredGuideStyle" className="text-gray-700 font-semibold mb-2 block">
                    Preferred Guide Style
                  </Label>
                  {isEditing ? (
                    <Input
                      id="preferredGuideStyle"
                      value={currentProfile?.preferredGuideStyle || ''}
                      onChange={(e) => updateField('preferredGuideStyle', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Interactive, Educational, Fun & Casual"
                    />
                  ) : (
                    <InfoRow label="">
                      {currentProfile?.preferredGuideStyle || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="skills" className="text-gray-700 font-semibold mb-3 block">
                    Skills
                  </Label>
                  {isEditing ? (
                    <Input
                      id="skills"
                      value={currentProfile?.skills?.join(', ') || ''}
                      onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Photography, History, Food Tours"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentProfile?.skills && currentProfile.skills.length > 0 ? (
                        currentProfile.skills.map((skill, idx) => (
                          <SkillChip key={idx} label={skill} variant="blue" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No skills listed</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="interests" className="text-gray-700 font-semibold mb-3 block">
                    Interests
                  </Label>
                  {isEditing ? (
                    <Input
                      id="interests"
                      value={currentProfile?.interests?.join(', ') || ''}
                      onChange={(e) => updateField('interests', e.target.value.split(',').map(s => s.trim()))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Art, Music, Sports"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentProfile?.interests && currentProfile.interests.length > 0 ? (
                        currentProfile.interests.map((interest, idx) => (
                          <SkillChip key={idx} label={interest} variant="purple" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No interests listed</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Service Preferences */}
            <SectionCard
              title="Service Preferences"
              icon={DollarSign}
              delay={0.4}
              accentGradient="from-green-400 via-teal-400 to-blue-400"
              subtitle="Your rates and services you offer to tourists"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label htmlFor="hourlyRate" className="text-gray-700 font-semibold mb-2 block">
                    Hourly Rate (USD)
                  </Label>
                  {isEditing ? (
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={currentProfile?.hourlyRate || ''}
                      onChange={(e) => updateField('hourlyRate', parseFloat(e.target.value))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    <InfoRow label="" icon={DollarSign}>
                      ${currentProfile?.hourlyRate || '0'} / hour
                    </InfoRow>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="servicesOffered" className="text-gray-700 font-semibold mb-3 block">
                    Services Offered
                  </Label>
                  {isEditing ? (
                    <Input
                      id="servicesOffered"
                      value={currentProfile?.servicesOffered?.join(', ') || ''}
                      onChange={(e) => updateField('servicesOffered', e.target.value.split(',').map(s => s.trim()))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., City Tours, Food Tours, Museum Visits"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentProfile?.servicesOffered && currentProfile.servicesOffered.length > 0 ? (
                        currentProfile.servicesOffered.map((service, idx) => (
                          <SkillChip key={idx} label={service} variant="green" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No services listed</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Availability */}
            <SectionCard
              title="Availability"
              icon={Clock}
              delay={0.5}
              accentGradient="from-blue-400 via-cyan-400 to-teal-400"
              subtitle="Set your weekly availability for tours"
            >
              <AvailabilityEditor
                value={currentProfile?.availability}
                onChange={(availability) => updateField('availability', availability)}
                disabled={!isEditing}
              />
            </SectionCard>

            {/* Emergency Contact */}
            <SectionCard
              title="Emergency Contact"
              icon={Shield}
              delay={0.6}
              accentGradient="from-red-400 via-orange-400 to-yellow-400"
              subtitle="For safety and security purposes"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <Label htmlFor="emergencyContactName" className="text-gray-700 font-semibold mb-2 block">
                    Contact Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="emergencyContactName"
                      value={currentProfile?.emergencyContactName || ''}
                      onChange={(e) => updateField('emergencyContactName', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="" icon={User}>
                      {currentProfile?.emergencyContactName || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor="emergencyContactPhone" className="text-gray-700 font-semibold mb-2 block">
                    Contact Phone
                  </Label>
                  {isEditing ? (
                    <Input
                      id="emergencyContactPhone"
                      value={currentProfile?.emergencyContactPhone || ''}
                      onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                    />
                  ) : (
                    <InfoRow label="" icon={Phone}>
                      {currentProfile?.emergencyContactPhone || 'Not provided'}
                    </InfoRow>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Bottom Action Buttons in Edit Mode */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 shadow-premium border border-white/60 backdrop-blur-lg"
              >
                <div className="flex items-center justify-end gap-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isSaving}
                    size="lg"
                    className="border-2 border-gray-300 hover:border-gray-400 bg-white/80 backdrop-blur"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel Changes
                  </Button>
                  <PrimaryCTAButton
                    onClick={handleSave}
                    disabled={isSaving}
                    icon={Save}
                    variant="purple"
                    isLoading={isSaving}
                    loadingText="Saving..."
                  >
                    Save All Changes
                  </PrimaryCTAButton>
                </div>
              </motion.div>
            )}

            {/* Bottom Spacing */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </>
  );
}
