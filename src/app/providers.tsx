'use client';

import { SessionProvider } from 'next-auth/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ContactModalProvider } from '@/components/ContactModal/ContactModalProvider';
import { DevAuthProvider } from '@/lib/dev-auth-bypass';
import { DevAuthPanel } from '@/components/DevAuthPanel';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <DevAuthProvider>
          <ContactModalProvider>
            {children}
            {/* Dev Auth Panel - only visible in development */}
            <DevAuthPanel />
          </ContactModalProvider>
        </DevAuthProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
