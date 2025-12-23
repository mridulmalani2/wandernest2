'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const consentKey = 'cookie-consent';

    const readConsent = () => {
        try {
            return localStorage.getItem(consentKey);
        } catch {
            return null;
        }
    };

    const writeConsent = (value: 'accepted' | 'declined') => {
        try {
            localStorage.setItem(consentKey, value);
        } catch {
            // Ignore storage failures (e.g., private mode)
        }
        document.documentElement.dataset.cookieConsent = value;
        window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { value } }));
    };

    const clearNonEssentialCookies = () => {
        const cookiesToClear = ['_ga', '_gid', '_gat', '_gcl_au'];
        cookiesToClear.forEach((cookieName) => {
            document.cookie = `${cookieName}=; Max-Age=0; path=/; SameSite=Lax`;
        });
    };

    useEffect(() => {
        // Check if user has already consented
        const consent = readConsent();
        if (consent !== 'accepted' && consent !== 'declined') {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        writeConsent('accepted');
        setIsVisible(false);
    };

    const declineCookies = () => {
        clearNonEssentialCookies();
        writeConsent('declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-md border-t border-white/10 text-white shadow-2xl animate-slide-up-fade">
            <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-sm text-gray-300">
                    <p className="text-white/90">
                        We use cookies to enhance your experience, analyze site traffic, and personalize content.
                        By clicking "Accept All", you consent to our use of cookies.
                        Read our <Link href="/privacy" className="text-purple-300 hover:text-purple-200 hover:underline transition-colors">Privacy Policy</Link> and <Link href="/terms" className="text-purple-300 hover:text-purple-200 hover:underline transition-colors">Terms of Service</Link>.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={declineCookies}
                        className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
                    >
                        Necessary Only
                    </button>
                    <button
                        onClick={acceptCookies}
                        className="px-6 py-2 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all shadow-lg hover:shadow-purple-500/25"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
