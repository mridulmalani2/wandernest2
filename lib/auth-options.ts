import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";

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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/tourist/signin",  // Default to tourist signin
    error: "/tourist/signin", // Error page
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Determine if this is a student or tourist based on email domain
      const isStudent = isStudentEmail(user.email);

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
      });

      // If tourist, create or update Tourist record
      if (!isStudent && account?.providerAccountId) {
        await prisma.tourist.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
          },
          update: {
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
          },
        });
      }

      return true;
    },
    async session({ session, user }) {
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id;

        // Get the full user record to check userType
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { userType: true },
        });

        const userType = dbUser?.userType || "tourist";
        session.user.userType = userType;

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
          });

          // Add student info to session
          session.user.studentId = student?.id;
          session.user.studentStatus = student?.status;
          session.user.hasCompletedOnboarding = !!student;
        } else {
          // Check if tourist profile exists
          const tourist = await prisma.tourist.findUnique({
            where: { email: user.email || undefined },
            select: {
              id: true,
              name: true,
            },
          });

          // Add tourist info to session
          session.user.touristId = tourist?.id;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, check user type and redirect accordingly
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
