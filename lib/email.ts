import nodemailer from 'nodemailer'

// Mock mode - set to true to bypass actual email sending
const MOCK_EMAIL_MODE = process.env.MOCK_EMAIL === 'true' || true

const transporter = MOCK_EMAIL_MODE
  ? null
  : nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  // Mock mode - just log the code
  if (MOCK_EMAIL_MODE) {
    console.log('\n===========================================')
    console.log('📧 MOCK EMAIL - Verification Code')
    console.log('===========================================')
    console.log(`To: ${email}`)
    console.log(`Code: ${code}`)
    console.log(`Expires: 10 minutes`)
    console.log('===========================================\n')
    return
  }
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          .code-box {
            background: white;
            border: 2px dashed #667eea;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
            font-family: 'Courier New', monospace;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #6b7280;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🌍 WanderNest</h1>
          <p style="margin: 10px 0 0 0;">Email Verification</p>
        </div>
        <div class="content">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for booking with WanderNest! Please use the verification code below to complete your booking request:</p>

          <div class="code-box">
            <div class="code">${code}</div>
            <p style="margin: 10px 0 0 0; color: #6b7280;">This code expires in 10 minutes</p>
          </div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request this code, please ignore this email.
          </div>

          <p>Once verified, we'll match you with the perfect local guide for your adventure!</p>

          <p>Best regards,<br>The WanderNest Team</p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>© ${new Date().getFullYear()} WanderNest. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  await transporter!.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email - WanderNest Booking',
    html,
  })
}

