import React from 'react';
import Navigation from '@/components/Navigation';
import { Shield, Gift } from 'lucide-react';
import { PrimaryCTAButton } from '@/components/ui/PrimaryCTAButton';
import Link from 'next/link';

export default function ReferralPolicyPage() {
    return (
        <>
            <Navigation variant="default" showBackButton backHref="/" />
            <div className="min-h-screen bg-black text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="glass-card-dark rounded-3xl p-8 md:p-12 shadow-premium animate-fade-in border border-white/10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                <Gift className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-purple-200">
                                Referral Policy
                            </h1>
                            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full opacity-70" />
                        </div>

                        {/* Content */}
                        <div className="space-y-8 text-gray-300 leading-relaxed">
                            <div className="bg-white/5 rounded-2xl p-6 md:p-8 border border-white/10 shadow-inner">
                                <p className="text-lg md:text-xl font-light text-center text-white">
                                    Successfully referring a user who completes a trip enters you into a raffle for TourWiseCo to cover your accommodation during your next trip at your home country! Terms and conditions apply.
                                </p>
                            </div>

                            <div className="flex justify-center pt-8">
                                <Link href="/booking">
                                    <PrimaryCTAButton variant="blue" showArrow>
                                        Start a Booking
                                    </PrimaryCTAButton>
                                </Link>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500 font-light">
                            <p>
                                TourWiseCo reserves the right to modify or terminate this referral program at any time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
