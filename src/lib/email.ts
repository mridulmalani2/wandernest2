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
  getTouristAcceptanceNotificationHtml
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
      host: config.email.host,
      port: config.email.port,
      secure: false, // Use TLS
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      // Add timeout to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
    })

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
    replyTo?: string
  },
  context: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Try Resend first
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || config.email.contactEmail,
      })

      if (data.error) {
        throw new Error(data.error.message)
      }

      if (config.app.isDevelopment) {
        console.log(`✅ Email sent via Resend: ${context} to ${options.to}`)
      }

      return { success: true }
    } catch (error) {
      console.error(`❌ Failed to send email via Resend: ${context}`, error)
      // Fallback to SMTP if available?
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
  if (config.app.isDevelopment) {
    console.log('\n===========================================')
    console.log(`📧 MOCK EMAIL - ${context}`)
    console.log('===========================================')
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('===========================================\n')
  }
  return { success: true } // Mock sends always "succeed"
}

export async function sendStudentOtpEmail(toEmail: string, otp: string) {
  const html = getOtpEmailHtml(otp)

  return await sendEmail(
    {
      to: toEmail,
      subject: 'Your TourWiseCo sign-in code',
      html,
    },
    'Student OTP Email'
  )
}


export async function sendBookingConfirmation(
  email: string,
  requestId: string,
  options?: { matchesFound?: number }
) {
  const hasMatches = (options?.matchesFound ?? 0) > 0
  const html = getBookingConfirmationHtml(requestId, "Your Destination", hasMatches, options?.matchesFound)

  return await sendEmail(
    {
      to: email,
      subject: '✅ Booking Confirmed – Your Adventure Awaits!',
      html,
    },
    'Booking Confirmation'
  )
}

export async function sendStudentRequestNotification(
  student: Student,
  touristRequest: TouristRequest
) {
  const acceptUrl = `${getBaseUrl()}/student/requests/${touristRequest.id}/accept`
  const html = getStudentRequestNotificationHtml(student.name || 'Student', touristRequest.city, acceptUrl)

  return await sendEmail(
    {
      to: student.email,
      subject: `🌟 You've Been Requested as a Guide in ${touristRequest.city}!`,
      html,
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
  touristRequest: TouristRequest
) {
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const html = getTouristAcceptanceNotificationHtml(
    'Tourist', // We might not have tourist name easily available here
    student.name || 'Student Guide',
    touristRequest.city,
    startDate,
    {
      institute: student.institute || 'Unknown Institute',
      nationality: student.nationality || 'Unknown',
      languages: student.languages,
      rating: student.averageRating || undefined,
      tripsHosted: student.tripsHosted,
      email: student.email,
      whatsapp: (student as any).whatsapp,
      phone: (student as any).phone
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
  const html = getOtpEmailHtml(code, 'Verify Your Email', 'Enter this code to continue with your booking')

  return await sendEmail(
    {
      to: email,
      subject: 'Verification Code',
      html,
    },
    'Verification Email'
  )
}
