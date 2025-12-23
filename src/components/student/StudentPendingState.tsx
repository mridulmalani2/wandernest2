
'use client';

import { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, RefreshCw, Mail } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import Link from 'next/link';

export function StudentPendingState() {
    const [reminderSent, setReminderSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReraiseRequest = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setReminderSent(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#1a1a3a_0%,_#0a0a0a_70%)] opacity-50" />
            </div>

            <div className="max-w-lg w-full relative z-10">
                <div className="glass-card-dark rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl backdrop-blur-xl bg-[#0F0E1A]/40 text-center space-y-6">

                    {/* Icon Animation */}
                    <div className="relative mx-auto w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse blur-xl" />
                        <div className="relative bg-gradient-to-br from-yellow-400/20 to-orange-500/20 w-full h-full rounded-full flex items-center justify-center border border-yellow-500/30">
                            <Clock className="w-10 h-10 text-yellow-400" />
                        </div>
                        {/* Status Indicator Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-gray-900 rounded-full p-1 border border-gray-700">
                            <div className="bg-yellow-500 w-4 h-4 rounded-full animate-pulse" />
                        </div>
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
                            Application Under Review
                        </h1>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            Thanks for applying to be a TourWise guide! Our team is currently verifying your student credentials.
                        </p>
                    </div>

                    {/* Timeline / Steps */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-left space-y-4">
                        <div className="flex items-start gap-4 opacity-50">
                            <div className="mt-1">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Profile Submitted</h4>
                                <p className="text-sm text-gray-400">Your details have been received.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="mt-1 relative">
                                <div className="w-5 h-5 rounded-full border-2 border-yellow-500/50 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                </div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-0.5 h-full bg-white/10 -z-10" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Verification in Progress</h4>
                                <p className="text-sm text-gray-400">
                                    We verify 100% of student IDs manually. This usually takes <strong>1-2 business days</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 opacity-30">
                            <div className="mt-1">
                                <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Ready to Guide</h4>
                                <p className="text-sm text-gray-400">Start accepting bookings and earning.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <p className="text-sm text-gray-500 mb-4">
                            Still waiting after 3-4 days?
                        </p>

                        {!reminderSent ? (
                            <button
                                onClick={handleReraiseRequest}
                                disabled={loading}
                                className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors hover:bg-white/5 px-4 py-2 rounded-full border border-transparent hover:border-white/10"
                            >
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Mail className="w-4 h-4" />
                                )}
                                {loading ? 'Sending Reminder...' : 'Re-raise verification request'}
                            </button>
                        ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium animate-fade-in">
                                <CheckCircle className="w-4 h-4" />
                                Reminder sent to admin team
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                            Return to Home
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
