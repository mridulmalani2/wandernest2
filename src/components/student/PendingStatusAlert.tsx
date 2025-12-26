
'use client';

import { useState } from 'react';
import { Clock, CheckCircle, RefreshCw, Mail, AlertTriangle } from 'lucide-react';

export function PendingStatusAlert() {
    const [reminderSent, setReminderSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleReraiseRequest = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/student/reraise-approval', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const isJson = res.headers.get('content-type')?.includes('application/json');
            const data = isJson ? await res.json().catch(() => null) : null;

            if (!res.ok || !data?.success) {
                throw new Error('Failed to send reminder. Please try again.');
            }

            setReminderSent(true);
        } catch (err: any) {
            console.error('Error sending reminder:', err);
            setError(err.message || 'Failed to send reminder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8 w-full">
            <div className="glass-card-dark rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 relative z-10">

                    {/* Icon Area */}
                    <div className="shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">
                            Account Under Confirmation
                        </h3>
                        <p className="text-gray-400 mb-4 max-w-2xl">
                            We verify 100% of student IDs manually to ensure safety. This usually takes <strong>1-2 business days</strong>.
                            You can still browse the dashboard, but you won't appear in search results until verified.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            {/* Tiny Timeline */}
                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                <span>Profile Submitted</span>
                                <span className="text-gray-600 px-1">→</span>
                                <span className="text-yellow-500 font-medium">Reviewing</span>
                                <span className="text-gray-600 px-1">→</span>
                                <span className="opacity-50">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="flex flex-col justify-center items-start md:items-end gap-3 min-w-[200px]">
                        <p className="text-xs text-gray-500">
                            Waiting longer than 3 days?
                        </p>

                        {error && (
                            <p className="text-xs text-red-400 mb-2">{error}</p>
                        )}

                        {!reminderSent ? (
                            <button
                                onClick={handleReraiseRequest}
                                disabled={loading}
                                className="flex items-center gap-2 text-sm font-medium text-white bg-white/10 hover:bg-white/15 transition-colors px-4 py-2 rounded-lg border border-white/10"
                            >
                                {loading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Mail className="w-4 h-4" />
                                )}
                                {loading ? 'Sending...' : 'Re-raise Request'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4" />
                                <span>Reminder sent</span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
