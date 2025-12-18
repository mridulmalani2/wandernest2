import { Suspense } from 'react';
import StudentSignInClient from './StudentSignInClient';

export default function StudentSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      }
    >
      <StudentSignInClient />
    </Suspense>
  );
}
