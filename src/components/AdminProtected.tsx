'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUserStore } from '@/lib/store/userStore';
import { trpc } from '@/trpc/client';

interface AdminProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminProtected({
  children,
  fallback,
}: AdminProtectedProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Zustand store
  const { adminUser, adminToken, setAdminUser, logoutAdmin, _hasHydrated } =
    useUserStore();

  // Validate token with server
  const {
    data: userData,
    error,
    isLoading: isValidating,
  } = trpc.auth.validateAdminToken.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: _hasHydrated && !!adminToken, // Only run query if store is hydrated and token exists
  });

  useEffect(() => {
    // Wait for store to be rehydrated
    if (!_hasHydrated) {
      return;
    }

    const checkAuth = () => {
      if (!adminToken || !adminUser) {
        handleLogout();
        return;
      }

      // Check if user has ADMIN role
      if (adminUser.role !== 'ADMIN') {
        handleLogout();
        return;
      }
    };

    checkAuth();
  }, [adminToken, adminUser, _hasHydrated]);

  useEffect(() => {
    if (!isValidating && _hasHydrated) {
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

        // Token is valid, update Zustand store with fresh data
        setAdminUser(
          {
            id: userData.userId,
            username: userData.username,
            role: userData.role,
            profile: userData.profile,
          },
          adminToken
        );
        setIsAuthorized(true);
      }

      setIsLoading(false);
    }
  }, [userData, error, isValidating, setAdminUser, adminToken, _hasHydrated]);

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthorized(false);
    setIsLoading(false);
    router.push('/admin/login');
  };

  // Show loading while store is being rehydrated or validating
  if (!_hasHydrated || isLoading || isValidating) {
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
