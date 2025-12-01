'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export interface LiquidSliderProps {
    value: number[];
    onValueChange: (value: number[]) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    showValue?: boolean;
    recommendedValue?: number;
    formatValue?: (value: number) => string;
    disabled?: boolean;
    className?: string;
}

export function LiquidSlider({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    label,
    showValue = true,
    recommendedValue,
    formatValue = (v) => v.toString(),
    disabled,
    className,
}: LiquidSliderProps) {
    const recommendedPosition = recommendedValue
        ? ((recommendedValue - min) / (max - min)) * 100
        : null;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Header */}
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className="text-sm font-light tracking-wide text-liquid-dark-secondary">
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span className="text-lg font-normal text-liquid-dark-primary">
                            {formatValue(value[0])}
                        </span>
                    )}
                </div>
            )}

            {/* Slider */}
            <div className="relative py-4">
                <SliderPrimitive.Root
                    value={value}
                    onValueChange={onValueChange}
                    min={min}
                    max={max}
                    step={step}
                    disabled={disabled}
                    className="relative flex w-full touch-none select-none items-center"
                >
                    {/* Track */}
                    <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden rounded-full bg-gray-200">
                        {/* Filled Range */}
                        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-liquid-dark-primary to-liquid-dark-secondary" />
                    </SliderPrimitive.Track>

                    {/* Recommended Notch */}
                    {recommendedPosition !== null && (
                        <div
                            className="absolute -top-2 z-0 flex flex-col items-center pointer-events-none"
                            style={{ left: `${recommendedPosition}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="h-3 w-0.5 bg-gray-300" />
                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">
                                Rec.
                            </span>
                        </div>
                    )}

                    {/* Thumb */}
                    <SliderPrimitive.Thumb
                        className={cn(
                            'block h-5 w-5 rounded-full',
                            'bg-white shadow-lg border-2 border-liquid-dark-primary',
                            'transition-all duration-200 ease-out',
                            'hover:scale-110 focus:scale-110',
                            'focus:outline-none focus:ring-2 focus:ring-liquid-dark-primary focus:ring-offset-2',
                            'disabled:pointer-events-none disabled:opacity-50',
                            'z-10'
                        )}
                    />
                </SliderPrimitive.Root>
            </div>

            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs font-light text-gray-400">
                <span>{formatValue(min)}</span>
                <span>{formatValue(max)}</span>
            </div>
        </div>
    );
}
