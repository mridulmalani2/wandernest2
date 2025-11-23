// Design System: Modern button component with cohesive styling
'use client';

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { motion, HTMLMotionProps } from 'framer-motion'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 hover:-translate-y-0.5',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft hover:shadow-premium',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-soft hover:shadow-premium',
        outline:
          'border-2 border-input bg-background/80 backdrop-blur-sm text-foreground hover:bg-accent hover:text-accent-foreground hover:border-primary/50 shadow-sm hover:shadow-premium',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft hover:shadow-premium',
        ghost: 'hover:bg-muted hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-9 rounded-md px-4 text-xs',
        lg: 'h-12 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  disableMotion?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, disableMotion = false, ...props }, ref) => {
    const buttonClassName = cn(buttonVariants({ variant, size, className }))

    if (disableMotion) {
      return (
        <button
          className={buttonClassName}
          ref={ref}
          {...props}
        />
      )
    }

    const MotionButton = motion.button as any

    return (
      <MotionButton
        className={buttonClassName}
        ref={ref}
        whileHover={{
          scale: 1.02,
          y: -2,
          transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        }}
        whileTap={{
          scale: 0.97,
          transition: { duration: 0.1 }
        }}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
