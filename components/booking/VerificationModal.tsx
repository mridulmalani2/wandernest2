'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookingFormData } from './BookingForm'

type Props = {
  email: string
  formData: BookingFormData
  onSuccess: (requestId: string) => void
  onClose: () => void
}

export function VerificationModal({ email, formData, onSuccess, onClose }: Props) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('')
      const newCode = [...code]
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char
        }
      })
      setCode(newCode)
      const nextIndex = Math.min(index + pastedCode.length, 5)
      inputRefs.current[nextIndex]?.focus()
    } else {
      // Handle single character
      const newCode = [...code]
      newCode[index] = value
      setCode(newCode)

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
    setError('')
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const verificationCode = code.join('')

    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/tourist/request/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          code: verificationCode,
        }),
      })

      const data = await response.json()

      if (data.success) {
        onSuccess(data.requestId)
      } else {
        if (data.action === 'regenerate') {
          setError(data.error + ' Please request a new code.')
          setAttemptsRemaining(0)
        } else if (data.attemptsRemaining !== undefined) {
          setAttemptsRemaining(data.attemptsRemaining)
          setError(`${data.error}. ${data.attemptsRemaining} attempts remaining.`)
          setCode(['', '', '', '', '', ''])
          inputRefs.current[0]?.focus()
        } else {
          setError(data.error || 'Verification failed')
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    setIsVerifying(true)
    setError('')
    setCode(['', '', '', '', '', ''])
    setAttemptsRemaining(3)

    try {
      const response = await fetch('/api/tourist/request/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!data.success) {
        setError('Failed to resend code. Please try again.')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsVerifying(false)
      inputRefs.current[0]?.focus()
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit code to <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Code Input */}
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-bold"
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Attempts Info */}
          {attemptsRemaining > 0 && attemptsRemaining < 3 && (
            <p className="text-sm text-center text-gray-600">
              {attemptsRemaining} {attemptsRemaining === 1 ? 'attempt' : 'attempts'}{' '}
              remaining
            </p>
          )}

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying || code.join('').length !== 6}
            className="w-full"
            size="lg"
          >
            {isVerifying ? 'Verifying...' : 'Verify & Complete Booking'}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            <Button
              variant="link"
              onClick={handleResendCode}
              disabled={isVerifying}
              className="text-blue-600"
            >
              Resend Code
            </Button>
          </div>

          {/* Expiry Info */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-xs text-gray-600 text-center">
              ⏱️ Code expires in 10 minutes
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
