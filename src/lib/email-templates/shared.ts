import { config } from '@/lib/config';

// ============================================================================
// BRANDING & DESIGN SYSTEM
// ============================================================================

export const theme = {
    colors: {
        primary: '#2DB7B5',    // Teal - Fresh, trustworthy, energetic
        secondary: '#1D3557',  // Deep Navy - Professional, secure
        accent: '#FFCF56',     // Warm Sunshine - Friendly, highlighting
        background: '#F5F7FA', // Light Gray - Clean base
        surface: '#ffffff',
        text: '#1F2937',       // Gray 800 - Readable
        textSecondary: '#6B7280', // Gray 500
        border: '#E5E7EB',     // Gray 200
        success: '#10B981',    // Green
        successBg: '#ECFDF5',
        error: '#EF4444',      // Red
        errorBg: '#FEF2F2',
        warning: '#F59E0B',    // Amber
    },
    fonts: {
        headings: '"Poppins", "Montserrat", sans-serif',
        body: '"Inter", "Lato", sans-serif',
    },
};

// Security: Helper to escape HTML characters to prevent XSS
export function escapeHtml(text: string | null | undefined | number): string {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Security: Helper to validate allow-listed URLs to prevent open redirects
export function validateUrl(url: string): string {
    const baseUrl = config.app.baseUrl || 'https://tourwiseco.com';
    try {
        if (url.startsWith('/')) {
            return `${baseUrl}${url}`;
        }
        const parsedUrl = new URL(url);
        const trustedHost = new URL(baseUrl).host;
        if (parsedUrl.host === trustedHost) {
            return url;
        }
        console.warn(`[Security] Blocked potential open redirect: ${url}`);
        return baseUrl;
    } catch (e) {
        return baseUrl;
    }
}

export const baseUrl = config.app.baseUrl || 'https://tourwiseco.com';

/**
 * Startup-Ready Email Layout
 * A youthful, trustworthy, and travel-inspired layout.
 */
export const StartupEmailLayout = (content: string, title: string = 'TourWiseCo', preheader: string = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Poppins', sans-serif; }
    .btn-primary:hover { background-color: #259d9b !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${theme.colors.background}; font-family: ${theme.fonts.body}; -webkit-font-smoothing: antialiased; color: ${theme.colors.text}; line-height: 1.6;">
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${theme.colors.background}; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Brand Header -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin-bottom: 24px;">
          <tr>
            <td align="center">
              <div style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 24px; color: ${theme.colors.secondary}; letter-spacing: -0.5px;">
                <span style="color: ${theme.colors.primary};">Tour</span>WiseCo
              </div>
            </td>
          </tr>
        </table>

        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: ${theme.colors.surface}; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(29, 53, 87, 0.1); overflow: hidden;">
          
          <!-- Decorative Top Bar -->
          <tr>
            <td style="height: 8px; background: linear-gradient(90deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);"></td>
          </tr>

          <!-- Content Area -->
          <tr>
            <td style="padding: 48px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 32px 40px; border-top: 1px solid ${theme.colors.border}; text-align: center;">
              <div style="margin-bottom: 20px;">
                <a href="${baseUrl}" style="color: ${theme.colors.secondary}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Home</a>
                <a href="${baseUrl}/explore" style="color: ${theme.colors.secondary}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Explore</a>
                <a href="${baseUrl}/support" style="color: ${theme.colors.secondary}; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 12px;">Support</a>
              </div>

              <p style="margin: 0 0 12px; font-size: 13px; color: ${theme.colors.textSecondary};">
                Connecting curious travelers with local student guides.
              </p>
              
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                © ${new Date().getFullYear()} TourWiseCo. All rights reserved.<br>
                Made with ❤️ for travel.
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
