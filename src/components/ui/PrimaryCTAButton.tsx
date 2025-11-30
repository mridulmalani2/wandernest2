'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export type CTAVariant = 'blue' | 'purple' | 'ghost';

interface PrimaryCTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  showArrow?: boolean;
  variant?: CTAVariant;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<
  CTAVariant,
  { gradient: string; glow: string; textColor: string; iconColor: string }
> = {
  blue: {
    gradient: 'bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400',
    glow: 'bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400',
    textColor: 'text-white',
    iconColor: 'text-white',
  },
  purple: {
    gradient: 'bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400',
    glow: 'bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400',
    textColor: 'text-white',
    iconColor: 'text-white',
  },
  ghost: {
    gradient: 'bg-white border border-slate-200',
    glow: 'bg-slate-200',
    textColor: 'text-slate-900',
    iconColor: 'text-indigo-600',
  },
  ghost: {
    gradient:
      'bg-white/5 border border-white/40 backdrop-blur-sm text-white hover:bg-white/10 transition-colors duration-300',
    glow: 'bg-white/10',
  },
  ghost: {
    gradient:
      'bg-white/5 border border-white/40 backdrop-blur-sm text-white hover:bg-white/10 transition-colors duration-300',
    glow: 'bg-white/10',
  },
};

export function PrimaryCTAButton({
  children,
  href,
  onClick,
  icon: Icon,
  showArrow = false,
  variant = 'blue',
  disabled = false,
  className = '',
  type = 'button',
}: PrimaryCTAButtonProps) {
  const styles = variantStyles[variant];

  const buttonContent = (
    <div className={`relative transition-transform duration-200 ${disabled ? '' : 'hover:scale-103 active:scale-98'}`}>
      {/* Glow effect */}
      <div
        className={`absolute -inset-1 ${styles.glow} rounded-2xl opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${
          disabled ? 'opacity-10' : ''
        }`}
      />

      {/* Main button */}
      <div
        className={`relative px-6 py-3 sm:px-8 sm:py-4 ${styles.gradient} rounded-2xl shadow-lg overflow-hidden ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {/* Shimmer effect */}
        {!disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
        )}

        <div className={`relative flex items-center gap-2 sm:gap-3 ${className}`}>
          {Icon && <Icon className={`w-5 h-5 ${styles.iconColor}`} />}
          <span className={`text-base lg:text-lg font-medium ${styles.textColor}`}>{children}</span>
          {showArrow && (
            <span className={`ml-auto ${styles.textColor} group-hover:translate-x-1 transition-transform duration-300`}>
              →
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className="group inline-block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-2xl transition-all"
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={(e) => {
        if (!disabled && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      disabled={disabled}
      className="group inline-block cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-2xl transition-all"
    >
      {buttonContent}
    </button>
  );
}
