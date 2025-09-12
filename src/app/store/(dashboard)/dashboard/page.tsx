'use client';

import {
  AlertTriangle,
  CheckCircle,
  Settings,
  Store,
  User,
} from 'lucide-react';

import { useRouter } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useUserStore } from '@/lib/store/userStore';
import { validateProfileCompletion } from '@/lib/util/commonValidations';
import { trpc } from '@/trpc/client';

export default function StoreDashboardPage() {
  const router = useRouter();
  const { storeUser } = useUserStore();

  // Get user profile data
  const { data: profileData, isLoading: profileLoading } =
    trpc.profile.me.useQuery();

  // Check profile completion
  const profileCompletion = profileData?.profile
    ? validateProfileCompletion(profileData.profile)
    : {
        isComplete: false,
        missingFields: ['نام', 'نام خانوادگی', 'کد ملی'],
        completionPercentage: 0,
      };

  return (
    <div className="space-y-6">
      {/* Profile Completion Alert */}
      {!profileLoading && !profileCompletion.isComplete && (
        <Alert
          variant="destructive"
          className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20"
        >
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">
            تکمیل پروفایل ضروری است
          </AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            <div className="mt-2">
              <p className="mb-2">
                برای استفاده کامل از سیستم، لطفاً اطلاعات زیر را تکمیل کنید:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-3">
                {profileCompletion.missingFields.map((field, index) => (
                  <li key={index} className="text-sm">
                    {field}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  درصد تکمیل: {profileCompletion.completionPercentage}%
                </span>
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => router.push('/store/profile')}
                >
                  تکمیل پروفایل
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Completion Success Alert */}
      {!profileLoading && profileCompletion.isComplete && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>پروفایل شما تکمیل شده است</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p className="mb-2">
                تبریک! تمام اطلاعات پروفایل شما تکمیل شده است.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  درصد تکمیل: {profileCompletion.completionPercentage}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                  onClick={() => router.push('/store/profile')}
                >
                  ویرایش پروفایل
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Card */}
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
            🎉 تبریک! ورود موفقیت‌آمیز بود
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            شما با موفقیت وارد پنل مدیریت فروشگاه شده‌اید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3 space-x-reverse p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <User className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  نام کاربری
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {storeUser?.username}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  نقش کاربری
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {storeUser?.role === 'STORE_ADMIN'
                    ? 'مدیر فروشگاه'
                    : storeUser?.role}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              مدیریت منو
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              افزودن، ویرایش و حذف آیتم‌های منو
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              به زودی
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              سفارشات
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              مشاهده و مدیریت سفارشات مشتریان
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              به زودی
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              گزارشات
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              گزارشات فروش و عملکرد فروشگاه
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              به زودی
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              اقدامات سریع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" disabled>
                <Store className="w-4 h-4 ml-2" />
                ایجاد فروشگاه جدید
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/store/profile')}
                className="hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <User className="w-4 h-4 ml-2" />
                ویرایش پروفایل
              </Button>
              <Button variant="outline" disabled>
                <Settings className="w-4 h-4 ml-2" />
                تنظیمات
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
