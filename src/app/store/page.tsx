'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store/userStore';

export default function StoreIndexPage() {
    const router = useRouter();
    const { storeUser, storeToken, _hasHydrated } = useUserStore();

    useEffect(() => {
        if (!_hasHydrated) {
            return;
        }

        // If user is already logged in, redirect to dashboard
        if (storeToken && storeUser) {
            router.push('/store/dashboard');
        } else {
            // Otherwise redirect to signin
            router.push('/store/signin');
        }
    }, [storeToken, storeUser, router, _hasHydrated]);

    // Show loading while checking authentication
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
