import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

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
export async function GET() {
  const emailConfig = {
    isConfigured: config.email.isConfigured,
    variables: {
      EMAIL_HOST: config.email.host ? '✅ Set' : '❌ Not set',
      EMAIL_PORT: config.email.port,
      EMAIL_USER: config.email.user ? '✅ Set' : '❌ Not set',
      EMAIL_PASS: config.email.pass ? '✅ Set' : '❌ Not set',
      EMAIL_FROM: config.email.from,
    },
    smtpDetails: {
      host: config.email.host || 'Not configured',
      port: config.email.port,
      secure: config.email.port === 465,
      user: config.email.user ? `${config.email.user.substring(0, 3)}***` : 'Not set',
    },
    status: config.email.isConfigured
      ? '✅ Email is configured - magic link authentication should work'
      : '❌ Email is NOT configured - magic link authentication will FAIL',
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
    nextSteps: config.email.isConfigured
      ? [
          'Try signing in with magic link',
          'Check Vercel logs for SMTP connection errors if it fails',
          'Verify SMTP credentials are correct',
          'Ensure firewall allows outbound SMTP connections',
        ]
      : [
          'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          'Add the required EMAIL_* variables',
          'For Gmail: Use an App Password (not your regular password)',
          'Deploy the changes',
        ],
  }

  return NextResponse.json(emailConfig, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * POST /api/admin/test-email
 *
 * Send a test email to verify SMTP configuration.
 * Requires a recipient email in the request body.
 */
export async function POST(request: Request) {
  try {
    const { to } = await request.json()

    if (!to || typeof to !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "to" field in request body' },
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

    console.log('📧 Sending test email...')
    console.log('   To:', to)
    console.log('   From:', config.email.from)
    console.log('   SMTP Host:', config.email.host)

    const result = await transport.sendMail({
      to,
      from: config.email.from,
      subject: 'Test Email - WanderNest Email Configuration',
      text: `This is a test email from WanderNest to verify your email configuration is working correctly.\n\nIf you received this email, your SMTP settings are configured properly!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>✅ Email Configuration Test Successful</h2>
          <p>This is a test email from WanderNest to verify your email configuration is working correctly.</p>
          <p><strong>If you received this email, your SMTP settings are configured properly!</strong></p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Configuration Details:<br>
            SMTP Host: ${config.email.host}<br>
            SMTP Port: ${config.email.port}<br>
            From: ${config.email.from}
          </p>
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
          details: `Recipients failed: ${failed.join(', ')}`,
          result,
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
      to,
      from: config.email.from,
    })
  } catch (error) {
    console.error('❌ Error sending test email:', error)

    const errorDetails: any = {
      success: false,
      error: 'Failed to send test email',
    }

    if (error instanceof Error) {
      errorDetails.message = error.message
      errorDetails.name = error.name
      if ('code' in error) {
        errorDetails.code = (error as any).code
      }
      if ('command' in error) {
        errorDetails.command = (error as any).command
      }
    }

    return NextResponse.json(errorDetails, { status: 500 })
  }
}
