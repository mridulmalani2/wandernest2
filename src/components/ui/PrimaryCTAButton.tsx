'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

export type CTAVariant = 'blue' | 'purple' | 'ghost';

interface PrimaryCTAButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: (e?: React.MouseEvent) => void;
  icon?: LucideIcon;
  showArrow?: boolean;
  variant?: CTAVariant;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  loadingText?: string;
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
    gradient: 'bg-gradient-to-r from-[#A66CFF] to-[#E85D9B] hover:shadow-[0_0_20px_rgba(166,108,255,0.4)]',
    glow: 'bg-gradient-to-r from-[#A66CFF] to-[#E85D9B]',
    textColor: 'text-white',
    iconColor: 'text-white',
  },
  ghost: {
    gradient:
      'bg-white/5 border border-white/40 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300',
    glow: 'bg-white/10',
    textColor: 'text-white',
    iconColor: 'text-white',
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
  isLoading = false,
  loadingText,
}: PrimaryCTAButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || isLoading;

  const buttonContent = (
    <div className={`relative transition-transform duration-200 ${isDisabled ? '' : 'hover:scale-103 active:scale-98'}`}>
      {/* Glow effect */}
      <div
        className={`absolute -inset-1 ${styles.glow} rounded-2xl opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${isDisabled ? 'opacity-10' : ''
          }`}
      />

      {/* Main button */}
      <div
        className={`relative px-6 py-3 sm:px-8 sm:py-4 ${styles.gradient} rounded-2xl shadow-lg overflow-hidden ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        {/* Shimmer effect */}
        {!isDisabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
        )}

        <div className="relative flex items-center justify-center gap-2 sm:gap-3">
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className={`text-base lg:text-lg font-medium ${styles.textColor}`}>
                {loadingText || children}
              </span>
            </>
          ) : (
            <>
              {Icon && <Icon className={`w-5 h-5 ${styles.iconColor}`} />}
              <span className={`text-base lg:text-lg font-medium ${styles.textColor}`}>{children}</span>
              {showArrow && (
                <span className={`ml-auto ${styles.textColor} group-hover:translate-x-1 transition-transform duration-300`}>
                  →
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (href && !isDisabled) {
    return (
      <Link
        href={href}
        onClick={(e) => onClick?.(e)}
        className={`group inline-block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-2xl transition-all ${className}`}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={(e) => {
        if (!isDisabled && onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      disabled={isDisabled}
      className={`group inline-block cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-2xl transition-all disabled:cursor-not-allowed ${className}`}
    >
      {buttonContent}
    </button>
  );
}
