'use client'

import { Label } from '@/components/ui/label'
import { ModernInput } from '@/components/ui/ModernInput'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { BookingFormData } from './BookingForm'
import { useState } from 'react'
<<<<<<< HEAD
import { Mail, Phone, MessageSquare, FileText, Shield, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
=======
import Link from 'next/link'
>>>>>>> c2626a4f409d082306e95fee7ca9a168640a3362

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
  isEmailFromSession?: boolean
}

<<<<<<< HEAD
const CONTACT_METHODS = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'phone', label: 'Phone Call', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'sms', label: 'SMS / Text', icon: MessageSquare },
]

export function ContactStep({ data, errors, updateData }: Props) {
=======
export function ContactStep({ data, errors, updateData, isEmailFromSession = false }: Props) {
>>>>>>> c2626a4f409d082306e95fee7ca9a168640a3362
  const [useWhatsApp, setUseWhatsApp] = useState(false)

  const handleWhatsAppToggle = (checked: boolean) => {
    setUseWhatsApp(checked)
    if (checked && data.phone) {
      updateData({ whatsapp: data.phone })
    } else if (!checked) {
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
<<<<<<< HEAD
    <div className="space-y-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-ui-blue-primary to-ui-purple-primary bg-clip-text text-transparent mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          How should we reach you with your guide matches?
        </p>
=======
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Contact Information</h2>
        <p className="text-gray-600">How should we reach you?</p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email Address <span className="text-ui-error">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          className={errors.email ? 'border-ui-error' : ''}
          readOnly={isEmailFromSession}
          disabled={isEmailFromSession}
        />
        {errors.email && <p className="text-sm text-ui-error">{errors.email}</p>}
        {isEmailFromSession ? (
          <p className="text-xs text-ui-success flex items-center gap-1">
            <span>✓</span> Email linked to your account
          </p>
        ) : (
          <p className="text-xs text-gray-500">
            We'll send a verification code to this email
          </p>
        )}
>>>>>>> c2626a4f409d082306e95fee7ca9a168640a3362
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Contact Details */}
        <div className="space-y-6">
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-ui-blue-primary/10 flex items-center justify-center text-ui-blue-primary">
                <Mail className="h-4 w-4" />
              </span>
              Your Details
            </h3>

            {/* Email */}
            <ModernInput
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              error={errors.email}
              icon={Mail}
              helperText="We'll send a verification code to this email"
            />

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <div className="flex gap-2">
                <div className="w-24">
                  <ModernInput
                    placeholder="+1"
                    defaultValue="+1"
                    className="text-center"
                  />
                </div>
                <div className="flex-1">
                  <ModernInput
                    type="tel"
                    placeholder="123-456-7890"
                    value={data.phone || ''}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    icon={Phone}
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Toggle */}
            {data.phone && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center space-x-3 mb-3">
                  <Checkbox
                    id="whatsapp"
                    checked={useWhatsApp}
                    onCheckedChange={handleWhatsAppToggle}
                  />
                  <Label htmlFor="whatsapp" className="font-medium cursor-pointer flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    This number is also my WhatsApp
                  </Label>
                </div>
                {!useWhatsApp && (
                  <ModernInput
                    type="tel"
                    placeholder="Different WhatsApp number"
                    value={data.whatsapp || ''}
                    onChange={(e) => updateData({ whatsapp: e.target.value })}
                    className="bg-white"
                  />
                )}
              </div>
            )}
          </div>

          {/* Contact Method Preference */}
          <div className="space-y-3">
            <Label className={errors.contactMethod ? "text-ui-error" : ""}>
              Preferred Contact Method <span className="text-ui-error">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {CONTACT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = data.contactMethod === method.value;
                return (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => updateData({ contactMethod: method.value as any })}
                    className={cn(
                      "flex items-center p-3 rounded-xl border-2 transition-all duration-200 gap-3",
                      isSelected
                        ? "border-ui-blue-primary bg-ui-blue-primary/5 text-ui-blue-primary shadow-sm"
                        : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{method.label}</span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
            {errors.contactMethod && <p className="text-xs text-ui-error">{errors.contactMethod}</p>}
          </div>
        </div>

        {/* Right Column: Notes & Legal */}
        <div className="space-y-6">
          {/* Trip Notes */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/60 rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="h-8 w-8 rounded-full bg-ui-purple-primary/10 flex items-center justify-center text-ui-purple-primary">
                <FileText className="h-4 w-4" />
              </span>
              Additional Notes
            </h3>
            <Textarea
              placeholder="Any special requests, dietary restrictions, or other information you'd like to share..."
              value={data.tripNotes || ''}
              onChange={(e) => updateData({ tripNotes: e.target.value })}
              rows={6}
              className="rounded-xl border-2 border-gray-200 bg-white/50 focus-visible:ring-ui-blue-primary resize-none"
            />
            <p className="text-xs text-gray-500">
              Help your guide prepare for your visit
            </p>
          </div>

          {/* Legal Consent */}
          <div className={cn(
            "rounded-3xl p-6 border-2 transition-all duration-300",
            errors.termsAccepted ? "border-ui-error bg-ui-error/5" : "border-gray-100 bg-white/50"
          )}>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="termsConsent"
                checked={data.termsAccepted || false}
                onCheckedChange={(checked) => updateData({ termsAccepted: checked as boolean })}
                className="mt-1"
              />
              <Label htmlFor="termsConsent" className="font-normal text-sm cursor-pointer leading-relaxed text-gray-600">
                I agree to the <span className="text-ui-blue-primary font-medium">Terms of Service</span> and <span className="text-ui-blue-primary font-medium">Privacy Policy</span>, and I understand that{' '}
                <strong className="text-gray-900">TourWiseCo is a marketplace connector only</strong> and does not handle payments, guarantee service quality, or assume liability for guide interactions.
              </Label>
            </div>
            {errors.termsAccepted && (
              <p className="text-xs text-ui-error mt-2 ml-7">{errors.termsAccepted}</p>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-ui-success/10 border border-ui-success/20 rounded-2xl p-4 flex gap-3">
            <Shield className="h-5 w-5 text-ui-success shrink-0" />
            <div>
              <h3 className="font-bold text-ui-success text-sm mb-1">Privacy Guarantee</h3>
              <p className="text-xs text-ui-success/80 leading-relaxed">
                Your contact information will only be shared with your matched guide after
                you accept their proposal. We never share your data with third parties.
              </p>
            </div>
          </div>
        </div>
<<<<<<< HEAD
=======
      )}

      {/* Contact Method Preference */}
      <div className="space-y-2">
        <Label>
          Preferred Contact Method <span className="text-ui-error">*</span>
        </Label>
        <RadioGroup
          value={data.contactMethod}
          onValueChange={(value: string) => updateData({ contactMethod: value as 'email' | 'phone' | 'whatsapp' | 'sms' })}
          className={errors.contactMethod ? 'border border-ui-error rounded p-4' : ''}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="contact_email" />
            <Label htmlFor="contact_email" className="font-normal cursor-pointer">
              Email
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="contact_phone" />
            <Label htmlFor="contact_phone" className="font-normal cursor-pointer">
              Phone call
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="contact_whatsapp" />
            <Label htmlFor="contact_whatsapp" className="font-normal cursor-pointer">
              WhatsApp
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sms" id="contact_sms" />
            <Label htmlFor="contact_sms" className="font-normal cursor-pointer">
              SMS / text message
            </Label>
          </div>
        </RadioGroup>
        {errors.contactMethod && (
          <p className="text-sm text-ui-error">{errors.contactMethod}</p>
        )}
      </div>

      {/* Trip Notes */}
      <div className="space-y-2">
        <Label htmlFor="tripNotes">Additional Notes (Optional)</Label>
        <Textarea
          id="tripNotes"
          placeholder="Any special requests, dietary restrictions, or other information you'd like to share..."
          value={data.tripNotes || ''}
          onChange={(e) => updateData({ tripNotes: e.target.value })}
          rows={4}
        />
        <p className="text-xs text-gray-500">
          Help your guide prepare for your visit
        </p>
      </div>

      {/* Legal Consent */}
      <div className="space-y-3 pt-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="termsConsent"
            checked={data.termsAccepted || false}
            onCheckedChange={(checked) => updateData({ termsAccepted: checked as boolean })}
            className="mt-1"
          />
          <Label htmlFor="termsConsent" className="font-normal text-sm cursor-pointer leading-relaxed">
            I agree to the{' '}
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="text-ui-blue-primary hover:text-ui-blue-accent underline font-medium">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="text-ui-blue-primary hover:text-ui-blue-accent underline font-medium">
              Privacy Policy
            </Link>
            , and I understand that{' '}
            <strong>TourWiseCo is a marketplace connector only</strong> and does not handle payments, guarantee service quality, or assume liability for guide interactions.
            <span className="text-ui-error ml-1">*</span>
          </Label>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-ui-error">{errors.termsAccepted}</p>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-ui-blue-secondary/20 border border-ui-blue-secondary rounded-lg p-4">
        <h3 className="font-semibold text-ui-blue-primary mb-2">🔒 Privacy Notice</h3>
        <p className="text-sm text-ui-blue-accent">
          Your contact information will only be shared with your matched guide after
          you accept their proposal. We take your privacy seriously and never share
          your data with third parties.
        </p>
>>>>>>> c2626a4f409d082306e95fee7ca9a168640a3362
      </div>
    </div>
  )
}
