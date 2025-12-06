import { theme, StartupEmailLayout, escapeHtml, validateUrl } from './shared';

/**
 * 10. Tour Reminder
 * Tone: Warm, helpful.
 */
export const getTourReminderHtml = (
    name: string,
    guideName: string,
    city: string,
    date: string,
    time: string,
    meetingPoint: string
) => {
    const safeName = escapeHtml(name);
    const safeGuide = escapeHtml(guideName);
    const safeCity = escapeHtml(city);
    const safeDate = escapeHtml(date);
    const safeTime = escapeHtml(time);
    const safeMeeting = escapeHtml(meetingPoint);

    const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Ready for Tomorrow, ${safeName}? 🎒
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Your trip with <strong>${safeGuide}</strong> in <strong>${safeCity}</strong> is coming up!
      </p>

      <div style="background-color: ${theme.colors.background}; border-radius: 16px; padding: 24px; text-align: left; margin-bottom: 32px;">
        <div style="margin-bottom: 16px; display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 12px; width: 24px; text-align: center;">🗓️</span>
          <span style="color: ${theme.colors.text}; font-weight: 600;">${safeDate}</span>
        </div>
        <div style="margin-bottom: 16px; display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 12px; width: 24px; text-align: center;">⏰</span>
          <span style="color: ${theme.colors.text}; font-weight: 600;">${safeTime}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <span style="font-size: 20px; margin-right: 12px; width: 24px; text-align: center;">📍</span>
          <span style="color: ${theme.colors.text}; font-weight: 600;">${safeMeeting}</span>
        </div>
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'Trip Reminder', `Your trip to ${safeCity} is tomorrow!`);
};

/**
 * 11. Post-Tour Thank You
 * Tone: Heartfelt, community-oriented.
 */
export const getThankYouHtml = (name: string) => {
    const safeName = escapeHtml(name);
    const content = `
    <div style="text-align: center;">
      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Hope You Had a Blast, ${safeName}! 🌟
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Thank you for exploring with TourWiseCo. By booking a student guide, you've supported local education and cultural exchange.
      </p>

      <div style="background-color: ${theme.colors.accent}; color: ${theme.colors.secondary}; border-radius: 16px; padding: 24px; font-weight: 600; margin-bottom: 32px;">
        "Travel is the only thing you buy that makes you richer."
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'Thanks for traveling with us!', 'We hope you made great memories.');
};

/**
 * 12. Review Request
 * Tone: Friendly nudge.
 */
export const getReviewRequestHtml = (
    name: string,
    guideName: string,
    reviewUrl: string
) => {
    const safeName = escapeHtml(name);
    const safeGuide = escapeHtml(guideName);
    const safeUrl = validateUrl(reviewUrl);

    const content = `
    <div style="text-align: center;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 32px; color: ${theme.colors.accent};">⭐⭐⭐⭐⭐</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        How was ${safeGuide}?
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Hi ${safeName}, help other travelers by sharing your experience. It only takes a minute!
      </p>

      <a href="${safeUrl}" style="display: inline-block; background-color: ${theme.colors.primary}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(45, 183, 181, 0.3);">
        Leave a Review
      </a>
    </div>
  `;
    return StartupEmailLayout(content, 'Rate your experience', `How was your trip with ${safeGuide}?`);
};
