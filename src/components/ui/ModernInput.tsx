import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  helperText?: string;
}

const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  ({ className, type, label, error, icon: Icon, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              error ? "text-ui-error" : "text-gray-700"
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border-2 bg-white/50 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-blue-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
              Icon ? "pl-10" : "",
              error
                ? "border-ui-error focus-visible:ring-ui-error"
                : "border-gray-200 hover:border-ui-blue-primary/50",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-ui-error animate-slide-down">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
ModernInput.displayName = "ModernInput";

export { ModernInput };
