import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, requireDatabase } from "@/lib/prisma";
import { config } from "@/lib/config";
import { isStudentEmail, getStudentEmailErrorMessage } from "@/lib/email-validation";
import { logger } from "@/lib/logger";
import { maskEmail } from "@/lib/utils";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeEmailText(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function sanitizeMagicLinkUrl(url: string): string {
  const baseUrl = config.app.baseUrl || 'https://tourwiseco.com';
  const base = new URL(baseUrl);
  try {
    const parsedUrl = url.startsWith('/') ? new URL(url, base) : new URL(url);
    if (parsedUrl.host !== base.host) {
      return base.toString();
    }
    if (parsedUrl.protocol !== base.protocol) {
      return base.toString();
    }
    if (parsedUrl.username || parsedUrl.password) {
      return base.toString();
    }
    return new URL(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`, base).toString();
  } catch (error) {
    return base.toString();
  }
}

// Build providers array conditionally based on configuration
const providers = [];

// ============================================================================
// EMAIL PROVIDER CONFIGURATION (REQUIRED FOR STUDENT MAGIC-LINK SIGN-IN)
// ============================================================================
// Only add EmailProvider if email is properly configured (Resend or SMTP).
// This prevents NextAuth from trying to use an unconfigured email service.
//
// Preferred: RESEND_API_KEY (recommended for production)
// Fallback: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS (SMTP)
//
// Without these, students will see a "Sign-In Unavailable" message on the student sign-in page.
// ============================================================================
if (config.email.isConfigured) {
  // Build server config - use dummy values if only Resend is configured
  // (these won't be used since we override sendVerificationRequest)
  const serverConfig = config.email.host
    ? {
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user!,
        pass: config.email.pass!,
      },
      secure: config.email.port === 465,
      tls: {
        rejectUnauthorized: config.app.isProduction,
      },
    }
    : {
      // Dummy config when only Resend is available
      host: 'dummy.smtp.server',
      port: 587,
      auth: {
        user: 'dummy@example.com',
        pass: 'dummy',
      },
    };

  providers.push(
    EmailProvider({
      server: serverConfig,
      from: config.email.from,
      async sendVerificationRequest({ identifier: email, url, provider }) {

        // Removed Legacy Student Domain Check
        // Students now use /student/signup with OTP

        const safeUrl = sanitizeMagicLinkUrl(url);
        const safeHost = new URL(safeUrl).host;
        const safeEmail = sanitizeEmailText(email);

        // Try Resend first if available
        if (config.email.resendApiKey) {
          try {
            const { Resend } = await import('resend')
            const resend = new Resend(config.email.resendApiKey)

            if (config.app.isDevelopment) {
              logger.info('Magic link email via Resend - sending', {
                to: maskEmail(email),
                from: provider.from,
              })
            }

            // Resend SDK v6+ returns { data, error }
            const response = await resend.emails.send({
              from: provider.from,
              to: email,
              subject: `Sign in to ${safeHost}`,
              html: html({ url: safeUrl, host: safeHost, email: safeEmail }),
            })

            if (response.error) {
              throw new Error(response.error.message)
            }

            logger.info('Magic link email via Resend - sent', {
              to: maskEmail(email),
              messageId: response.data?.id,
            })
            return
          } catch (error) {
            logger.error('Magic link email via Resend - failed', {
              error: error instanceof Error ? error.message : String(error),
            })
            // Fall through to SMTP if Resend fails
            if (!config.email.host) {
              throw error // No fallback available
            }
            logger.warn('Magic link email via Resend - falling back to SMTP')
          }
        }

        // Fallback to SMTP
        const nodemailer = (await import('nodemailer')).default
        const transport = nodemailer.createTransport({
          host: config.email.host!,
          port: config.email.port,
          secure: config.email.port === 465,
          auth: {
            user: config.email.user!,
            pass: config.email.pass!,
          },
          tls: {
            rejectUnauthorized: config.app.isProduction,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        })

        try {
          if (config.app.isDevelopment) {
            logger.info('Magic link email via SMTP - sending', {
              to: maskEmail(email),
              from: provider.from,
              host: config.email.host,
              port: config.email.port,
            })
          }

          const result = await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to ${safeHost}`,
            text: text({ url: safeUrl, host: safeHost }),
            html: html({ url: safeUrl, host: safeHost, email: safeEmail }),
          })

          const failed = result.rejected.concat(result.pending).filter(Boolean)
          if (failed.length) {
            logger.error('Magic link email via SMTP - failed', {
              failed,
            })
            throw new Error(`Email (${failed.join(', ')}) could not be sent`)
          }

          logger.info('Magic link email via SMTP - sent', {
            to: maskEmail(email),
            messageId: result.messageId,
          })
        } catch (error) {
          logger.error('Magic link email via SMTP - failed', {
            error: error instanceof Error ? error.message : String(error),
            code: error instanceof Error ? (error as any).code : undefined,
            command: error instanceof Error ? (error as any).command : undefined,
            resendConfigured: !!config.email.resendApiKey,
            smtpHostConfigured: !!config.email.host,
            smtpUserConfigured: !!config.email.user,
            smtpPassConfigured: !!config.email.pass,
            isConfigured: config.email.isConfigured,
          })
          throw error
        }
      },
    })
  );
  logger.info('EmailProvider configured - magic link authentication enabled');
  if (config.email.resendApiKey) {
    logger.info('Magic link provider: Resend API');
  } else {
    logger.info('Magic link provider: SMTP');
  }
} else {
  logger.warn('EmailProvider not configured - magic link authentication disabled');
  logger.warn('Set RESEND_API_KEY or EMAIL_HOST/EMAIL_USER/EMAIL_PASS to enable magic links');
}

