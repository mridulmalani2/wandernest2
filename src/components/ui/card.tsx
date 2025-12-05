// Design System: Modern card component with cohesive border radius and shadows
'use client';

import React, { forwardRef } from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'subtle' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  disableMotion?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      disableMotion = false,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: 'bg-glass-card border-white/10 text-card-foreground shadow-soft',
      elevated: 'bg-glass-card-dark border-white/10 text-card-foreground shadow-premium backdrop-blur-xl',
      subtle: 'bg-white/5 border-white/5 text-card-foreground',
      ghost: 'bg-transparent border-transparent text-card-foreground hover:bg-white/5',
    }

    const paddings = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    }

    const cardClassName = `relative rounded-3xl border ${variants[variant]} ${paddings[padding]} ${className || ''}`

    if (disableMotion) {
      return (
        <div
          ref={ref}
          className={`${cardClassName} hover:shadow-premium transition-all duration-300`}
          {...(props as React.HTMLAttributes<HTMLDivElement>)}
        />
      )
    }

    return (
      <motion.div
        ref={ref}
        className={`${cardClassName} hover:shadow-premium`}
        whileHover={{
          scale: 1.02,
          y: -4,
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-2xl font-bold leading-none tracking-tight font-serif ${className || ''}`}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={`text-sm text-muted-foreground ${className || ''}`}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`flex items-center p-6 pt-0 ${className || ''}`}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
