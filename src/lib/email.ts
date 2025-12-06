import 'server-only'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import type { Student, TouristRequest } from '@prisma/client'
import { config } from '@/lib/config'
import { generateMatchUrls } from '@/lib/auth/tokens'
import {
  getOtpEmailHtml,
  getBookingConfirmationHtml,
  getStudentRequestNotificationHtml,
  getStudentMatchInvitationHtml,
  getTouristAcceptanceNotificationHtml,
  getStudentConfirmationHtml,
  getContactFormEmailHtml
} from '@/lib/email-templates'

/**
 * Email system with comprehensive error handling
 *
 * Features:
 * - Prioritizes Resend for reliable delivery
 * - Fallback to SMTP if Resend is not configured
 * - Graceful fallback to mock mode when email is not configured
 * - Never crashes the calling code due to email failures
 * - Clear logging of email send status
 * - Safe handling of missing environment variables
 */

/**
 * Get base URL safely with fallback
 */
function getBaseUrl(): string {
  const baseUrl = config.app.baseUrl
  if (!baseUrl) {
    console.warn(
      '⚠️  NEXT_PUBLIC_BASE_URL not configured - email links will use fallback'
    )
    return 'https://tourwiseco.com' // Fallback URL
  }
  return baseUrl
}

/**
 * Email clients initialization
 */
let transporter: nodemailer.Transporter | null = null
let resend: Resend | null = null

if (config.email.resendApiKey) {
  try {
    resend = new Resend(config.email.resendApiKey)
    if (config.app.isDevelopment) {
      console.log('✅ Resend email client initialized')
    }
  } catch (error) {
    console.error('❌ Failed to initialize Resend client:', error)
    resend = null
  }
}

// Only initialize SMTP if Resend is NOT configured, or as a fallback?
// For now, let's initialize it if configured, but we'll prioritize Resend in sendEmail.
if (config.email.host && config.email.user && config.email.pass) {
  try {
    transporter = nodemailer.createTransport({
      host: config.email.host as string,
      port: config.email.port,
      secure: false, // Use TLS
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      // Add timeout to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      // Vercel optimization: Force IPv4 to avoid IPv6 timeouts with some providers (like Gmail)
      family: 4,
      dnsCache: true,
    } as any)

    if (config.app.isDevelopment) {
      console.log('✅ SMTP Email transporter initialized')
    }
  } catch (error) {
    console.error('❌ Failed to initialize SMTP email transporter:', error)
    transporter = null
  }
}

if (!resend && !transporter) {
  if (config.app.isDevelopment) {
    console.log('⚠️  Email not configured - using mock mode')
  } else if (config.app.isProduction) {
    console.warn(
      '⚠️  WARNING: Email not configured in production - emails will not be sent'
    )
  }
}

/**
 * Send email with comprehensive error handling
 * Never throws - always returns success/failure status
 */
async function sendEmail(
  options: {
    to: string
    subject: string
    html: string
    text?: string
    replyTo?: string
  },
  context: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`🚀 sendEmail called for context: ${context}`);
  console.log(`   To: ${options.to}`);
  console.log(`   Resend Client Available: ${!!resend}`);
  const isTestKey = config.email.resendApiKey?.startsWith('re_test_');
  console.log(`   Resend API Key Type: ${config.email.resendApiKey ? (isTestKey ? '⚠️ TEST KEY (Sandbox Mode - Only sends to you)' : '✅ LIVE KEY') : '❌ NOT CONFIGURED'}`);
  console.log(`   Resend API Key Configured: ${!!config.email.resendApiKey}`);

  // 1. Try Resend first
  if (resend) {
    try {
      // Resend SDK v6+ returns { data, error }
      const response = await resend.emails.send({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || undefined,
        replyTo: options.replyTo || config.email.contactEmail,
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      console.log(`✅ Email sent via Resend: ${context} to ${options.to}`)
      if (config.app.isDevelopment && response.data) {
        console.log('   Message ID:', response.data.id)
      }

      return { success: true }
    } catch (error) {
      console.error(`❌ Failed to send email via Resend: ${context}`, error)
      // Fallback to SMTP if available
      if (!transporter) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown Resend error',
        }
      }
      console.log('🔄 Falling back to SMTP...')
    }
  }

  // 2. Try SMTP (Nodemailer)
  if (transporter) {
    try {
      await transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo || config.email.contactEmail,
      })

      if (config.app.isDevelopment) {
        console.log(`✅ Email sent via SMTP: ${context} to ${options.to}`)
      }

      return { success: true }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      console.error(`❌ Failed to send email via SMTP: ${context}`)
      console.error(`   To: ${options.to}`)
      console.error(`   Error: ${errorMessage}`)

      // Log full error in development
      if (config.app.isDevelopment) {
        console.error('   Full error:', error)
      }

      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  // 3. Mock mode - log instead of sending
  console.log('⚠️  FALLING BACK TO MOCK EMAIL MODE - NO REAL EMAIL WILL BE SENT');
  if (config.app.isDevelopment || !config.email.isConfigured) {
    console.log('\n===========================================')
    console.log(`📧 MOCK EMAIL - ${context}`)
    console.log('===========================================')
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('===========================================\n')
  }

  if (config.app.isProduction && !config.email.isConfigured) {
    return { success: false, error: 'Email not configured in production' };
  }

  return { success: true } // Mock sends always "succeed" in dev
}

