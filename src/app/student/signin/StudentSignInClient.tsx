'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import { Input } from '@/components/ui/input';
import {
    isStudentEmail,
    isValidEmailFormat,
    getStudentEmailErrorMessage,
} from '@/lib/email-validation';

type Step = 'email' | 'otp';

export default function StudentSignInClient() {
    const { data: session } = useSession(); // We might still need this if there are client side interactions relying on it, but for the redirect logic it's handled by server.
    // Actually, if we are handling session on server, we might not need useSession for *this* flow, but consistency is good.
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/student/auth-landing';
    const urlError = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<Step>('email');
    const [code, setCode] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(null);
    const [domainValidationError, setDomainValidationError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // REMOVED: checkSession useEffect

    // Handle Email Submit (Password Login or Send OTP)
    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setEmailErrorMessage(null);
        setDomainValidationError(null);
        setMessage(null);

        // Basic format checks
        if (!isValidEmailFormat(email)) {
            setDomainValidationError('Please enter a valid email address.');
            return;
        }
        if (!isStudentEmail(email)) {
            setDomainValidationError(getStudentEmailErrorMessage(email));
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/student/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, rememberMe }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setEmailErrorMessage(data.error || 'Invalid credentials');
                setIsSubmitting(false);
                return;
            }

            setMessage('Signed in successfully. Redirecting...');
            router.replace(callbackUrl);
        } catch (error) {
            console.error('Auth error:', error);
            setEmailErrorMessage('An unexpected error occurred. Please try again.');
            setIsSubmitting(false);
        }
    };

    const anyError = domainValidationError || emailErrorMessage || urlError;

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1920&q=80"
                    alt="Student studying"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>
            <div className="absolute inset-0 pattern-grid opacity-5" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-md w-full space-y-8 animate-fade-in-up">

                        <div className="text-center">
                            <h2 className="text-4xl font-bold mb-2 text-white text-shadow-lg">
                                Sign in as <span className="text-gradient-vibrant inline-block">Student Guide</span>
                            </h2>
                            <p className="text-gray-300 mt-2 text-shadow">Use your university email</p>
                        </div>

                        {/* Error Display */}
                        {anyError && (
                            <div className="glass-card-dark bg-red-900/20 border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-scale-in">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <div className="flex-1">
                                    <p className="text-sm text-red-300 font-semibold">{anyError}</p>
                                    {anyError.includes('Account does not exist') && (
                                        <Link href="/student/signup" className="text-sm text-red-200 hover:text-white underline mt-1 block">
                                            Create an account now &rarr;
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Success Display */}
                        {message && (
                            <div className="glass-card-dark bg-green-900/20 border-green-500/50 p-4 rounded-xl flex items-center gap-3 animate-scale-in">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <p className="text-sm text-green-300 font-semibold">{message}</p>
                            </div>
                        )}

                        {/* Form Card */}
                        <div className="glass-card-dark rounded-3xl border border-white/10 p-8 shadow-premium space-y-6 bg-[#0F0E1A]/40 backdrop-blur-xl">
                            <form onSubmit={handleEmailSignIn} className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-medium text-gray-200 mb-1">
                                        University Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 text-[#CFCBFF]" size={20} />
                                        <Input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your.email@university.edu"
                                            className="pl-10 h-12 bg-[#ffffff10] border-[#ffffff2e] text-white placeholder:text-gray-400 focus:border-[#A66CFF]/50 focus:ring-[#A66CFF]/20"
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </div>

                                <div className="animate-fade-in">
                                    <label className="block text-sm font-medium text-gray-200 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-12 pr-10 bg-[#ffffff10] border-[#ffffff2e] text-white placeholder:text-gray-400 focus:border-[#A66CFF]/50 focus:ring-[#A66CFF]/20"
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        <Link href="/student/reset-password" className="text-xs text-gray-300 hover:text-white transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                <PrimaryCTAButton
                                    type="submit"
                                    disabled={isSubmitting || !email || !password}
                                    isLoading={isSubmitting}
                                    loadingText="Signing in..."
                                    variant="purple"
                                    className="w-full justify-center"
                                >
                                    Sign In
                                </PrimaryCTAButton>
                            </form>

                            <div className="text-center text-sm text-[#B8B3CC] pt-4 border-t border-white/20 mt-4 flex flex-col items-center gap-3">
                                <p className='text-[#B8B3CC]'>Don't have an account?</p>
                                <Link
                                    href="/student/signup"
                                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                                >
                                    <span className="font-bold bg-gradient-to-r from-[#A66CFF] to-[#E85D9B] text-transparent bg-clip-text group-hover:opacity-80">
                                        Create Account
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="glass-card-dark bg-blue-900/20 border border-blue-500/20 rounded-2xl p-6 shadow-lg">
                            <h3 className="font-bold text-blue-300 mb-2">New here?</h3>
                            <ul className="text-sm text-blue-200/80 list-disc list-inside space-y-1">
                                <li>Create an account to start guiding</li>
                                <li>Set your own schedule & rates</li>
                                <li>Get paid directly</li>
                            </ul>
                        </div>

                    </div>
                </main>

                <footer className="py-6 text-center text-sm text-gray-500 animate-fade-in delay-200">
                    &copy; {new Date().getFullYear()} TourWiseCo
                </footer>
            </div>
        </div>
    );
}
