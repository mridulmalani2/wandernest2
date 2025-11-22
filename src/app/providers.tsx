'use client';

import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ContactModalProvider } from '@/components/ContactModal/ContactModalProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <ContactModalProvider>
          {children}
        </ContactModalProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
