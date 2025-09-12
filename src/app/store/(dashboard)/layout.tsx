'use client';

import {
  BarChart3,
  Home,
  LogOut,
  Menu,
  Settings,
  Store,
  User,
  Users,
  X,
} from 'lucide-react';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useUserStore } from '@/lib/store/userStore';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { storeUser, getUserFullName, logoutStore } = useUserStore();

  const handleLogout = () => {
    logoutStore();
    router.push('/store/signin');
    setIsOpen(false);
  };

  const navigationItems = [
    {
      icon: Home,
      label: 'داشبورد',
      href: '/store/dashboard',
    },
    {
      icon: Store,
      label: 'مدیریت منو',
      href: '/store/menu',
    },
    {
      icon: Users,
      label: 'سفارشات',
      href: '/store/orders',
    },
    {
      icon: BarChart3,
      label: 'گزارشات',
      href: '/store/reports',
    },
    {
      icon: Settings,
      label: 'تنظیمات',
      href: '/store/settings',
    },
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header with Menu Button */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                پنل مدیریت
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {getUserFullName()}
              </p>
            </div>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="p-2"
                aria-label="باز کردن منو"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full p-0"
              closeButton={false}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <SheetHeader className="p-6 border-b border-gray-200 dark:border-slate-700 flex flex-row w-full items-center justify-between">
                  <SheetTitle className="text-right text-lg font-bold text-slate-900 dark:text-white">
                    منوی اصلی
                  </SheetTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </SheetHeader>

                {/* Navigation Links */}
                <div className="flex-1 p-6">
                  <nav className="space-y-2">
                    {navigationItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.href}
                          variant="ghost"
                          className="w-full justify-start text-right space-x-reverse space-x-3 h-12"
                          onClick={() => handleNavigation(item.href)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </Button>
                      );
                    })}
                  </nav>
                </div>

                {/* User Info and Logout */}
                <div className="p-6 border-t border-gray-200 dark:border-slate-700 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {getUserFullName()}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {storeUser?.role === 'STORE_ADMIN'
                          ? 'مدیر فروشگاه'
                          : storeUser?.role}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    خروج از حساب
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
