import { theme, StartupEmailLayout, escapeHtml } from './shared';

/**
 * Contact Form Email Template (Existing)
 */
export const getContactFormEmailHtml = (
    name: string,
    email: string,
    message: string,
    phone?: string,
    fileUrl?: string,
    fileName?: string
) => {
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);
    const safePhone = phone ? escapeHtml(phone) : undefined;
    const safeFileUrl = fileUrl ? escapeHtml(fileUrl) : undefined;
    const safeFileName = fileName ? escapeHtml(fileName) : undefined;

    const content = `
    <div style="text-align: left;">
      <h2 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 700; color: ${theme.colors.secondary};">
        New Contact Message
      </h2>
      
      <div style="background-color: ${theme.colors.background}; border-radius: 16px; padding: 24px; border: 1px solid ${theme.colors.border};">
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">From</p>
          <p style="margin: 0; font-size: 16px; color: ${theme.colors.text}; font-weight: 500;">
            ${safeName} <span style="color: ${theme.colors.textSecondary}; font-weight: 400;">&lt;${safeEmail}&gt;</span>
          </p>
        </div>

        ${safePhone ? `
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">Phone</p>
          <p style="margin: 0; font-size: 16px; color: ${theme.colors.text}; font-weight: 500;">${safePhone}</p>
        </div>
        ` : ''}
        
        <div>
          <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">Message</p>
          <div style="background-color: ${theme.colors.surface}; padding: 20px; border-radius: 8px; border: 1px solid ${theme.colors.border};">
            <p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${theme.colors.text}; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>

        ${safeFileUrl ? `
        <div style="margin-top: 20px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${theme.colors.textSecondary}; text-transform: uppercase;">Attachment</p>
          <p style="margin: 0; font-size: 15px; color: ${theme.colors.text};">
            <a href="${safeFileUrl}" style="color: ${theme.colors.primary}; text-decoration: underline;">
              ${safeFileName ? safeFileName : 'View uploaded file'}
            </a>
          </p>
        </div>
        ` : ''}
      </div>
    </div>
  `;
    return StartupEmailLayout(content, 'New Contact Message', `New message from ${safeName}`);
};
