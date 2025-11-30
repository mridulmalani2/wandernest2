import 'server-only'
import nodemailer from 'nodemailer'
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
    return 'https://wandernest.com' // Fallback URL
  }
  return baseUrl
}

/**
 * Standalone email transporter for transactional emails ONLY
 * This is separate from the NextAuth email transporter
 */
let transporter: nodemailer.Transporter | null = null

if (config.email.isConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: config.email.host!,
      port: config.email.port,
      secure: config.email.port === 465, // true for 465 (SSL), false for other ports like 587 (STARTTLS)
      auth: {
        user: config.email.user!,
        pass: config.email.pass!,
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
} else {
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
  },
  context: string
): Promise<{ success: boolean; error?: string }> {
  // Mock mode - log instead of sending
  if (!transporter) {
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

  // Production mode - actually send
  try {
    const result = await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
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
      console.log(`✅ Transactional email sent: ${context}`)
    }

    return { success: true }
  } catch (error) {
    console.error(`❌ Error sending transactional email (${context}):`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
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
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Booking Confirmed</title>
        <!--[if mso]>
        <style type="text/css">
          body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
        </style>
        <![endif]-->
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <!-- Main Container -->
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);">

                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      WanderNest
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                      Connect with Local Student Guides
                    </p>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px; text-align: center;">
                    <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">✅</div>
                    <h2 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                      Booking Confirmed!
                    </h2>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                      Your journey begins here
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      ${hasMatches
                        ? 'Great news! Your booking request has been successfully submitted and we\'ve found matching student guides who can help with your trip.'
                        : 'Great news! Your booking request has been successfully created. While we don\'t have immediate matches yet, your request is saved and we\'re actively working to find the perfect student guide for you.'}
                    </p>

                    <!-- Request ID Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; margin: 32px 0; border: 2px solid #bae6fd;">
                      <tr>
                        <td style="padding: 24px; text-align: center;">
                          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #0369a1;">
                            Your Request ID
                          </p>
                          <p style="margin: 0; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace; color: #0c4a6e; letter-spacing: 2px;">
                            ${requestId}
                          </p>
                        </td>
                      </tr>
                    </table>

                    <h3 style="margin: 32px 0 16px 0; font-size: 20px; font-weight: 600; color: #111827;">
                      What Happens Next?
                    </h3>

                    <!-- Timeline Steps - Dynamic based on match status -->
                    ${hasMatches ? `
                    <!-- When matches are found -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px; margin-bottom: 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">1</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Student guides are reviewing your request</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">We've notified ${options?.matchesFound} qualified guides about your trip</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      <tr>
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">2</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Receive acceptance notification</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">You'll get an email when a guide accepts (usually within 24 hours)</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      <tr>
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">3</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Connect and plan your trip</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Get their contact info and start planning your adventure!</p>
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
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px; margin-bottom: 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">1</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Your request is secured</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">We've saved all your trip details and preferences. Your booking request is active in our system.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      <tr>
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">2</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">We're actively searching</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Student guides are continuously joining our platform. We'll match you with the perfect guide as soon as one becomes available.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr><td style="height: 12px;"></td></tr>
                      <tr>
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">3</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Instant notification when matched</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">You'll receive an email immediately when a suitable guide accepts your request. Check your inbox regularly!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    `}

                    <!-- Info Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #92400e;">
                            <strong style="color: #78350f;">💡 Pro Tip:</strong> ${hasMatches
                              ? 'You\'ll receive an email as soon as a guide accepts your request. Keep an eye on your inbox!'
                              : 'Your request remains active for 7 days. We\'ll notify you immediately when a matching guide becomes available. Check your email regularly!'}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 16px 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Questions? We're here to help!
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                      © ${new Date().getFullYear()} WanderNest · Connecting travelers with local student guides worldwide<br>
                      <a href="${getBaseUrl()}" style="color: #6366f1; text-decoration: none;">Visit Dashboard</a>
                    </p>
                  </td>
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
