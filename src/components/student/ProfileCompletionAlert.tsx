'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowRight, X } from 'lucide-react';

interface ProfileCompletionAlertProps {
    completeness: number; // 0 to 100
}

export function ProfileCompletionAlert({ completeness }: ProfileCompletionAlertProps) {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || completeness >= 100) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mb-8 relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md shadow-lg shadow-purple-900/20"
                >
                    <div className="absolute inset-0 bg-noise opacity-[0.03]" />

                    <div className="relative z-10 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 border border-purple-500/30">
                                <AlertCircle className="h-6 w-6 text-purple-300" />
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">
                                    Complete your profile
                                </h3>
                                <p className="text-gray-300 font-light text-sm max-w-xl">
                                    Your profile is <span className="text-purple-300 font-medium">{completeness}% complete</span>.
                                    Tourists are 3x more likely to book guides with detailed profiles.
                                </p>

                                {/* Progress Bar */}
                                <div className="mt-3 w-full max-w-xs h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-purple-400 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${completeness}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-center">
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-gray-400 hover:text-white transition-colors p-2"
                                aria-label="Dismiss"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <Link href="/student/profile">
                                <button className="group px-5 py-2.5 rounded-full bg-white text-black font-medium hover:bg-gray-100 transition-all flex items-center gap-2 text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                                    Finish Profile
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