export async function sendStudentOtpEmail(toEmail: string, otp: string) {
  // Use standardized OTP email template and subject
  const html = getOtpEmailHtml(otp, 'Sign in as Student Guide', 'Enter this code to securely sign in to your account.')
  const text = `Sign in as Student Guide\n\nEnter this code to securely sign in to your account:\n\n${otp}\n\nThis code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.`

  return sendEmail(
    {
      to: toEmail,
      subject: 'Verification Code', // Changed from 'Your TourWiseCo sign-in code' to match sendVerificationEmail
      html,
      text,
    },
    'Student OTP Email'
  )
}


export async function sendBookingConfirmation(
  email: string,
  requestId: string,
  city: string,
  options?: { matchesFound?: number }
) {
  const hasMatches = (options?.matchesFound ?? 0) > 0
  const html = getBookingConfirmationHtml(requestId, city, hasMatches, options?.matchesFound)
  const text = `Booking Request Received!\n\nYour trip to ${city} is officially in the works.\nRequest ID: ${requestId}\n\n${hasMatches ? `Good News! We found ${options?.matchesFound} student guides who match your preferences.` : ''}`

  return sendEmail(
    {
      to: email,
      subject: '✅ Booking Confirmed – Your Adventure Awaits!',
      html,
      text,
    },
    'Booking Confirmation'
  )
}

export async function sendStudentRequestNotification(
  student: Student,
  touristRequest: TouristRequest,
  selectionId: string
) {
  // Use secure token generation for the accept URL, consistent with match invitations
  const { acceptUrl } = generateMatchUrls(
    getBaseUrl(),
    touristRequest.id,
    student.id,
    selectionId
  )
  const html = getStudentRequestNotificationHtml(student.name || 'Student', touristRequest.city, acceptUrl)
  const text = `New Request in ${touristRequest.city}!\n\nHi ${student.name || 'Student'}, a tourist has requested you as their guide.\n\nView & Accept Request: ${acceptUrl}`

  return sendEmail(
    {
      to: student.email,
      subject: `🌟 You've Been Requested as a Guide in ${touristRequest.city}!`,
      html,
      text,
    },
    'Student Request Notification'
  )
}

/**
 * Send match invitation to student with secure accept/decline links
 * Used by automatic matching service
 */
export async function sendStudentMatchInvitation(
  student: Student,
  touristRequest: TouristRequest,
  selectionId: string
) {
  // Generate secure accept/decline URLs using signed tokens
  const { acceptUrl } = generateMatchUrls(
    getBaseUrl(),
    touristRequest.id,
    student.id,
    selectionId
  )

  const html = getStudentMatchInvitationHtml(student.name || 'Student', touristRequest.city, acceptUrl)

  return await sendEmail(
    {
      to: student.email,
      subject: `🎉 New Match Opportunity in ${touristRequest.city}!`,
      html,
    },
    'Student Match Invitation'
  )
}

export async function sendTouristAcceptanceNotification(
  touristEmail: string,
  student: Student,
  touristRequest: TouristRequest,
  touristName?: string
) {


  const html = getTouristAcceptanceNotificationHtml(
    touristName || 'Tourist',
    student.name || 'Student Guide',
    touristRequest.city,
    {
      institute: student.institute || 'Unknown Institute',
      languages: student.languages,
      email: student.email,
    }
  )

  return await sendEmail(
    {
      to: touristEmail,
      subject: `🎉 Your Guide in ${touristRequest.city} Has Accepted!`,
      html,
    },
    'Tourist Acceptance Notification'
  )
}

export async function sendVerificationEmail(
  email: string,
  code: string
) {
  const html = getOtpEmailHtml(code, 'Sign in as Student Guide', 'Enter this code to securely sign in to your account.')
  const text = `Sign in as Student Guide\n\nEnter this code to securely sign in to your account:\n\n${code}\n\nThis code expires in 10 minutes. If you didn't request this code, you can safely ignore this email.`

  return await sendEmail(
    {
      to: email,
      subject: 'Verification Code',
      html,
      text,
    },
    'Verification Email'
  )
}

export async function sendStudentConfirmation(
  student: Student,
  touristRequest: TouristRequest,
  touristName: string = 'Tourist' // Default if not provided, but caller should ideally provide it
) {
  const dates = touristRequest.dates as { start: string; end?: string }
  const dateString = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // Cleaner implementation without leftover comments
  const html = getStudentConfirmationHtml(
    student.name || 'Student',
    touristName,
    touristRequest.city,
    dateString,
    touristRequest.email,
    touristRequest.phone || undefined,
    touristRequest.whatsapp || undefined
  )
  const text = `Trip Confirmed!\n\nHi ${student.name || 'Student'}, you are confirmed for the trip in ${touristRequest.city}.\n\nDates: ${dateString}\nTourist: ${touristName}\n\nContact Email: ${touristRequest.email}`

  return sendEmail(
    {
      to: student.email,
      subject: `✅ You are confirmed for a trip in ${touristRequest.city}!`,
      html,
      text,
    },
    'Student Confirmation'
  )
}

export async function sendContactFormEmails(data: {
  name: string
  email: string
  message: string
  phone?: string
}) {
  const html = getContactFormEmailHtml(data.name, data.email, data.message, data.phone)

  // Send to admin
  return sendEmail(
    {
      to: config.email.contactEmail, // Send to support email
      subject: `New Contact Form Submission from ${data.name}`,
      html,
      replyTo: data.email
    },
    'Contact Form Submission'
  )
}
