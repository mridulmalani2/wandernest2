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

// Shared styles
const DARK_INPUT_CLASS = "w-full px-3 py-2 bg-[#ffffff10] border border-[#ffffff2e] text-white placeholder:text-gray-400 rounded-md focus:outline-none focus:border-[#A66CFF]/50 focus:ring-2 focus:ring-[#A66CFF]/20 transition-all";
const DARK_LABEL_CLASS = "text-gray-300 font-medium mb-2 block";

export default function StudentProfilePage() {
  const router = useRouter();
// ... (rest of component logic remains the same)

// In the JSX, replace usages:

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
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phoneNumber"
                      value={currentProfile?.phoneNumber || ''}
                      onChange={(e) => updateField('phoneNumber', e.target.value)}
                      className={DARK_INPUT_CLASS}
                    />
                  ) : (
                    <InfoRow label="" icon={Phone}>
                      {currentProfile?.phoneNumber || 'Not provided'}
                    </InfoRow>
                  )}
                </div>

                <div>
                  <Label htmlFor={isEditing ? "dateOfBirth" : undefined} className={DARK_LABEL_CLASS}>
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={currentProfile?.dateOfBirth || ''}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      className={DARK_INPUT_CLASS}
                    />
                  ) : (
                    <InfoRow label="" icon={Calendar}>
                      {currentProfile?.dateOfBirth || 'Not provided'}
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
                    Nationality
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
                    City
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
              </div >
            </SectionCard >

    {/* Academic Information */ }
    < SectionCard
  title = "Academic Information"
  icon = { GraduationCap }
  delay = { 0.2}
  accentGradient = "from-purple-400 via-purple-500 to-pink-500"
  subtitle = "Your university and academic credentials"
    >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div>
        <Label htmlFor={isEditing ? "institute" : undefined} className={DARK_LABEL_CLASS}>
          University/Institute
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
          Campus
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
          Program/Degree
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
          Year of Study
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
          Expected Graduation
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
            </SectionCard >

    {/* About You */ }
    < SectionCard
  title = "About You"
  icon = { FileText }
  delay = { 0.3}
  accentGradient = "from-pink-400 via-purple-400 to-blue-400"
  subtitle = "Tell tourists about yourself, your skills, and interests"
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
          <Input
            id="skills"
            value={currentProfile?.skills?.join(', ') || ''}
            onChange={(e) => updateField('skills', parseArrayInput(e.target.value))}
            className={DARK_INPUT_CLASS}
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
        <Label htmlFor={isEditing ? "interests" : undefined} className={DARK_LABEL_CLASS}>
          Interests
        </Label>
        {isEditing ? (
          <Input
            id="interests"
            value={currentProfile?.interests?.join(', ') || ''}
            onChange={(e) => updateField('interests', parseArrayInput(e.target.value))}
            className={DARK_INPUT_CLASS}
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
            </SectionCard >

    {/* Service Preferences */ }
    < SectionCard
  title = "Service Preferences"
  icon = { DollarSign }
  delay = { 0.4}
  accentGradient = "from-green-400 via-teal-400 to-blue-400"
  subtitle = "Your rates and services you offer to tourists"
    >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
      <div>
        <Label htmlFor={isEditing ? "hourlyRate" : undefined} className={DARK_LABEL_CLASS}>
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
            </SectionCard >



    {/* Emergency Contact */ }
    < SectionCard
  title = "Emergency Contact"
  icon = { Shield }
  delay = { 0.6}
  accentGradient = "from-red-400 via-orange-400 to-yellow-400"
  subtitle = "For safety and security purposes"
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
            </SectionCard >

    {/* Bottom Action Buttons in Edit Mode */ }
  {
    isEditing && (
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
    )
  }

  {/* Bottom Spacing */ }
  <div className="h-8" />
          </div >
        </div >
      </div >
    </>
  );
}
