import 'server-only'
import nodemailer from 'nodemailer'
import type { Student, TouristRequest } from '@prisma/client'
import { config } from '@/lib/config'
import { generateMatchUrls } from '@/lib/auth/tokens'

/**
 * Email system with comprehensive error handling
 *
 * Features:
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
    return 'https://wandernest.com' // Fallback URL
  }
  return baseUrl
}

/**
 * Email transporter with configuration validation
 */
let transporter: nodemailer.Transporter | null = null

if (config.email.isConfigured) {
  try {
    transporter = nodemailer.createTransport({
      host: config.email.host!,
      port: config.email.port,
      secure: false, // Use TLS
      auth: {
        user: config.email.user!,
        pass: config.email.pass!,
      },
      // Add timeout to prevent hanging
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
    })

    if (config.app.isDevelopment) {
      console.log('✅ Email transporter initialized')
    }
  } catch (error) {
    console.error('❌ Failed to initialize email transporter:', error)
    transporter = null
  }
} else {
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
  },
  context: string
): Promise<{ success: boolean; error?: string }> {
  // Mock mode - log instead of sending
  if (!transporter) {
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

  // Production mode - actually send
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    if (config.app.isDevelopment) {
      console.log(`✅ Email sent: ${context} to ${options.to}`)
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error(`❌ Failed to send email: ${context}`)
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

export async function sendBookingConfirmation(
  email: string,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
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
                      Great news! Your booking request has been successfully submitted and we're now connecting you with the perfect local student guides.
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

                    <!-- Timeline Steps -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 16px; background: #f9fafb; border-radius: 10px; margin-bottom: 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="40" style="vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">1</div>
                              </td>
                              <td style="padding-left: 12px; vertical-align: top;">
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Local guides review your request</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">We're matching you with students who love your chosen destination</p>
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
                                <p style="margin: 0; font-size: 15px; font-weight: 600; color: #111827;">Receive guide proposals</p>
                                <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">Interested guides will accept your request</p>
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

                    <!-- Info Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #92400e;">
                            <strong style="color: #78350f;">💡 Pro Tip:</strong> You'll receive an email as soon as a guide accepts your request. Keep an eye on your inbox!
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
): Promise<{ success: boolean; error?: string }> {
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const endDate = dates.end
    ? new Date(dates.end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  const acceptUrl = `${getBaseUrl()}/student/requests/${touristRequest.id}/accept`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>New Direct Request</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);">

                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      WanderNest
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                      Student Guide Opportunities
                    </p>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 48px 40px; text-align: center;">
                    <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">🌟</div>
                    <h2 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                      You've Been Requested!
                    </h2>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                      A tourist specifically chose you for ${touristRequest.city}
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">
                      Hi ${student.name}! 👋
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      Great news! A tourist has <strong>selected you specifically</strong> as their guide. They found your profile and want you to show them around!
                    </p>

                    <!-- Trip Details Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin: 24px 0;">
                      <tr>
                        <td style="padding: 24px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  📍 Location
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.city}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  📅 Dates
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${startDate}${endDate ? ` - ${endDate}` : ''}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  ⏰ Preferred Time
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.preferredTime}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  👥 Group Size
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.numberOfGuests} guests (${touristRequest.groupType})
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  🎯 Service Type
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.serviceType === 'itinerary_help' ? 'Itinerary Help (Online)' : 'Guided Experience (In-Person)'}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; ${touristRequest.tripNotes ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  💡 Interests
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.interests.join(', ')}
                                </p>
                              </td>
                            </tr>
                            ${touristRequest.tripNotes ? `
                            <tr>
                              <td style="padding: 12px 0;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  📝 Special Notes
                                </p>
                                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.5;">
                                  ${touristRequest.tripNotes}
                                </p>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Urgency Banner -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #92400e;">
                            <strong style="color: #78350f;">⚡ Act Fast!</strong> This may also have been sent to other guides. First to accept wins!
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0;">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                <a href="${acceptUrl}" style="display: inline-block; padding: 18px 48px; font-size: 17px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                                  ✅ Accept This Request
                                </a>
                              </td>
                            </tr>
                            <tr><td style="height: 16px;"></td></tr>
                            <tr>
                              <td style="border-radius: 12px; background: #6b7280;">
                                <a href="${getBaseUrl()}/student/dashboard" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                                  View in Dashboard
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Reminders -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0c4a6e;">
                            Important Reminders
                          </h3>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ Once you accept, you'll receive the tourist's contact details
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ First to accept wins (if multiple guides received this)
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ Payment and meeting details are arranged directly with the tourist
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ Maintain professional conduct and high service standards
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
                  <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Questions? We're here to help!
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                      © ${new Date().getFullYear()} WanderNest · Connecting travelers with local student guides worldwide
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
): Promise<{ success: boolean; error?: string }> {
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const endDate = dates.end
    ? new Date(dates.end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    : null

  // Generate secure accept/decline URLs using signed tokens
  const { acceptUrl, declineUrl } = generateMatchUrls(
    getBaseUrl(),
    touristRequest.id,
    student.id,
    selectionId
  )

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>New Match Opportunity</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);">

                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      WanderNest
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                      Student Guide Opportunities
                    </p>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 48px 40px; text-align: center;">
                    <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">🎉</div>
                    <h2 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                      New Match Opportunity!
                    </h2>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                      ${touristRequest.serviceType === 'itinerary_help' ? 'Itinerary Consultation' : 'Guided Experience'} in ${touristRequest.city}
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">
                      Hi ${student.name}! 👋
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      You've been automatically matched with a tourist based on your profile, location, and availability! Review the details below:
                    </p>

                    <!-- Trip Details Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin: 24px 0;">
                      <tr>
                        <td style="padding: 24px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  📍 Location
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.city}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  📅 Dates
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${startDate}${endDate ? ` - ${endDate}` : ''}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  ⏰ Preferred Time
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.preferredTime}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  👥 Group Size
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.numberOfGuests} guests (${touristRequest.groupType})
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  🎯 Service Type
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.serviceType === 'itinerary_help' ? 'Itinerary Help (Online)' : 'Guided Experience (In-Person)'}
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 12px 0; ${touristRequest.tripNotes ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  💡 Interests
                                </p>
                                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                                  ${touristRequest.interests.join(', ')}
                                </p>
                              </td>
                            </tr>
                            ${touristRequest.tripNotes ? `
                            <tr>
                              <td style="padding: 12px 0;">
                                <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">
                                  📝 Special Notes
                                </p>
                                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.5;">
                                  ${touristRequest.tripNotes}
                                </p>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Urgency Banner -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #92400e;">
                            <strong style="color: #78350f;">⚡ Act Fast!</strong> This request was sent to multiple guides. The first one to accept gets the opportunity!
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- CTA Buttons -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0;">
                      <tr>
                        <td align="center">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                <a href="${acceptUrl}" style="display: inline-block; padding: 18px 48px; font-size: 17px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                                  ✅ Accept This Request
                                </a>
                              </td>
                            </tr>
                            <tr><td style="height: 16px;"></td></tr>
                            <tr>
                              <td style="border-radius: 12px; background: #6b7280;">
                                <a href="${declineUrl}" style="display: inline-block; padding: 14px 36px; font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                                  Decline (Let Others Respond)
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- What Happens Next -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0c4a6e;">
                            What Happens If You Accept?
                          </h3>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ You'll instantly receive the tourist's contact details (email, phone, WhatsApp)
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ The tourist will receive your contact information
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ All other guides will be notified the spot is filled
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #0c4a6e;">
                                  ✅ You arrange payment and final details directly with the tourist
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Reminders -->
                    <h3 style="margin: 32px 0 16px 0; font-size: 18px; font-weight: 700; color: #111827;">
                      Important Reminders
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                            ✅ Maintain professional conduct and high service standards
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                            ✅ Respond promptly to tourist messages
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                            ✅ Confirm meeting details 24 hours before the trip
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">
                            ✅ No-shows hurt your reliability score and future matching
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 32px 0 0 0; font-size: 13px; color: #9ca3af; font-style: italic;">
                      This invitation link expires in 72 hours. Accept or decline using the buttons above.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Questions? We're here to help!
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                      © ${new Date().getFullYear()} WanderNest · Connecting travelers with local student guides worldwide
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
): Promise<{ success: boolean; error?: string }> {
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Guide Accepted!</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);">

                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      WanderNest
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                      Your Travel Connection
                    </p>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px; text-align: center;">
                    <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">🎉</div>
                    <h2 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                      Your Guide Accepted!
                    </h2>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                      Get ready for an amazing experience in ${touristRequest.city}
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      Excellent news! A local student guide has accepted your request for <strong>${touristRequest.city}</strong> on <strong>${startDate}</strong>. Your adventure is about to begin!
                    </p>

                    <!-- Student Guide Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; border: 2px solid #10b981; margin: 24px 0;">
                      <tr>
                        <td style="padding: 32px 24px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #065f46;">
                            🎓 Your Local Guide
                          </h3>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 120px; font-size: 13px; font-weight: 600; color: #047857;">Name</td>
                                    <td style="font-size: 15px; font-weight: 600; color: #064e3b;">${student.name}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 120px; font-size: 13px; font-weight: 600; color: #047857;">University</td>
                                    <td style="font-size: 15px; color: #065f46;">${student.institute}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(16, 185, 129, 0.2);">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 120px; font-size: 13px; font-weight: 600; color: #047857;">Nationality</td>
                                    <td style="font-size: 15px; color: #065f46;">${student.nationality}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; ${student.averageRating ? 'border-bottom: 1px solid rgba(16, 185, 129, 0.2);' : ''}">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 120px; font-size: 13px; font-weight: 600; color: #047857;">Languages</td>
                                    <td style="font-size: 15px; color: #065f46;">${student.languages.join(', ')}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ${student.averageRating ? `
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="width: 120px; font-size: 13px; font-weight: 600; color: #047857;">Rating</td>
                                    <td style="font-size: 15px; color: #065f46;">⭐ ${student.averageRating.toFixed(1)}/5 (${student.tripsHosted} trips hosted)</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Contact Information -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f0f9ff; border-radius: 12px; border: 2px solid #3b82f6; margin: 24px 0;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1e40af;">
                            📞 Contact Information
                          </h3>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 6px 0;">
                                <p style="margin: 0; font-size: 15px; color: #1e3a8a;">
                                  <strong style="display: inline-block; width: 100px;">Email:</strong> <a href="mailto:${student.email}" style="color: #2563eb; text-decoration: none;">${student.email}</a>
                                </p>
                              </td>
                            </tr>
                            ${(student as any).whatsapp ? `
                            <tr>
                              <td style="padding: 6px 0;">
                                <p style="margin: 0; font-size: 15px; color: #1e3a8a;">
                                  <strong style="display: inline-block; width: 100px;">WhatsApp:</strong> ${(student as any).whatsapp}
                                </p>
                              </td>
                            </tr>
                            ` : ''}
                            ${(student as any).phone ? `
                            <tr>
                              <td style="padding: 6px 0;">
                                <p style="margin: 0; font-size: 15px; color: #1e3a8a;">
                                  <strong style="display: inline-block; width: 100px;">Phone:</strong> ${(student as any).phone}
                                </p>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Next Steps -->
                    <h3 style="margin: 32px 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">
                      What's Next?
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">1</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Reach out within 24-48 hours</strong> to confirm the exact meeting point and time
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">2</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Agree on final terms</strong> including payment amount and method
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">3</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Confirm your meeting</strong> at least 24 hours before your trip
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">4</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Enjoy your experience</strong> and leave a review afterward!
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Important Notice -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #78350f;">
                            ⚠️ Important Reminders
                          </p>
                          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                            • WanderNest is a connector platform – we don't handle payments<br>
                            • Arrange all payments directly with your guide<br>
                            • Meet in public places for your first interaction<br>
                            • Report any concerns to our support team
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Have a wonderful trip! 🌍
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                      © ${new Date().getFullYear()} WanderNest · Connecting travelers with local student guides worldwide
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
): Promise<{ success: boolean; error?: string }> {

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
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

                <!-- Hero Section -->
                <tr>
                  <td style="padding: 48px 40px 32px 40px; text-align: center;">
                    <div style="font-size: 56px; line-height: 1; margin-bottom: 24px;">🔐</div>
                    <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: #111827;">
                      Verify Your Email
                    </h2>
                    <p style="margin: 0; font-size: 16px; color: #6b7280; line-height: 1.5;">
                      Enter this code to continue with your booking
                    </p>
                  </td>
                </tr>

                <!-- Verification Code -->
                <tr>
                  <td style="padding: 0 40px 48px 40px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-radius: 16px; border: 3px solid #6366f1; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);">
                      <tr>
                        <td style="padding: 40px 32px; text-align: center;">
                          <p style="margin: 0 0 16px 0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5;">
                            Your Verification Code
                          </p>
                          <div style="font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #4338ca; font-family: 'Courier New', Courier, monospace; margin: 0;">
                            ${code}
                          </div>
                          <p style="margin: 20px 0 0 0; font-size: 14px; color: #6366f1; font-weight: 500;">
                            Valid for 10 minutes
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Security Tips -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
                      <tr>
                        <td style="padding: 20px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
                          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #92400e;">
                            🔒 Security Tips
                          </p>
                          <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #92400e;">
                            • Never share this code with anyone<br>
                            • WanderNest will never ask for your code via phone or email<br>
                            • If you didn't request this, please ignore this email
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Having trouble? Contact our support team
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                      © ${new Date().getFullYear()} WanderNest · Connecting travelers with local student guides worldwide
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

  return await sendEmail(
    {
      to: email,
      subject: '🔐 Your WanderNest Verification Code',
      html,
    },
    'Verification Email'
  )
}

