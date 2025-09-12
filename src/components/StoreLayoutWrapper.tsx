'use client';

import { usePathname } from 'next/navigation';

import StoreProtected from './StoreProtected';

interface StoreLayoutWrapperProps {
  children: React.ReactNode;
}

export default function StoreLayoutWrapper({
  children,
}: StoreLayoutWrapperProps) {
  const pathname = usePathname();

  // Check if current path is an authentication page
  const isAuthPage =
    pathname.includes('/signin') ||
    pathname.includes('/signup') ||
    pathname.includes('/otp') ||
    pathname.includes('/forgot-password') ||
    pathname.includes('/verify-reset-otp') ||
    pathname.includes('/reset-password');

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center">
        {/* Mobile container - forces mobile view on all devices */}
        <div className="w-full max-w-sm min-h-screen bg-white shadow-lg relative overflow-hidden">
          {/* Mobile status bar simulation */}

          {/* Main content area */}
          <div className="flex-1 relative">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <StoreProtected>
      <div className="min-h-screen bg-gray-100 flex justify-center">
        {/* Mobile container - forces mobile view on all devices */}
        <div className="w-full max-w-sm min-h-screen bg-white shadow-lg relative overflow-hidden">
          {/* Mobile status bar simulation */}

          {/* Main content area */}
          <div className="flex-1 relative">{children}</div>
        </div>
      </div>
    </StoreProtected>
  );
}
