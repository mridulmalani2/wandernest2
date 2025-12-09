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
const PROFILE_BG_IMAGE = "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1920&q=80";

const ProfileBackground = () => (
  <>
    <div className="absolute inset-0">
      <Image
        src={PROFILE_BG_IMAGE}
        alt="Students working together at modern café"
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
    </div>
    <div className="absolute inset-0 pattern-dots opacity-10" />
  </>
);

const parseArrayInput = (value: string) =>
  value.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

interface ProfileActionsProps {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  className?: string; // Allow passing extra classes for positioning
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
  className = "",
}) => {
  return (
    <div className={`flex items-center gap-3 flex-shrink-0 ${className}`}>
      {!isEditing ? (
        <Button
          onClick={onEdit}
          variant="ghost"
          className="group flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/30 hover:border-white/80 backdrop-blur-md transition-all duration-300 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
        >
          <Edit className="w-3.5 h-3.5 mr-2" />
          Edit Profile
        </Button>
      ) : (
        <>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isSaving}
            className="border-2 border-white/20 hover:border-white/40 bg-white/10 backdrop-blur transition-colors text-white hover:bg-white/20"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <PrimaryCTAButton
            onClick={onSave}
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
  );
};

export default function StudentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after 3 seconds with cleanup
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch profile on mount
  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/student/profile', {
          signal: controller.signal
        });

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
        if (err.name !== 'AbortError') {
          console.error('Error fetching profile:', err);
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  const handleEdit = () => {
    if (!profile) return;
    setIsEditing(true);
    // Use structuredClone for deep copy if environment supports, or JSON parse/stringify for safety
    // For now, assuming simple object structure or that spread is sufficient if no deep nested mutations are needed except those handled
    setEditedProfile(JSON.parse(JSON.stringify(profile)));
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    if (!profile) return;
    setIsEditing(false);
    setEditedProfile(JSON.parse(JSON.stringify(profile)));
    setError(null);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

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

    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof StudentProfile>(field: K, value: StudentProfile[K]) => {
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
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
        <ProfileBackground />
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
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
        <ProfileBackground />
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
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
        <ProfileBackground />

        {/* Content Container */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pt-28 pb-8 md:pt-36 md:pb-12">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Header Section - Profile Hero */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-dark rounded-3xl shadow-premium border border-white/10 backdrop-blur-lg overflow-hidden"
            >
              {/* Subtle gradient background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-accent/5 via-transparent to-ui-purple-accent/5 pointer-events-none" />

              <div className="relative px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-7">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-8">
                  {/* Left: Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                      Your Profile
                    </h1>
                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed font-medium">
                      Manage your information and availability
                    </p>
                  </div>

                  {/* Right: Edit/Save Actions */}
                  <ProfileActions
                    isEditing={isEditing}
                    isSaving={isSaving}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                  />
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
                  className="glass-card-dark rounded-2xl p-5 border border-green-500/20 bg-green-900/20 backdrop-blur-lg shadow-premium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-green-300 font-semibold">{successMessage}</p>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card-dark rounded-2xl p-5 border border-red-500/20 bg-red-900/20 backdrop-blur-lg shadow-premium"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-red-300 font-medium">Error</p>
                      <p className="text-red-200 text-sm mt-0.5">{error}</p>
                    </div>
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
                value={currentProfile?.averageRating ? currentProfile.averageRating.toFixed(1) : 'N/A'}
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
                  <Label htmlFor={isEditing ? "name" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "phoneNumber" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "dateOfBirth" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "gender" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                    <InfoRow label="" icon={User}>
                      {currentProfile?.gender || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "nationality" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "city" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "timezone" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "institute" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                    <InfoRow label="" icon={GraduationCap}>
                      {currentProfile?.institute || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "campus" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                    <InfoRow label="" icon={MapPin}>
                      {currentProfile?.campus || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "programDegree" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                    <InfoRow label="" icon={FileText}>
                      {currentProfile?.programDegree || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "yearOfStudy" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                    <InfoRow label="" icon={Calendar}>
                      {currentProfile?.yearOfStudy || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "expectedGraduation" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "bio" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                    <InfoRow label="" icon={FileText}>
                      <div className="whitespace-pre-wrap">
                        {currentProfile?.bio || 'Not provided'}
                      </div>
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "preferredGuideStyle" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "skills" : undefined} className="text-gray-700 font-semibold mb-3 block">
                    Skills
                  </Label>
                  {isEditing ? (
                    <Input
                      id="skills"
                      value={currentProfile?.skills?.join(', ') || ''}
                      onChange={(e) => updateField('skills', parseArrayInput(e.target.value))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Photography, History, Food Tours"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentProfile?.skills && currentProfile.skills.length > 0 ? (
                        currentProfile.skills.map((skill, idx) => (
                          <SkillChip key={`${skill}-${idx}`} label={skill} variant="blue" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No skills listed</p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "interests" : undefined} className="text-gray-700 font-semibold mb-3 block">
                    Interests
                  </Label>
                  {isEditing ? (
                    <Input
                      id="interests"
                      value={currentProfile?.interests?.join(', ') || ''}
                      onChange={(e) => updateField('interests', parseArrayInput(e.target.value))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., Art, Music, Sports"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentProfile?.interests && currentProfile.interests.length > 0 ? (
                        currentProfile.interests.map((interest, idx) => (
                          <SkillChip key={`${interest}-${idx}`} label={interest} variant="purple" />
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
                  <Label htmlFor={isEditing ? "hourlyRate" : undefined} className="text-gray-700 font-semibold mb-2 block">
                    Hourly Rate (USD)
                  </Label>
                  {isEditing ? (
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={currentProfile?.hourlyRate?.toString() || ''}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        updateField('hourlyRate', isNaN(val) ? 0 : val);
                      }}
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
                  <Label htmlFor={isEditing ? "servicesOffered" : undefined} className="text-gray-700 font-semibold mb-3 block">
                    Services Offered
                  </Label>
                  {isEditing ? (
                    <Input
                      id="servicesOffered"
                      value={currentProfile?.servicesOffered?.join(', ') || ''}
                      onChange={(e) => updateField('servicesOffered', parseArrayInput(e.target.value))}
                      className="bg-white/80 border-gray-300 focus:border-ui-blue-accent"
                      placeholder="e.g., City Tours, Food Tours, Museum Visits"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentProfile?.servicesOffered && currentProfile.servicesOffered.length > 0 ? (
                        currentProfile.servicesOffered.map((service, idx) => (
                          <SkillChip key={`${service}-${idx}`} label={service} variant="green" />
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No services listed</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                  <Label htmlFor={isEditing ? "emergencyContactName" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <Label htmlFor={isEditing ? "emergencyContactPhone" : undefined} className="text-gray-700 font-semibold mb-2 block">
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
                  <ProfileActions
                    isEditing={isEditing}
                    isSaving={isSaving}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                  />
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
