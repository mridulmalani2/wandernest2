import 'server-only'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'
import type { Student, TouristRequest } from '@prisma/client'
import { config } from '@/lib/config'
import { generateMatchUrls } from '@/lib/auth/tokens'
import { isValidEmailFormat } from '@/lib/email-validation'
import {
  getOtpEmailHtml,
  getBookingConfirmationHtml,
  getStudentRequestNotificationHtml,
  getStudentMatchInvitationHtml,
  getTouristAcceptanceNotificationHtml,
  getStudentConfirmationHtml,
  getContactFormEmailHtml,
  getWelcomeEmailHtml,
  getAdminApprovalReminderHtml
} from '@/lib/email-templates'

/**
 * Email system with comprehensive error handling
 *
 * SECURITY FEATURES:
 * - Email address validation before sending
 * - Input sanitization for all user-provided content
 * - Header injection prevention
 * - Safe error handling without exposing internals
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
 * Maximum lengths for email content to prevent abuse
 */
const MAX_SUBJECT_LENGTH = 200;
const MAX_TEXT_LENGTH = 50000;

/**
 * Validate and sanitize email address
 * SECURITY: Prevents email header injection and malformed addresses
 */
function validateEmailAddress(email: string): string {
  if (!email || typeof email !== 'string') {
    throw new Error('Email address is required');
  }

  const trimmed = email.trim().toLowerCase();

  // Check for header injection attempts (newlines, carriage returns)
  if (/[\r\n]/.test(trimmed)) {
    throw new Error('Invalid email address format');
  }

  // Validate email format
  if (!isValidEmailFormat(trimmed)) {
    throw new Error('Invalid email address format');
  }

  return trimmed;
}

/**
 * Sanitize text content to prevent injection
 * SECURITY: Removes control characters that could be used for header injection
 */
function sanitizeTextContent(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Remove control characters except newline and tab
  // This prevents header injection in email content
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize subject line
 * SECURITY: Prevents header injection via subject
 */
function sanitizeSubject(subject: string): string {
  if (!subject || typeof subject !== 'string') {
    return 'TourWise Notification';
  }

  // Remove all control characters including newlines (subjects must be single line)
  const sanitized = subject.replace(/[\x00-\x1F\x7F]/g, '').trim();

  // Truncate to prevent abuse
  return sanitized.substring(0, MAX_SUBJECT_LENGTH);
}

/**
 * Escape HTML special characters to prevent XSS
 * SECURITY: Used for user-provided content inserted into HTML emails
 */
function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Get base URL safely with fallback
 */
function getBaseUrl(): string {
  const baseUrl = config.app.baseUrl
  if (!baseUrl) {
    console.warn(
      '[Email] NEXT_PUBLIC_BASE_URL not configured - email links will use fallback'
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
      console.log('[Email] Resend email client initialized')
    }
  } catch {
    console.error('[Email] Failed to initialize Resend client')
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
    } as nodemailer.TransportOptions)

    if (config.app.isDevelopment) {
      console.log('[Email] SMTP Email transporter initialized')
    }
  } catch {
    console.error('[Email] Failed to initialize SMTP email transporter')
    transporter = null
  }
}

if (!resend && !transporter) {
  if (config.app.isDevelopment) {
    console.log('[Email] Email not configured - using mock mode')
  } else if (config.app.isProduction) {
    console.warn(
      '[Email] WARNING: Email not configured in production - emails will not be sent'
    )
  }
}

