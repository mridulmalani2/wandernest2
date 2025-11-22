'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { StudentProfileCard, StudentMatch } from '@/components/tourist/StudentProfileCard'
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton'
import { Loader2, CheckCircle2, ArrowLeft, Info, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

type FormStep = 'form' | 'results' | 'confirmed'

interface FormData {
  city: string
  startDate: string
  endDate: string
  preferredTime: 'morning' | 'afternoon' | 'evening' | ''
  numberOfGuests: number
  groupType: 'family' | 'friends' | 'solo' | 'business' | ''
  preferredLanguages: string[]
  serviceType: 'itinerary_help' | 'guided_experience' | ''
  interests: string[]
  totalBudget: string
  email: string
  phone: string
  contactMethod: 'email' | 'phone' | 'whatsapp' | 'sms' | ''
  tripNotes: string
}

const LANGUAGE_OPTIONS = [
  'English',
  'French',
  'Spanish',
  'German',
  'Italian',
  'Mandarin',
  'Japanese',
  'Arabic',
  'Hindi',
  'Portuguese',
]

const INTEREST_OPTIONS = [
  'art',
  'museums',
  'history',
  'food',
  'nightlife',
  'shopping',
  'architecture',
  'nature',
  'photography',
  'culture',
  'music',
  'sports',
  'family activities',
  'kid-friendly',
]

export default function DemoTouristFlowPage() {
  const [step, setStep] = useState<FormStep>('form')
  const [formData, setFormData] = useState<FormData>({
    city: '',
    startDate: '',
    endDate: '',
    preferredTime: '',
    numberOfGuests: 2,
    groupType: '',
    preferredLanguages: [],
    serviceType: '',
    interests: [],
    totalBudget: '',
    email: '',
    phone: '',
    contactMethod: '',
    tripNotes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requestId, setRequestId] = useState<string>('')
  const [matches, setMatches] = useState<StudentMatch[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [suggestedPrice, setSuggestedPrice] = useState<any>(null)
  const [confirmedStudent, setConfirmedStudent] = useState<any>(null)

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(lang)
        ? prev.preferredLanguages.filter((l) => l !== lang)
        : [...prev.preferredLanguages, lang],
    }))
  }

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.preferredTime) newErrors.preferredTime = 'Time preference is required'
    if (!formData.groupType) newErrors.groupType = 'Group type is required'
    if (formData.preferredLanguages.length === 0)
      newErrors.preferredLanguages = 'Select at least one language'
    if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
    if (formData.interests.length === 0) newErrors.interests = 'Select at least one interest'
    if (!formData.email) newErrors.email = 'Email is required'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address'
    if (!formData.contactMethod) newErrors.contactMethod = 'Contact method is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Step 1: Create request
      const requestResponse = await fetch('/api/demo/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: formData.city,
          dates: { start: formData.startDate, end: formData.endDate },
          preferredTime: formData.preferredTime,
          numberOfGuests: formData.numberOfGuests,
          groupType: formData.groupType,
          preferredLanguages: formData.preferredLanguages,
          serviceType: formData.serviceType,
          interests: formData.interests,
          totalBudget: formData.totalBudget ? parseFloat(formData.totalBudget) : undefined,
          email: formData.email,
          phone: formData.phone,
          contactMethod: formData.contactMethod,
          tripNotes: formData.tripNotes,
        }),
      })

      const requestData = await requestResponse.json()

      if (!requestData.success) {
        alert(requestData.error || 'Failed to create request')
        return
      }

      const newRequestId = requestData.requestId
      setRequestId(newRequestId)

      // Step 2: Get matching students
      const matchResponse = await fetch('/api/demo/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: newRequestId }),
      })

      const matchData = await matchResponse.json()

      if (matchData.success) {
        setMatches(matchData.matches)
        setSuggestedPrice(matchData.suggestedPriceRange)
        setStep('results')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        alert(matchData.error || 'Failed to find matches')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmStudent = async () => {
    if (!selectedStudent) {
      alert('Please select a student first')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/demo/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          studentId: selectedStudent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setConfirmedStudent(data.selection)
        setStep('confirmed')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        alert(data.error || 'Failed to confirm selection')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToForm = () => {
    setStep('form')
    setSelectedStudent('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartOver = () => {
    setStep('form')
    setFormData({
      city: '',
      startDate: '',
      endDate: '',
      preferredTime: '',
      numberOfGuests: 2,
      groupType: '',
      preferredLanguages: [],
      serviceType: '',
      interests: [],
      totalBudget: '',
      email: '',
      phone: '',
      contactMethod: '',
      tripNotes: '',
    })
    setErrors({})
    setRequestId('')
    setMatches([])
    setSelectedStudent('')
    setSuggestedPrice(null)
    setConfirmedStudent(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
          alt="Travelers planning their adventure"
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-ui-blue-primary/15 via-ui-purple-primary/10 to-ui-purple-accent/15" />
      </div>
      <div className="absolute inset-0 pattern-dots opacity-10" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
          {/* Demo Banner */}
          <div className="max-w-4xl mx-auto mb-6">
            <Alert className="border-2 border-ui-warning bg-gradient-to-br from-ui-warning/20 to-ui-warning/10 shadow-premium">
              <Info className="h-5 w-5 text-ui-warning" />
              <AlertDescription className="text-ui-warning font-medium">
                <strong>Demo Mode:</strong> This is a local demo using dummy student data. No
                real bookings or emails will be sent.
              </AlertDescription>
            </Alert>
          </div>

          {/* STEP 1: FORM */}
          {step === 'form' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 text-center animate-fade-in-up">
                <h1 className="text-4xl font-bold mb-4 text-white text-shadow-lg">
                  Find Your Perfect Student Guide
                </h1>
                <p className="text-white text-lg text-shadow">
                  Tell us about your trip and we'll match you with local students
                </p>
              </div>

              <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 animate-fade-in-up delay-100">
                <div className="space-y-6">
                  {/* City & Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city" className="text-gray-800 font-semibold mb-2">
                        City *
                      </Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, city: value }))
                        }
                      >
                        <SelectTrigger id="city" className={errors.city ? 'border-ui-error' : ''}>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paris">Paris</SelectItem>
                          <SelectItem value="London">London</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.city && <p className="text-ui-error text-sm mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <Label htmlFor="startDate" className="text-gray-800 font-semibold mb-2">
                        Start Date *
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                        }
                        className={errors.startDate ? 'border-ui-error' : ''}
                      />
                      {errors.startDate && (
                        <p className="text-ui-error text-sm mt-1">{errors.startDate}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="endDate" className="text-gray-800 font-semibold mb-2">
                        End Date (Optional)
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="preferredTime" className="text-gray-800 font-semibold mb-2">
                        Preferred Time *
                      </Label>
                      <Select
                        value={formData.preferredTime}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({ ...prev, preferredTime: value }))
                        }
                      >
                        <SelectTrigger
                          id="preferredTime"
                          className={errors.preferredTime ? 'border-ui-error' : ''}
                        >
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.preferredTime && (
                        <p className="text-ui-error text-sm mt-1">{errors.preferredTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Group Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="numberOfGuests" className="text-gray-800 font-semibold mb-2">
                        Number of Guests
                      </Label>
                      <Input
                        id="numberOfGuests"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.numberOfGuests}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            numberOfGuests: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="groupType" className="text-gray-800 font-semibold mb-2">
                        Group Type *
                      </Label>
                      <Select
                        value={formData.groupType}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({ ...prev, groupType: value }))
                        }
                      >
                        <SelectTrigger
                          id="groupType"
                          className={errors.groupType ? 'border-ui-error' : ''}
                        >
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="friends">Friends</SelectItem>
                          <SelectItem value="solo">Solo</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.groupType && (
                        <p className="text-ui-error text-sm mt-1">{errors.groupType}</p>
                      )}
                    </div>
                  </div>

                  {/* Service Type */}
                  <div>
                    <Label htmlFor="serviceType" className="text-gray-800 font-semibold mb-2">
                      Service Type *
                    </Label>
                    <Select
                      value={formData.serviceType}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, serviceType: value }))
                      }
                    >
                      <SelectTrigger
                        id="serviceType"
                        className={errors.serviceType ? 'border-ui-error' : ''}
                      >
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="itinerary_help">
                          Itinerary Help (Online Planning)
                        </SelectItem>
                        <SelectItem value="guided_experience">
                          Guided Experience (In-Person)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.serviceType && (
                      <p className="text-ui-error text-sm mt-1">{errors.serviceType}</p>
                    )}
                  </div>

                  {/* Languages */}
                  <div>
                    <Label className="text-gray-800 font-semibold mb-3 block">
                      Preferred Languages * (Select at least one)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={`lang-${lang}`}
                            checked={formData.preferredLanguages.includes(lang)}
                            onCheckedChange={() => toggleLanguage(lang)}
                          />
                          <label
                            htmlFor={`lang-${lang}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {lang}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.preferredLanguages && (
                      <p className="text-ui-error text-sm mt-2">{errors.preferredLanguages}</p>
                    )}
                  </div>

                  {/* Interests */}
                  <div>
                    <Label className="text-gray-800 font-semibold mb-3 block">
                      Interests * (Select at least one)
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {INTEREST_OPTIONS.map((interest) => (
                        <div key={interest} className="flex items-center space-x-2">
                          <Checkbox
                            id={`interest-${interest}`}
                            checked={formData.interests.includes(interest)}
                            onCheckedChange={() => toggleInterest(interest)}
                          />
                          <label
                            htmlFor={`interest-${interest}`}
                            className="text-sm text-gray-700 cursor-pointer capitalize"
                          >
                            {interest}
                          </label>
                        </div>
                      ))}
                    </div>
                    {errors.interests && (
                      <p className="text-ui-error text-sm mt-2">{errors.interests}</p>
                    )}
                  </div>

                  {/* Budget */}
                  <div>
                    <Label htmlFor="totalBudget" className="text-gray-800 font-semibold mb-2">
                      Total Budget (Optional)
                    </Label>
                    <Input
                      id="totalBudget"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.totalBudget}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, totalBudget: e.target.value }))
                      }
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      This helps us match you with guides in your price range
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-gray-800 font-semibold mb-2">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className={errors.email ? 'border-ui-error' : ''}
                      />
                      {errors.email && <p className="text-ui-error text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-800 font-semibold mb-2">
                        Phone (Optional)
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, phone: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contactMethod" className="text-gray-800 font-semibold mb-2">
                      Preferred Contact Method *
                    </Label>
                    <Select
                      value={formData.contactMethod}
                      onValueChange={(value: any) =>
                        setFormData((prev) => ({ ...prev, contactMethod: value }))
                      }
                    >
                      <SelectTrigger
                        id="contactMethod"
                        className={errors.contactMethod ? 'border-ui-error' : ''}
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.contactMethod && (
                      <p className="text-ui-error text-sm mt-1">{errors.contactMethod}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="tripNotes" className="text-gray-800 font-semibold mb-2">
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="tripNotes"
                      placeholder="Any special requests or information..."
                      value={formData.tripNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, tripNotes: e.target.value }))
                      }
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <PrimaryCTAButton
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      variant="blue"
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Finding Matches...
                        </>
                      ) : (
                        'Find Matching Students'
                      )}
                    </PrimaryCTAButton>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: RESULTS */}
          {step === 'results' && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8 text-center animate-fade-in-up">
                <h1 className="text-4xl font-bold mb-4 text-white text-shadow-lg">
                  Your Matching Student Guides
                </h1>
                <p className="text-white text-lg text-shadow">
                  We found {matches.length} guide{matches.length !== 1 ? 's' : ''} that match your
                  preferences
                </p>
              </div>

              {/* Suggested Price */}
              {suggestedPrice && (
                <div className="max-w-3xl mx-auto mb-8 glass-card rounded-2xl border-2 border-white/40 shadow-premium p-6 animate-fade-in-up delay-100">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">Suggested Price Range</h3>
                  <p className="text-3xl font-bold bg-gradient-to-r from-ui-purple-primary to-ui-purple-accent bg-clip-text text-transparent mb-2">
                    {suggestedPrice.min}-{suggestedPrice.max} {suggestedPrice.currency}
                    {suggestedPrice.type === 'hourly' && (
                      <span className="text-sm font-normal text-gray-600">/hour</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700">{suggestedPrice.note}</p>
                </div>
              )}

              {/* No Matches */}
              {matches.length === 0 && (
                <div className="max-w-md mx-auto text-center glass-card rounded-3xl p-8 shadow-premium animate-fade-in">
                  <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Guides Available</h2>
                  <p className="text-gray-700 mb-6">
                    We couldn't find any matching guides for your criteria. Try adjusting your
                    preferences.
                  </p>
                  <Button onClick={handleBackToForm} variant="outline" className="hover-lift">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Form
                  </Button>
                </div>
              )}

              {/* Matches Grid */}
              {matches.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-200">
                    {matches.map((student) => (
                      <StudentProfileCard
                        key={student.studentId}
                        student={student}
                        isSelected={selectedStudent === student.studentId}
                        onToggleSelect={(id) =>
                          setSelectedStudent(selectedStudent === id ? '' : id)
                        }
                      />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
                    <Button
                      onClick={handleBackToForm}
                      variant="outline"
                      disabled={isSubmitting}
                      className="hover-lift"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Modify Request
                    </Button>

                    <PrimaryCTAButton
                      onClick={handleConfirmStudent}
                      disabled={!selectedStudent || isSubmitting}
                      variant="blue"
                      className="sm:min-w-[250px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Confirm This Student
                        </>
                      )}
                    </PrimaryCTAButton>
                  </div>

                  {!selectedStudent && (
                    <p className="text-center text-white text-shadow mt-4 font-medium">
                      ↑ Click on a student card to select them
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3: CONFIRMED */}
          {step === 'confirmed' && confirmedStudent && (
            <div className="max-w-2xl mx-auto">
              <div className="glass-card rounded-3xl border-2 border-white/40 shadow-premium p-8 text-center animate-fade-in">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-ui-success/20 mb-4">
                    <CheckCircle2 className="h-10 w-10 text-ui-success" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Selection Confirmed!</h1>
                  <p className="text-gray-700 text-lg">
                    Your request has been sent to <strong>{confirmedStudent.studentName}</strong>
                  </p>
                </div>

                <div className="bg-gradient-to-br from-ui-blue-primary/10 to-ui-blue-secondary/20 rounded-2xl p-6 mb-6 text-left">
                  <h3 className="font-bold text-gray-900 mb-4">Selected Student Guide</h3>
                  <div className="space-y-2">
                    <p className="text-gray-800">
                      <span className="font-semibold">Name:</span> {confirmedStudent.studentName}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Email:</span> {confirmedStudent.studentEmail}
                    </p>
                    <p className="text-gray-800">
                      <span className="font-semibold">Institute:</span>{' '}
                      {confirmedStudent.studentInstitute}
                    </p>
                  </div>
                </div>

                <Alert className="mb-6 border-2 border-ui-info">
                  <Info className="h-5 w-5 text-ui-info" />
                  <AlertDescription className="text-left text-gray-700">
                    <strong>Next Steps:</strong> {confirmedStudent.nextSteps}
                  </AlertDescription>
                </Alert>

                <div className="bg-ui-warning/10 border-2 border-ui-warning rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-900 font-medium">
                    <strong>Demo Note:</strong> In production, automated emails would be sent to
                    both you and the student. The student would then accept or decline your request.
                  </p>
                </div>

                <Button onClick={handleStartOver} variant="outline" className="hover-lift">
                  Start Another Request
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
