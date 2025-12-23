import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

/**
 * ModernInput - Accessible input component with proper ARIA attributes
 *
 * Accessibility features:
 * - aria-describedby: Links error and helper text to input
 * - aria-invalid: Indicates validation state
 * - aria-required: Indicates required fields
 * - role="alert" on error messages for screen reader announcements
 */
const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({
    className,
    type,
    label,
    error,
    icon: Icon,
    helperText,
    id: providedId,
    required,
    onBlur,
    onFocus,
    ...props
  }, ref) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    // Build aria-describedby based on what's present
    const describedBy = [
      error ? errorId : null,
      !error && helperText ? helperId : null,
    ].filter(Boolean).join(' ') || undefined;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error ? "text-ui-error" : "text-gray-700"
            )}
          >
            {label}
            {required && <span className="text-ui-error ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            {...props}
            id={id}
            type={type}
            ref={ref}
            required={required}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-invalid={error ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              "peer flex h-12 w-full rounded-xl border-2 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-blue-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              Icon ? "pl-10" : "",
              error
                ? "border-ui-error focus-visible:ring-ui-error"
                : "border-gray-200 hover:border-ui-blue-primary/50",
              className
            )}
          />
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-ui-error animate-slide-down"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
ModernInput.displayName = "ModernInput";

export { ModernInput };