// Email HTML template
/**
 * Generates the HTML email template for magic link sign-in.
 * @param params - Object containing url, host, and email
 * @returns HTML string for the email
 */
function html({ url, host, email }: { url: string; host: string; email: string }) {
  const escapedEmail = escapeHtml(email)
  const escapedHost = escapeHtml(host)
  const escapedUrl = escapeHtml(url)

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Sign in to TourWiseCo</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f3f4f6;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);">

            <!-- Brand Header -->
            <tr>
              <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 40px; text-align: center;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                  TourWiseCo
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.9);">
                  Connect with Local Student Guides
                </p>
              </td>
            </tr>

            <!-- Hero Section -->
            <tr>
              <td style="padding: 48px 40px 32px 40px; text-align: center;">
                <div style="font-size: 56px; line-height: 1; margin-bottom: 24px;">🔑</div>
                <h2 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 700; color: #111827;">
                  Sign in to Your Account
                </h2>
                <p style="margin: 0; font-size: 16px; color: #6b7280; line-height: 1.5;">
                  Click the button below to securely sign in
                </p>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 0 40px 48px 40px;">
                <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #374151;">
                  You requested a magic link to sign in to <strong>${escapedHost}</strong> using <strong>${escapedEmail}</strong>.
                </p>

                <!-- CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 32px 0;">
                  <tr>
                    <td align="center">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="border-radius: 12px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);">
                            <a href="${escapedUrl}" style="display: inline-block; padding: 18px 48px; font-size: 17px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                              🔓 Sign in to TourWiseCo
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- Alternative Link -->
                <p style="margin: 32px 0 16px 0; font-size: 14px; color: #6b7280; text-align: center;">
                  If the button doesn't work, copy and paste this link:
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 0 0 32px 0;">
                  <tr>
                    <td style="word-break: break-all; font-size: 13px; color: #6b7280; text-align: center; font-family: 'Courier New', monospace;">
                      ${escapedUrl}
                    </td>
                  </tr>
                </table>

                <!-- Security Info -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; margin: 24px 0;">
                  <tr>
                    <td style="padding: 20px;">
                      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #92400e;">
                        🔒 Security Notice
                      </p>
                      <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #92400e;">
                        • This link expires in <strong>24 hours</strong> and can only be used once<br>
                        • If you didn't request this, you can safely ignore this email<br>
                        • Never share this link with anyone
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280; text-align: center;">
                  Questions? We're here to help!
                </p>
                <p style="margin: 0; font-size: 13px; color: #9ca3af; text-align: center; line-height: 1.6;">
                  © ${new Date().getFullYear()} TourWiseCo · Connecting travelers with local student guides worldwide
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`
}

// Email text template (fallback for email clients that don't support HTML)
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${sanitizeEmailText(host)}\n\n${sanitizeEmailText(url)}\n\n`
}

// Always add GoogleProvider (required for authentication)
providers.push(
  GoogleProvider({
    clientId: config.auth.google.clientId || "",
    clientSecret: config.auth.google.clientSecret || "",
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    },
    // Allow automatic account linking when email matches
    // This prevents OAuthAccountNotLinked errors when users sign in
    // with different methods (email + OAuth) using the same email address
    allowDangerousEmailAccountLinking: true
  })
);

