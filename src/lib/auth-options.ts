import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, requireDatabase } from "@/lib/prisma";
import { config } from "@/lib/config";

// Valid student email domains
const STUDENT_EMAIL_DOMAINS = [
  '.edu',
  '.edu.in',
  '.ac.uk',
  '.edu.au',
  '.edu.sg',
  '.ac.in',
  // Add more institution-specific domains as needed
];

function isStudentEmail(email: string): boolean {
  const lowerEmail = email.toLowerCase();
  return STUDENT_EMAIL_DOMAINS.some(domain => lowerEmail.endsWith(domain));
}

// Build providers array conditionally based on configuration
const providers = [];

// Only add EmailProvider if email is properly configured
// This prevents NextAuth from trying to use an unconfigured email service
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
        const nodemailer = (await import('nodemailer')).default
        const { host } = new URL(url)

        const transport = nodemailer.createTransport({
          host: config.email.host!,
          port: config.email.port,
          secure: false, // Use STARTTLS
          auth: {
            user: config.email.user!,
            pass: config.email.pass!,
          },
          // Add timeouts to prevent hanging
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        })

        const result = await transport.sendMail({
          to: email,
          from: provider.from,
          subject: `Sign in to ${host}`,
          text: text({ url, host }),
          html: html({ url, host, email }),
        })

        const failed = result.rejected.concat(result.pending).filter(Boolean)
        if (failed.length) {
          throw new Error(`Email (${failed.join(', ')}) could not be sent`)
        }

        if (config.app.isDevelopment) {
          console.log('✅ Magic link email sent to:', email)
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
<html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f9fafb;
      }
      .container {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
      }
      .content {
        padding: 40px 30px;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        padding: 16px 40px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);
        transition: transform 0.2s;
      }
      .button:hover {
        transform: translateY(-2px);
      }
      .footer {
        padding: 30px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
        border-top: 1px solid #e5e7eb;
      }
      .link-text {
        background: #f3f4f6;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
        word-break: break-all;
        font-size: 12px;
        color: #6b7280;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎓 Sign in to WanderNest</h1>
      </div>
      <div class="content">
        <p>Hi there!</p>
        <p>You requested a magic link to sign in to <strong>${escapedHost}</strong> using <strong>${escapedEmail}</strong>.</p>
        <p>Click the button below to sign in:</p>

        <div class="button-container">
          <a href="${url}" class="button">Sign in to WanderNest</a>
        </div>

        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <div class="link-text">${url}</div>

        <p><strong>This link will expire in 24 hours</strong> and can only be used once.</p>

        <p>If you didn't request this email, you can safely ignore it.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} WanderNest. All rights reserved.</p>
        <p>Connect students and travelers worldwide.</p>
      </div>
    </div>
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
    signIn: "/tourist/signin",  // Default to tourist signin
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

        if (!prisma) {
          console.error('❌ Auth: Database not available - cannot create user records')
          return false
        }

        // IMPORTANT: The PrismaAdapter automatically creates User + Account records
        // before this callback runs. We only update the userType field here.
        // The user.id will be set by the adapter.

        // Determine user type based on existing records
        // For returning users: check if Student or Tourist record exists
        // For new users: create BOTH records to allow access to either dashboard
        // The auth-landing pages (/student/auth-landing and /tourist/auth-landing) will
        // correct the userType if needed based on which signin page the user came from
        let userType: 'student' | 'tourist' = 'tourist';
        let isNewUser = false;

        try {
          const [existingStudent, existingTourist] = await Promise.all([
            prisma.student.findUnique({ where: { email: user.email }, select: { id: true } }),
            prisma.tourist.findUnique({ where: { email: user.email }, select: { id: true } })
          ]);

          if (existingStudent && existingTourist) {
            // User has both records - prefer student if they have .edu email, otherwise tourist
            // The auth-landing pages will correct this if the user signed in from the wrong page
            userType = isStudentEmail(user.email) ? 'student' : 'tourist';
          } else if (existingStudent) {
            // User already has a Student record - they're a student
            userType = 'student';
          } else if (existingTourist) {
            // User already has a Tourist record - they're a tourist
            userType = 'tourist';
          } else {
            // New user - will create both records to allow flexible access
            isNewUser = true;
            // Default to student if .edu email, otherwise tourist
            // The auth-landing pages will correct this if needed
            userType = isStudentEmail(user.email) ? 'student' : 'tourist';
          }

          if (config.app.isDevelopment) {
            console.log('🔍 Auth: User type determined:', {
              userType,
              isNewUser,
              hasStudentRecord: !!existingStudent,
              hasTouristRecord: !!existingTourist,
              emailDomainCheck: isStudentEmail(user.email)
            })
          }
        } catch (error) {
          console.error('⚠️  Auth: Error checking existing records, defaulting to tourist:', error)
          // On error, default to tourist (safer option)
          userType = 'tourist';
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

        // Create or update role-specific records
        // For new users: create BOTH Student and Tourist records to allow flexible access
        // For returning users: update their existing record(s)
        try {
          if (isNewUser) {
            // New user - create BOTH Student and Tourist records
            // This allows them to access either dashboard without AccessDenied errors
            const [student, tourist] = await Promise.all([
              prisma.student.upsert({
                where: { email: user.email },
                create: {
                  email: user.email,
                  name: user.name,
                  googleId: account?.provider === 'google' ? account.providerAccountId : null,
                  emailVerified: true,
                  profilePhotoUrl: user.image,
                },
                update: {
                  name: user.name || undefined,
                  ...(account?.provider === 'google' && { googleId: account.providerAccountId }),
                  emailVerified: true,
                  profilePhotoUrl: user.image || undefined,
                },
              }),
              prisma.tourist.upsert({
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
              })
            ]);

            if (config.app.isDevelopment) {
              console.log('✅ Auth: Created both Student and Tourist records for new user:', {
                studentId: student.id,
                touristId: tourist.id,
                email: user.email,
                defaultUserType: userType
              })
            }
          } else {
            // Returning user - update existing record(s)
            // Update whichever records already exist
            const updatePromises = [];

            if (userType === 'student') {
              updatePromises.push(
                prisma.student.upsert({
                  where: { email: user.email },
                  create: {
                    email: user.email,
                    name: user.name,
                    googleId: account?.provider === 'google' ? account.providerAccountId : null,
                    emailVerified: true,
                    profilePhotoUrl: user.image,
                  },
                  update: {
                    name: user.name || undefined,
                    ...(account?.provider === 'google' && { googleId: account.providerAccountId }),
                    emailVerified: true,
                    profilePhotoUrl: user.image || undefined,
                  },
                })
              );
            } else {
              updatePromises.push(
                prisma.tourist.upsert({
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
                })
              );
            }

            await Promise.all(updatePromises);

            if (config.app.isDevelopment) {
              console.log('✅ Auth: Updated existing record for returning user:', {
                email: user.email,
                userType
              })
            }
          }
        } catch (error) {
          console.error('⚠️  Auth: Error creating/updating role-specific record:', error)
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
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { userType: true },
          })

          const userType = dbUser?.userType || "tourist"
          session.user.userType = (userType === "student" || userType === "tourist") ? userType : "tourist"

          if (userType === "student") {
            // Check if student profile exists
            const student = await prisma.student.findUnique({
              where: { email: user.email || undefined },
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
          } else {
            // Check if tourist profile exists
            const tourist = await prisma.tourist.findUnique({
              where: { email: user.email || undefined },
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
              const student = await prisma.student.findUnique({
                where: { email: dbUser.email },
                select: {
                  id: true,
                  status: true,
                  city: true,
                },
              })
              token.hasCompletedOnboarding = !!student?.city // city is required field from onboarding
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
