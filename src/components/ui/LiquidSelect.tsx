'use client';

import * as React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';


export interface LiquidSelectProps {
    label?: string;
    value: string;
    onValueChange: (value: string) => void;
    options: { value: string; label: string; icon?: LucideIcon }[];
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    icon?: LucideIcon;
    className?: string;
}

export function LiquidSelect({
    label,
    value,
    onValueChange,
    options,
    placeholder,
    error,
    disabled,
    icon: Icon,
    className,
}: LiquidSelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const id = React.useId();

    return (
        <div className={cn('relative w-full', className)}>
            {/* Floating Label */}
            {label && (
                <label
                    htmlFor={id}
                    className={cn(
                        'block mb-2 text-xs font-normal tracking-wide transition-colors duration-200',
                        error ? 'text-ui-error' : 'text-white/80'
                    )}
                >
                    {label}
                </label>
            )}

            <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled} onOpenChange={setIsOpen}>
                <SelectPrimitive.Trigger
                    id={id}
                    className={cn(
                        // Base - minimal underline style
                        'w-full bg-transparent px-0 py-3 text-base font-light tracking-wide',
                        'text-white',
                        'border-0 border-b border-white/20',
                        'transition-all duration-300 ease-out',

                        // Focus/Open state
                        'focus:outline-none focus:ring-0 focus:border-b-2 focus:border-white',
                        isOpen && 'border-b-2 border-white',

                        // Error state
                        error && 'border-ui-error focus:border-ui-error',

                        // Disabled
                        'disabled:opacity-50 disabled:cursor-not-allowed',

                        // Icon padding - removed to fix alignment with LiquidInput
                        // Code removed

                        // Layout
                        'flex items-center justify-between gap-2'
                    )}
                >
                    <div className="flex items-center gap-2 flex-1 text-left">
                        {Icon && <Icon className="h-4 w-4 text-gray-400 shrink-0" />}
                        <SelectPrimitive.Value placeholder={placeholder} />
                    </div>
                    <SelectPrimitive.Icon>
                        <ChevronDown className={cn(
                            'h-4 w-4 text-gray-400 transition-transform duration-200',
                            isOpen && 'rotate-180'
                        )} />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        className={cn(
                            'relative z-50 max-h-96 min-w-[200px] overflow-hidden',
                            'glass-card-dark rounded-2xl shadow-premium border border-white/10',
                            'animate-in fade-in-0 zoom-in-95',
                        )}
                        position="popper"
                        sideOffset={8}
                    >
                        <SelectPrimitive.Viewport className="p-1">
                            {options.map((option) => {
                                const OptionIcon = option.icon;
                                return (
                                    <SelectPrimitive.Item
                                        key={option.value}
                                        value={option.value}
                                        className={cn(
                                            'relative flex items-center gap-3 px-3 py-2 rounded-xl',
                                            'text-sm cursor-pointer transition-all',
                                            'outline-none',
                                            'text-gray-300 hover:bg-white/10 hover:text-white',
                                            'data-[state=checked]:bg-white/20 data-[state=checked]:font-medium data-[state=checked]:text-white',
                                        )}
                                    >
                                        {OptionIcon && <OptionIcon className="h-4 w-4" />}
                                        <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                                        <SelectPrimitive.ItemIndicator className="ml-auto">
                                            <Check className="h-4 w-4 text-white" />
                                        </SelectPrimitive.ItemIndicator>
                                    </SelectPrimitive.Item>
                                );
                            })}
                        </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>

            {/* Error Text */}
            {error && (
                <p className="mt-1.5 text-xs font-light text-ui-error">{error}</p>
            )}
        </div>
    );
}
