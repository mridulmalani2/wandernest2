'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { MultiSelect } from '@/components/ui/MultiSelect';
// import { toast } from 'sonner';
import { InfoRow, SectionCard, StatCard, SkillChip } from '@/components/student/ProfileComponents';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { COUNTRY_CALLING_CODES, type CountryCallingCode } from '@/config/countryCallingCodes';

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
  hourlyRateCurrency?: 'GBP' | 'EUR';
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
const PROFILE_BG_IMAGE = "/images/backgrounds/cafe-ambiance.jpg";

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

const formatRating = (value: unknown): string | null => {
  const rating = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(rating) ? rating.toFixed(1) : null;
};

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
            variant="ghost"
            disabled={isSaving}
            className="w-[160px] h-10 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl backdrop-blur-md transition-all active:scale-95"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="w-[160px] h-10 bg-gradient-to-r from-[#A66CFF] to-[#E85D9B] hover:shadow-[0_0_20px_rgba(166,108,255,0.4)] text-white border-0 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};

// Shared styles
const DARK_INPUT_CLASS = "w-full px-3 py-2 bg-[#ffffff10] border border-[#ffffff2e] text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:border-[#A66CFF]/50 focus:ring-2 focus:ring-[#A66CFF]/20 transition-all";
const DARK_LABEL_CLASS = "text-gray-300 font-medium mb-2 block";

const SKILL_OPTIONS = [
  "Photography", "History", "Food & Culinary", "Nightlife", "Art & Museums",
  "Hiking", "Shopping", "Language Exchange", "Local Culture", "Architecture"
];

const INTEREST_OPTIONS = [
  "Music", "Sports", "Reading", "Travel", "Cooking", "Gaming",
  "Movies", "Tech", "Fashion", "Nature"
];

