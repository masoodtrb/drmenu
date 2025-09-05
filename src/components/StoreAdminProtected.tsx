'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useUserStore } from '@/lib/store/userStore';
import { trpc } from '@/trpc/client';

interface StoreAdminProtectedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function StoreAdminProtected({
  children,
  fallback,
}: StoreAdminProtectedProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Zustand store
  const { storeUser, storeToken, setStoreUser, logoutStore, _hasHydrated } =
    useUserStore();

  // Validate token with server
  const {
    data: userData,
    error,
    isLoading: isValidating,
  } = trpc.auth.validateStoreAdminToken.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: _hasHydrated && !!storeToken, // Only run query if store is hydrated and token exists
  });

  useEffect(() => {
    // Wait for store to be rehydrated
    if (!_hasHydrated) {
      return;
    }

    const checkAuth = () => {
      if (!storeToken || !storeUser) {
        handleLogout();
        return;
      }

      // Check if user has STORE_ADMIN role
      if (storeUser.role !== 'STORE_ADMIN') {
        handleLogout();
        return;
      }
    };

    checkAuth();
  }, [storeToken, storeUser, _hasHydrated]);

  useEffect(() => {
    if (!isValidating && _hasHydrated) {
      if (error) {
        // Handle authentication errors
        console.error('Store admin authentication error:', error);
        handleLogout();
        return;
      }

      if (userData) {
        // Check if user has STORE_ADMIN role
        if (userData.role !== 'STORE_ADMIN') {
          handleLogout();
          return;
        }

        // Token is valid, update Zustand store with fresh data
        setStoreUser(
          {
            id: userData.userId,
            username: userData.username,
            role: userData.role,
            profile: userData.profile,
          },
          storeToken
        );
        setIsAuthorized(true);
      }

      setIsLoading(false);
    }
  }, [userData, error, isValidating, setStoreUser, storeToken, _hasHydrated]);

  const handleLogout = () => {
    logoutStore();
    setIsAuthorized(false);
    setIsLoading(false);
    router.push('/storeAdmin/login');
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