/**
 * Send email with comprehensive error handling
 * Never throws - always returns success/failure status
 *
 * SECURITY: Validates and sanitizes all inputs before sending
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
  try {
    // SECURITY: Validate and sanitize recipient email
    const validatedTo = validateEmailAddress(options.to);

    // SECURITY: Sanitize subject and content
    const sanitizedSubject = sanitizeSubject(options.subject);
    const sanitizedText = options.text ? sanitizeTextContent(options.text).substring(0, MAX_TEXT_LENGTH) : undefined;

    // SECURITY: Validate replyTo if provided
    let validatedReplyTo: string | undefined;
    if (options.replyTo) {
      try {
        validatedReplyTo = validateEmailAddress(options.replyTo);
      } catch {
        // Invalid replyTo - use default
        validatedReplyTo = config.email.contactEmail;
      }
    }

    if (config.app.isDevelopment) {
      console.log(`[Email] Sending: ${context} to ${validatedTo}`);
    }

    // 1. Try Resend first
    if (resend) {
      try {
        const response = await resend.emails.send({
          from: config.email.from,
          to: validatedTo,
          subject: sanitizedSubject,
          html: options.html,
          text: sanitizedText || undefined,
          replyTo: validatedReplyTo || config.email.contactEmail,
        })

        if (response.error) {
          throw new Error(response.error.message)
        }

        if (config.app.isDevelopment) {
          console.log(`[Email] Sent via Resend: ${context}`)
        }

        return { success: true }
      } catch (error) {
        console.error(`[Email] Resend failed: ${context}`)
        // Fallback to SMTP if available
        if (!transporter) {
          return {
            success: false,
            error: 'Email delivery failed',
          }
        }
        console.log('[Email] Falling back to SMTP...')
      }
    }

    // 2. Try SMTP (Nodemailer)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: config.email.from,
          to: validatedTo,
          subject: sanitizedSubject,
          html: options.html,
          text: sanitizedText,
          replyTo: validatedReplyTo || config.email.contactEmail,
        })

        if (config.app.isDevelopment) {
          console.log(`[Email] Sent via SMTP: ${context}`)
        }

        return { success: true }
      } catch {
        console.error(`[Email] SMTP failed: ${context}`)
        return {
          success: false,
          error: 'Email delivery failed',
        }
      }
    }

    // 3. Mock mode - log instead of sending
    if (config.app.isDevelopment || !config.email.isConfigured) {
      console.log(`[Email] MOCK MODE - ${context} to ${validatedTo}`)
    }

    if (config.app.isProduction && !config.email.isConfigured) {
      return { success: false, error: 'Email not configured' };
    }

    return { success: true } // Mock sends always "succeed" in dev
  } catch (err) {
    // SECURITY: Don't expose internal error details
    console.error(`[Email] Error in ${context}:`, err instanceof Error ? err.message : 'Unknown');
    return {
      success: false,
      error: 'Email delivery failed',
    };
  }
}

export async function sendStudentOtpEmail(toEmail: string, otp: string) {
  // SECURITY: Validate inputs
  const validatedEmail = validateEmailAddress(toEmail);

  // SECURITY: OTP should only contain digits
  if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    throw new Error('Invalid OTP format');
  }

  // Use standardized OTP email template and subject
  const html = getOtpEmailHtml(otp, 'Verify Your Account')
  const text = `Here's your secure sign-in code for TourWise:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email or reply and we'll help you.`

  return sendEmail(
    {
      to: validatedEmail,
      subject: 'Your TourWise sign-in code',
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
  // SECURITY: Validate inputs
  const validatedEmail = validateEmailAddress(email);

  // SECURITY: Sanitize user-provided values
  const safeRequestId = escapeHtml(String(requestId || '').substring(0, 50));
  const safeCity = escapeHtml(String(city || '').substring(0, 100));

  const hasMatches = (options?.matchesFound ?? 0) > 0
  const html = getBookingConfirmationHtml(safeRequestId, safeCity, hasMatches, options?.matchesFound)
  const text = sanitizeTextContent(
    `Booking Request Received!\n\nYour trip to ${safeCity} is officially in the works.\nRequest ID: ${safeRequestId}\n\n${hasMatches ? `Good News! We found ${options?.matchesFound} student guides who match your preferences.` : ''}`
  )

  return sendEmail(
    {
      to: validatedEmail,
      subject: 'Booking Confirmed - Your Adventure Awaits!',
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
  // SECURITY: Validate student email
  const validatedEmail = validateEmailAddress(student.email);

  // Use secure token generation for the accept URL, consistent with match invitations
  const { acceptUrl } = generateMatchUrls(
    getBaseUrl(),
    touristRequest.id,
    student.id,
    selectionId
  )

  // SECURITY: Sanitize user-provided values
  const safeName = escapeHtml(String(student.name || 'Student').substring(0, 100));
  const safeCity = escapeHtml(String(touristRequest.city || '').substring(0, 100));

  const html = getStudentRequestNotificationHtml(safeName, safeCity, acceptUrl)
  const text = sanitizeTextContent(
    `New Request in ${safeCity}!\n\nHi ${safeName}, a tourist has requested you as their guide.\n\nView & Accept Request: ${acceptUrl}`
  )

  return sendEmail(
    {
      to: validatedEmail,
      subject: `You've Been Requested as a Guide in ${safeCity}!`,
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
  // SECURITY: Validate student email
  const validatedEmail = validateEmailAddress(student.email);

  // Generate secure accept/decline URLs using signed tokens
  const { acceptUrl } = generateMatchUrls(
    getBaseUrl(),
    touristRequest.id,
    student.id,
    selectionId
  )

  // SECURITY: Sanitize user-provided values
  const safeName = escapeHtml(String(student.name || 'Student').substring(0, 100));
  const safeCity = escapeHtml(String(touristRequest.city || '').substring(0, 100));

  const html = getStudentMatchInvitationHtml(safeName, safeCity, acceptUrl)

  return await sendEmail(
    {
      to: validatedEmail,
      subject: `New Match Opportunity in ${safeCity}!`,
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
  // SECURITY: Validate tourist email
  const validatedEmail = validateEmailAddress(touristEmail);

  // SECURITY: Sanitize user-provided values
  const safeTouristName = escapeHtml(String(touristName || 'Tourist').substring(0, 100));
  const safeStudentName = escapeHtml(String(student.name || 'Student Guide').substring(0, 100));
  const safeCity = escapeHtml(String(touristRequest.city || '').substring(0, 100));
  const safeInstitute = escapeHtml(String(student.institute || 'Unknown Institute').substring(0, 200));
  const safeStudentEmail = validateEmailAddress(student.email);

  const html = getTouristAcceptanceNotificationHtml(
    safeTouristName,
    safeStudentName,
    safeCity,
    {
      institute: safeInstitute,
      languages: student.languages,
      email: safeStudentEmail,
    }
  )

  return await sendEmail(
    {
      to: validatedEmail,
      subject: `Your Guide in ${safeCity} Has Accepted!`,
      html,
    },
    'Tourist Acceptance Notification'
  )
}

export async function sendVerificationEmail(
  email: string,
  code: string
) {
  // SECURITY: Validate inputs
  const validatedEmail = validateEmailAddress(email);

  // SECURITY: Verification code should only contain digits
  if (!code || typeof code !== 'string' || !/^\d{6}$/.test(code)) {
    throw new Error('Invalid verification code format');
  }

  const html = getOtpEmailHtml(code, 'Verify Your Account')
  const text = `Here's your secure sign-in code for TourWise:\n\n${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email or reply and we'll help you.`

  return await sendEmail(
    {
      to: validatedEmail,
      subject: 'Your TourWise sign-in code',
      html,
      text,
    },
    'Verification Email'
  )
}

export async function sendStudentConfirmation(
  student: Student,
  touristRequest: TouristRequest,
  touristName: string = 'Tourist'
) {
  // SECURITY: Validate student email
  const validatedEmail = validateEmailAddress(student.email);

  const dates = touristRequest.dates as { start: string; end?: string }
  const dateString = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // SECURITY: Sanitize user-provided values
  const safeName = escapeHtml(String(student.name || 'Student').substring(0, 100));
  const safeTouristName = escapeHtml(String(touristName || 'Tourist').substring(0, 100));
  const safeCity = escapeHtml(String(touristRequest.city || '').substring(0, 100));
  const safeTouristEmail = touristRequest.email ? validateEmailAddress(touristRequest.email) : '';

  const html = getStudentConfirmationHtml(
    safeName,
    safeTouristName,
    safeCity,
    dateString,
    safeTouristEmail,
    touristRequest.phone || undefined,
    touristRequest.whatsapp || undefined
  )
  const text = sanitizeTextContent(
    `Trip Confirmed!\n\nHi ${safeName}, you are confirmed for the trip in ${safeCity}.\n\nDates: ${dateString}\nTourist: ${safeTouristName}\n\nContact Email: ${safeTouristEmail}`
  )

  return sendEmail(
    {
      to: validatedEmail,
      subject: `You are confirmed for a trip in ${safeCity}!`,
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
  fileUrl?: string
}) {
  const html = getContactFormEmailHtml(
    data.name,
    data.email,
    data.message,
    data.phone,
    data.fileUrl
  )

  // Send to admin
  return sendEmail(
    {
      to: config.email.contactEmail,
      subject: `New Contact Form Submission from ${safeName}`,
      html,
      replyTo: validatedReplyTo
    },
    'Contact Form Submission'
  )
}

export async function sendWelcomeEmail(email: string) {
  // SECURITY: Validate email
  const validatedEmail = validateEmailAddress(email);

  const html = getWelcomeEmailHtml()
  const text = `Hi there,\n\nI'm so glad you decided to join TourWise.\n\nQuick question to kick things off: What city are you most excited to guide strangers in?\n\nHit reply and let me know — I read every email.\n\nCheers,\nThe TourWise Team`

  return sendEmail(
    {
      to: validatedEmail,
      subject: 'Welcome to TourWise! (Quick question)',
      html,
      text,
    },
    'Welcome Email'
  )
}

/**
 * Send approval reminder to admins when a student requests re-approval
 */
