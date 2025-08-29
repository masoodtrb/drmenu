'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, LogOut, User, Settings } from 'lucide-react';
import { useUserStore } from '@/lib/store/userStore';

export default function StoreDashboardPage() {
    const router = useRouter();
    const { storeUser, logoutStore } = useUserStore();

    const handleLogout = () => {
        logoutStore();
        router.push('/store/signin');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full"></div>
            {/* Header */}
            <div className="flex flex-col space-y-4 mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                پنل مدیریت فروشگاه
                            </h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                خوش آمدید، {storeUser?.username}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="w-4 h-4 ml-2" />
                        خروج
                    </Button>
                </div>
            </div>

            {/* Welcome Card */}
            <Card className="mb-8 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
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
                                    {storeUser?.role === 'STORE_ADMIN' ? 'مدیر فروشگاه' : storeUser?.role}
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
            <div className="mt-8">
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
                            <Button variant="outline" disabled>
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
