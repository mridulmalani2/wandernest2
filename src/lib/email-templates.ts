
export const theme = {
  colors: {
    primary: '#6366f1', // Indigo 500
    primaryGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    secondary: '#ec4899', // Pink 500
    success: '#10b981', // Emerald 500
    background: '#f3f4f6',
    card: '#ffffff',
    text: '#1f2937',
    textLight: '#6b7280',
    border: '#e5e7eb',
  },
  fonts: {
    main: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
};

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tourwiseco.com';

/**
 * Base Email Layout
 * Wraps content in a responsive, centered card with header and footer.
 */
const BaseEmailLayout = (content: string, title: string = 'TourWiseCo') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${theme.colors.background}; font-family: ${theme.fonts.main}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${theme.colors.background}; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: ${theme.colors.card}; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.5);">
          
          <!-- Header with Logo & Gradient -->
          <tr>
            <td style="background: ${theme.colors.primaryGradient}; padding: 40px 0; text-align: center; position: relative;">
              <!-- Decorative overlay -->
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="position: relative; z-index: 1;">
                <tr>
                  <td align="center">
                    <div style="background: rgba(255,255,255,0.15); padding: 12px; border-radius: 16px; display: inline-block; backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.2);">
                      <img src="https://tourwiseco.com/logo-white.png" alt="TourWiseCo" width="48" height="48" style="display: block; border-radius: 8px;" />
                    </div>
                    <h1 style="margin: 16px 0 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">TourWiseCo</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 48px 40px; background-color: #ffffff;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid ${theme.colors.border}; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 14px; color: ${theme.colors.textLight}; line-height: 1.5;">
                Connecting curious travelers with local student guides.<br/>
                Your journey, your way.
              </p>
              
              <div style="margin-bottom: 24px;">
                <a href="${baseUrl}" style="color: ${theme.colors.primary}; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 12px;">Home</a>
                <a href="${baseUrl}/student/dashboard" style="color: ${theme.colors.primary}; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 12px;">Dashboard</a>
                <a href="${baseUrl}/support" style="color: ${theme.colors.primary}; text-decoration: none; font-weight: 600; font-size: 14px; margin: 0 12px;">Support</a>
              </div>

              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} TourWiseCo. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
        
        <!-- Unsubscribe / Address (Optional) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin-top: 24px;">
          <tr>
            <td align="center">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                You received this email because you signed up for TourWiseCo.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * OTP Email Template
 */
/**
 * OTP Email Template
 */
export const getOtpEmailHtml = (otp: string, title: string = 'Verify Your Identity', subtitle: string = 'Use the code below to securely sign in to your TourWiseCo account. This code expires in 10 minutes.') => {
  const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        ${title}
      </h2>
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textLight};">
        ${subtitle}
      </p>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #bae6fd; border-radius: 16px; padding: 32px; margin-bottom: 32px; display: inline-block; min-width: 200px;">
        <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0284c7; display: block;">
          ${otp}
        </span>
      </div>

      <p style="margin: 0; font-size: 14px; color: #9ca3af;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;
  return BaseEmailLayout(content, title);
};

// ... (keep existing getBookingConfirmationHtml and getStudentRequestNotificationHtml and getStudentMatchInvitationHtml) ...

/**
 * Tourist Acceptance Notification Template
 */
