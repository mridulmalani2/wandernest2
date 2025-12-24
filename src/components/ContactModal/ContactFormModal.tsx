'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ContactFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContactFormModal({ open, onOpenChange }: ContactFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    const trimmedEmail = formData.email.trim()

    if (!trimmedEmail) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      let fileUrl: string | undefined

      // Upload file if present
      if (file) {
        const fileFormData = new FormData()
        fileFormData.append('file', file)

        const uploadResponse = await fetch('/api/student/upload', {
          method: 'POST',
          body: fileFormData,
        })

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file')
        }

        const uploadData = await uploadResponse.json()
        fileUrl = uploadData.url
      }

      // Submit contact form
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          message: formData.message.trim(),
          fileUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit form')
      }

      // Show success message
      setSubmitSuccess(true)

      // Reset form after a delay
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' })
        setFile(null)
        setSubmitSuccess(false)
        onOpenChange(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to submit form. Please try again.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 5MB' }))
        return
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
      if (!validTypes.includes(selectedFile.type)) {
        setErrors(prev => ({ ...prev, file: 'Only images and PDFs are allowed' }))
        return
      }

      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || ''
      const mimeToExt: Record<string, string[]> = {
        'image/jpeg': ['jpg', 'jpeg'],
        'image/png': ['png'],
        'image/webp': ['webp'],
        'application/pdf': ['pdf'],
      }
      if (!mimeToExt[selectedFile.type]?.includes(ext)) {
        setErrors(prev => ({ ...prev, file: 'File extension does not match file type' }))
        return
      }

      setFile(selectedFile)
      setErrors(prev => ({ ...prev, file: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact Us</DialogTitle>
          <DialogDescription>
            Have a question or need help? Send us a message and we&apos;ll get back to you soon.
          </DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <div className="py-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
            <p className="text-muted-foreground">
              Thank you for contacting us. We&apos;ll get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                maxLength={100}
                onChange={(e) => {
                  const val = e.target.value
                  setFormData(prev => ({ ...prev, name: val }))
                }}
                className={errors.name ? 'border-destructive' : ''}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                maxLength={254}
                onChange={(e) => {
                  const val = e.target.value
                  setFormData(prev => ({ ...prev, email: val }))
                }}
                className={errors.email ? 'border-destructive' : ''}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                maxLength={30}
                onChange={(e) => {
                  const val = e.target.value
                  setFormData(prev => ({ ...prev, phone: val }))
                }}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                maxLength={2000}
                onChange={(e) => {
                  const val = e.target.value
                  setFormData(prev => ({ ...prev, message: val }))
                }}
                className={errors.message ? 'border-destructive' : ''}
                placeholder="Tell us how we can help..."
                rows={5}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Attachment (optional)</Label>
              <Input
                id="file"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                className={errors.file ? 'border-destructive' : ''}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Images and PDFs up to 5MB
              </p>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
