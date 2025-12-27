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

interface MatchResponsePayload {
  success: boolean
  status: 'success' | 'error' | 'info'
  title: string
  message: string
  redirectUrl?: string
  contactDetails?: {
    email?: string
    phone?: string
    whatsapp?: string
  }
  nextSteps?: string[]
}

function buildPayload(
  statusCode: number,
  status: MatchResponsePayload['status'],
  title: string,
  message: string,
  extra: Partial<MatchResponsePayload> = {}
): { statusCode: number; payload: MatchResponsePayload } {
  return {
    statusCode,
    payload: {
      success: statusCode >= 200 && statusCode < 300,
      status,
      title,
      message,
      ...extra,
    },
  }
}

function renderProcessingPage(): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Processing Invitation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 50px;
            background: #f8fafc;
            color: #1f2937;
          }
          .card {
            background: white;
            color: #333;
            padding: 40px;
            border-radius: 10px;
            max-width: 640px;
            margin: 0 auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
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
        <div class="card" id="result">
          <h1>⏳ Processing your response…</h1>
          <p>Please keep this page open while we confirm your response.</p>
        </div>
        <script>
          (function () {
            var hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
            var searchParams = new URLSearchParams(window.location.search);
            var token = hashParams.get('token') || searchParams.get('token');
            var container = document.getElementById('result');

            if (!token) {
              container.innerHTML = '<h1>❌ Invalid Link</h1><p>This link is missing required parameters.</p><a href="/" class="button">Return to Home</a>';
              return;
            }

            if (window.history && window.history.replaceState) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }

            function escapeHtml(value) {
              return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\"/g, '&quot;')
                .replace(/'/g, '&#39;');
            }

            fetch('/api/student/match/respond', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token })
            })
              .then(function (response) {
                return response.json().catch(function () { return null; }).then(function (data) {
                  if (!data) {
                    throw new Error('Invalid response');
                  }
                  return { response: response, data: data };
                });
              })
              .then(function (result) {
                var data = result.data;
                var message = escapeHtml(data.message || 'We were unable to process your response.');
                var title = escapeHtml(data.title || 'Request Failed');
                var redirectUrl = data.redirectUrl || '/';
                var buttonLabel = data.redirectUrl ? 'Go to Dashboard' : 'Return to Home';

                var nextStepsHtml = '';
                if (Array.isArray(data.nextSteps) && data.nextSteps.length > 0) {
                  nextStepsHtml = '<ol style="text-align: left; display: inline-block;">' + data.nextSteps.map(function (step) {
                    return '<li>' + escapeHtml(step) + '</li>';
                  }).join('') + '</ol>';
                }

                var contactHtml = '';
                if (data.contactDetails) {
                  var items = [];
                  if (data.contactDetails.email) {
                    items.push('<li>Tourist email: <strong>' + escapeHtml(data.contactDetails.email) + '</strong></li>');
                  }
                  if (data.contactDetails.phone) {
                    items.push('<li>Phone: <strong>' + escapeHtml(data.contactDetails.phone) + '</strong></li>');
                  }
                  if (data.contactDetails.whatsapp) {
                    items.push('<li>WhatsApp: <strong>' + escapeHtml(data.contactDetails.whatsapp) + '</strong></li>');
                  }
                  if (items.length > 0) {
                    contactHtml = '<p>We\'ve sent you an email with the tourist\'s contact details:</p>' +
                      '<ul style="text-align: left; display: inline-block;">' + items.join('') + '</ul>';
                  }
                }

                container.innerHTML =
                  '<h1>' + title + '</h1>' +
                  '<p>' + message + '</p>' +
                  contactHtml +
                  nextStepsHtml +
                  '<a href="' + redirectUrl + '" class="button">' + buttonLabel + '</a>';
              })
              .catch(function () {
                container.innerHTML = '<h1>⚠️ Server Error</h1><p>An unexpected error occurred while processing your response.</p><a href="/" class="button">Return to Home</a>';
              });
          })();
        </script>
      </body>
    </html>
  `
}

async function processMatchToken(token: string) {
  const db = requireDatabase()

  try {
    const payload = verifyMatchToken(token)
    if (!payload) {
      return buildPayload(
        401,
        'error',
        'Invalid or Expired Link',
        'This invitation link is either invalid or has expired. Please contact support if you need a new link.'
      )
    }

    const { requestId, studentId, selectionId, action } = payload

    const selection = await db.requestSelection.findUnique({
      where: { id: selectionId },
      include: {
        request: true,
        student: true,
      },
    })

    if (!selection) {
      return buildPayload(
        404,
        'error',
        'Match Not Found',
        'This match invitation could not be found in our system.'
      )
    }

    if (selection.requestId !== requestId || selection.studentId !== studentId) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[match/respond] Token mismatch for selection')
      }

      return buildPayload(
        403,
        'error',
        'Invalid Token',
        'The token does not match the expected data. This may indicate tampering.'
      )
    }

    if (selection.status !== 'pending') {
      const statusMessages: Record<string, string> = {
        accepted: "You've already accepted this request.",
        rejected: "You've already declined this request.",
      }

      const message =
        statusMessages[selection.status] ||
        `This match has already been processed (status: ${selection.status}).`

      return buildPayload(400, 'info', 'Already Processed', message, {
        redirectUrl: '/student/dashboard',
      })
    }

    if (selection.request.status === 'ACCEPTED') {
      return buildPayload(
        409,
        'info',
        'Already Matched',
        'Sorry, another student has already accepted this request.',
        { redirectUrl: '/student/dashboard' }
      )
    }

    if (action === 'accept') {
      await db.$transaction(async (tx) => {
        const updateResult = await tx.touristRequest.updateMany({
          where: {
            id: requestId,
            status: 'PENDING',
          },
          data: {
            status: 'ACCEPTED',
            assignedStudentId: studentId,
          },
        })

        if (updateResult.count === 0) {
          throw new Error('ALREADY_MATCHED')
        }

        await tx.requestSelection.update({
          where: { id: selectionId },
          data: {
            status: 'accepted',
            acceptedAt: new Date(),
          },
        })

        await tx.requestSelection.updateMany({
          where: {
            requestId,
            id: { not: selectionId },
            status: 'pending',
          },
          data: { status: 'rejected' },
        })

        await tx.student.update({
          where: { id: studentId },
          data: {
            tripsHosted: { increment: 1 },
          },
        })
      })

      const touristEmailResult = await sendTouristAcceptanceNotification(
        selection.request.email,
        selection.student,
        selection.request
      )

      if (!touristEmailResult.success && process.env.NODE_ENV !== 'production') {
        console.error('[match/respond] Failed to send tourist email')
      }

      const studentEmailResult = await sendStudentConfirmation(
        selection.student,
        selection.request
      )

      if (!studentEmailResult.success && process.env.NODE_ENV !== 'production') {
        console.error('[match/respond] Failed to send student email')
      }

      return buildPayload(
        200,
        'success',
        '🎉 Match Accepted!',
        "Congratulations! You've successfully accepted this trip request.",
        {
          redirectUrl: '/student/dashboard',
          contactDetails: {
            email: selection.request.email,
            phone: selection.request.phone ?? undefined,
            whatsapp: selection.request.whatsapp ?? undefined,
          },
          nextSteps: [
            'Check your email for full tourist contact details',
            'Reach out to the tourist within 24 hours',
            'Confirm meeting details and payment arrangements',
            'Provide excellent service and build your reputation!',
          ],
        }
      )
    }

    if (action === 'decline') {
      await db.requestSelection.update({
        where: { id: selectionId },
        data: { status: 'rejected' },
      })

      return buildPayload(
        200,
        'success',
        'Match Declined',
        "You've declined this trip request. We'll continue sending you other opportunities that match your profile.",
        { redirectUrl: '/student/dashboard' }
      )
    }

    return buildPayload(
      400,
      'error',
      'Invalid Action',
      'The action specified in the token is not recognized.'
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'ALREADY_MATCHED') {
      return buildPayload(
        409,
        'info',
        'Already Matched',
        'Sorry, another student has already accepted this request.',
        { redirectUrl: '/student/dashboard' }
      )
    }

    if (process.env.NODE_ENV !== 'production') {
      console.error('[match/respond] Error processing match response:', error)
    }

    return buildPayload(
      500,
      'error',
      'Server Error',
      'An unexpected error occurred while processing your response.'
    )
  }
}

export async function GET(req: NextRequest) {
  return new NextResponse(renderProcessingPage(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      const { statusCode, payload } = buildPayload(
        400,
        'error',
        'Invalid Request',
        'Request body must be valid JSON.'
      )
      return NextResponse.json(payload, {
        status: statusCode,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const token =
      typeof (body as { token?: unknown })?.token === 'string'
        ? (body as { token: string }).token
        : ''

    if (!token) {
      const { statusCode, payload } = buildPayload(
        400,
        'error',
        'Invalid Link',
        'This link is missing required parameters.'
      )
      return NextResponse.json(payload, {
        status: statusCode,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    const result = await processMatchToken(token)
    return NextResponse.json(result.payload, {
      status: result.statusCode,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[match/respond] Error processing match response:', error)
    }

    const { statusCode, payload } = buildPayload(
      500,
      'error',
      'Server Error',
      'An unexpected error occurred while processing your response.'
    )

    return NextResponse.json(payload, {
      status: statusCode,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