export const getTouristAcceptanceNotificationHtml = (
  touristName: string,
  studentName: string,
  city: string,
  startDate: string,
  studentProfile: {
    institute: string;
    nationality: string;
    languages: string[];
    rating?: number;
    tripsHosted?: number;
    email: string;
    whatsapp?: string;
    phone?: string;
  }
) => {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);">
        <span style="font-size: 32px; line-height: 1;">🎉</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        Guide Accepted!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textLight};">
        Great news! <strong>${studentName}</strong> has accepted your request for <strong>${city}</strong> starting on <strong>${startDate}</strong>.
      </p>

      <div style="text-align: left; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #166534;">
          🎓 Your Guide Details
        </h3>
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">Name:</span>
            <span style="color: #14532d;">${studentName}</span>
        </div>
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">University:</span>
            <span style="color: #14532d;">${studentProfile.institute}</span>
        </div>
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">Nationality:</span>
            <span style="color: #14532d;">${studentProfile.nationality}</span>
        </div>
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">Languages:</span>
            <span style="color: #14532d;">${studentProfile.languages.join(', ')}</span>
        </div>
        ${studentProfile.rating ? `
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">Rating:</span>
            <span style="color: #14532d;">⭐ ${studentProfile.rating.toFixed(1)}/5 (${studentProfile.tripsHosted} trips)</span>
        </div>
        ` : ''}
      </div>

      <div style="text-align: left; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1e40af;">
          📞 Contact Information
        </h3>
        <p style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">
          <strong style="display: inline-block; width: 100px;">Email:</strong> <a href="mailto:${studentProfile.email}" style="color: #2563eb; text-decoration: none;">${studentProfile.email}</a>
        </p>
        ${studentProfile.whatsapp ? `
        <p style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">
          <strong style="display: inline-block; width: 100px;">WhatsApp:</strong> ${studentProfile.whatsapp}
        </p>
        ` : ''}
        ${studentProfile.phone ? `
        <p style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">
          <strong style="display: inline-block; width: 100px;">Phone:</strong> ${studentProfile.phone}
        </p>
        ` : ''}
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; text-align: left;">
        <p style="margin: 0 0 8px; font-weight: 700; color: #92400e; font-size: 14px;">⚠️ Next Steps:</p>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.5;">
            <li>Contact your guide within 24-48 hours.</li>
            <li>Agree on meeting point and final terms.</li>
            <li>Enjoy your trip!</li>
        </ul>
      </div>
    </div>
  `;
  return BaseEmailLayout(content, 'Guide Accepted');
};

/**
 * Booking Confirmation Template
 */
export const getBookingConfirmationHtml = (
  requestId: string,
  city: string,
  hasMatches: boolean,
  matchesCount: number = 0
) => {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);">
        <span style="font-size: 32px; line-height: 1;">✈️</span>
      </div>
      
      <h2 style="margin: 0 0 16px; font-size: 30px; font-weight: 800; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        Booking Confirmed!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 18px; line-height: 1.6; color: ${theme.colors.textLight};">
        Your trip to <strong style="color: ${theme.colors.primary};">${city}</strong> is officially in the works.
      </p>

      <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 32px; border: 1px solid ${theme.colors.border};">
        <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
          Request ID
        </p>
        <p style="margin: 0; font-size: 20px; font-family: monospace; font-weight: 600; color: ${theme.colors.text};">
          ${requestId}
        </p>
      </div>

      ${hasMatches ? `
        <div style="background: linear-gradient(to right, #eff6ff, #ffffff); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; text-align: left; margin-bottom: 32px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1e40af;">
            🎉 Good News!
          </h3>
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #1e3a8a;">
            We found <strong>${matchesCount} student guides</strong> who match your preferences. They have been notified and are reviewing your request.
          </p>
        </div>
      ` : `
        <div style="background: linear-gradient(to right, #f0fdf4, #ffffff); border-left: 4px solid #22c55e; padding: 20px; border-radius: 8px; text-align: left; margin-bottom: 32px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #15803d;">
            Request Received
          </h3>
          <p style="margin: 0; font-size: 15px; line-height: 1.5; color: #14532d;">
            We're actively searching for the perfect guide for you. You'll be notified as soon as we find a match!
          </p>
        </div>
      `}

      <a href="${baseUrl}/booking/status/${requestId}" style="display: inline-block; background: ${theme.colors.primaryGradient}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
        View Booking Status
      </a>
    </div>
  `;
  return BaseEmailLayout(content, 'Booking Confirmed');
};

/**
 * Student Request Notification Template
 */
export const getStudentRequestNotificationHtml = (
  studentName: string,
  city: string,
  acceptUrl: string
) => {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(236, 72, 153, 0.2);">
        <span style="font-size: 32px; line-height: 1;">👋</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        New Request in ${city}!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textLight};">
        Hi <strong>${studentName}</strong>, a tourist has specifically requested you as their guide. This is a great opportunity to earn and connect!
      </p>

      <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <p style="margin: 0 0 12px; font-size: 15px; color: #be123c; font-weight: 600;">
          ⚡ Act Fast!
        </p>
        <p style="margin: 0; font-size: 14px; color: #9f1239; line-height: 1.5;">
          Review the trip details and accept the request to secure this booking.
        </p>
      </div>

      <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);">
        View & Accept Request
      </a>
    </div>
  `;
  return BaseEmailLayout(content, 'New Tourist Request');
};

/**
 * Student Match Invitation Template
 */
export const getStudentMatchInvitationHtml = (
  studentName: string,
  city: string,
  acceptUrl: string
) => {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2);">
        <span style="font-size: 32px; line-height: 1;">🎯</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        It's a Match!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textLight};">
        Hi <strong>${studentName}</strong>, we found a new trip in <strong>${city}</strong> that matches your profile perfectly.
      </p>

      <div style="text-align: left; background-color: #f8fafc; padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid ${theme.colors.border};">
        <ul style="margin: 0; padding: 0 0 0 20px; color: ${theme.colors.textLight}; font-size: 15px; line-height: 1.8;">
          <li>Matches your language preferences</li>
          <li>Fits your availability schedule</li>
          <li>Aligns with your interests</li>
        </ul>
      </div>

      <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
        Review Opportunity
      </a>
    </div>
  `;
  return BaseEmailLayout(content, 'New Match Opportunity');
};

