export const theme = {
  colors: {
    primary: '#6366f1', // Indigo 500
    primaryDark: '#4f46e5', // Indigo 600
    background: '#f9fafb', // Gray 50
    surface: '#ffffff',
    text: '#1f2937', // Gray 800
    textSecondary: '#6b7280', // Gray 500
    border: '#e5e7eb', // Gray 200
    success: '#10b981',
    successBg: '#ecfdf5',
    successBorder: '#a7f3d0',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  fonts: {
    main: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
};

import { config } from '@/lib/config';

// Security: Helper to escape HTML characters to prevent XSS
function escapeHtml(text: string | null | undefined | number): string {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Security: Helper to validate allow-listed URLs to prevent open redirects
function validateUrl(url: string): string {
  const baseUrl = config.app.baseUrl || 'https://tourwiseco.com';
  try {
    // If it's a relative path, prepend base URL
    if (url.startsWith('/')) {
      return `${baseUrl}${url}`;
    }

    // Check if URL belongs to trusted domain
    const parsedUrl = new URL(url);
    const trustedHost = new URL(baseUrl).host;

    // Simplistic check: allow if host matches config.app.baseUrl's host
    // or if it's strictly the baseUrl
    if (parsedUrl.host === trustedHost) {
      return url;
    }

    // Fallback safe URL
    console.warn(`[Security] Blocked potential open redirect: ${url}`);
    return baseUrl;
  } catch (e) {
    return baseUrl;
  }
}

const baseUrl = config.app.baseUrl || 'https://tourwiseco.com';

/**
 * Premium Email Layout
 * A clean, modern, image-free layout optimized for all email clients.
 */
const PremiumEmailLayout = (content: string, title: string = 'TourWiseCo') => `
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
<body style="margin: 0; padding: 0; background-color: ${theme.colors.background}; font-family: ${theme.fonts.main}; -webkit-font-smoothing: antialiased; color: ${theme.colors.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${theme.colors.background}; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 500px; width: 100%; background-color: ${theme.colors.surface}; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 0 40px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background-color: #e0e7ff; border-radius: 9999px; color: ${theme.colors.primaryDark}; font-weight: 700; font-size: 14px; letter-spacing: 0.5px;">
                TourWiseCo
              </div>
            </td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 32px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; border-top: 1px solid ${theme.colors.border}; text-align: center;">
              <p style="margin: 0 0 12px; font-size: 12px; color: ${theme.colors.textSecondary}; line-height: 1.5;">
                Connecting curious travelers with local student guides.
              </p>
              
              <div style="margin-bottom: 16px;">
                <a href="${baseUrl}" style="color: ${theme.colors.textSecondary}; text-decoration: none; font-size: 12px; margin: 0 8px;">Home</a>
                <span style="color: ${theme.colors.border};">•</span>
                <a href="${baseUrl}/support" style="color: ${theme.colors.textSecondary}; text-decoration: none; font-size: 12px; margin: 0 8px;">Support</a>
              </div>

              <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                © ${new Date().getFullYear()} TourWiseCo. All rights reserved.
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
export const getOtpEmailHtml = (otp: string, title: string = 'Sign In Verification', subtitle: string = 'Use the code below to securely sign in to your account. This code expires in 10 minutes.') => {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeOtp = escapeHtml(otp);

  const content = `
    <div style="text-align: center;">
      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        ${safeTitle}
      </h1>
      <p style="margin: 0 0 32px; font-size: 15px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        ${safeSubtitle}
      </p>
      
      <div style="background-color: #f3f4f6; border-radius: 12px; padding: 24px; margin-bottom: 32px; letter-spacing: 8px; font-family: monospace; font-size: 32px; font-weight: 700; color: ${theme.colors.text}; border: 1px solid ${theme.colors.border};">
        ${safeOtp}
      </div>

      <p style="margin: 0; font-size: 13px; color: ${theme.colors.textSecondary};">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  `;
  return PremiumEmailLayout(content, safeTitle);
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
  const safeCity = escapeHtml(city);
  const safeRequestId = escapeHtml(requestId);
  const safeMatchesCount = escapeHtml(matchesCount);

  const content = `
    <div style="text-align: center;">
      <div style="width: 48px; height: 48px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; color: ${theme.colors.success}; font-size: 24px;">
        ✈️
      </div>
      
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        Booking Confirmed
      </h2>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Your trip to <strong style="color: ${theme.colors.text};">${safeCity}</strong> is officially in the works.
      </p>

      <div style="background-color: #f9fafb; border: 1px solid ${theme.colors.border}; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;">
          Request ID
        </p>
        <p style="margin: 0; font-size: 16px; font-family: monospace; font-weight: 600; color: ${theme.colors.text};">
          ${safeRequestId}
        </p>
      </div>

      ${hasMatches ? `
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1e40af;">
            🎉 Good News!
          </p>
          <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1e3a8a;">
            We found <strong>${safeMatchesCount} student guides</strong> who match your preferences.
          </p>
        </div>
      ` : ''}

      <a href="${baseUrl}/booking/status/${safeRequestId}" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
        View Booking Status
      </a>
    </div>
  `;
  return PremiumEmailLayout(content, 'Booking Confirmed');
};

/**
 * Student Request Notification Template
 */
export const getStudentRequestNotificationHtml = (
  studentName: string,
  city: string,
  acceptUrl: string
) => {
  const safeName = escapeHtml(studentName);
  const safeCity = escapeHtml(city);
  const safeUrl = validateUrl(acceptUrl);

  const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        New Request in ${safeCity}
      </h2>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeName}</strong>, a tourist has requested you as their guide.
      </p>

      <a href="${safeUrl}" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
        View & Accept Request
      </a>
    </div>
  `;
  return PremiumEmailLayout(content, 'New Tourist Request');
};

/**
 * Student Match Invitation Template
 */
export const getStudentMatchInvitationHtml = (
  studentName: string,
  city: string,
  acceptUrl: string
) => {
  const safeName = escapeHtml(studentName);
  const safeCity = escapeHtml(city);
  const safeUrl = validateUrl(acceptUrl);

  const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        It's a Match!
      </h2>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeName}</strong>, we found a new trip in <strong>${safeCity}</strong> that matches your profile.
      </p>

      <a href="${safeUrl}" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
        Review Opportunity
      </a>
    </div>
  `;
  return PremiumEmailLayout(content, 'New Match Opportunity');
};

/**
 * Student Confirmation Template
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

  const safeStudent = escapeHtml(studentName);
  const safeTourist = escapeHtml(touristName);
  const safeCity = escapeHtml(city);
  const safeDates = escapeHtml(dates);
  const safeEmail = escapeHtml(touristEmail);
  const safePhone = touristPhone ? escapeHtml(touristPhone) : undefined;
  const safeWhatsapp = touristWhatsapp ? escapeHtml(touristWhatsapp) : undefined;

  const content = `
    <div style="text-align: center;">
      <div style="width: 48px; height: 48px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; color: ${theme.colors.success}; font-size: 24px;">
        ✅
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        Booking Confirmed
      </h2>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeStudent}</strong>, you are confirmed for <strong>${safeCity}</strong>.
      </p>

      <div style="text-align: left; background-color: ${theme.colors.successBg}; border: 1px solid ${theme.colors.successBorder}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;">
            <span style="font-weight: 600; color: #065f46; width: 80px; display: inline-block;">Dates:</span>
            <span style="color: #064e3b;">${safeDates}</span>
        </div>
        <div>
            <span style="font-weight: 600; color: #065f46; width: 80px; display: inline-block;">Tourist:</span>
            <span style="color: #064e3b;">${safeTourist}</span>
        </div>
      </div>

      <div style="text-align: left; background-color: #f9fafb; border: 1px solid ${theme.colors.border}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: ${theme.colors.text}; text-transform: uppercase; letter-spacing: 0.5px;">
          Contact Info
        </h3>
        <p style="margin: 0 0 8px; font-size: 14px; color: ${theme.colors.text};">
          <strong style="color: ${theme.colors.textSecondary};">Email:</strong> <a href="mailto:${safeEmail}" style="color: ${theme.colors.primary}; text-decoration: none;">${safeEmail}</a>
        </p>
        ${safeWhatsapp ? `
        <p style="margin: 0 0 8px; font-size: 14px; color: ${theme.colors.text};">
          <strong style="color: ${theme.colors.textSecondary};">WhatsApp:</strong> ${safeWhatsapp}
        </p>
        ` : ''}
        ${safePhone ? `
        <p style="margin: 0; font-size: 14px; color: ${theme.colors.text};">
          <strong style="color: ${theme.colors.textSecondary};">Phone:</strong> ${safePhone}
        </p>
        ` : ''}
      </div>
    </div>
  `;
  return PremiumEmailLayout(content, 'Booking Confirmed');
};

/**
 * Tourist Acceptance Notification Template
 */
export const getTouristAcceptanceNotificationHtml = (
  touristName: string,
  studentName: string,
  city: string,
  studentProfile: {
    institute: string;
    languages: string[];
    email: string;
  }
) => {
  const safeStudent = escapeHtml(studentName);
  const safeCity = escapeHtml(city);
  const safeInstitute = escapeHtml(studentProfile.institute);
  const safeLanguages = studentProfile.languages.map(l => escapeHtml(l)).join(', ');
  const safeEmail = escapeHtml(studentProfile.email);

  const content = `
    <div style="text-align: center;">
      <div style="width: 48px; height: 48px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; color: ${theme.colors.success}; font-size: 24px;">
        🎉
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.text}; letter-spacing: -0.5px;">
        Guide Accepted!
      </h2>
      
      <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        <strong>${safeStudent}</strong> has accepted your request for <strong>${safeCity}</strong>.
      </p>

      <div style="text-align: left; background-color: #f9fafb; border: 1px solid ${theme.colors.border}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: ${theme.colors.text}; text-transform: uppercase; letter-spacing: 0.5px;">
          Guide Details
        </h3>
        <div style="margin-bottom: 8px; font-size: 14px;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; display: inline-block;">Name:</span>
            <span style="color: ${theme.colors.text};">${safeStudent}</span>
        </div>
        <div style="margin-bottom: 8px; font-size: 14px;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; display: inline-block;">University:</span>
            <span style="color: ${theme.colors.text};">${safeInstitute}</span>
        </div>
        <div style="margin-bottom: 8px; font-size: 14px;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; display: inline-block;">Languages:</span>
            <span style="color: ${theme.colors.text};">${safeLanguages}</span>
        </div>
        <div style="margin-bottom: 8px; font-size: 14px;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; display: inline-block;">Email:</span>
            <a href="mailto:${safeEmail}" style="color: ${theme.colors.primary}; text-decoration: none;">${safeEmail}</a>
        </div>
      </div>
    </div>
  `;
  return PremiumEmailLayout(content, 'Guide Accepted');
};

/**
 * Contact Form Email Template
 */
export const getContactFormEmailHtml = (
  name: string,
  email: string,
  message: string,
  phone?: string
) => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message);
  const safePhone = phone ? escapeHtml(phone) : undefined;

  const content = `
    <div style="text-align: left;">
      <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: ${theme.colors.text};">
        New Contact Message
      </h2>
      
      <div style="background-color: #f9fafb; border-radius: 12px; padding: 24px; border: 1px solid ${theme.colors.border};">
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">From</p>
          <p style="margin: 0; font-size: 15px; color: ${theme.colors.text}; font-weight: 500;">
            ${safeName} <span style="color: ${theme.colors.textSecondary}; font-weight: 400;">&lt;${safeEmail}&gt;</span>
          </p>
        </div>

        ${safePhone ? `
        <div style="margin-bottom: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">Phone</p>
          <p style="margin: 0; font-size: 15px; color: ${theme.colors.text}; font-weight: 500;">${safePhone}</p>
        </div>
        ` : ''}
        
        <div>
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">Message</p>
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; border: 1px solid ${theme.colors.border};">
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${theme.colors.text}; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      </div>
    </div>
  `;
  return PremiumEmailLayout(content, 'New Contact Message');
};
