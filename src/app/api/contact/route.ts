export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { withErrorHandler, withDatabaseRetry } from '@/lib/error-handler'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required').max(2000),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
})

/**
 * Send email notification for new contact form submission
 */
async function sendContactNotification(data: {
  name: string
  email: string
  phone?: string
  message: string
  fileUrl?: string
  fileName?: string
}): Promise<void> {
  // Import email utilities
  const nodemailer = await import('nodemailer')

  // Mock mode - only enabled in development OR when email is not configured
  const MOCK_EMAIL_MODE = process.env.NODE_ENV !== 'production' || !process.env.EMAIL_HOST

  if (MOCK_EMAIL_MODE) {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n===========================================')
      console.log('📧 MOCK EMAIL - Contact Form Submission')
      console.log('===========================================')
      console.log(`From: ${data.name} <${data.email}>`)
      console.log(`Phone: ${data.phone || 'Not provided'}`)
      console.log(`Message: ${data.message}`)
      if (data.fileUrl) {
        console.log(`File: ${data.fileName} (${data.fileUrl})`)
      }
      console.log('===========================================\n')
    }
    return
  }

  const transporter = nodemailer.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

  const html = `
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

  // Send to admin/support email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.CONTACT_EMAIL || process.env.EMAIL_FROM, // Fallback to EMAIL_FROM if CONTACT_EMAIL not set
    replyTo: data.email,
    subject: `📬 New Contact Form: ${data.name}`,
    html,
  })

  // Send confirmation to user
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

          <p>Best regards,<br>The WanderNest Team</p>
        </div>
      </body>
    </html>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.email,
    subject: '✅ We received your message - WanderNest',
    html: confirmationHtml,
  })
}

/**
 * POST /api/contact
 * Handle contact form submissions
 */
async function handleContactSubmission(req: NextRequest) {
  const body = await req.json()

  // Validate input
  const validatedData = contactSchema.parse(body)

  // Save to database
  const contactMessage = await withDatabaseRetry(async () =>
    prisma.contactMessage.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        message: validatedData.message,
        fileUrl: validatedData.fileUrl,
        fileName: validatedData.fileName,
      },
    })
  )

  // Send email notification (don't await - fire and forget to not block response)
  sendContactNotification(validatedData).catch((error) => {
    console.error('Failed to send contact notification email:', error)
    // Don't throw - we still want to return success since message was saved
  })

  return NextResponse.json({
    success: true,
    message: 'Your message has been received. We\'ll get back to you soon!',
    id: contactMessage.id,
  })
}

export const POST = withErrorHandler(handleContactSubmission, 'POST /api/contact')
