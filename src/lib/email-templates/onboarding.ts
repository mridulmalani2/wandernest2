import { theme, StartupEmailLayout, escapeHtml, baseUrl } from './shared';

/**
 * 1. Signup OTP Email
 * Tone: Fast, minimal, trustworthy.
 */
export const getOtpEmailHtml = (otp: string, title: string = 'Verify Your Account', subtitle: string = 'Welcome to TourWiseCo! Use this code to complete your signup.') => {
  const safeTitle = escapeHtml(title);
  const safeSubtitle = escapeHtml(subtitle);
  const safeOtp = escapeHtml(otp);

  const content = `
    <div style="text-align: center;">
    <div style="text-align: center;">
      <!-- Badge using Table for compatibility -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="display: inline-block; background-color: ${theme.colors.successBg}; border-radius: 32px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 24px;">
            <span style="font-size: 32px; vertical-align: middle; margin-right: 12px;">👋</span>
            <span style="font-size: 20px; font-weight: 700; color: ${theme.colors.success}; vertical-align: middle;">Hello!</span>
          </td>
        </tr>
      </table>

      <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary}; letter-spacing: -0.5px;">
        ${safeTitle}
      </h1>
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Here&rsquo;s your secure sign-in code for TourWise:
      </p>
      
      <div style="background-color: ${theme.colors.background}; border-radius: 16px; padding: 24px; margin-bottom: 32px; letter-spacing: 8px; font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; color: ${theme.colors.primary}; border: 2px dashed ${theme.colors.primary}; display: inline-block; min-width: 200px;">
        ${safeOtp}
      </div>

      <p style="margin: 0; font-size: 14px; color: ${theme.colors.textSecondary}; line-height: 1.6;">
        This code expires in 10 minutes.<br/>
        If you didn&rsquo;t request this, you can ignore this email<br/>
        or <a href="mailto:team@tourwiseco.com" style="color: ${theme.colors.primary}; text-decoration: none;">reply and we&rsquo;ll help you</a>.
      </p>
    </div>
  `;
  return StartupEmailLayout(content, safeTitle, 'Use this code to finish signing in to TourWiseCo.');
};

/**
 * 2. Login / Password Reset OTP (Reuses getOtpEmailHtml with different defaults)
 * Tone: Calm, secure.
 */
export const getLoginOtpEmailHtml = (otp: string) => {
  return getOtpEmailHtml(otp, 'Secure Login', 'Use the code below to securely sign in to your account.');
}

/**
 * 3. Tourist Welcome Email
 * Tone: Friendly, travel-inspired.
 */
export const getTouristWelcomeHtml = (name: string) => {
  const safeName = escapeHtml(name);
  const content = `
    <div style="text-align: center;">
      <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: ${theme.colors.secondary};">
        Welcome to the Journey, ${safeName}! 🌍
      </h1>
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        You're now part of a community that believes the best way to see a city is through the eyes of a local student.
      </p>
      
      <div style="background-color: ${theme.colors.successBg}; border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 32px;">
        <h3 style="margin: 0 0 12px; font-size: 18px; color: ${theme.colors.secondary};">What's Next?</h3>
        <ul style="padding-left: 20px; margin: 0; color: ${theme.colors.text}; font-size: 15px; line-height: 1.8;">
          <li>📍 <strong>Pick a City:</strong> Find your next destination.</li>
          <li>🎓 <strong>Choose a Guide:</strong> Match with students who share your interests.</li>
          <li>🎒 <strong>Explore:</strong> Experience the city like a local.</li>
        </ul>
      </div>

      <a href="${baseUrl}/explore" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(45, 183, 181, 0.3);">
        Browse Guides Near You
      </a>
    </div>
  `;
  return StartupEmailLayout(content, 'Welcome to TourWiseCo', 'Ready to explore like a local?');
}

/**
 * 4. Student Guide Welcome Email
 * Tone: Supportive, empowering.
 */
export const getStudentWelcomeHtml = (name: string) => {
  const safeName = escapeHtml(name);
  const content = `
    <div style="text-align: center;">
      <h1 style="margin: 0 0 16px; font-size: 26px; font-weight: 700; color: ${theme.colors.secondary};">
        You're an Ambassador Now, ${safeName}! 🎓
      </h1>
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Welcome to the team. You have the power to shape how travelers experience your city.
      </p>
      
      <div style="background-color: #EFF6FF; border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 32px; border: 1px solid #BFDBFE;">
        <h3 style="margin: 0 0 12px; font-size: 18px; color: ${theme.colors.secondary};">Your First Steps</h3>
        <ul style="padding-left: 20px; margin: 0; color: ${theme.colors.text}; font-size: 15px; line-height: 1.8;">
          <li>📸 <strong>Complete Profile:</strong> Add a great photo and bio.</li>
          <li>🗓️ <strong>Set Availability:</strong> Let tourists know when you're free.</li>
          <li>💬 <strong>Be Responsive:</strong> Fast replies get more bookings.</li>
        </ul>
      </div>

      <a href="${baseUrl}/student/profile" style="display: inline-block; background-color: ${theme.colors.secondary}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(29, 53, 87, 0.3);">
        Complete Your Profile
      </a>
    </div>
  `;
  return StartupEmailLayout(content, 'Welcome to the Team', 'Start your journey as a local guide.');
}
