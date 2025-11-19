import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
}

export function Spinner({ size = 'md', className, label = 'Loading...' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite">
      <div
        className={cn(
          'animate-spin rounded-full border-blue-600 border-t-transparent',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

interface LoadingOverlayProps {
  message?: string
  transparent?: boolean
}

export function LoadingOverlay({ message = 'Loading...', transparent = false }: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        transparent ? 'bg-black/20 backdrop-blur-sm' : 'bg-white/90 backdrop-blur-md'
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-lg font-medium text-gray-700 animate-pulse">{message}</p>
      )}
    </div>
  )
}