export async function sendAdminApprovalReminder(student: {
  id: string
  name: string
  email: string
  city: string
  institute: string
  createdAt: Date
}) {
  const appliedDate = new Date(student.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  // SECURITY: Sanitize all user-provided values
  const safeName = escapeHtml(String(student.name || 'Unknown').substring(0, 100));
  const safeEmail = student.email ? validateEmailAddress(student.email) : 'unknown@unknown.com';
  const safeId = escapeHtml(String(student.id || '').substring(0, 50));
  const safeCity = escapeHtml(String(student.city || '').substring(0, 100));
  const safeInstitute = escapeHtml(String(student.institute || '').substring(0, 200));

  const html = getAdminApprovalReminderHtml(
    safeName,
    safeEmail,
    safeId,
    safeCity,
    safeInstitute,
    appliedDate
  )

  const text = sanitizeTextContent(
    `Approval Reminder\n\nA student has requested re-approval:\n\nName: ${safeName}\nEmail: ${safeEmail}\nCity: ${safeCity}\nInstitute: ${safeInstitute}\nApplied: ${appliedDate}\n\nPlease review their application at ${getBaseUrl()}/admin/approvals`
  )

  // Send to multiple admin recipients
  const adminEmails = [
    'mridul.malani@hec.edu',
    'ajinkyakamble332@gmail.com'
  ]

  const results = await Promise.allSettled(
    adminEmails.map(email =>
      sendEmail(
        {
          to: email,
          subject: `Approval Reminder: ${safeName} (${safeCity})`,
          html,
          text,
        },
        `Admin Approval Reminder to ${email}`
      )
    )
  )

  // Log any failures
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`[Email] Failed to send reminder to admin ${index + 1}`)
    }
  })

  // Return success if at least one email was sent successfully
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  return {
    success: successCount > 0,
    sentTo: successCount,
    total: adminEmails.length
  }
}
