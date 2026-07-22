"use client"

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to detect page navigation loading state
 * Shows loading when route changes
 */
export function usePageLoading() {
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Start loading
        setIsLoading(true);

        // Stop loading after a short delay (simulating page load)
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(timeout);
    }, [pathname]);

    return isLoading;
}
