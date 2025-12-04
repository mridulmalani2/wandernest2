import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, requireDatabase } from "@/lib/prisma";
import { config } from "@/lib/config";
import { isStudentEmail, getStudentEmailErrorMessage } from "@/lib/email-validation";

// Build providers array conditionally based on configuration
const providers = [];

// ============================================================================
// EMAIL PROVIDER CONFIGURATION (REQUIRED FOR STUDENT MAGIC-LINK SIGN-IN)
// ============================================================================
// Only add EmailProvider if email is properly configured with SMTP credentials.
// This prevents NextAuth from trying to use an unconfigured email service.
//
// Required environment variables for magic-link to work:
// - EMAIL_HOST (e.g., smtp.gmail.com)
// - EMAIL_PORT (e.g., 587 for TLS, 465 for SSL)
// - EMAIL_USER (SMTP username / email address)
// - EMAIL_PASS (SMTP password / app password)
// - EMAIL_FROM (sender address shown in emails)
//
// Without these, students will see a "Sign-In Unavailable" message on the student sign-in page.
// ============================================================================
if (config.email.isConfigured) {
  providers.push(
    EmailProvider({
      server: {
        host: config.email.host!,
        port: config.email.port,
        auth: {
          user: config.email.user!,
          pass: config.email.pass!,
        },
        secure: config.email.port === 465, // true for 465 (SSL), false for other ports like 587 (STARTTLS)
        tls: {
          rejectUnauthorized: config.app.isProduction, // Enforce in production, allow self-signed in dev
        },
      },
      from: config.email.from,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        // ========================================================================
        // STUDENT EMAIL DOMAIN VALIDATION
        // ========================================================================
        // Students can ONLY sign in with magic-link using verified educational
        // email domains (e.g., .edu, .ac.uk, .edu.au, etc.).
        //
        // This server-side check ensures domain validation even if client-side
        // validation is bypassed. The list of valid domains is maintained in
        // src/lib/email-validation.ts
        // ========================================================================

        // Check if this is a student sign-in flow by examining the callback URL
        const magicLinkUrl = new URL(url);
        const callbackUrl = magicLinkUrl.searchParams.get('callbackUrl') || '';
        const isStudentFlow = callbackUrl.includes('/student/auth-landing') || callbackUrl.includes('intent=student');

        // Validate email domain for student flows
        if (isStudentFlow && !isStudentEmail(email)) {
          console.error('❌ Auth: Student sign-in rejected - invalid email domain:', email);
          throw new Error(
            `Invalid email domain. Students must use a university or institutional email address (e.g., .edu, .ac.uk, .edu.au). The email "${email}" is not from a recognized educational institution.`
          );
        }

        if (config.app.isDevelopment && isStudentFlow) {
          console.log('🎓 Auth: Student email validation passed:', email);
        }

        const nodemailer = (await import('nodemailer')).default
        const { host } = new URL(url)

        const transport = nodemailer.createTransport({
          host: config.email.host!,
          port: config.email.port,
          secure: config.email.port === 465, // true for 465 (SSL), false for other ports like 587 (STARTTLS)
          auth: {
            user: config.email.user!,
            pass: config.email.pass!,
          },
          tls: {
            rejectUnauthorized: config.app.isProduction, // Enforce in production, allow self-signed in dev
          },
          // Add timeouts to prevent hanging
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        })

        try {
          if (config.app.isDevelopment) {
            console.log('📧 Attempting to send magic link email...')
            console.log('   To:', email)
            console.log('   From:', provider.from)
            console.log('   SMTP Host:', config.email.host)
            console.log('   SMTP Port:', config.email.port)
          }

          const result = await transport.sendMail({
            to: email,
            from: provider.from,
            subject: `Sign in to ${host}`,
            text: text({ url, host }),
            html: html({ url, host, email }),
          })

          const failed = result.rejected.concat(result.pending).filter(Boolean)
          if (failed.length) {
            console.error('❌ Email failed to send:', failed.join(', '))
            console.error('   SMTP Response:', JSON.stringify(result, null, 2))
            throw new Error(`Email (${failed.join(', ')}) could not be sent`)
          }

          console.log('✅ Magic link email sent successfully to:', email)
          console.log('   Message ID:', result.messageId)
        } catch (error) {
          console.error('❌ Error sending magic link email:', error)
          if (error instanceof Error) {
            console.error('   Error message:', error.message)
            console.error('   Error name:', error.name)
            if ('code' in error) {
              console.error('   Error code:', (error as any).code)
            }
            if ('command' in error) {
              console.error('   SMTP command:', (error as any).command)
            }
            console.error('   Error stack:', error.stack)
          }
          console.error('   Email config check:')
          console.error('     - EMAIL_HOST set:', !!config.email.host)
          console.error('     - EMAIL_USER set:', !!config.email.user)
          console.error('     - EMAIL_PASS set:', !!config.email.pass)
          console.error('     - isConfigured:', config.email.isConfigured)
          throw error
        }
      },
    })
  );
  console.log('✅ EmailProvider configured - magic link authentication enabled');
} else {
  console.log('⚠️  EmailProvider not configured - magic link authentication disabled');
  console.log('   Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS environment variables to enable');
}