export async function sendBookingConfirmation(
  email: string,
  requestId: string
): Promise<void> {
  // Mock mode - just log
  if (MOCK_EMAIL_MODE) {
    console.log('\n===========================================')
    console.log('📧 MOCK EMAIL - Booking Confirmation')
    console.log('===========================================')
    console.log(`To: ${email}`)
    console.log(`Request ID: ${requestId}`)
    console.log('===========================================\n')
    return
  }
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
          .request-id {
            background: white;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="success-icon">✅</div>
          <h1 style="margin: 0;">Booking Request Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Your Request is Being Processed</h2>
          <p>Great news! Your booking request has been successfully submitted.</p>

          <div class="request-id">
            <strong>Request ID:</strong> ${requestId}
          </div>

          <p>We're now matching you with the perfect local guide. You'll receive an email notification once guides start responding to your request.</p>

          <h3>What's Next?</h3>
          <ul>
            <li>Local guides will review your request</li>
            <li>You'll receive proposals from interested guides</li>
            <li>Review their profiles and choose your favorite</li>
            <li>Connect and plan your amazing trip!</li>
          </ul>

          <p>If you have any questions, feel free to reach out to our support team.</p>

          <p>Happy travels,<br>The WanderNest Team</p>
        </div>
      </body>
    </html>
  `

  await transporter!.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '✅ Booking Request Confirmed - WanderNest',
    html,
  })
}

export async function sendStudentRequestNotification(
  student: any,
  touristRequest: any
): Promise<void> {
  // Mock mode - just log
  if (MOCK_EMAIL_MODE) {
    console.log('\n===========================================')
    console.log('📧 MOCK EMAIL - Student Request Notification')
    console.log('===========================================')
    console.log(`To: ${student.email}`)
    console.log(`Student: ${student.name}`)
    console.log(`Request: ${touristRequest.city} - ${touristRequest.serviceType}`)
    console.log('===========================================\n')
    return
  }
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

  const acceptUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/student/requests/${touristRequest.id}/accept`

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
            display: flex;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label {
            font-weight: 600;
            color: #6b7280;
            width: 140px;
          }
          .detail-value {
            color: #111827;
            flex: 1;
          }
          .cta-button {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 10px 5px;
          }
          .decline-button {
            background: #6b7280;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">🎉 New Request for a ${touristRequest.serviceType === 'itinerary_help' ? 'Itinerary Consultation' : 'Guided Experience'}</h1>
          <p style="margin: 10px 0 0 0;">In ${touristRequest.city}</p>
        </div>
        <div class="content">
          <h2>Hi ${student.name}!</h2>
          <p>Great news! A tourist has selected you as a potential guide for their trip. Here are the details:</p>

          <div class="detail-box">
            <div class="detail-row">
              <div class="detail-label">📍 City:</div>
              <div class="detail-value">${touristRequest.city}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">📅 Dates:</div>
              <div class="detail-value">${startDate}${endDate ? ` - ${endDate}` : ''}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">⏰ Preferred Time:</div>
              <div class="detail-value">${touristRequest.preferredTime}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">👥 Guests:</div>
              <div class="detail-value">${touristRequest.numberOfGuests} (${touristRequest.groupType})</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">🎯 Service Type:</div>
              <div class="detail-value">${touristRequest.serviceType === 'itinerary_help' ? 'Itinerary Help (Online)' : 'Guided Experience (In-Person)'}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">💡 Interests:</div>
              <div class="detail-value">${touristRequest.interests.join(', ')}</div>
            </div>
            ${touristRequest.tripNotes ? `
            <div class="detail-row">
              <div class="detail-label">📝 Notes:</div>
              <div class="detail-value">${touristRequest.tripNotes}</div>
            </div>
            ` : ''}
          </div>

          <div class="warning">
            <strong>⚡ Act Fast!</strong> This request was sent to multiple guides. The first one to accept gets the opportunity. If you're interested, click below to accept right away!
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" class="cta-button">Accept This Request</a>
            <br>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/student/dashboard" class="cta-button decline-button">View in Dashboard</a>
          </div>

          <h3>Important Reminders:</h3>
          <ul>
            <li><strong>First come, first served:</strong> Whichever guide accepts first gets the job</li>
            <li><strong>Direct arrangement:</strong> WanderNest is just a connector. Payment and exact meeting details are arranged directly with the tourist</li>
            <li><strong>Contact details:</strong> You'll receive the tourist's contact information once you accept</li>
            <li><strong>Professional conduct:</strong> Please maintain high standards of service and reliability</li>
          </ul>

          <p>Good luck!<br>The WanderNest Team</p>
        </div>
      </body>
    </html>
  `

  await transporter!.sendMail({
    from: process.env.EMAIL_FROM,
    to: student.email,
    subject: `🎉 New Request: ${touristRequest.serviceType === 'itinerary_help' ? 'Itinerary Help' : 'Guided Experience'} in ${touristRequest.city}`,
    html,
  })
}

export async function sendTouristAcceptanceNotification(
  touristEmail: string,
  student: any,
  touristRequest: any
): Promise<void> {
  // Mock mode - just log
  if (MOCK_EMAIL_MODE) {
    console.log('\n===========================================')
    console.log('📧 MOCK EMAIL - Tourist Acceptance Notification')
    console.log('===========================================')
    console.log(`To: ${touristEmail}`)
    console.log(`Guide: ${student.name}`)
    console.log(`City: ${touristRequest.city}`)
    console.log('===========================================\n')
    return
  }
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
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
          .student-card {
            background: white;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .contact-box {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
          }
          .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin: 20px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎉 Your Student Guide Has Accepted!</h1>
        </div>
        <div class="content">
          <h2>Great News!</h2>
          <p>A student guide has accepted your request for ${touristRequest.city} on ${startDate}.</p>

          <div class="student-card">
            <h3 style="margin-top: 0; color: #10b981;">Your Guide:</h3>
            <p><strong>Name:</strong> ${student.name}</p>
            <p><strong>University:</strong> ${student.institute}</p>
            <p><strong>Nationality:</strong> ${student.nationality}</p>
            <p><strong>Languages:</strong> ${student.languages.join(', ')}</p>
            ${student.averageRating ? `<p><strong>Rating:</strong> ${student.averageRating.toFixed(1)}/5 (${student.tripsHosted} trips hosted)</p>` : ''}
          </div>

          <div class="contact-box">
            <h3 style="margin-top: 0;">Contact Information:</h3>
            <p><strong>Email:</strong> ${student.email}</p>
            ${student.whatsapp ? `<p><strong>WhatsApp:</strong> ${student.whatsapp}</p>` : ''}
            ${student.phone ? `<p><strong>Phone:</strong> ${student.phone}</p>` : ''}
          </div>

          <h3>Next Steps:</h3>
          <ol>
            <li><strong>Reach out within 24-48 hours</strong> to confirm the exact meeting point and time</li>
            <li><strong>Agree on the final terms</strong> including the payment amount and method</li>
            <li><strong>Confirm your meeting details</strong> at least 24 hours before your trip</li>
            <li><strong>Enjoy your experience</strong> and don't forget to leave a review afterward!</li>
          </ol>

          <div class="warning">
            <strong>⚠️ Important Reminders:</strong>
            <ul style="margin: 10px 0;">
              <li>WanderNest is a connector platform only. We are not involved in payment processing or service delivery</li>
              <li>All payments and arrangements are made directly between you and the student guide</li>
              <li>We recommend meeting in public places for your first interaction</li>
              <li>Please report any issues or concerns to our support team</li>
            </ul>
          </div>

          <p>Have a wonderful trip!<br>The WanderNest Team</p>
        </div>
      </body>
    </html>
  `

  await transporter!.sendMail({
    from: process.env.EMAIL_FROM,
    to: touristEmail,
    subject: `🎉 Your student guide in ${touristRequest.city} has accepted!`,
    html,
  })
}

export async function sendStudentConfirmation(
  student: any,
  touristRequest: any
): Promise<void> {
  // Mock mode - just log
  if (MOCK_EMAIL_MODE) {
    console.log('\n===========================================')
    console.log('📧 MOCK EMAIL - Student Confirmation')
    console.log('===========================================')
    console.log(`To: ${student.email}`)
    console.log(`Tourist: ${touristRequest.email}`)
    console.log(`City: ${touristRequest.city}`)
    console.log('===========================================\n')
    return
  }
  const dates = touristRequest.dates as { start: string; end?: string }
  const startDate = new Date(dates.start).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
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
          .tourist-card {
            background: white;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">✅ Congratulations!</h1>
          <p style="margin: 10px 0 0 0;">You've Got the Opportunity</p>
        </div>
        <div class="content">
          <h2>Hi ${student.name}!</h2>
          <p>Great news! You've successfully accepted the request. Here are the tourist's contact details:</p>

          <div class="tourist-card">
            <h3 style="margin-top: 0; color: #10b981;">Tourist Information:</h3>
            <p><strong>Email:</strong> ${touristRequest.email}</p>
            ${touristRequest.phone ? `<p><strong>Phone:</strong> ${touristRequest.phone}</p>` : ''}
            ${touristRequest.whatsapp ? `<p><strong>WhatsApp:</strong> ${touristRequest.whatsapp}</p>` : ''}
            <p><strong>Preferred Contact Method:</strong> ${touristRequest.contactMethod}</p>
            <p><strong>Trip Date:</strong> ${startDate}</p>
            <p><strong>Number of Guests:</strong> ${touristRequest.numberOfGuests}</p>
            <p><strong>Group Type:</strong> ${touristRequest.groupType}</p>
          </div>

          <h3>Next Steps:</h3>
          <ol>
            <li><strong>Reach out promptly</strong> - Contact the tourist within the next few hours using their preferred method</li>
            <li><strong>Confirm details</strong> - Discuss and agree on:
              <ul>
                <li>Exact meeting point and time</li>
                <li>Final price and payment method</li>
                <li>Any special requests or accessibility needs</li>
              </ul>
            </li>
            <li><strong>Prepare well</strong> - Plan an amazing experience for your guests</li>
            <li><strong>Show up on time</strong> - Punctuality builds trust and leads to great reviews</li>
          </ol>

          <p><strong>Remember:</strong> This is your opportunity to showcase ${touristRequest.city} and earn great reviews. Provide excellent service, be professional, and have fun!</p>

          <p>Good luck!<br>The WanderNest Team</p>
        </div>
      </body>
    </html>
  `

  await transporter!.sendMail({
    from: process.env.EMAIL_FROM,
    to: student.email,
    subject: '✅ You Got the Job! Tourist Contact Details',
    html,
  })
}
