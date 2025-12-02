'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface LiquidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: LucideIcon;
    containerClassName?: string;
}

const LiquidInput = React.forwardRef<HTMLInputElement, LiquidInputProps>(
    ({ className, label, error, helperText, icon: Icon, containerClassName, type, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);
        const id = React.useId();

        const handleFocus = () => setIsFocused(true);
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
            props.onBlur?.(e);
        };

        return (
            <div className={cn('relative w-full', containerClassName)}>
                <div className="relative">
                    {/* Icon */}
                    {Icon && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200">
                            <Icon className="h-4 w-4" />
                        </div>
                    )}

                    {/* Input */}
                    <input
                        id={id}
                        type={type}
                        className={cn(
                            // Base styles - minimal, transparent
                            'w-full bg-transparent px-0 py-3 text-base font-light tracking-wide',
                            'text-white',

                            // Border - single bottom line
                            'border-0 border-b border-white/20',
                            'transition-all duration-300 ease-out',

                            // Focus state - gradient underline
                            'focus:outline-none focus:ring-0',
                            'focus:border-b-2',
                            isFocused && 'border-white',

                            // Error state
                            error && 'border-ui-error focus:border-ui-error',

                            // Disabled state
                            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent',

                            // Icon padding
                            Icon && 'pl-6',

                            // Always hide placeholder when we have a label (prevents overlap)
                            label && 'placeholder:text-transparent',

                            // Force hide date input placeholders (browser default)
                            // type === 'date' && '[&::-webkit-datetime-edit]:opacity-0 focus:[&::-webkit-datetime-edit]:opacity-100',
                            // type === 'date' && hasValue && '[&::-webkit-datetime-edit]:opacity-100',

                            // Date input specific styling for dark mode
                            // type === 'date' && '[color-scheme:dark]',

                            className
                        )}
                        ref={ref}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={type === 'date' || label ? '' : (props.placeholder || ' ')}
                        {...props}
                    />

                    {/* Floating Label */}
                    {label && (
                        <label
                            htmlFor={id}
                            className={cn(
                                'absolute left-0 transition-all duration-200 ease-out pointer-events-none',
                                'font-light tracking-wide',
                                Icon && 'left-6',

                                // Floating animation
                                isFocused || hasValue || props.value
                                    ? '-top-5 text-xs text-white/80'
                                    : 'top-3 text-base text-white/50',

                                // Error state
                                error && 'text-ui-error',

                                // Focus state
                                isFocused && !error && 'text-white font-normal'
                            )}
                        >
                            {label}
                        </label>
                    )}
                </div>

                {/* Helper/Error Text */}
                {(helperText || error) && (
                    <p
                        className={cn(
                            'mt-1.5 text-xs font-light',
                            error ? 'text-ui-error' : 'text-gray-500'
                        )}
                    >
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

LiquidInput.displayName = 'LiquidInput';

export { LiquidInput };