/**
 * Student Confirmation Template
 * Sent to student when they are assigned to a booking
 */
export const getStudentConfirmationHtml = (
  studentName: string,
  touristName: string,
  city: string,
  dates: string,
  touristEmail: string,
  touristPhone?: string,
  touristWhatsapp?: string
) => {
  const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 8px 16px rgba(16, 185, 129, 0.2);">
        <span style="font-size: 32px; line-height: 1;">✅</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 28px; font-weight: 800; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        Booking Confirmed!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textLight};">
        Hi <strong>${studentName}</strong>, you have been confirmed as the guide for <strong>${touristName}</strong> in <strong>${city}</strong>.
      </p>

      <div style="text-align: left; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #166534;">
          📅 Trip Details
        </h3>
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">Dates:</span>
            <span style="color: #14532d;">${dates}</span>
        </div>
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #15803d; width: 100px; display: inline-block;">Tourist:</span>
            <span style="color: #14532d;">${touristName}</span>
        </div>
      </div>

      <div style="text-align: left; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1e40af;">
          📞 Tourist Contact Info
        </h3>
        <p style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">
          <strong style="display: inline-block; width: 100px;">Email:</strong> <a href="mailto:${touristEmail}" style="color: #2563eb; text-decoration: none;">${touristEmail}</a>
        </p>
        ${touristWhatsapp ? `
        <p style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">
          <strong style="display: inline-block; width: 100px;">WhatsApp:</strong> ${touristWhatsapp}
        </p>
        ` : ''}
        ${touristPhone ? `
        <p style="margin: 0 0 12px; font-size: 15px; color: #1e3a8a;">
          <strong style="display: inline-block; width: 100px;">Phone:</strong> ${touristPhone}
        </p>
        ` : ''}
      </div>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; text-align: left;">
        <p style="margin: 0 0 8px; font-weight: 700; color: #92400e; font-size: 14px;">⚠️ Next Steps:</p>
        <ul style="margin: 0; padding-left: 20px; color: #92400e; font-size: 14px; line-height: 1.5;">
            <li>Contact the tourist immediately to introduce yourself.</li>
            <li>Confirm the meeting point and itinerary.</li>
            <li>Be professional and punctual!</li>
        </ul>
      </div>
    </div>
  `;
  return BaseEmailLayout(content, 'Booking Confirmed');
};

/**
 * Contact Form Email Template
 * Sent to admin when a user submits the contact form
 */
export const getContactFormEmailHtml = (
  name: string,
  email: string,
  message: string,
  phone?: string
) => {
  const content = `
    <div style="text-align: left;">
      <h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: ${theme.colors.text};">
        New Contact Form Submission
      </h2>
      
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid ${theme.colors.border};">
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: ${theme.colors.textLight}; text-transform: uppercase;">Name</p>
          <p style="margin: 0; font-size: 16px; color: ${theme.colors.text}; font-weight: 500;">${name}</p>
        </div>
        
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: ${theme.colors.textLight}; text-transform: uppercase;">Email</p>
          <p style="margin: 0; font-size: 16px; color: ${theme.colors.text}; font-weight: 500;">
            <a href="mailto:${email}" style="color: ${theme.colors.primary}; text-decoration: none;">${email}</a>
          </p>
        </div>

        ${phone ? `
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: ${theme.colors.textLight}; text-transform: uppercase;">Phone</p>
          <p style="margin: 0; font-size: 16px; color: ${theme.colors.text}; font-weight: 500;">${phone}</p>
        </div>
        ` : ''}
        
        <div>
          <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: ${theme.colors.textLight}; text-transform: uppercase;">Message</p>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid ${theme.colors.border};">
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${theme.colors.text}; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  return BaseEmailLayout(content, 'New Contact Message');
};
