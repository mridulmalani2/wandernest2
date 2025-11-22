'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { BookingFormData } from './BookingForm'
import { useState } from 'react'

type Props = {
  data: BookingFormData
  errors: Record<string, string>
  updateData: (data: Partial<BookingFormData>) => void
}

export function ContactStep({ data, errors, updateData }: Props) {
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
        />
        {errors.email && <p className="text-sm text-ui-error">{errors.email}</p>}
        <p className="text-xs text-gray-500">
          We'll send a verification code to this email
        </p>
      </div>

      {/* Phone Number with Country Code */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <div className="flex gap-2">
          <Input
            id="countryCode"
            type="text"
            placeholder="+1"
            className="w-20"
            defaultValue="+1"
          />
          <Input
            id="phone"
            type="tel"
            placeholder="123-456-7890"
            value={data.phone || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {/* WhatsApp */}
      {data.phone && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="whatsapp"
              checked={useWhatsApp}
              onCheckedChange={handleWhatsAppToggle}
            />
            <Label htmlFor="whatsapp" className="font-normal cursor-pointer">
              This number is also my WhatsApp
            </Label>
          </div>
          {!useWhatsApp && (
            <Input
              id="whatsappNumber"
              type="tel"
              placeholder="Different WhatsApp number (optional)"
              value={data.whatsapp || ''}
              onChange={(e) => updateData({ whatsapp: e.target.value })}
            />
          )}
        </div>
      )}

      {/* Contact Method Preference */}
      <div className="space-y-2">
        <Label>
          Preferred Contact Method <span className="text-ui-error">*</span>
        </Label>
        <RadioGroup
          value={data.contactMethod}
          onValueChange={(value: string) => updateData({ contactMethod: value })}
          className={errors.contactMethod ? 'border border-ui-error rounded p-4' : ''}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="contact_email" />
            <Label htmlFor="contact_email" className="font-normal cursor-pointer">
              Email
            </Label>
          </div>
          {data.phone && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phone" id="contact_phone" />
              <Label htmlFor="contact_phone" className="font-normal cursor-pointer">
                Phone Call
              </Label>
            </div>
          )}
          {(data.whatsapp || data.phone) && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="contact_whatsapp" />
              <Label htmlFor="contact_whatsapp" className="font-normal cursor-pointer">
                WhatsApp
              </Label>
            </div>
          )}
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
            I agree to the Terms of Service and Privacy Policy, and I understand that{' '}
            <strong>WanderNest is a marketplace connector only</strong> and does not handle payments, guarantee service quality, or assume liability for guide interactions.
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
      </div>
    </div>
  )
}
