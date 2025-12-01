import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface ModernSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options?: Option[];
    placeholder?: string;
    label?: string;
    error?: string;
    icon?: LucideIcon;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
}

export function ModernSelect({
    value,
    onValueChange,
    options,
    placeholder,
    label,
    error,
    icon: Icon,
    children,
    className,
    disabled
}: ModernSelectProps) {
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
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400 pointer-events-none">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
                <Select value={value} onValueChange={onValueChange} disabled={disabled}>
                    <SelectTrigger
                        className={cn(
                            "h-12 w-full rounded-xl border-2 bg-white/50 transition-all duration-200",
                            Icon ? "pl-10" : "",
                            error
                                ? "border-ui-error focus:ring-ui-error"
                                : "border-gray-200 hover:border-ui-blue-primary/50 focus:ring-ui-blue-primary",
                            className
                        )}
                    >
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options
                            ? options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))
                            : children}
                    </SelectContent>
                </Select>
            </div>
            {error && (
                <p className="text-xs text-ui-error animate-slide-down">{error}</p>
            )}
        </div>
    );
}
