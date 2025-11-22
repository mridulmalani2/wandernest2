// Design System: Modern card component with cohesive border radius and shadows
'use client';

import * as React from "react"
import { motion } from "framer-motion"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  disableMotion?: boolean
  hoverScale?: number
  hoverY?: number
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, disableMotion = false, hoverScale = 1.02, hoverY = -4, ...props }, ref) => {
    const cardClassName = `rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm text-card-foreground shadow-soft ${className || ''}`

    if (disableMotion) {
      return (
        <div
          ref={ref}
          className={`${cardClassName} hover:shadow-premium transition-all duration-300`}
          {...props}
        />
      )
    }

    const MotionDiv = motion.div as any

    return (
      <MotionDiv
        ref={ref}
        className={cardClassName}
        whileHover={{
          scale: hoverScale,
          y: hoverY,
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.15), 0 8px 16px -8px rgba(0, 0, 0, 0.1)',
          transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
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

const CardTitle = React.forwardRef<
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

const CardDescription = React.forwardRef<
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

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className || ''}`} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
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