export default function StudentProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentProfile, setCurrentProfile] = useState<StudentProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneCode, setPhoneCode] = useState('+1');
  const countryCodeOptions = useMemo(() => {
    const mergedByCode = COUNTRY_CALLING_CODES.reduce<Record<string, CountryCallingCode>>((acc, entry) => {
      if (acc[entry.code]) {
        acc[entry.code] = {
          code: entry.code,
          country: `${acc[entry.code].country}, ${entry.country}`
        };
      } else {
        acc[entry.code] = entry;
      }
      return acc;
    }, {});

    return Object.values(mergedByCode).sort((a, b) => a.country.localeCompare(b.country));
  }, []);

  useEffect(() => {
    if (currentProfile?.phoneNumber) {
      const found = COUNTRY_CALLING_CODES.find(c => currentProfile.phoneNumber?.startsWith(c.code));
      if (found) {
        setPhoneCode(found.code);
      }
    }
  }, [currentProfile]);

  const handlePhoneCodeChange = (newCode: string) => {
    if (!currentProfile) return;
    const currentNumber = currentProfile.phoneNumber || '';
    const localPart = currentNumber.startsWith(phoneCode)
      ? currentNumber.slice(phoneCode.length)
      : currentNumber;

    setPhoneCode(newCode);
    updateField('phoneNumber', `${newCode}${localPart}`);
  };

  const validateForm = () => {
    if (!currentProfile?.name?.trim()) {
      alert("Full Name is required");
      return false;
    }

    if (currentProfile.dateOfBirth) {
      const dob = new Date(currentProfile.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 16) {
        alert("You must be at least 16 years old.");
        return false;
      }
      if (dob > today) {
        alert("Date of birth cannot be in the future.");
        return false;
      }
    }

    if (currentProfile.phoneNumber) {
      if (currentProfile.phoneNumber.length < 5) {
        alert("Please enter a valid phone number.");
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/profile');
      if (res.ok) {
        const data = await res.json();
        const normalizedStudent: StudentProfile = {
          ...data.student,
          hourlyRateCurrency: data.student?.hourlyRateCurrency ?? 'GBP'
        };
        setCurrentProfile(normalizedStudent);
        setOriginalProfile(normalizedStudent);
      } else {
        // Handle unauthorized or error
        if (res.status === 401) {
          router.push('/student/login');
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof StudentProfile, value: any) => {
    if (!currentProfile) return;
    setCurrentProfile({
      ...currentProfile,
      [field]: value
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setCurrentProfile(originalProfile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!currentProfile) return;

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentProfile),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedStudent: StudentProfile = {
          ...data.student,
          hourlyRateCurrency: data.student?.hourlyRateCurrency ?? currentProfile.hourlyRateCurrency ?? 'GBP'
        };
        setOriginalProfile(updatedStudent);
        setCurrentProfile(updatedStudent);
        setIsEditing(false);
      } else {
        // Handle error
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !currentProfile) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation variant="student" />
      <div className="min-h-screen relative bg-neutral-900 text-white overflow-hidden font-sans selection:bg-purple-500/30">

        {/* Background */}
        <div className="fixed inset-0 z-0">
          <ProfileBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/80 to-neutral-900" />
        </div>

        <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-200">
                My Profile
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Manage your personal information and preferences
              </p>
            </div>

            {/* Top Edit Button - Only visible when NOT editing */}
            {!isEditing && (
              <div className="hidden md:block">
                <ProfileActions
                  isEditing={isEditing}
                  isSaving={isSaving}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onSave={handleSave}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card-dark rounded-2xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group border border-white/10 backdrop-blur-md">               <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white/10 shadow-2xl relative">
                    {currentProfile?.profilePhotoUrl ? (
                      <Image
                        src={currentProfile.profilePhotoUrl}
                        alt={currentProfile.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <User className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full text-white shadow-lg hover:bg-purple-500 transition-colors">
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">
                  {currentProfile?.name}
                </h2>
                <div className="text-purple-300 font-medium mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {currentProfile?.programDegree || 'Student'}
                </div>

                <div className="w-full border-t border-white/10 my-6" />

                <div className="grid grid-cols-2 gap-4 w-full">
                  <StatCard
                    label="Trips Hosted"
                    value={currentProfile?.tripsHosted?.toString() || '0'}
                    icon={Globe}
                    accentColor="blue"
                  />
                  <StatCard
                    label="Rating"
                    value={formatRating(currentProfile?.averageRating) ?? 'N/A'}
                    icon={Star}
                    accentColor="yellow"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal Information */}
              <SectionCard
                title="Personal Information"
                icon={User}
                delay={0.1}
                accentGradient="from-blue-400 via-indigo-500 to-purple-500"
                subtitle="Your basic personal details"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <Label htmlFor={isEditing ? "name" : undefined} className={DARK_LABEL_CLASS}>
                      Full Name *
                    </Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={currentProfile?.name || ''}
                        onChange={(e) => updateField('name', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      />
                    ) : (
                      <InfoRow label="" icon={User}>
                        {currentProfile?.name || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label className={DARK_LABEL_CLASS}>Email</Label>
                    <InfoRow label="" icon={Mail}>
                      {currentProfile?.email}
                    </InfoRow>
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "phoneNumber" : undefined} className={DARK_LABEL_CLASS}>
                      Phone Number <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <select
                          value={phoneCode}
                          onChange={(e) => handlePhoneCodeChange(e.target.value)}
                          className="px-3 py-2 bg-[#ffffff10] border border-[#ffffff2e] text-white rounded-md focus:outline-none focus:border-purple-500/50 appearance-none min-w-[140px]"
                        >
                          {countryCodeOptions.map((c) => (
                            <option key={`${c.code}-${c.country}`} value={c.code} className="bg-neutral-900 text-white">
                              {c.code} ({c.country})
                            </option>
                          ))}
                        </select>
                        <Input
                          id="phoneNumber"
                          value={currentProfile?.phoneNumber?.replace(phoneCode, '') || ''}
                          onChange={(e) => updateField('phoneNumber', `${phoneCode}${e.target.value}`)}
                          className={DARK_INPUT_CLASS}
                          placeholder="Phone number"
                        />
                      </div>
                    ) : (
                      <InfoRow label="" icon={Phone}>
                        {currentProfile?.phoneNumber || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "dateOfBirth" : undefined} className={DARK_LABEL_CLASS}>
                      Date of Birth <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <div className="relative">
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={currentProfile?.dateOfBirth ? new Date(currentProfile.dateOfBirth).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateField('dateOfBirth', e.target.value)}
                          className={`${DARK_INPUT_CLASS} [color-scheme:dark] cursor-pointer`}
                        />
                        <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <InfoRow label="" icon={Calendar}>
                        {currentProfile?.dateOfBirth ? new Date(currentProfile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "gender" : undefined} className={DARK_LABEL_CLASS}>
                      Gender
                    </Label>
                    {isEditing ? (
                      <select
                        id="gender"
                        value={currentProfile?.gender || ''}
                        onChange={(e) => updateField('gender', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      >
                        <option value="" className="bg-gray-900 text-gray-400">Select...</option>
                        <option value="Male" className="bg-gray-900 text-white">Male</option>
                        <option value="Female" className="bg-gray-900 text-white">Female</option>
                        <option value="Non-binary" className="bg-gray-900 text-white">Non-binary</option>
                        <option value="Prefer not to say" className="bg-gray-900 text-white">Prefer not to say</option>
                      </select>
                    ) : (
                      <InfoRow label="" icon={User}>
                        {currentProfile?.gender || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "nationality" : undefined} className={DARK_LABEL_CLASS}>
                      Nationality <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="nationality"
                        value={currentProfile?.nationality || ''}
                        onChange={(e) => updateField('nationality', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      />
                    ) : (
                      <InfoRow label="" icon={Globe}>
                        {currentProfile?.nationality || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "city" : undefined} className={DARK_LABEL_CLASS}>
                      City <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="city"
                        value={currentProfile?.city || ''}
                        onChange={(e) => updateField('city', e.target.value)}
                        className={DARK_INPUT_CLASS}
                        placeholder="e.g., Paris, London, Tokyo"
                      />
                    ) : (
                      <InfoRow label="" icon={MapPin}>
                        {currentProfile?.city || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "timezone" : undefined} className={DARK_LABEL_CLASS}>
                      Timezone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="timezone"
                        value={currentProfile?.timezone || ''}
                        onChange={(e) => updateField('timezone', e.target.value)}
                        className={DARK_INPUT_CLASS}
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
                    <Label htmlFor={isEditing ? "institute" : undefined} className={DARK_LABEL_CLASS}>
                      University/Institute <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="institute"
                        value={currentProfile?.institute || ''}
                        onChange={(e) => updateField('institute', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      />
                    ) : (
                      <InfoRow label="" icon={GraduationCap}>
                        {currentProfile?.institute || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "campus" : undefined} className={DARK_LABEL_CLASS}>
                      Campus <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="campus"
                        value={currentProfile?.campus || ''}
                        onChange={(e) => updateField('campus', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      />
                    ) : (
                      <InfoRow label="" icon={MapPin}>
                        {currentProfile?.campus || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "programDegree" : undefined} className={DARK_LABEL_CLASS}>
                      Program/Degree <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="programDegree"
                        value={currentProfile?.programDegree || ''}
                        onChange={(e) => updateField('programDegree', e.target.value)}
                        className={DARK_INPUT_CLASS}
                        placeholder="e.g., Bachelor of Computer Science"
                      />
                    ) : (
                      <InfoRow label="" icon={FileText}>
                        {currentProfile?.programDegree || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "yearOfStudy" : undefined} className={DARK_LABEL_CLASS}>
                      Year of Study <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="yearOfStudy"
                        value={currentProfile?.yearOfStudy || ''}
                        onChange={(e) => updateField('yearOfStudy', e.target.value)}
                        className={DARK_INPUT_CLASS}
                        placeholder="e.g., 2nd Year"
                      />
                    ) : (
                      <InfoRow label="" icon={Calendar}>
                        {currentProfile?.yearOfStudy || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "expectedGraduation" : undefined} className={DARK_LABEL_CLASS}>
                      Expected Graduation <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="expectedGraduation"
                        value={currentProfile?.expectedGraduation || ''}
                        onChange={(e) => updateField('expectedGraduation', e.target.value)}
                        className={DARK_INPUT_CLASS}
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
                    <Label htmlFor={isEditing ? "bio" : undefined} className={DARK_LABEL_CLASS}>
                      Bio / Short Introduction
                    </Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={currentProfile?.bio || ''}
                        onChange={(e) => updateField('bio', e.target.value)}
                        className={`${DARK_INPUT_CLASS} min-h-[120px]`}
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
                    <Label htmlFor={isEditing ? "preferredGuideStyle" : undefined} className={DARK_LABEL_CLASS}>
                      Preferred Guide Style
                    </Label>
                    {isEditing ? (
                      <Input
                        id="preferredGuideStyle"
                        value={currentProfile?.preferredGuideStyle || ''}
                        onChange={(e) => updateField('preferredGuideStyle', e.target.value)}
                        className={DARK_INPUT_CLASS}
                        placeholder="e.g., Interactive, Educational, Fun & Casual"
                      />
                    ) : (
                      <InfoRow label="">
                        {currentProfile?.preferredGuideStyle || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "skills" : undefined} className={DARK_LABEL_CLASS}>
                      Skills
                    </Label>
                    {isEditing ? (
                      <MultiSelect
                        options={SKILL_OPTIONS}
                        selected={currentProfile?.skills || []}
                        onChange={(selected) => updateField('skills', selected)}
                        placeholder="Select or type skills..."
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
                    <Label htmlFor={isEditing ? "interests" : undefined} className={DARK_LABEL_CLASS}>
                      Interests <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <MultiSelect
                        options={INTEREST_OPTIONS}
                        selected={currentProfile?.interests || []}
                        onChange={(selected) => updateField('interests', selected)}
                        placeholder="Select or type interests..."
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
                    <Label htmlFor={isEditing ? "hourlyRate" : undefined} className={DARK_LABEL_CLASS}>
                      Hourly Rate <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          id="hourlyRateCurrency"
                          value={currentProfile?.hourlyRateCurrency || 'GBP'}
                          onChange={(e) => updateField('hourlyRateCurrency', e.target.value as StudentProfile['hourlyRateCurrency'])}
                          className={`${DARK_INPUT_CLASS} appearance-none`}
                        >
                          <option value="GBP" className="bg-gray-900 text-white">GBP (£)</option>
                          <option value="EUR" className="bg-gray-900 text-white">EUR (€)</option>
                        </select>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={currentProfile?.hourlyRate?.toString() || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            updateField('hourlyRate', isNaN(val) ? 0 : val);
                          }}
                          className={DARK_INPUT_CLASS}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    ) : (
                      <InfoRow label="" icon={DollarSign}>
                        {`${currentProfile?.hourlyRateCurrency === 'EUR' ? '€' : '£'}${currentProfile?.hourlyRate || '0'} / hour (${currentProfile?.hourlyRateCurrency || 'GBP'})`}
                      </InfoRow>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor={isEditing ? "servicesOffered" : undefined} className={DARK_LABEL_CLASS}>
                      Services Offered
                    </Label>
                    {isEditing ? (
                      <Input
                        id="servicesOffered"
                        value={currentProfile?.servicesOffered?.join(', ') || ''}
                        onChange={(e) => updateField('servicesOffered', parseArrayInput(e.target.value))}
                        className={DARK_INPUT_CLASS}
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
                    <Label htmlFor={isEditing ? "emergencyContactName" : undefined} className={DARK_LABEL_CLASS}>
                      Contact Name <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContactName"
                        value={currentProfile?.emergencyContactName || ''}
                        onChange={(e) => updateField('emergencyContactName', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      />
                    ) : (
                      <InfoRow label="" icon={User}>
                        {currentProfile?.emergencyContactName || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={isEditing ? "emergencyContactPhone" : undefined} className={DARK_LABEL_CLASS}>
                      Contact Phone <span className="text-red-400">*</span>
                    </Label>
                    {isEditing ? (
                      <Input
                        id="emergencyContactPhone"
                        value={currentProfile?.emergencyContactPhone || ''}
                        onChange={(e) => updateField('emergencyContactPhone', e.target.value)}
                        className={DARK_INPUT_CLASS}
                      />
                    ) : (
                      <InfoRow label="" icon={Phone}>
                        {currentProfile?.emergencyContactPhone || 'Not provided'}
                      </InfoRow>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* Sticky Bottom Action Bar in Edit Mode */}
              <AnimatePresence>
                {isEditing && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 border-t border-white/10 bg-neutral-900/90 backdrop-blur-xl shadow-2xl"
                  >
                    <div className="max-w-7xl mx-auto flex justify-end items-center gap-4 px-4 sm:px-6 lg:px-8">
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
              </AnimatePresence>

              {/* Bottom Spacing */}
              <div className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Icon for the profile picture edit button
const CameraIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
