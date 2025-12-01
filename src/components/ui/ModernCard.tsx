import React from 'react';
import { cn } from '@/lib/utils';

interface ModernCardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'flat' | 'gradient';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hoverEffect?: boolean;
}

export function ModernCard({
    className,
    variant = 'glass',
    padding = 'lg',
    hoverEffect = true,
    children,
    ...props
}: ModernCardProps) {
    const variants = {
        default: "bg-white border border-gray-200 shadow-sm",
        glass: "glass-card border-2 border-white/40 shadow-premium",
        flat: "bg-gray-50 border border-gray-100",
        gradient: "bg-gradient-to-br from-white to-gray-50 border border-white/60 shadow-lg",
    };

    const paddings = {
        none: "",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-6",
        lg: "p-6 sm:p-8",
        xl: "p-8 sm:p-10",
    };

    return (
        <div
            className={cn(
                "rounded-3xl transition-all duration-300",
                variants[variant],
                paddings[padding],
                hoverEffect && "hover-lift",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
