import { theme, StartupEmailLayout, escapeHtml, sanitizeEmailText, validateUrl } from './shared';

/**
 * 8. Payment Successful
 * Tone: Professional, friendly.
 */
export const getPaymentSuccessHtml = (
    amount: string,
    date: string,
    invoiceId: string
) => {
    const safeAmount = escapeHtml(amount);
    const safeAmountText = sanitizeEmailText(amount);
    const safeDate = escapeHtml(date);
    const safeInvoiceId = escapeHtml(invoiceId);

    const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background-color: ${theme.colors.successBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">🧾</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Payment Successful
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        Thank you! Your payment has been processed successfully.
      </p>

      <div style="background-color: ${theme.colors.background}; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: left;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid ${theme.colors.border}; padding-bottom: 16px;">
          <span style="color: ${theme.colors.textSecondary};">Amount Paid</span>
          <span style="font-weight: 700; color: ${theme.colors.text}; font-size: 18px;">${safeAmount}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: ${theme.colors.textSecondary}; font-size: 14px;">Date</span>
          <span style="color: ${theme.colors.text}; font-size: 14px;">${safeDate}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: ${theme.colors.textSecondary}; font-size: 14px;">Invoice ID</span>
          <span style="color: ${theme.colors.text}; font-size: 14px; font-family: monospace;">${safeInvoiceId}</span>
        </div>
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'Payment Receipt', `Receipt for ${safeAmountText}`);
};

/**
 * 9. Payment Failed
 * Tone: Calm, solution-oriented.
 */
export const getPaymentFailedHtml = (retryUrl: string) => {
    const safeUrl = escapeHtml(validateUrl(retryUrl));

    const content = `
    <div style="text-align: center;">
      <div style="width: 64px; height: 64px; background-color: ${theme.colors.errorBg}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px;">
        <span style="font-size: 32px;">⚠️</span>
      </div>

      <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: ${theme.colors.secondary};">
        Payment Couldn't Be Processed
      </h2>
      
      <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: ${theme.colors.textSecondary};">
        We ran into a small issue processing your payment. Don't worry, no money has been deducted.
      </p>

      <a href="${safeUrl}" style="display: inline-block; background-color: ${theme.colors.secondary}; color: white; font-weight: 600; font-size: 16px; padding: 16px 32px; border-radius: 50px; text-decoration: none; box-shadow: 0 4px 15px rgba(29, 53, 87, 0.3);">
        Retry Payment
      </a>
    </div>
  `;
    return StartupEmailLayout(content, 'Action Required: Payment Failed', 'Please update your payment method.');
};
