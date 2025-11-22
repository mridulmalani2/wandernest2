'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export type CTAVariant = 'blue' | 'purple';

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

const variantStyles: Record<CTAVariant, { gradient: string; glow: string }> = {
  blue: {
    gradient: 'bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400',
    glow: 'bg-gradient-to-r from-blue-300 via-blue-400 to-purple-400',
  },
  purple: {
    gradient: 'bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400',
    glow: 'bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400',
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
    <motion.div
      className="relative pointer-events-none"
      whileHover={disabled ? undefined : { scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-1 ${styles.glow} rounded-2xl opacity-25 blur-xl group-hover:opacity-40 transition-opacity duration-500 ${
          disabled ? 'opacity-10' : ''
        }`}
      />

      {/* Main button */}
      <div
        className={`relative px-8 py-4 ${styles.gradient} rounded-2xl shadow-lg overflow-hidden ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {/* Shimmer effect */}
        {!disabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}

        <div className={`relative flex items-center gap-3 ${className}`}>
          {Icon && <Icon className="w-5 h-5 text-white" />}
          <span className="text-base lg:text-lg font-medium text-white">{children}</span>
          {showArrow && (
            <span className="ml-auto text-white group-hover:translate-x-1 transition-transform duration-300">
              →
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="group inline-block">
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && onClick) {
          onClick();
        }
      }}
      disabled={disabled}
      className="group inline-block cursor-pointer"
    >
      {buttonContent}
    </button>
  );
}
