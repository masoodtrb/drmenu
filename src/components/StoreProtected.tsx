'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store/userStore';

interface StoreProtectedProps {
    children: React.ReactNode;
}

export default function StoreProtected({ children }: StoreProtectedProps) {
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const router = useRouter();
    const { storeUser, storeToken, _hasHydrated } = useUserStore();

    useEffect(() => {
        if (!_hasHydrated) {
            return;
        }

        if (!storeToken || !storeUser) {
            router.push('/store/signin');
            return;
        }

        // Check if user has STORE_ADMIN role
        if (storeUser.role !== 'STORE_ADMIN') {
            router.push('/store/signin');
            return;
        }

        setIsCheckingAuth(false);
    }, [storeToken, storeUser, router, _hasHydrated]);

    // Show loading while checking authentication
    if (isCheckingAuth || !_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
