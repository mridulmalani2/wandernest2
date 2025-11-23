export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { z } from 'zod'
import { withErrorHandler, withDatabaseRetry } from '@/lib/error-handler'
import { sendContactFormEmails } from '@/lib/email'

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
 * POST /api/contact
 * Handle contact form submissions
 */
async function handleContactSubmission(req: NextRequest) {
  const db = requireDatabase()

  const body = await req.json()

  // Validate input
  const validatedData = contactSchema.parse(body)
  const prisma = requireDatabase()


  // Save to database
  const contactMessage = await withDatabaseRetry(async () =>
    db.contactMessage.create({
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
  // Uses centralized email singleton for efficiency
  sendContactFormEmails(validatedData).catch((error) => {
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
