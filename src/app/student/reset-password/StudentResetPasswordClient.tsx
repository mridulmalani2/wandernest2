'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, AlertCircle, ArrowLeft, Lock, Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import {
    isStudentEmail,
    isValidEmailFormat,
    getStudentEmailErrorMessage,
} from '@/lib/email-validation';

type ResetStep = 'email' | 'otp' | 'new-password' | 'success';

export default function StudentResetPasswordClient() {
    const router = useRouter();
    const [step, setStep] = useState<ResetStep>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form Data
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Request OTP
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isValidEmailFormat(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/student/auth/forgot-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to send reset code');
            }

            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP (Local check before final submit, or just move to next step)
    // For this flow, we will actually just move to next step and verify everything at the end? 
    // OR verify OTP first? 
    // Let's verify OTP implicitly by moving to next step? 
    // Actually, usually it's better to verify OTP *before* asking for password to fail fast.
    // BUT our API structure above does it all in one go in 'confirm'. 
    // Let's stick to the plan: User enters OTP, clicks Next, then Enters Password.
    // Wait, the API I designed `forgot-password/confirm` takes { email, code, newPassword }.
    // So we must collect all 3. 
    // So Step 2 (OTP) just collects OTP locally. Step 3 collects Password. Then we submit all.
    // UX-wise, nice to verify OTP before showing password field, but let's do simplicity first.
    // Actually, I can allow the user to proceed to 'new-password' step purely on client side if code is entered.

    const handleVerifyOtpStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) {
            setError('Please enter the full 6-digit code');
            return;
        }
        setError(null);
        setStep('new-password');
    };

    // Step 3: Set New Password
    const handleSetNewPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/student/auth/forgot-password/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    code,
                    newPassword
                }),
            });
            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to reset password');
            }

            setStep('success');
            // Auto redirect after few seconds?
            setTimeout(() => {
                router.push('/student/signin');
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
            // If invalid code, maybe go back to OTP step?
            if (err.message && (err.message.includes('code') || err.message.includes('expired'))) {
                setStep('otp');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-black">
            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80"
                    alt="Night sky"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
            </div>
            <div className="absolute inset-0 pattern-grid opacity-5" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-1 flex items-center justify-center px-4 py-16">
                    <div className="max-w-md w-full space-y-8 animate-fade-in-up">

                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-2 text-white text-shadow-lg">
                                Reset Password
                            </h2>
                            <p className="text-gray-300">
                                {step === 'email' && 'Enter your university email to receive a code'}
                                {step === 'otp' && `Enter the code sent to ${email}`}
                                {step === 'new-password' && 'Create a strong new password'}
                                {step === 'success' && 'Password updated successfully!'}
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="glass-card-dark bg-red-900/20 border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-scale-in">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-300 font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="glass-card-dark rounded-3xl border border-white/10 p-8 shadow-premium space-y-6 bg-[#0F0E1A]/40 backdrop-blur-xl">

                            {/* STEP 1: EMAIL */}
                            {step === 'email' && (
                                <form onSubmit={handleRequestOtp} className="space-y-4">
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
                                        Send Reset Code
                                    </PrimaryCTAButton>
                                    <Link href="/student/signin" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mt-4">
                                        <ArrowLeft size={16} /> Back to Sign In
                                    </Link>
                                </form>
                            )}

                            {/* STEP 2: OTP */}
                            {step === 'otp' && (
                                <form onSubmit={handleVerifyOtpStep} className="space-y-6">
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
                                        />
                                        <p className="text-xs text-center text-gray-400 mt-2">
                                            Check your spam folder if you don't see it.
                                        </p>
                                    </div>

                                    <PrimaryCTAButton
                                        type="submit"
                                        variant="purple"
                                        className="w-full justify-center"
                                    >
                                        Verify & Continue
                                    </PrimaryCTAButton>

                                    <button
                                        type="button"
                                        onClick={() => setStep('email')}
                                        className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ArrowLeft size={16} /> Change email
                                    </button>
                                </form>
                            )}

                            {/* STEP 3: NEW PASSWORD */}
                            {step === 'new-password' && (
                                <form onSubmit={handleSetNewPassword} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <KeyRound className="absolute left-3 top-3.5 text-[#CFCBFF]" size={20} />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
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

                                    <div>
                                        <label className="block text-sm font-medium text-gray-200 mb-1">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3.5 text-[#CFCBFF]" size={20} />
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                minLength={8}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="Re-enter password"
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
                                        Reset Password
                                    </PrimaryCTAButton>
                                </form>
                            )}

                            {/* STEP 4: SUCCESS */}
                            {step === 'success' && (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">All Set!</h3>
                                    <p className="text-gray-300">
                                        Your password has been successfully reset. You will be redirected to the login page shortly.
                                    </p>
                                    <Link href="/student/signin">
                                        <PrimaryCTAButton variant="purple" className="mt-6 w-full justify-center">
                                            Go to Sign In
                                        </PrimaryCTAButton>
                                    </Link>
                                </div>
                            )}

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
