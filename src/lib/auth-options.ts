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
      },
      from: config.email.from,
    })
  );
} else if (config.app.isDevelopment) {
  console.log('⚠️  EmailProvider not configured - magic link authentication disabled');
}

// Always add GoogleProvider (required for authentication)
providers.push(
  GoogleProvider({
    clientId: config.auth.google.clientId || "",
    clientSecret: config.auth.google.clientSecret || "",
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(requireDatabase()) as any,
  providers: providers,
  pages: {
    signIn: "/tourist/signin",  // Default to tourist signin
    error: "/tourist/signin", // Error page
  },
  // Trust host for Vercel deployment (required for proper proxy handling)
  trustHost: true,
  // Cookie configuration for production security
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
        if (!user.email) {
          console.error('❌ Auth: Sign-in failed - no email provided')
          return false
        }

        if (!prisma) {
          console.error('❌ Auth: Database not available - cannot create user records')
          return false
        }

        // Determine if this is a student or tourist based on email domain
        const isStudent = isStudentEmail(user.email)

        // Update or create the User record with userType
        await prisma.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            userType: isStudent ? "student" : "tourist",
          },
          update: {
            name: user.name,
            image: user.image,
            userType: isStudent ? "student" : "tourist",
          },
        })

        // Create or update role-specific record based on user type
        if (isStudent) {
          // Create or update Student record for academic emails
          await prisma.student.upsert({
            where: { email: user.email },
            create: {
              email: user.email,
              name: user.name,
              googleId: account?.providerAccountId || null,
              emailVerified: true,
              profilePhotoUrl: user.image,
            },
            update: {
              name: user.name,
              googleId: account?.providerAccountId || undefined,
              emailVerified: true,
              profilePhotoUrl: user.image,
            },
          })
        } else {
          // Create or update Tourist record for non-academic emails
          await prisma.tourist.upsert({
            where: { email: user.email },
            create: {
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account?.providerAccountId || null,
            },
            update: {
              name: user.name,
              image: user.image,
              googleId: account?.providerAccountId || undefined,
            },
          })
        }

        return true
      } catch (error) {
        console.error('❌ Auth: Sign-in callback failed:', error)
        console.error('   User email:', user.email)
        if (error instanceof Error) {
          console.error('   Error message:', error.message)
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
      // Custom redirect based on user type
      // If url is already specified and starts with baseUrl, use it
      if (url.startsWith(baseUrl)) {
        return url;
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
