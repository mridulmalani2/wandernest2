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
        <h2 className="text-4xl font-light tracking-tight text-white">
          Contact Information
        </h2>
        <p className="text-base font-light text-gray-200 max-w-md mx-auto">
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
            <label className="text-sm font-light tracking-wide text-white/90 block">
              Phone Number <span className="text-xs text-white/50 ml-1">(Optional)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="+1"
                defaultValue="+1"
                className={cn(
                  'w-20 text-center bg-transparent px-2 py-3 text-base font-light text-white',
                  'border-0 border-b border-white/20 focus:border-b-2 focus:border-white',
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
            <div className="bg-white/5 rounded-2xl p-4 space-y-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="whatsapp"
                  checked={useWhatsApp}
                  onChange={handleWhatsAppToggle}
                  className="h-4 w-4 rounded border-white/30 bg-transparent text-white focus:ring-white"
                />
                <label htmlFor="whatsapp" className="text-sm font-light cursor-pointer flex items-center gap-2 text-white/90">
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
        <label className="text-sm font-light tracking-wide text-white/90 block">
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
                  'border-2',
                  isSelected
                    ? 'bg-white text-black border-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-transparent text-white border-white/30 hover:border-white hover:bg-white/10 hover:shadow-md active:scale-[0.98] active:bg-white/5'
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
          <label className="text-sm font-light tracking-wide text-white/90 block">
            Additional Notes <span className="text-xs text-white/50 ml-1">(Optional)</span>
          </label>
          <textarea
            placeholder="Any special requests, dietary restrictions, or information you'd like to share..."
            value={data.tripNotes || ''}
            onChange={(e) => updateData({ tripNotes: e.target.value })}
            rows={4}
            className={cn(
              'w-full bg-transparent px-0 py-2 text-base font-light',
              'text-white placeholder:text-white/30',
              'border-0 border-b border-white/20 focus:border-b-2 focus:border-white',
              'transition-all duration-300 resize-none focus:outline-none'
            )}
          />
          <p className="text-xs font-light text-gray-400">
            Help your guide prepare for your visit
          </p>
        </div>
      </FlowCard>

      {/* Referral Section */}
      <FlowCard padding="lg" variant="subtle">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-light tracking-wide text-white/90 block">
              Were you referred by anyone? If yes, please share their email here.
            </label>
            <Link href="/referral-policy" target="_blank" className="text-xs font-medium text-ui-blue-primary hover:text-ui-blue-accent transition-colors border border-ui-blue-primary/30 rounded-full px-3 py-1 hover:bg-ui-blue-primary/10">
              Learn More
            </Link>
          </div>

          <LiquidInput
            type="email"
            placeholder="referrer@example.com"
            value={data.referralEmail || ''}
            onChange={(e) => updateData({ referralEmail: e.target.value })}
            icon={Mail}
          />

          <p className="text-xs font-light text-gray-400 italic">
            Please note: this will work only if you share the email ID that the user has already signed in with once as a tourist or student and has a profile created with us.
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
              'mt-1 h-5 w-5 rounded border-white/30 bg-transparent',
              'focus:ring-white',
              data.termsAccepted ? 'text-white' : '',
              errors.termsAccepted && 'border-ui-error'
            )}
          />
          <label htmlFor="termsConsent" className="text-sm font-light cursor-pointer space-y-2">
            <p className="text-white/90">
              I agree to the <Link href="/terms" className="font-medium text-white hover:underline" onClick={(e) => e.stopPropagation()}>Terms of Service</Link> and <Link href="/privacy" className="font-medium text-white hover:underline" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>.
            </p>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10 text-xs text-gray-300">
              <strong className="text-white block mb-1">Disclaimer:</strong>
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
      <div className="bg-white/5 rounded-2xl p-4 flex gap-3 items-start border border-white/10">
        <Shield className="h-5 w-5 text-white/70 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="font-medium text-white text-sm">Privacy Guarantee</h3>
          <p className="text-xs font-light text-gray-300 leading-relaxed">
            Your contact information will only be shared with your matched guide after you accept their proposal.
          </p>
        </div>
      </div>
    </div>
  )
}
