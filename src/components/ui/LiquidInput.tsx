'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

export interface LiquidInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    icon?: LucideIcon;
    containerClassName?: string;
}

/**
 * LiquidInput - Accessible floating label input component
 */
const LiquidInput = React.forwardRef<HTMLInputElement, LiquidInputProps>(
    ({
        className,
        label,
        error,
        helperText,
        icon: Icon,
        containerClassName,
        type,
        placeholder,
        required,
        onBlur,
        onFocus,
        id: providedId,
        ...props
    }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);
        const [showPassword, setShowPassword] = React.useState(false);
        const internalId = React.useId();
        const id = providedId || internalId;
        const errorId = `${id}-error`;
        const helperId = `${id}-helper`;

        // Build aria-describedby based on what's present
        const describedBy = [
            error ? errorId : null,
            !error && helperText ? helperId : null,
        ].filter(Boolean).join(' ') || undefined;

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            onFocus?.(e);
        };
        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
            onBlur?.(e);
        };

        const inputType = type === 'password' && showPassword ? 'text' : type;

        return (
            <div className={cn('relative w-full', containerClassName)}>
                <div className="relative">
                    {/* Icon */}
                    {Icon && (
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-200"
                            aria-hidden="true"
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                    )}

                    {/* Input */}
                    <input
                        {...props}
                        id={id}
                        type={inputType}
                        ref={ref}
                        required={required}
                        aria-invalid={error ? 'true' : undefined}
                        aria-required={required ? 'true' : undefined}
                        aria-describedby={describedBy}
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
                            type === 'password' && 'pr-8',

                            // Always hide placeholder when we have a label (prevents overlap)
                            label && 'placeholder:text-transparent',

                            className
                        )}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={type === 'date' || label ? '' : (placeholder || ' ')}
                    />

                    {/* Password Toggle */}
                    {type === 'password' && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-2 p-1 text-gray-400 hover:text-white transition-colors focus:outline-none"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    )}

                    {/* Floating Label */}
                    {label && (
                        <label
                            htmlFor={id}
                            className={cn(
                                'absolute left-0 transition-all duration-200 ease-out pointer-events-none',
                                'font-light tracking-wide',
                                Icon && 'left-6',

                                // Floating animation
                                isFocused || hasValue || props.value || inputType === 'date'
                                    ? '-top-5 text-xs text-white/80'
                                    : 'top-3 text-base text-white/50',

                                // Error state
                                error && 'text-ui-error',

                                // Focus state
                                isFocused && !error && 'text-white font-normal'
                            )}
                        >
                            {label}
                            {required && <span className="ml-1" aria-hidden="true">*</span>}
                        </label>
                    )}
                </div>

                {/* Helper/Error Text */}
                {error && (
                    <p
                        id={errorId}
                        role="alert"
                        aria-live="polite"
                        className="mt-1.5 text-xs font-light text-ui-error"
                    >
                        {error}
                    </p>
                )}
                {!error && helperText && (
                    <p
                        id={helperId}
                        className="mt-1.5 text-xs font-light text-gray-500"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

LiquidInput.displayName = 'LiquidInput';

export { LiquidInput };
