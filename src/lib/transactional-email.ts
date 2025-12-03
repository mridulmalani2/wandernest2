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
        console.log(`✅ Transactional email sent via Resend: ${context}`)
      }

      return { success: true }
    } catch (error) {
      console.error(`❌ Error sending transactional email via Resend (${context}):`, error)
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
  }
  return { success: true } // Mock sends always "succeed"
}

/**
 * Send booking confirmation email to tourist
 * Standalone implementation - does NOT depend on auth modules
 */
export async function sendBookingConfirmation(
  email: string,
  requestId: string,
  options?: { matchesFound?: number }
): Promise<{ success: boolean; error?: string }> {
  const hasMatches = (options?.matchesFound ?? 0) > 0
  const baseUrl = getBaseUrl()
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Booking Confirmed - TourWiseCo</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
        </style>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%);">
          <tr>
            <td align="center" style="padding: 48px 20px;">

              <!-- Main Container -->
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);">

                <!-- Brand Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #8b5cf6 100%); padding: 40px; text-align: center; position: relative;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <!-- Logo -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 16px auto;">
                            <tr>
                              <td style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); border-radius: 16px; padding: 12px; border: 2px solid rgba(255, 255, 255, 0.25);">
                                <img src="${baseUrl}/images/logo-large.png" alt="TourWiseCo" width="48" height="48" style="display: block; border: 0; border-radius: 8px;" />
                              </td>
                            </tr>
                          </table>
                          <!-- Brand Name -->
                          <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.8px; line-height: 1.2;">
                            TourWiseCo
                          </h1>
                          <p style="margin: 10px 0 0 0; font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.95); letter-spacing: 0.3px;">
                            Your Journey, Your Local Guide
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 56px 40px; text-align: center; border-bottom: 4px solid #047857;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <!-- Success Icon -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px auto;">
                            <tr>
                              <td style="background: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; text-align: center; vertical-align: middle; font-size: 48px; line-height: 80px; border: 3px solid rgba(255, 255, 255, 0.4);">
                                ✅
                              </td>
                            </tr>
                          </table>
                          <h2 style="margin: 0; font-size: 36px; font-weight: 800; color: #ffffff; line-height: 1.2; letter-spacing: -0.5px;">
                            Booking Confirmed!
                          </h2>
                          <p style="margin: 16px 0 0 0; font-size: 17px; font-weight: 500; color: rgba(255, 255, 255, 0.98); line-height: 1.5;">
                            Your adventure starts here 🌍
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <!-- Welcome Message -->
                    <p style="margin: 0 0 28px 0; font-size: 17px; line-height: 1.7; color: #1f2937; font-weight: 400;">
                      ${hasMatches
      ? '🎉 <strong style="font-weight: 600; color: #111827;">Fantastic news!</strong> Your booking request has been successfully submitted, and we\'ve already found qualified student guides who match your trip preferences. They\'re reviewing your request now!'
      : '👋 <strong style="font-weight: 600; color: #111827;">Thank you for choosing TourWiseCo!</strong> Your booking request has been successfully created and saved. While we don\'t have immediate matches yet, rest assured—we\'re actively working to connect you with the perfect local student guide.'}
                    </p>

                    <!-- Request ID Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 16px; margin: 36px 0; border: 2px solid #93c5fd; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);">
                      <tr>
                        <td style="padding: 28px; text-align: center;">
                          <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #1e40af;">
                            📋 Your Confirmation ID
                          </p>
                          <p style="margin: 0; font-size: 26px; font-weight: 800; font-family: 'SF Mono', 'Monaco', 'Courier New', monospace; color: #1e3a8a; letter-spacing: 3px; background: rgba(255, 255, 255, 0.7); padding: 12px 20px; border-radius: 10px; display: inline-block;">
                            ${requestId}
                          </p>
                          <p style="margin: 12px 0 0 0; font-size: 13px; color: #3b82f6; font-weight: 500;">
                            Save this for your records
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Section Divider -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0 24px 0;">
                      <tr>
                        <td style="border-bottom: 2px solid #e5e7eb;"></td>
                      </tr>
                    </table>

                    <h3 style="margin: 0 0 24px 0; font-size: 22px; font-weight: 700; color: #111827; letter-spacing: -0.3px;">
                      What Happens Next? 🚀
                    </h3>

                    <!-- Timeline Steps - Dynamic based on match status -->
                    ${hasMatches ? `
                    <!-- When matches are found -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 14px; border-left: 4px solid #a855f7; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.1);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50" style="vertical-align: top; padding-right: 16px;">
                                <table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">1</td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4;">🎓 Student guides are reviewing your request</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-weight: 400;">We've notified <strong style="color: #4b5563; font-weight: 600;">${options?.matchesFound} qualified guides</strong> about your trip. They're reviewing the details now!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 16px;"></td></tr>
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 14px; border-left: 4px solid #a855f7; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.1);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50" style="vertical-align: top; padding-right: 16px;">
                                <table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">2</td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4;">📬 Receive acceptance notification</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-weight: 400;">You'll get an email when a guide accepts your request—<strong style="color: #4b5563; font-weight: 600;">usually within 24 hours</strong>. Keep an eye on your inbox!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 16px;"></td></tr>
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 14px; border-left: 4px solid #a855f7; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.1);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50" style="vertical-align: top; padding-right: 16px;">
                                <table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">3</td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4;">🗺️ Connect and plan your adventure</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-weight: 400;">Once accepted, you'll receive their contact information and can start planning your unforgettable journey together!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    ` : `
                    <!-- When no matches are found yet - reassuring timeline -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 14px; border-left: 4px solid #a855f7; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.1);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50" style="vertical-align: top; padding-right: 16px;">
                                <table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">1</td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4;">🔒 Your request is secured</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-weight: 400;">We've saved all your trip details and preferences. Your booking request is <strong style="color: #4b5563; font-weight: 600;">active in our system</strong> and ready to match!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 16px;"></td></tr>
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 14px; border-left: 4px solid #a855f7; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.1);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50" style="vertical-align: top; padding-right: 16px;">
                                <table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">2</td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4;">🔍 We're actively searching</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-weight: 400;">Student guides join our platform daily! We'll match you with the <strong style="color: #4b5563; font-weight: 600;">perfect guide</strong> as soon as one becomes available for your destination.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 16px;"></td></tr>
                      <tr>
                        <td style="padding: 20px; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border-radius: 14px; border-left: 4px solid #a855f7; box-shadow: 0 2px 8px rgba(168, 85, 247, 0.1);">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="50" style="vertical-align: top; padding-right: 16px;">
                                <table cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; text-align: center; vertical-align: middle; color: white; font-weight: 800; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">3</td>
                                  </tr>
                                </table>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 700; color: #111827; line-height: 1.4;">⚡ Instant notification when matched</p>
                                <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6; font-weight: 400;">You'll receive an email <strong style="color: #4b5563; font-weight: 600;">immediately</strong> when a suitable guide accepts your request. Check your inbox regularly!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    `}

                    <!-- Pro Tip Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0 0 0; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 5px solid #f59e0b; border-radius: 12px; box-shadow: 0 3px 10px rgba(245, 158, 11, 0.15);">
                      <tr>
                        <td style="padding: 24px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top; padding-right: 12px; font-size: 28px; line-height: 1;">💡</td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #78350f;">
                                  <strong style="color: #92400e; font-weight: 700;">Pro Tip:</strong> ${hasMatches
      ? 'You\'ll receive an email as soon as a guide accepts your request. Make sure to <strong style="font-weight: 600;">check your inbox regularly</strong> (including spam folder) so you don\'t miss any updates!'
      : 'Your request remains active for <strong style="font-weight: 600;">7 days</strong>. We\'ll notify you immediately when a matching guide becomes available. Meanwhile, feel free to <strong style="font-weight: 600;">check your email regularly</strong> for updates!'}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%); padding: 40px; border-top: 2px solid #e5e7eb;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center">
                          <p style="margin: 0 0 20px 0; font-size: 15px; color: #6b7280; text-align: center; font-weight: 500;">
                            Questions? We're here to help! 💬
                          </p>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 24px auto;">
                            <tr>
                              <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 10px; text-align: center; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);">
                                <a href="${baseUrl}" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Visit Your Dashboard →</a>
                              </td>
                            </tr>
                          </table>
                          <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.8;">
                            © ${new Date().getFullYear()} TourWiseCo · Connecting travelers with local student guides worldwide<br>
                            <span style="color: #d1d5db;">━━━━━</span><br>
                            Made with ❤️ for curious explorers
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Email Client Compatibility Spacer -->
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px;">
                <tr>
                  <td style="height: 20px;"></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return await sendTransactionalEmail(
    {
      to: email,
      subject: '✅ Booking Confirmed – Your Adventure Awaits!',
      html,
    },
    'Booking Confirmation'
  )
}
