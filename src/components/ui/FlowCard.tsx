'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'subtle' | 'dark';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

const FlowCard = React.forwardRef<HTMLDivElement, FlowCardProps>(
    ({ className, variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Base - liquid contours
                    'rounded-3xl transition-all duration-300 ease-out',

                    // Variants
                    variant === 'default' && [
                        'bg-white/5 backdrop-blur-sm',
                        'border border-white/10',
                        'shadow-sm',
                    ],
                    variant === 'elevated' && [
                        'bg-white/10',
                        'border border-white/20',
                        'shadow-md',
                    ],
                    variant === 'subtle' && [
                        'bg-white/5',
                        'border border-transparent',
                        'shadow-none',
                    ],
                    variant === 'dark' && [
                        'glass-card-dark',
                        'shadow-premium',
                    ],

                    // Padding
                    padding === 'none' && 'p-0',
                    padding === 'sm' && 'p-4',
                    padding === 'md' && 'p-6',
                    padding === 'lg' && 'p-8',

                    // Hover effect
                    hover && 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer',

                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

FlowCard.displayName = 'FlowCard';

export { FlowCard };
