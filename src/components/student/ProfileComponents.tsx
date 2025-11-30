'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * InfoRow Component
 * Displays a label-value pair with optional icon
 */
interface InfoRowProps {
  label: string;
  children: React.ReactNode;
  icon?: LucideIcon;
}

export function InfoRow({ label, children, icon: Icon }: InfoRowProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-2 text-gray-900 font-medium">
        {Icon && <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        <span className="leading-relaxed">{children}</span>
      </div>
    </div>
  );
}

/**
 * StatCard Component
 * Displays a statistic with icon and gradient accent
 */
interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: 'blue' | 'purple' | 'pink' | 'yellow';
}

const accentColors = {
  blue: {
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
    icon: 'text-ui-blue-accent',
    iconBg: 'bg-ui-blue-primary/10',
    border: 'border-blue-200/50',
  },
  purple: {
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100/50',
    icon: 'text-ui-purple-accent',
    iconBg: 'bg-ui-purple-primary/10',
    border: 'border-purple-200/50',
  },
  pink: {
    bg: 'bg-gradient-to-br from-pink-50 to-pink-100/50',
    icon: 'text-pink-600',
    iconBg: 'bg-pink-100',
    border: 'border-pink-200/50',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
    icon: 'text-yellow-600',
    iconBg: 'bg-yellow-100',
    border: 'border-yellow-200/50',
  },
};

export function StatCard({ label, value, icon: Icon, accentColor }: StatCardProps) {
  const colors = accentColors[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-2xl p-5 border ${colors.border} ${colors.bg} backdrop-blur-lg shadow-premium hover-lift`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 font-medium truncate">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * SectionCard Component
 * Main card wrapper for profile sections with gradient accent
 */
interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
  accentGradient?: string;
  subtitle?: string;
}

export function SectionCard({
  title,
  icon: Icon,
  children,
  delay = 0,
  accentGradient = 'from-blue-400 via-purple-400 to-pink-400',
  subtitle,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card rounded-3xl shadow-premium border border-white/60 backdrop-blur-lg overflow-hidden"
    >
      {/* Gradient Accent Bar */}
      <div className={`h-1 bg-gradient-to-r ${accentGradient}`} />

      {/* Card Content */}
      <div className="p-6 md:p-8">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ui-blue-primary/20 to-ui-purple-primary/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-ui-blue-accent" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-sm text-gray-600 ml-13 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Section Content */}
        {children}
      </div>
    </motion.div>
  );
}

/**
 * SkillChip Component
 * Displays a skill or tag as a pill
 */
interface SkillChipProps {
  label: string;
  variant?: 'blue' | 'purple' | 'green' | 'pink';
}

const chipVariants = {
  blue: 'bg-ui-blue-primary/10 text-ui-blue-accent border-ui-blue-primary/20',
  purple: 'bg-ui-purple-primary/10 text-ui-purple-accent border-ui-purple-primary/20',
  green: 'bg-green-100 text-green-700 border-green-200',
  pink: 'bg-pink-100 text-pink-700 border-pink-200',
};

export function SkillChip({ label, variant = 'blue' }: SkillChipProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${chipVariants[variant]} transition-all hover:scale-105`}
    >
      {label}
    </span>
  );
}
