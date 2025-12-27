import { theme, StartupEmailLayout, escapeHtml, sanitizeEmailText, validateUrl, baseUrl } from './shared';

/**
 * 5. Booking Confirmation (to Tourist)
 * Tone: Clear, reassuring.
 */
export const getBookingConfirmationHtml = (
    requestId: string,
    city: string,
    hasMatches: boolean,
    matchesCount: number = 0
) => {
    const safeCity = escapeHtml(city);
    const safeCityText = sanitizeEmailText(city);
    const safeRequestId = escapeHtml(requestId);
    const requestIdPath = encodeURIComponent(requestId);
    const safeMatchesCount = escapeHtml(matchesCount);

    const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">✈️</span>
      </div>
      
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Request Received!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Your trip to <strong style="color: ${theme.colors.primary};">${safeCity}</strong> is officially in the works.
      </p>

      <div style="background-color: ${theme.colors.background}; border-radius: 16px; padding: 20px; margin-bottom: 32px; text-align: left;">
        <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase; letter-spacing: 0.5px;">
          Request ID
        </p>
        <p style="margin: 0; font-size: 18px; font-family: monospace; font-weight: 600; color: ${theme.colors.text};">
          ${safeRequestId}
        </p>
      </div>

      ${hasMatches ? `
        <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 16px; padding: 20px; text-align: left; margin-bottom: 32px;">
          <div style="display: flex; align-items: start;">
            <span style="font-size: 20px; margin-right: 12px;">🎉</span>
            <div>
              <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: ${theme.colors.secondary};">
                Good News!
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.5; color: ${theme.colors.text};">
                We found <strong>${safeMatchesCount} student guides</strong> who match your preferences.
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <a href="${baseUrl}/booking/status/${requestIdPath}" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(45, 183, 181, 0.3);">
        View Booking Status
      </a>
    </div>
  `;
    return StartupEmailLayout(content, 'Booking Request Received', `Your trip to ${safeCityText} is in the works.`);
};

/**
 * 6. New Booking Request (to Student Guide)
 * Tone: Energetic, responsible.
 */
export const getStudentRequestNotificationHtml = (
    studentName: string,
    city: string,
    acceptUrl: string
) => {
    const safeName = escapeHtml(studentName);
    const safeCity = escapeHtml(city);
    const safeCityText = sanitizeEmailText(city);
    const safeUrl = escapeHtml(validateUrl(acceptUrl));

    const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background-color: #EFF6FF; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🔔</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        New Request in ${safeCity}!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeName}</strong>, a tourist wants YOU to be their guide! This is your chance to show off your city.
      </p>

      <a href="${safeUrl}" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(45, 183, 181, 0.3);">
        View & Accept Request
      </a>
    </div>
  `;
    return StartupEmailLayout(content, 'New Tourist Request', `You have a new request in ${safeCityText}`);
};

/**
 * 6b. Student Match Invitation (Variant of Request)
 */
export const getStudentMatchInvitationHtml = (
    studentName: string,
    city: string,
    acceptUrl: string
) => {
    return getStudentRequestNotificationHtml(studentName, city, acceptUrl);
};

/**
 * 7a. Booking Accepted (to Tourist)
 * Tone: Excited, travel-ready.
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
    const safeTourist = escapeHtml(touristName);
    const safeStudent = escapeHtml(studentName);
    const safeCity = escapeHtml(city);
    const safeStudentText = sanitizeEmailText(studentName);
    const safeInstitute = escapeHtml(studentProfile.institute);
    const safeLanguages = Array.isArray(studentProfile.languages) && studentProfile.languages.length > 0
        ? studentProfile.languages.map(l => escapeHtml(String(l))).join(', ')
        : 'Not specified';
    const safeEmail = escapeHtml(studentProfile.email);

    const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🎉</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Guide Accepted!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeTourist}</strong>, great news! <strong>${safeStudent}</strong> has accepted your request for <strong>${safeCity}</strong>.
      </p>

      <div style="text-align: left; background-color: ${theme.colors.background}; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: ${theme.colors.secondary}; text-transform: uppercase; letter-spacing: 0.5px;">
          Guide Details
        </h3>
        <div style="margin-bottom: 12px; display: flex;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; flex-shrink: 0;">Name:</span>
            <span style="color: ${theme.colors.text}; font-weight: 500;">${safeStudent}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; flex-shrink: 0;">University:</span>
            <span style="color: ${theme.colors.text}; font-weight: 500;">${safeInstitute}</span>
        </div>
        <div style="margin-bottom: 12px; display: flex;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; flex-shrink: 0;">Languages:</span>
            <span style="color: ${theme.colors.text}; font-weight: 500;">${safeLanguages}</span>
        </div>
        <div style="display: flex;">
            <span style="font-weight: 600; color: ${theme.colors.textSecondary}; width: 100px; flex-shrink: 0;">Email:</span>
            <a href="mailto:${safeEmail}" style="color: ${theme.colors.primary}; text-decoration: none; font-weight: 500;">${safeEmail}</a>
        </div>
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'Guide Accepted', `${safeStudentText} has accepted your request!`);
};

/**
 * 7b. Booking Declined (to Tourist)
 * Tone: Soft, empathetic, helpful.
 */
export const getBookingDeclinedHtml = (
    touristName: string,
    studentName: string,
    city: string
) => {
    const safeTourist = escapeHtml(touristName);
    const safeStudent = escapeHtml(studentName);
    const safeCity = escapeHtml(city);
    const safeCityText = sanitizeEmailText(city);

    const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Update on Your Request
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeTourist}</strong>, unfortunately, <strong>${safeStudent}</strong> is not available for your trip to <strong>${safeCity}</strong>.
      </p>

      <div style="background-color: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <p style="margin: 0 0 16px; font-size: 16px; color: ${theme.colors.text}; font-weight: 500;">
          Don't worry! There are other guides available.
        </p>
        <a href="${baseUrl}/explore" style="display: inline-block; background-color: ${theme.colors.secondary}; color: white; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 50px; text-decoration: none;">
          Find Another Guide
        </a>
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'Update on Your Request', 'Let\'s find you another guide.');
};

/**
 * 7c. Student Confirmation (Finalized)
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
    const safeCityText = sanitizeEmailText(city);
    const safeDates = escapeHtml(dates);
    const safeEmail = escapeHtml(touristEmail);
    const safePhone = touristPhone ? escapeHtml(touristPhone) : undefined;
    const safeWhatsapp = touristWhatsapp ? escapeHtml(touristWhatsapp) : undefined;

    const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">✅</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Trip Confirmed!
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi <strong>${safeStudent}</strong>, you are confirmed for the trip in <strong>${safeCity}</strong>.
      </p>

      <div style="text-align: left; background-color: ${theme.colors.successBg}; border: 1px solid ${theme.colors.success}; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <div style="margin-bottom: 16px; display: flex;">
            <span style="font-weight: 600; color: ${theme.colors.success}; width: 100px; flex-shrink: 0;">Dates:</span>
            <span style="color: ${theme.colors.text}; font-weight: 500;">${safeDates}</span>
        </div>
        <div style="display: flex;">
            <span style="font-weight: 600; color: ${theme.colors.success}; width: 100px; flex-shrink: 0;">Tourist:</span>
            <span style="color: ${theme.colors.text}; font-weight: 500;">${safeTourist}</span>
        </div>
      </div>

      <div style="text-align: left; background-color: ${theme.colors.background}; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px; font-size: 14px; font-weight: 700; color: ${theme.colors.secondary}; text-transform: uppercase; letter-spacing: 0.5px;">
          Contact Info
        </h3>
        <div style="margin-bottom: 12px;">
          <strong style="color: ${theme.colors.textSecondary}; font-size: 14px;">Email:</strong><br>
          <a href="mailto:${safeEmail}" style="color: ${theme.colors.primary}; text-decoration: none; font-weight: 500;">${safeEmail}</a>
        </div>
        ${safeWhatsapp ? `
        <div style="margin-bottom: 12px;">
          <strong style="color: ${theme.colors.textSecondary}; font-size: 14px;">WhatsApp:</strong><br>
          <span style="color: ${theme.colors.text};">${safeWhatsapp}</span>
        </div>
        ` : ''}
        ${safePhone ? `
        <div>
          <strong style="color: ${theme.colors.textSecondary}; font-size: 14px;">Phone:</strong><br>
          <span style="color: ${theme.colors.text};">${safePhone}</span>
        </div>
        ` : ''}
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'Trip Confirmed', `You are confirmed for a trip in ${safeCityText}`);
};
