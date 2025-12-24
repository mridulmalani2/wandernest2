export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { z } from 'zod'
import { AppError, withErrorHandler, withDatabaseRetry } from '@/lib/error-handler'
import { sendContactFormEmails } from '@/lib/email'
import { sanitizeEmail, sanitizePhoneNumber, sanitizeText, sanitizeUrl } from '@/lib/sanitization'

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  message: z.string().min(1, 'Message is required').max(2000),
  fileUrl: z.string().url().optional(),
}).strip()

/**
 * POST /api/contact
 * Handle contact form submissions
 */
async function handleContactSubmission(req: NextRequest) {
  const body = await req.json()

  // Validate input
  const validatedData = contactSchema.parse(body)
  let sanitizedEmail: string
  let sanitizedPhone: string | undefined
  let sanitizedFileUrl: string | undefined

  try {
    sanitizedEmail = sanitizeEmail(validatedData.email)
    sanitizedPhone = validatedData.phone ? sanitizePhoneNumber(validatedData.phone) : undefined
    sanitizedFileUrl = validatedData.fileUrl ? sanitizeUrl(validatedData.fileUrl) : undefined
  } catch (error) {
    throw new AppError(400, 'Invalid input provided')
  }

  const sanitizedName = sanitizeText(validatedData.name, 100)
  const sanitizedMessage = sanitizeText(validatedData.message, 2000)

  const db = requireDatabase()


  // Save to database
  const contactMessage = await withDatabaseRetry(async () =>
    db.contactMessage.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        fileUrl: sanitizedFileUrl,
      },
    })
  )

  // Send email notification (don't await - fire and forget to not block response)
  // Uses centralized email singleton for efficiency
  sendContactFormEmails({
    ...validatedData,
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    message: sanitizedMessage,
  }).catch((error) => {
    console.error('Failed to send contact form emails:', error)
    // Don't throw - we still want to return success since message was saved
  })

  return NextResponse.json({
    success: true,
    message: 'Your message has been received. We\'ll get back to you soon!',
    id: contactMessage.id,
  })
}

export const POST = withErrorHandler(handleContactSubmission, 'POST /api/contact')