// Email HTML template
function html({ url, host, email }: { url: string; host: string; email: string }) {
  const escapedEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const escapedHost = host.replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
                            <a href="${url}" style="display: inline-block; padding: 18px 48px; font-size: 17px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
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
                      ${url}
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
  return `Sign in to ${host}\n\n${url}\n\n`
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
          console.log('🔐 Auth: Sign-in attempt', {
            provider: account?.provider,
            email: user.email,
            userId: user.id,
            accountId: account?.providerAccountId
          })
        }

        if (!user.email) {
          console.error('❌ Auth: Sign-in failed - no email provided')
          console.error('   Provider:', account?.provider)
          console.error('   Profile:', profile)
          return false
        }

        // ====================================================================
        // AUTHENTICATION POLICY - TOURISTS ONLY
        // ====================================================================
        // NextAuth is now exclusively for Tourists.
        // Students must use the dedicated Student Sign-In page (OTP-based).
        // ====================================================================

        if (isStudentEmail(user.email)) {
          console.log('🚫 Auth: Student email detected in NextAuth flow. Blocking sign-in.', user.email);
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
            console.log('🔍 Auth: User type determined:', {
              userType,
              isNewUser,
              emailDomain: user.email.split('@')[1],
              isEducationalDomain: isStudentEmail(user.email)
            })
          }
        } catch (error) {
          console.error('⚠️  Auth: Error checking existing record:', error)
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
              console.log('✅ Auth: Updated user record with userType:', userType)
            }
          } catch (error) {
            console.error('⚠️  Auth: Error updating user record:', error)
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
            console.log(`✅ Auth: ${isNewUser ? 'Created' : 'Updated'} Tourist record:`, {
              touristId: tourist.id,
              email: user.email,
              isNewUser
            })
          }
        } catch (error) {
          console.error('⚠️  Auth: Error creating/updating Tourist record:', error)
          // Log but continue - we want to allow sign-in even if this fails
        }

        if (config.app.isDevelopment) {
          console.log('✅ Auth: Sign-in successful for', user.email, 'as', userType)
        }

        return true
      } catch (error) {
        console.error('❌ Auth: Sign-in callback failed:', error)
        console.error('   User email:', user.email)
        if (error instanceof Error) {
          console.error('   Error message:', error.message)
          console.error('   Stack:', error.stack)
        }
        return false
      }
    },
    async session({ session, user }) {
      try {
        // Add user ID to session
        if (session.user) {
          session.user.id = user.id

          if (!prisma) {
            console.warn('⚠️  Auth: Database not available - session will have limited data')
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

          if (userType === "student") {
            // Check if student profile exists
            if (user.email) {
              const student = await prisma.student.findUnique({
                where: { email: user.email },
                select: {
                  id: true,
                  status: true,
                  name: true,
                  city: true,
                },
              })

              // Add student info to session
              session.user.studentId = student?.id
              session.user.studentStatus = student?.status
              session.user.hasCompletedOnboarding = !!student
            }
          } else {
            // Check if tourist profile exists
            if (user.email) {
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
        }
        return session
      } catch (error) {
        console.error('❌ Auth: Session callback failed:', error)
        console.error('   User ID:', user?.id)
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
          console.warn('⚠️  Auth: Database not available - JWT will have limited data')
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

            // Check if student has completed onboarding
            if (dbUser.userType === 'student' && dbUser.email) {
              try {
                const student = await prisma.student.findUnique({
                  where: { email: dbUser.email },
                  select: {
                    id: true,
                    status: true,
                    city: true,
                  },
                })
                token.hasCompletedOnboarding = !!student?.city // city is required field from onboarding
              } catch (error) {
                console.error('⚠️  Auth: Error fetching student onboarding status:', error)
                token.hasCompletedOnboarding = false
              }
            }
          }
        }

        return token
      } catch (error) {
        console.error('❌ Auth: JWT callback failed:', error)
        console.error('   Token email:', token.email)
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
