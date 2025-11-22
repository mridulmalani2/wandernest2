'use client';

import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  // Simplified version using CSS animation instead of Framer Motion
  return (
    <div className={`animate-fade-in ${className || ''}`}>
      {children}
    </div>
  );
}
