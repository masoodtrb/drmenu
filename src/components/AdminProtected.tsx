'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/trpc/client';

interface AdminProtectedProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function AdminProtected({ children, fallback }: AdminProtectedProps) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Validate token with server
    const { data: userData, error, isLoading: isValidating } = trpc.auth.validateAdminToken.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('adminToken');
            const localUserData = localStorage.getItem('adminUser');

            if (!token || !localUserData) {
                handleLogout();
                return;
            }

            try {
                const user = JSON.parse(localUserData);
                if (user.role !== 'ADMIN') {
                    handleLogout();
                    return;
                }
            } catch (error) {
                console.error('Error parsing admin user data:', error);
                handleLogout();
                return;
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (!isValidating) {
            if (error) {
                // Handle authentication errors
                console.error('Admin authentication error:', error);
                handleLogout();
                return;
            }

            if (userData) {
                // Check if user has ADMIN role
                if (userData.role !== 'ADMIN') {
                    handleLogout();
                    return;
                }

                // Token is valid, update localStorage with fresh data
                localStorage.setItem('adminUser', JSON.stringify({
                    id: userData.userId,
                    username: userData.username,
                    role: userData.role,
                    profile: userData.profile
                }));
                setIsAuthorized(true);
            }

            setIsLoading(false);
        }
    }, [userData, error, isValidating]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setIsAuthorized(false);
        setIsLoading(false);
        router.push('/admin/login');
    };

    if (isLoading || isValidating) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect to login
    }

    return <>{children}</>;
}