export const authOptions: NextAuthOptions = {
  // Use prisma instead of requireDatabase() to avoid build-time errors
  // The adapter gracefully handles null prisma in demo mode
  adapter: prisma ? (PrismaAdapter(prisma) as any) : undefined,
  providers: providers,
  pages: {
    signIn: "/booking",  // Default to booking page which handles tourist signin
    // Note: We intentionally do NOT set an error page here.
    // This allows NextAuth to append error info to the callbackUrl,
    // which lets student and tourist signin pages handle their own errors.
  },
  // Cookie configuration for production security
  // Note: Vercel proxy handling is automatically configured via NEXTAUTH_URL environment variable
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Log sign-in attempt for debugging
        if (config.app.isDevelopment) {
          logger.info('Auth: Sign-in attempt', {
            provider: account?.provider,
            email: maskEmail(user.email),
            userId: user.id,
            accountId: account?.providerAccountId,
          })
        }

        if (!user.email) {
          logger.error('Auth: Sign-in failed - no email provided', {
            provider: account?.provider,
          })
          return false
        }

        // ====================================================================
        // AUTHENTICATION POLICY - TOURISTS ONLY
        // ====================================================================
        // NextAuth is now exclusively for Tourists.
        // Students must use the dedicated Student Sign-In page (OTP-based).
        // ====================================================================

        if (isStudentEmail(user.email)) {
          logger.info('Auth: Student email detected in NextAuth flow. Blocking sign-in.', {
            email: maskEmail(user.email),
          })
          // Return false to deny access. 
          // Ideally we'd redirect to /student/signin but NextAuth callbacks are limited.
          return false;
        }

        const userType = 'tourist';

        // Check if this is a new user by checking for existing role-specific record
        let isNewUser = false;

        try {
          const existingRecord = await prisma.tourist.findUnique({ where: { email: user.email }, select: { id: true } });

          isNewUser = !existingRecord;

          if (config.app.isDevelopment) {
            logger.info('Auth: User type determined', {
              userType,
              isNewUser,
              emailDomain: user.email.split('@')[1],
              isEducationalDomain: isStudentEmail(user.email),
            })
          }
        } catch (error) {
          logger.error('Auth: Error checking existing record', {
            error: error instanceof Error ? error.message : String(error),
          })
          // Assume new user on error to ensure record creation
          isNewUser = true;
        }

        // Update the userType field on the User record (already created by adapter)
        if (user.id) {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { userType },
            })

            if (config.app.isDevelopment) {
              logger.info('Auth: Updated user record with userType', { userType })
            }
          } catch (error) {
            logger.error('Auth: Error updating user record', {
              error: error instanceof Error ? error.message : String(error),
            })
            // Continue anyway - this is not critical for sign-in
          }
        }

        // Create or update Tourist record
        try {
          const tourist = await prisma.tourist.upsert({
            where: { email: user.email },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account?.provider === 'google' ? account.providerAccountId : null,
            },
            update: {
              name: user.name || undefined,
              image: user.image || undefined,
              ...(account?.provider === 'google' && { googleId: account.providerAccountId }),
            },
          });

          if (config.app.isDevelopment) {
            logger.info(`Auth: ${isNewUser ? 'Created' : 'Updated'} Tourist record`, {
              touristId: tourist.id,
              email: maskEmail(user.email),
              isNewUser
            })
          }
        } catch (error) {
          logger.error('Auth: Error creating/updating Tourist record', {
            error: error instanceof Error ? error.message : String(error),
          })
          // Log but continue - we want to allow sign-in even if this fails
        }

        if (config.app.isDevelopment) {
          logger.info('Auth: Sign-in successful', {
            email: maskEmail(user.email),
            userType,
          })
        }

        return true
      } catch (error) {
        logger.error('Auth: Sign-in callback failed', {
          error: error instanceof Error ? error.message : String(error),
          email: maskEmail(user.email),
        })
        return false
      }
    },
    async session({ session, user }) {
      try {
        // Add user ID to session
        if (session.user) {
          session.user.id = user.id

          if (!prisma) {
            logger.warn('Auth: Database not available - session will have limited data')
            return session
          }

          // Get the full user record to check userType
          // Note: userType is immutable and determined by email domain
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { userType: true },
          })

          const userType = dbUser?.userType || "tourist"
          session.user.userType = (userType === "student" || userType === "tourist") ? userType : "tourist"

          // Legacy check for student type just in case, but mostly for Tourist
          if (userType === "tourist" && user.email) {
            const tourist = await prisma.tourist.findUnique({
              where: { email: user.email },
              select: {
                id: true,
                name: true,
              },
            })

            // Add tourist info to session
            session.user.touristId = tourist?.id
          }
        }
        return session
      } catch (error) {
        logger.error('Auth: Session callback failed', {
          error: error instanceof Error ? error.message : String(error),
          userId: user?.id,
        })
        // Return session with partial data rather than failing completely
        return session
      }
    },
    async redirect({ url, baseUrl }) {
      // Custom redirect based on user type and callback URL

      // If url is already specified and starts with baseUrl, use it
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // If url starts with a slash, it's a relative path - combine with baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // For external URLs, only allow if they start with baseUrl
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          return url;
        }
      } catch (e) {
        // Invalid URL, fall through to default
      }

      // Default redirect to baseUrl
      return baseUrl;
    },
    async jwt({ token, user, trigger }) {
      try {
        // Add custom fields to JWT token for middleware access
        if (user) {
          token.id = user.id
        }

        if (!prisma) {
          logger.warn('Auth: Database not available - JWT will have limited data')
          return token
        }

        // Always fetch fresh user data to keep token in sync with database
        // Note: userType is immutable and determined by email domain
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: {
              id: true,
              userType: true,
              email: true,
            },
          })

          if (dbUser) {
            token.userType = dbUser.userType as 'student' | 'tourist'
          }
        }

        return token
      } catch (error) {
        logger.error('Auth: JWT callback failed', {
          error: error instanceof Error ? error.message : String(error),
          email: maskEmail(token.email),
        })
        // Return token with partial data rather than failing completely
        return token
      }
    },
  },
  session: {
    strategy: "database",
  },
  // NEXTAUTH_SECRET is required for production - config validation will throw error if missing
  secret: config.auth.nextAuth.secret || process.env.NEXTAUTH_SECRET,
};
