'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LiquidButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

/**
 * LiquidButton - Accessible button component with loading states
 *
 * Accessibility features:
 * - aria-busy: Indicates loading state to screen readers
 * - aria-disabled: Indicates disabled state
 * - Spinner has aria-hidden to prevent double announcements
 * - Loading text announced via aria-live (implicit via button content change)
 */
const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                aria-busy={isLoading ? 'true' : undefined}
                aria-disabled={disabled || isLoading ? 'true' : undefined}
                className={cn(
                    // Base - pill shape
                    'rounded-full font-medium tracking-wide transition-all duration-300 ease-out',
                    'inline-flex items-center justify-center gap-2',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',

                    // Hover - subtle expand
                    'hover:scale-[1.02] active:scale-[0.98]',

                    // Variants
                    variant === 'primary' && [
                        'bg-gradient-to-r from-liquid-dark-primary to-liquid-dark-secondary',
                        'text-white shadow-md hover:shadow-lg',
                        'focus:ring-liquid-dark-primary',
                    ],
                    variant === 'secondary' && [
                        'bg-liquid-light text-liquid-dark-primary',
                        'border border-gray-200 shadow-sm hover:shadow-md',
                        'focus:ring-liquid-dark-secondary',
                    ],
                    variant === 'outline' && [
                        'bg-transparent text-liquid-dark-primary',
                        'border-2 border-liquid-dark-primary hover:bg-liquid-light',
                        'focus:ring-liquid-dark-primary',
                    ],
                    variant === 'ghost' && [
                        'bg-transparent text-liquid-dark-secondary',
                        'hover:bg-liquid-light',
                        'focus:ring-liquid-dark-secondary',
                    ],

                    // Sizes
                    size === 'sm' && 'px-4 py-2 text-sm',
                    size === 'md' && 'px-6 py-3 text-base',
                    size === 'lg' && 'px-8 py-4 text-lg',

                    // Disabled state
                    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',

                    className
                )}
                {...props}
            >
                {isLoading ? (
                    <>
                        <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Loading...</span>
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

LiquidButton.displayName = 'LiquidButton';

export { LiquidButton };
