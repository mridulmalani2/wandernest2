// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic'
export const maxDuration = 10

import { NextRequest, NextResponse } from 'next/server'
import { requireDatabase } from '@/lib/prisma'
import { verifyMatchToken } from '@/lib/auth/tokens'
import {
  sendTouristAcceptanceNotification,
  sendStudentConfirmation,
} from '@/lib/email'

/**
 * GET /api/student/match/respond?token=xxx
 *
 * Unified endpoint for accepting or declining match invitations
 * Uses secure signed tokens to verify authenticity
 *
 * Flow:
 * 1. Verify token signature and expiry
 * 2. Check that RequestSelection is still pending
 * 3. If ACCEPT:
 *    - Update RequestSelection to 'accepted'
 *    - Update TouristRequest to 'ACCEPTED' and set assignedStudentId
 *    - Reject all other pending selections for the same request
 *    - Increment student's tripsHosted counter
 *    - Send contact details to both tourist and student
 * 4. If DECLINE:
 *    - Update RequestSelection to 'rejected'
 *    - Keep TouristRequest in 'MATCHED' state (other students can still accept)
 * 5. Redirect to success/failure page
 */
export async function GET(req: NextRequest) {
  const db = requireDatabase()

  try {
    // Get token from query params
    const searchParams = req.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invalid Link</h1>
            <p>This link is missing required parameters.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Verify and decode token
    const payload = verifyMatchToken(token)

    if (!payload) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Invalid or Expired Link</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>⚠️ Invalid or Expired Link</h1>
            <p>This invitation link is either invalid or has expired (links expire after 72 hours).</p>
            <p>If you received this link recently, please contact the tourist directly or reach out to support.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
        `,
        {
          status: 401,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    const { requestId, studentId, selectionId, action } = payload

    console.log(
      `[match/respond] Processing ${action} for request ${requestId}, student ${studentId}, selection ${selectionId}`
    )

    // Fetch the RequestSelection
    const selection = await db.requestSelection.findUnique({
      where: { id: selectionId },
      include: {
        touristRequest: true,
        student: true,
      },
    })

    if (!selection) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Match Not Found</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Match Not Found</h1>
            <p>This match invitation could not be found in our system.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Verify that IDs match (prevent token tampering)
    if (
      selection.requestId !== requestId ||
      selection.studentId !== studentId
    ) {
      console.error(
        `[match/respond] Token mismatch: expected requestId=${selection.requestId}, studentId=${selection.studentId}; ` +
          `got requestId=${requestId}, studentId=${studentId}`
      )

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Invalid Token</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>⚠️ Invalid Token</h1>
            <p>The token does not match the expected data. This may indicate tampering.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
        `,
        {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Check if selection is still pending
    if (selection.status !== 'pending') {
      const statusMessages: Record<string, string> = {
        accepted: `You've already accepted this request.`,
        rejected: `You've already declined this request.`,
      }

      const message =
        statusMessages[selection.status] ||
        `This match has already been processed (status: ${selection.status}).`

      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Already Processed</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>ℹ️ Already Processed</h1>
            <p>${message}</p>
            <p><a href="/student/dashboard">Go to Dashboard</a></p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Check if the tourist request has already been accepted by someone else
    if (selection.touristRequest.status === 'ACCEPTED') {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Already Matched</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>😔 Too Late</h1>
            <p>Sorry, another student has already accepted this request.</p>
            <p>Keep an eye out for future opportunities!</p>
            <p><a href="/student/dashboard">Go to Dashboard</a></p>
          </body>
        </html>
        `,
        {
          status: 409,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }

    // Process the action
    if (action === 'accept') {
      // ACCEPT FLOW: Update status, send emails, close other selections
      await db.$transaction(async (tx) => {
        // 1. Update this RequestSelection to 'accepted'
        await tx.requestSelection.update({
          where: { id: selectionId },
          data: {
            status: 'accepted',
            acceptedAt: new Date(),
          },
        })

        console.log(`[match/respond] Updated RequestSelection ${selectionId} to 'accepted'`)

        // 2. Reject all other pending selections for this request
        const rejectedCount = await tx.requestSelection.updateMany({
          where: {
            requestId,
            id: { not: selectionId },
            status: 'pending',
          },
          data: { status: 'rejected' },
        })

        console.log(
          `[match/respond] Rejected ${rejectedCount.count} other pending selections for request ${requestId}`
        )

        // 3. Update TouristRequest to 'ACCEPTED' and set assignedStudentId
        await tx.touristRequest.update({
          where: { id: requestId },
          data: {
            status: 'ACCEPTED',
            assignedStudentId: studentId,
          },
        })

        console.log(`[match/respond] Updated TouristRequest ${requestId} to 'ACCEPTED'`)

        // 4. Increment student's tripsHosted counter
        await tx.student.update({
          where: { id: studentId },
          data: {
            tripsHosted: { increment: 1 },
          },
        })

        console.log(`[match/respond] Incremented tripsHosted for student ${studentId}`)
      })

      // 5. Send contact details to both tourist and student (outside transaction)
      console.log(`[match/respond] Sending contact emails for request ${requestId}`)

      // Send email to tourist with student contact details
      const touristEmailResult = await sendTouristAcceptanceNotification(
        selection.touristRequest.email,
        selection.student,
        selection.touristRequest
      )

      if (!touristEmailResult.success) {
        console.error(
          `[match/respond] Failed to send tourist email:`,
          touristEmailResult.error
        )
      }

      // Send email to student with tourist contact details
      const studentEmailResult = await sendStudentConfirmation(
        selection.student,
        selection.touristRequest
      )

      if (!studentEmailResult.success) {
        console.error(
          `[match/respond] Failed to send student email:`,
          studentEmailResult.error
        )
      }

      // Success! Show confirmation page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Match Accepted!</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 50px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
              }
              .card {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              }
              h1 { margin-top: 0; }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🎉 Match Accepted!</h1>
              <p><strong>Congratulations!</strong> You've successfully accepted this trip request.</p>
              <p>We've sent you an email with the tourist's contact details:</p>
              <ul style="text-align: left; display: inline-block;">
                <li>Tourist email: <strong>${selection.touristRequest.email}</strong></li>
                ${selection.touristRequest.phone ? `<li>Phone: <strong>${selection.touristRequest.phone}</strong></li>` : ''}
                ${selection.touristRequest.whatsapp ? `<li>WhatsApp: <strong>${selection.touristRequest.whatsapp}</strong></li>` : ''}
              </ul>
              <p><strong>Next steps:</strong></p>
              <ol style="text-align: left; display: inline-block;">
                <li>Check your email for full tourist contact details</li>
                <li>Reach out to the tourist within 24 hours</li>
                <li>Confirm meeting details and payment arrangements</li>
                <li>Provide excellent service and build your reputation!</li>
              </ol>
              <a href="/student/dashboard" class="button">Go to Dashboard</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    } else if (action === 'decline') {
      // DECLINE FLOW: Just update status to 'rejected'
      await db.requestSelection.update({
        where: { id: selectionId },
        data: { status: 'rejected' },
      })

      console.log(`[match/respond] Updated RequestSelection ${selectionId} to 'rejected'`)

      // Success! Show confirmation page
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Match Declined</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                text-align: center;
                padding: 50px;
              }
              .card {
                background: white;
                color: #333;
                padding: 40px;
                border-radius: 10px;
                max-width: 600px;
                margin: 0 auto;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              h1 { margin-top: 0; }
              .button {
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Match Declined</h1>
              <p>You've declined this trip request.</p>
              <p>No worries! We'll continue sending you other opportunities that match your profile.</p>
              <a href="/student/dashboard" class="button">Go to Dashboard</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    } else {
      // Invalid action
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head><title>Invalid Action</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>❌ Invalid Action</h1>
            <p>The action specified in the token is not recognized.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' },
        }
      )
    }
  } catch (error) {
    console.error('[match/respond] Error processing match response:', error)

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head><title>Server Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>⚠️ Server Error</h1>
          <p>An unexpected error occurred while processing your response.</p>
          <p>Please try again later or contact support if the problem persists.</p>
          <p><a href="/">Return to Home</a></p>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
}
