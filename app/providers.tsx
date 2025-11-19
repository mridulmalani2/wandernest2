'use client';

// import { SessionProvider } from 'next-auth/react';

// AUTH DISABLED FOR DEVELOPMENT - DATABASE_URL not configured
export function Providers({ children }: { children: React.ReactNode }) {
  // return <SessionProvider>{children}</SessionProvider>;
  return <>{children}</>;
}
