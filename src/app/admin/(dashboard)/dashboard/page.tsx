'use client';

import { LogOut, Menu, Settings, Shield, Store, Users } from 'lucide-react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserStore } from '@/lib/store/userStore';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Zustand store - only need user data and logout function
  const { logoutAdmin, getUserFullName } = useUserStore();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                پنل مدیریت
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                خوش آمدید، {getUserFullName()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Users Management Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">مدیریت کاربران</CardTitle>
                  <CardDescription>
                    مدیریت کاربران سیستم و دسترسی‌ها
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                مشاهده کاربران
              </Button>
            </CardContent>
          </Card>

          {/* Store Management Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">مدیریت فروشگاه‌ها</CardTitle>
                  <CardDescription>
                    مدیریت فروشگاه‌ها و انواع آن‌ها
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                مدیریت فروشگاه‌ها
              </Button>
            </CardContent>
          </Card>

          {/* Menu Management Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <Menu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">مدیریت منوها</CardTitle>
                  <CardDescription>مدیریت منوها و آیتم‌های منو</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                مدیریت منوها
              </Button>
            </CardContent>
          </Card>

          {/* System Settings Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">تنظیمات سیستم</CardTitle>
                  <CardDescription>پیکربندی تنظیمات سیستم</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                باز کردن تنظیمات
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-indigo-600 dark:text-indigo-400 font-bold">
                    📊
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">آمار و گزارشات</CardTitle>
                  <CardDescription>مشاهده آمار سیستم و گزارشات</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                مشاهده آمار
              </Button>
            </CardContent>
          </Card>

          {/* Audit Logs Card */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <div className="w-5 h-5 text-red-600 dark:text-red-400 font-bold">
                    📋
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">گزارش فعالیت‌ها</CardTitle>
                  <CardDescription>
                    بررسی گزارش فعالیت‌های سیستم
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                مشاهده گزارشات
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>آمار سریع</CardTitle>
              <CardDescription>نمای کلی فعالیت‌های سیستم</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    0
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    کل کاربران
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    0
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    فروشگاه‌های فعال
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    0
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    کل منوها
                  </div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    0
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    ورودهای امروز
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
