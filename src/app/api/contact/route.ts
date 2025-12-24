export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { AppError, withErrorHandler, withDatabaseRetry } from '@/lib/error-handler'
import { sendContactFormEmails } from '@/lib/email'
import { sanitizeEmail, sanitizePhoneNumber, sanitizeText, sanitizeUrl } from '@/lib/sanitization'
import { contactFormSchema } from '@/lib/schemas/api'
import { getValidStudentSession, readStudentTokenFromRequest } from '@/lib/student-auth'

/**
 * POST /api/contact
 * Handle contact form submissions
 */
async function handleContactSubmission(req: NextRequest) {
  const body = await req.json()

  // Validate input
  const validatedData = contactFormSchema.strict().parse(body)
  let sanitizedEmail: string
  let sanitizedPhone: string | undefined
  let sanitizedFileUrl: string | undefined
  let sanitizedFileName: string | undefined

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

  if (sanitizedFileUrl) {
    const fileMatch = sanitizedFileUrl.match(/^\/api\/files\/([a-z0-9]+)$/i)
    if (!fileMatch) {
      throw new AppError(400, 'Invalid file attachment URL')
    }

    const token = await readStudentTokenFromRequest(req)
    const session = await getValidStudentSession(token)
    if (!session) {
      throw new AppError(401, 'Authentication required for file attachments')
    }

    const fileRecord = await withDatabaseRetry(async () =>
      db.fileStorage.findUnique({
        where: { id: fileMatch[1] },
        select: { id: true, filename: true, studentId: true },
      })
    )

    if (!fileRecord || fileRecord.studentId !== session.studentId) {
      throw new AppError(403, 'Unauthorized file attachment')
    }

    sanitizedFileName = sanitizeText(fileRecord.filename, 255)
  }

  // Save to database
  const contactMessage = await withDatabaseRetry(async () =>
    db.contactMessage.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        message: sanitizedMessage,
        fileUrl: sanitizedFileUrl,
        fileName: sanitizedFileName,
      },
    })
  )

  // Send email notification (don't await - fire and forget to not block response)
  // Uses centralized email singleton for efficiency
  Promise.resolve(
    sendContactFormEmails({
      ...validatedData,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      message: sanitizedMessage,
      fileUrl: sanitizedFileUrl,
      fileName: sanitizedFileName,
    })
  ).catch((error) => {
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
