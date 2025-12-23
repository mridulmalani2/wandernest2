
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useWarpNavigation() {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();

    const triggerTransition = useCallback((path: string) => {
        setIsTransitioning(true);

        // Prefetch for faster load after animation
        router.prefetch(path);

        // Timeout handled by component (or fail-safe here)
        // The component usually calls onComplete, but we can have a backup
        setTimeout(() => {
            router.push(path);
        }, 1800); // Navigate slightly before animation ends for overlap
    }, [router]);

    return {
        isTransitioning,
        triggerTransition
    };
}
