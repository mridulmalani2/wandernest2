import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import StudentResetPasswordClient from './StudentResetPasswordClient';

export default function StudentResetPasswordPage() {
    // Optional: Check if already logged in and redirect to dashboard
    const cookieStore = cookies();
    const token = cookieStore.get('student_session_token')?.value;

    // Basic check - if token exists and looks valid-ish, redirect. 
    // We can let middleware handle this eventually, but explicit here is fine too.
    if (token) {
        redirect('/student/dashboard');
    }

    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-black">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                </div>
            }
        >
            <StudentResetPasswordClient />
        </Suspense>
    );
}
