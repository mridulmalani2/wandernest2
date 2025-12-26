import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { verifyAdmin } from '@/lib/api-auth'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/test-email
 *
 * Diagnostic endpoint to check email configuration status.
 * This helps administrators diagnose magic link authentication issues.
 *
 * Returns detailed information about:
 * - Whether email is configured
 * - Which environment variables are set
 * - SMTP connection details (without exposing secrets)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emailConfig = {
      isConfigured: config.email.isConfigured,
      status: config.email.isConfigured
        ? 'configured'
        : 'not_configured',
      requiredActions: config.email.isConfigured
        ? []
        : [
          'Set EMAIL_HOST in Vercel environment variables (e.g., smtp.gmail.com)',
          'Set EMAIL_PORT in Vercel environment variables (e.g., 587)',
          'Set EMAIL_USER in Vercel environment variables (your SMTP username)',
          'Set EMAIL_PASS in Vercel environment variables (your SMTP password/app password)',
          'Set EMAIL_FROM in Vercel environment variables (optional, has default)',
          'Redeploy the application after setting variables',
        ],
    }

    return NextResponse.json(emailConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load email configuration' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/test-email
 *
 * Send a test email to verify SMTP configuration.
 * Requires a recipient email in the request body.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)

    if (!authResult.authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to } = await request.json()

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!to || typeof to !== 'string' || !emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email address' },
        { status: 400 }
      )
    }

    // Check if email is configured
    if (!config.email.isConfigured) {
      return NextResponse.json(
        {
          error: 'Email is not configured',
          details: 'EMAIL_HOST, EMAIL_USER, and EMAIL_PASS must be set',
          isConfigured: false,
        },
        { status: 503 }
      )
    }

    // Dynamically import nodemailer to avoid loading it if not needed
    const nodemailer = (await import('nodemailer')).default

    const transport = nodemailer.createTransport({
      host: config.email.host!,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user!,
        pass: config.email.pass!,
      },
      tls: {
        rejectUnauthorized: config.app.isProduction,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    })

    const redactedRecipient = to.replace(/(^.).*(@.*$)/, '$1***$2')
    console.log('📧 Sending test email...')
    console.log('   To:', redactedRecipient)

    const result = await transport.sendMail({
      to,
      from: config.email.from,
      subject: 'Test Email - TourWiseCo Email Configuration',
      text: `This is a test email from TourWiseCo to verify your email configuration is working correctly.\n\nIf you received this email, your SMTP settings are configured properly!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Configuration Test Successful</h2>
          <p>This is a test email from TourWiseCo to verify your email configuration is working correctly.</p>
          <p><strong>If you received this email, your SMTP settings are configured properly!</strong></p>
        </div>
      `,
    })

    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
      console.error('❌ Test email failed to send:', failed.join(', '))
      return NextResponse.json(
        {
          success: false,
          error: 'Email failed to send',
          details: 'One or more recipients failed',
        },
        { status: 500 }
      )
    }

    console.log('✅ Test email sent successfully')
    console.log('   Message ID:', result.messageId)

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Error sending test email:', errorMessage)

    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}
