'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    }

    // If not authenticated or not admin, redirect to login
    router.push('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
