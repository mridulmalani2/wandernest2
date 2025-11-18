import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
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

  await transporter.sendMail({
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

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '✅ Booking Request Confirmed - WanderNest',
    html,
  })
}
