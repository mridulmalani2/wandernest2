import 'server-only'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import { config } from '@/lib/config'

/**
 * STANDALONE TRANSACTIONAL EMAIL MODULE
 *
 * CRITICAL: This module is completely isolated from authentication.
 * DO NOT import from:
 * - @/lib/email.ts (used by NextAuth for magic links)
 * - @/lib/auth/* (auth-related modules)
 *
 * This isolation prevents auth breakage when sending transactional emails.
 */

/**
 * Get base URL safely with fallback
 */
function getBaseUrl(): string {
  const baseUrl = config.app.baseUrl
  if (!baseUrl) {
    // SECURITY: Use generic warning to avoid leaking internal config details if this ever leaks to user (unlikely but safe)
    console.warn(
      '⚠️  App Base URL not configured in config.app.baseUrl - email links will use default fallback'
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
      console.log('✅ Resend transactional client initialized')
    }
  } catch (error) {
    console.error('❌ Failed to initialize Resend transactional client:', error)
    resend = null
  }
}

if (config.email.host && config.email.user && config.email.pass) {
  try {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465 (SSL), false for other ports like 587 (STARTTLS)
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
      tls: {
        rejectUnauthorized: config.app.isProduction, // Enforce in production, allow self-signed in dev
      },
      // Add timeout to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
    })

    if (config.app.isDevelopment) {
      console.log('✅ Transactional email transporter initialized (isolated from auth)')
    }
  } catch (error) {
    console.error('❌ Failed to initialize transactional email transporter:', error)
    transporter = null
  }
}

if (!resend && !transporter) {
  if (config.app.isDevelopment) {
    console.log('⚠️  Transactional email not configured - using mock mode')
  } else if (config.app.isProduction) {
    console.warn(
      '⚠️  WARNING: Transactional email not configured in production - emails will not be sent'
    )
  }
}

/**
 * Send transactional email with comprehensive error handling
 * Never throws - always returns success/failure status
 */
async function sendTransactionalEmail(
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
      // Resend SDK v6+ returns { data, error }
      const response = await resend.emails.send({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || config.email.contactEmail,
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      console.log(`✅ Transactional email sent via Resend: ${context}`)
      if (config.app.isDevelopment && response.data) {
        console.log('   Message ID:', response.data.id)
      }

      return { success: true }
    } catch (error) {
      console.error(`❌ Error sending transactional email via Resend (${context}):`, error)
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
      const result = await transporter.sendMail({
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo || config.email.contactEmail,
      })

      const failed = result.rejected.concat(result.pending).filter(Boolean)
      if (failed.length) {
        console.error('❌ Transactional email failed:', failed.join(', '))
        return {
          success: false,
          error: `Email delivery failed for: ${failed.join(', ')}`,
        }
      }

      if (config.app.isDevelopment) {
        console.log(`✅ Transactional email sent via SMTP: ${context}`)
      }

      return { success: true }
    } catch (error) {
      console.error(`❌ Error sending transactional email via SMTP (${context}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // 3. Mock mode - log instead of sending
  if (config.app.isDevelopment) {
    console.log('\n===========================================')
    console.log(`📧 MOCK TRANSACTIONAL EMAIL - ${context}`)
    console.log('===========================================')
    console.log(`To: ${options.to}`)
    console.log(`Subject: ${options.subject}`)
    console.log('===========================================\n')
    return { success: true }
  }

  // If we get here, no transport is available and we are NOT in dev mode (or we want to be strict)
  console.error(`❌ No email transport configured for: ${context}`)
  return { success: false, error: 'No email transport configured' }
}

/**
 * Send booking confirmation email to tourist
 * Standalone implementation - does NOT depend on auth modules
 */
import { getBookingConfirmationHtml } from '@/lib/email-templates'

// ... (keep existing imports and code up to sendBookingConfirmation)

/**
 * Send booking confirmation email to tourist
 * Standalone implementation - does NOT depend on auth modules
 */
export async function sendBookingConfirmation(
  email: string,
  requestId: string,
  city: string,
  options?: { matchesFound?: number }
): Promise<{ success: boolean; error?: string }> {
  const hasMatches = (options?.matchesFound ?? 0) > 0
  const html = getBookingConfirmationHtml(requestId, city, hasMatches, options?.matchesFound)

  return await sendTransactionalEmail(
    {
      to: email,
      subject: `✅ Booking Confirmed: ${city} – Your Adventure Awaits!`, // Enhanced subject
      html,
    },
    'Booking Confirmation'
  )
}

/**
 * Send welcome email to new student guide
 */
import { getStudentWelcomeHtml } from '@/lib/email-templates'

export async function sendStudentWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  const html = getStudentWelcomeHtml(name)

  return await sendTransactionalEmail(
    {
      to: email,
      subject: `Welcome to the Team, ${name}! 🎓`,
      html,
    },
    'Student Welcome Email'
  )
}
