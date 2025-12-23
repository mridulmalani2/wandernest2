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
    const safeMin = Number.isFinite(min) ? min : 0;
    const safeMax = Number.isFinite(max) ? max : 100;
    const hasRange = safeMax !== safeMin;
    const safeValue = Array.isArray(value) && value.length > 0 && Number.isFinite(value[0])
        ? value[0]
        : safeMin;
    const recommendedPosition =
        typeof recommendedValue === 'number' && Number.isFinite(recommendedValue) && hasRange
            ? Math.min(100, Math.max(0, ((recommendedValue - safeMin) / (safeMax - safeMin)) * 100))
            : null;

    return (
        <div className={cn('space-y-3', className)}>
            {/* Header */}
            {(label || showValue) && (
                <div className="flex items-center justify-between">
                    {label && (
                        <span className="text-sm font-light tracking-wide text-white/90">
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span className="text-lg font-normal text-white">
                            {formatValue(safeValue)}
                        </span>
                    )}
                </div>
            )}

            {/* Slider */}
            <div className="relative py-4">
                <SliderPrimitive.Root
                    value={value}
                    onValueChange={onValueChange}
                    min={safeMin}
                    max={safeMax}
                    step={step}
                    disabled={disabled}
                    className="relative flex w-full touch-none select-none items-center"
                >
                    {/* Track */}
                    <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden rounded-full bg-white/20">
                        {/* Filled Range */}
                        <SliderPrimitive.Range className="absolute h-full bg-white" />
                    </SliderPrimitive.Track>

                    {/* Recommended Notch */}
                    {recommendedPosition !== null && (
                        <div
                            className="absolute -top-2 z-0 flex flex-col items-center pointer-events-none"
                            style={{ left: `${recommendedPosition}%`, transform: 'translateX(-50%)' }}
                        >
                            <div className="h-3 w-0.5 bg-white/30" />
                            <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider mt-0.5">
                                Rec.
                            </span>
                        </div>
                    )}

                    {/* Thumb */}
                    <SliderPrimitive.Thumb
                        className={cn(
                            'block h-5 w-5 rounded-full',
                            'bg-white shadow-lg border-2 border-white',
                            'transition-all duration-200 ease-out',
                            'hover:scale-110 focus:scale-110',
                            'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2',
                            'disabled:pointer-events-none disabled:opacity-50',
                            'z-10'
                        )}
                    />
                </SliderPrimitive.Root>
            </div>

            {/* Min/Max Labels */}
            <div className="flex justify-between text-xs font-light text-white/50">
                <span>{formatValue(safeMin)}</span>
                <span>{formatValue(safeMax)}</span>
            </div>
        </div>
    );
}