export async function sendStudentConfirmation(
  student: any,
  touristRequest: any
): Promise<{ success: boolean; error?: string }> {
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Tourist Contact Details</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);">

                <!-- Brand Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                      WanderNest
                    </h1>
                    <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                      Student Guide Platform
                    </p>
                  </td>
                </tr>

                <!-- Hero Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px; text-align: center;">
                    <div style="font-size: 64px; line-height: 1; margin-bottom: 16px;">🎉</div>
                    <h2 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; line-height: 1.2;">
                      Congratulations!
                    </h2>
                    <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.95);">
                      You've got the job – Time to connect!
                    </p>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 48px 40px;">
                    <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #111827;">
                      Hi ${student.name}! 🎓
                    </p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #374151;">
                      You've successfully accepted the request! Here are the tourist's contact details so you can coordinate your trip together.
                    </p>

                    <!-- Tourist Info Card -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 12px; border: 2px solid #3b82f6; margin: 24px 0;">
                      <tr>
                        <td style="padding: 32px 24px;">
                          <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1e40af;">
                            🧳 Tourist Information
                          </h3>
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">Contact Email</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #1e3a8a;">
                                  <a href="mailto:${touristRequest.email}" style="color: #2563eb; text-decoration: none;">${touristRequest.email}</a>
                                </p>
                              </td>
                            </tr>
                            ${touristRequest.phone ? `
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">Phone Number</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #1e3a8a;">${touristRequest.phone}</p>
                              </td>
                            </tr>
                            ` : ''}
                            ${touristRequest.whatsapp ? `
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">WhatsApp</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #1e3a8a;">${touristRequest.whatsapp}</p>
                              </td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">Preferred Contact</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #1e3a8a;">${touristRequest.contactMethod}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid rgba(59, 130, 246, 0.2);">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">Trip Date</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #1e3a8a;">${startDate}</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e40af;">Group Details</p>
                                <p style="margin: 4px 0 0 0; font-size: 15px; color: #1e3a8a;">${touristRequest.numberOfGuests} guests · ${touristRequest.groupType}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Steps -->
                    <h3 style="margin: 32px 0 16px 0; font-size: 20px; font-weight: 700; color: #111827;">
                      Next Steps to Success
                    </h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">1</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Reach out immediately</strong> – Contact them within a few hours using their preferred method
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">2</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Confirm key details</strong> – Exact meeting point, time, final price, and payment method
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">3</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Prepare an amazing experience</strong> – Plan activities, routes, and interesting spots
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                              <td width="32" style="vertical-align: top; padding-top: 2px;">
                                <div style="width: 24px; height: 24px; background: #10b981; border-radius: 50%; color: white; text-align: center; line-height: 24px; font-weight: 700; font-size: 13px;">4</div>
                              </td>
                              <td style="padding-left: 12px;">
                                <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #374151;">
                                  <strong>Show up on time and shine</strong> – Punctuality leads to great reviews and future opportunities!
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Success Tip -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; border-radius: 8px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #92400e;">
                            <strong style="color: #78350f;">💡 Pro Tip:</strong> This is your chance to showcase ${touristRequest.city} and build your reputation! Provide excellent service, be professional, and have fun. Great experiences lead to amazing reviews!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                      Good luck – You've got this! 🌟
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                      © ${new Date().getFullYear()} WanderNest · Empowering student guides worldwide
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

  return await sendEmail(
    {
      to: student.email,
      subject: "🎉 You Got the Job! Here's Your Tourist's Contact Info",
      html,
    },
    'Student Confirmation'
  )
}

/**
 * Send contact form emails (admin notification + user confirmation)
 * Reuses the singleton transporter for efficiency
 */
export async function sendContactFormEmails(data: {
  name: string
  email: string
  phone?: string
  message: string
  fileUrl?: string
  fileName?: string
}): Promise<{ success: boolean; error?: string }> {
  // Admin notification email
  const adminHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .detail-box {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .detail-value {
            color: #111827;
          }
          .message-box {
            background: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">📬 New Contact Form Submission</h1>
        </div>
        <div class="content">
          <h2>Contact Details</h2>

          <div class="detail-box">
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">${data.name}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value"><a href="mailto:${data.email}">${data.email}</a></div>
            </div>
            ${data.phone ? `
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${data.phone}</div>
            </div>
            ` : ''}
            ${data.fileUrl ? `
            <div class="detail-row">
              <div class="detail-label">Attachment:</div>
              <div class="detail-value"><a href="${data.fileUrl}">${data.fileName || 'Download File'}</a></div>
            </div>
            ` : ''}
          </div>

          <h3>Message:</h3>
          <div class="message-box">
            ${data.message.replace(/\n/g, '<br>')}
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Submitted on ${new Date().toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </body>
    </html>
  `

  // User confirmation email
  const confirmationHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .success-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="success-icon">✅</div>
          <h1 style="margin: 0;">Thank You for Contacting Us!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.name},</h2>
          <p>We've received your message and will get back to you as soon as possible.</p>

          <p>Here's a copy of what you sent:</p>
          <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${data.message}</p>
          </div>

          <p>Our team typically responds within 24-48 hours. If your inquiry is urgent, please include that in your message or try reaching out through our alternative contact methods.</p>

          <p>Best regards,<br>The TourWiseCo Team</p>
        </div>
      </body>
    </html>
  `

  // Mock mode - log instead of sending
  if (!transporter) {
    if (config.app.isDevelopment) {
      console.log('\n===========================================')
      console.log('📧 MOCK EMAIL - Contact Form')
      console.log('===========================================')
      console.log(`From: ${data.name} <${data.email}>`)
      console.log(`Phone: ${data.phone || 'Not provided'}`)
      console.log(`Message: ${data.message}`)
      if (data.fileUrl) {
        console.log(`File: ${data.fileName} (${data.fileUrl})`)
      }
      console.log('===========================================\n')
    }
    return { success: true }
  }

  // Send both emails using the singleton transporter
  try {
    // Send to admin
    await transporter.sendMail({
      from: config.email.from,
      to: config.email.contactEmail,
      replyTo: data.email,
      subject: `📬 New Contact Form: ${data.name}`,
      html: adminHtml,
    })

    // Send confirmation to user
    await transporter.sendMail({
      from: config.email.from,
      to: data.email,
      subject: '✅ We received your message - TourWiseCo',
      html: confirmationHtml,
    })

    if (config.app.isDevelopment) {
      console.log(`✅ Contact form emails sent to admin and ${data.email}`)
    }

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    console.error('❌ Failed to send contact form emails')
    console.error(`   Error: ${errorMessage}`)

    if (config.app.isDevelopment) {
      console.error('   Full error:', error)
    }

    return {
      success: false,
      error: errorMessage,
    }
  }
}
