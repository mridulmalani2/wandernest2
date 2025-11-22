import { StudentStatus } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      userType?: "student" | "tourist";
      // Student-specific fields
      studentId?: string;
      studentStatus?: StudentStatus;
      hasCompletedOnboarding?: boolean;
      // Tourist-specific fields
      touristId?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    userType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    userType?: "student" | "tourist";
    hasCompletedOnboarding?: boolean;
  }
}
