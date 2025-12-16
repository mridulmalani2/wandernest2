
'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, CheckCircle2, User, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import { isValidEmailFormat } from '@/lib/email-validation';

type SignupStep = 'email' | 'otp' | 'details';

function StudentSignupContent() {
    const router = useRouter();
    const [step, setStep] = useState<SignupStep>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // Handlers
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isValidEmailFormat(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/student/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            // Optimistic move to details, final verification happens on submit
            setStep('details');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 1. Signup (Verify OTP + Create Account + Login)
            const res = await fetch('/api/student/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code,
                    name,
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            // 2. Set Password immediately
            const pwdRes = await fetch('/api/student/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (!pwdRes.ok) {
                console.error('Failed to set password');
                // Non-blocking error, user is created. They can reset password later.
            }

            router.push('/student/dashboard');
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
            {/* Background Image with Overlays */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop"
                    alt="University campus"
                    fill
                    priority
                    quality={85}
                    sizes="100vw"
                    className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            </div>
            <div className="absolute inset-0 pattern-grid opacity-10" />

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-md w-full space-y-8 animate-fade-in-up">

                        <div className="text-center">
                            <h2 className="text-4xl font-bold mb-2 text-white text-shadow-lg tracking-tight">
                                Join as a{' '}
                                <span className="text-gradient-vibrant inline-block">
                                    Student Guide
                                </span>
                            </h2>
                            <p className="text-gray-300 mt-2 text-shadow">
                                Share your campus, earn money, meet travelers.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="glass-card-dark bg-red-900/20 border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-scale-in">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300 font-semibold">{error}</p>
                            </div>
                        )}

                        {/* Main Card */}
                        <div className="glass-card-dark rounded-3xl border border-white/10 p-8 shadow-premium space-y-6 bg-[#0F0E1A]/40 backdrop-blur-xl">

                            {/* STEP 1: Email */}
                            {step === 'email' && (
                                <form onSubmit={handleSendOtp} className="space-y-4 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">
                                            University Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 text-[#CFCBFF]" size={20} />
                                            <Input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="your.name@university.edu"
                                                className="pl-10 h-12 bg-[#ffffff10] border-[#ffffff2e] text-white placeholder:text-gray-400 focus:border-[#A66CFF]/50 focus:ring-[#A66CFF]/20"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <PrimaryCTAButton
                                        type="submit"
                                        isLoading={loading}
                                        variant="purple"
                                        className="w-full justify-center"
                                    >
                                        Continue with Email
                                    </PrimaryCTAButton>
                                </form>
                            )}

                            {/* STEP 2: OTP */}
                            {step === 'otp' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-3">
                                            <Mail className="w-6 h-6 text-[#D7C4FF]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Check your inbox</h3>
                                        <p className="text-sm text-gray-300 mt-1">
                                            We sent a code to <span className="text-white font-semibold">{email}</span>
                                        </p>
                                    </div>

                                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-2 text-center">
                                                Verification Code
                                            </label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={6}
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                                placeholder="••••••"
                                                className="text-center text-2xl tracking-[0.5em] h-14 bg-[#ffffff10] border-[#ffffff2e] text-white font-bold focus:border-[#A66CFF]/50 focus:ring-[#A66CFF]/20"
                                                required
                                                disabled={loading}
                                            />
                                        </div>

                                        <PrimaryCTAButton
                                            type="submit"
                                            isLoading={loading}
                                            variant="purple"
                                            className="w-full justify-center"
                                        >
                                            Verify Code
                                        </PrimaryCTAButton>
                                    </form>

                                    <button
                                        onClick={() => setStep('email')}
                                        className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Change email
                                    </button>
                                </div>
                            )}

                            {/* STEP 3: Details */}
                            {step === 'details' && (
                                <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fade-in">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold text-white">One last step</h3>
                                        <p className="text-sm text-gray-300">Set up your profile credentials</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3.5 text-[#CFCBFF]" size={20} />
                                                <Input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="e.g. Alex Johnson"
                                                    className="pl-10 h-12 bg-[#ffffff10] border-[#ffffff2e] text-white placeholder:text-gray-400 focus:border-[#A66CFF]/50 focus:ring-[#A66CFF]/20"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-200 mb-1">Create Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3.5 text-[#CFCBFF]" size={20} />
                                                <Input
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    minLength={8}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Min. 8 characters"
                                                    className="pl-10 pr-10 h-12 bg-[#ffffff10] border-[#ffffff2e] text-white placeholder:text-gray-400 focus:border-[#A66CFF]/50 focus:ring-[#A66CFF]/20"
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                        <div className="flex items-center h-5 mt-0.5">
                                            <input
                                                id="terms-checkbox"
                                                type="checkbox"
                                                checked={agreedToTerms}
                                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-800"
                                            />
                                        </div>
                                        <label htmlFor="terms-checkbox" className="text-sm text-gray-300">
                                            I agree to the <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</Link>, <Link href="/safety" className="text-purple-400 hover:text-purple-300 underline">Safety Guidelines</Link>, and <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>. I understand I am acting as an independent student guide.
                                        </label>
                                    </div>

                                    <PrimaryCTAButton
                                        type="submit"
                                        isLoading={loading}
                                        variant="purple"
                                        className="w-full justify-center"
                                    >
                                        Create Account & Login
                                    </PrimaryCTAButton>
                                </form>
                            )}

                            <div className="text-center text-sm text-[#B8B3CC] pt-6 border-t border-white/20 mt-6 flex flex-col items-center gap-3">
                                <p className='text-[#B8B3CC]'>Already have an account?</p>
                                <Link
                                    href="/student/signin"
                                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                                >
                                    <span className="font-bold bg-gradient-to-r from-[#A66CFF] to-[#E85D9B] text-transparent bg-clip-text group-hover:opacity-80">
                                        Sign In
                                    </span>
                                </Link>
                            </div>
                        </div>

                    </div>
                </main>

                <footer className="py-6 text-center text-sm text-gray-500 animate-fade-in delay-200">
                    &copy; {new Date().getFullYear()} TourWiseCo. All rights reserved.
                </footer>
            </div>
        </div>
    );
}

export default function StudentSignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
            </div>
        }>
            <StudentSignupContent />
        </Suspense>
    );
}
