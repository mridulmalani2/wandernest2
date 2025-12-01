'use client'

import { LiquidInput } from '@/components/ui/LiquidInput'
import { FlowCard } from '@/components/ui/FlowCard'
import { BookingFormData } from './BookingForm'
import { useState } from 'react'
import { Mail, Phone, MessageSquare, CheckCircle2, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
  isEmailFromSession?: boolean
}

const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
]

export function ContactStep({ data, errors, updateData, isEmailFromSession = false }: Props) {
  const [useWhatsApp, setUseWhatsApp] = useState(false)

  const handleWhatsAppToggle = () => {
    const newValue = !useWhatsApp
    setUseWhatsApp(newValue)
    if (newValue && data.phone) {
      updateData({ whatsapp: data.phone })
    } else if (!newValue) {
      updateData({ whatsapp: undefined })
    }
  }

  const handlePhoneChange = (phone: string) => {
    updateData({ phone })
    if (useWhatsApp) {
      updateData({ whatsapp: phone })
    }
  }

  return (
    <div className="space-y-12 animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-light tracking-tight text-liquid-dark-primary">
          Contact Information
        </h2>
        <p className="text-base font-light text-gray-500 max-w-md mx-auto">
          How should we reach you?
        </p>
      </div>

      {/* Contact Details */}
      <FlowCard padding="lg">
        <div className="space-y-6">
          <LiquidInput
            label="Email Address"
            type="email"
            placeholder="your.email@example.com"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            error={errors.email}
            icon={Mail}
            helperText={!isEmailFromSession ? "We'll send a verification code" : undefined}
            disabled={isEmailFromSession}
          />

          <div className="space-y-3">
            <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
              Phone Number <span className="text-xs text-gray-400 ml-1">(Optional)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="+1"
                defaultValue="+1"
                className={cn(
                  'w-20 text-center bg-transparent px-2 py-3 text-base font-light',
                  'border-0 border-b border-gray-300 focus:border-b-2 focus:border-liquid-dark-primary',
                  'transition-all duration-300 focus:outline-none'
                )}
              />
              <LiquidInput
                type="tel"
                placeholder="123-456-7890"
                value={data.phone || ''}
                onChange={(e) => handlePhoneChange(e.target.value)}
                icon={Phone}
                containerClassName="flex-1"
              />
            </div>
          </div>

          {data.phone && (
            <div className="bg-liquid-light rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="whatsapp"
                  checked={useWhatsApp}
                  onChange={handleWhatsAppToggle}
                  className="h-4 w-4 rounded border-gray-300 text-liquid-dark-primary focus:ring-liquid-dark-primary"
                />
                <label htmlFor="whatsapp" className="text-sm font-light cursor-pointer flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  This number is also my WhatsApp
                </label>
              </div>
              {!useWhatsApp && (
                <LiquidInput
                  type="tel"
                  placeholder="Different WhatsApp number"
                  value={data.whatsapp || ''}
                  onChange={(e) => updateData({ whatsapp: e.target.value })}
                  icon={MessageSquare}
                />
              )}
            </div>
          )}
        </div>
      </FlowCard>

      {/* Contact Method - Pills */}
      <div className="space-y-4">
        <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
          Preferred Contact Method {errors.contactMethod && <span className="text-ui-error ml-1">*</span>}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONTACT_METHODS.map((method) => {
            const Icon = method.icon
            const isSelected = data.contactMethod === method.value
            return (
              <button
                key={method.value}
                type="button"
                onClick={() => updateData({ contactMethod: method.value as any })}
                className={cn(
                  'flex items-center justify-center gap-3 py-4 px-6 rounded-full transition-all duration-300',
                  'border hover:shadow-md',
                  isSelected
                    ? 'bg-liquid-dark-primary text-white border-liquid-dark-primary shadow-md active:bg-liquid-dark-primary active:text-white focus:bg-liquid-dark-primary focus:text-white'
                    : 'bg-gray-100 text-gray-800 border-gray-400 hover:border-liquid-dark-primary hover:bg-gray-50 active:bg-gray-200 active:text-gray-900 focus:bg-gray-100 focus:text-gray-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{method.label}</span>
                {isSelected && <CheckCircle2 className="h-4 w-4 ml-auto" />}
              </button>
            )
          })}
        </div>
        {errors.contactMethod && (
          <p className="text-xs font-light text-ui-error mt-2">{errors.contactMethod}</p>
        )}
      </div>

      {/* Trip Notes */}
      <FlowCard padding="lg" variant="subtle">
        <div className="space-y-3">
          <label className="text-sm font-light tracking-wide text-liquid-dark-secondary block">
            Additional Notes <span className="text-xs text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            placeholder="Any special requests, dietary restrictions, or information you'd like to share..."
            value={data.tripNotes || ''}
            onChange={(e) => updateData({ tripNotes: e.target.value })}
            rows={4}
            className={cn(
              'w-full bg-transparent px-0 py-2 text-base font-light',
              'text-liquid-dark-primary placeholder:text-gray-400',
              'border-0 border-b border-gray-300 focus:border-b-2 focus:border-liquid-dark-primary',
              'transition-all duration-300 resize-none focus:outline-none'
            )}
          />
          <p className="text-xs font-light text-gray-400">
            Help your guide prepare for your visit
          </p>
        </div>
      </FlowCard>

      {/* Legal Consent */}
      <FlowCard padding="lg" variant={errors.termsAccepted ? 'elevated' : 'default'}>
        <div className="flex items-start gap-4">
          <input
            type="checkbox"
            id="termsConsent"
            checked={data.termsAccepted || false}
            onChange={(e) => updateData({ termsAccepted: e.target.checked })}
            className={cn(
              'mt-1 h-5 w-5 rounded border-gray-300',
              'focus:ring-liquid-dark-primary',
              data.termsAccepted ? 'text-liquid-dark-primary' : '',
              errors.termsAccepted && 'border-ui-error'
            )}
          />
          <label htmlFor="termsConsent" className="text-sm font-light cursor-pointer space-y-2">
            <p className="text-liquid-dark-secondary">
              I agree to the <Link href="/terms" className="font-medium text-liquid-dark-primary hover:underline" onClick={(e) => e.stopPropagation()}>Terms of Service</Link> and <Link href="/privacy" className="font-medium text-liquid-dark-primary hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
            </p>
            <div className="bg-liquid-light p-3 rounded-xl border border-gray-100 text-xs text-gray-500">
              <strong className="text-gray-700 block mb-1">Disclaimer:</strong>
              TourWiseCo is a marketplace connector only and does not handle payments, guarantee service quality, or assume liability for guide interactions.
            </div>
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-xs font-light text-ui-error mt-3 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            {errors.termsAccepted}
          </p>
        )}
      </FlowCard>

      {/* Privacy Notice */}
      <div className="bg-liquid-light/50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
        <Shield className="h-5 w-5 text-liquid-dark-secondary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-medium text-liquid-dark-primary text-sm">Privacy Guarantee</h3>
          <p className="text-xs font-light text-gray-600 leading-relaxed">
            Your contact information will only be shared with your matched guide after you accept their proposal.
          </p>
        </div>
      </div>
    </div>
  )
}
