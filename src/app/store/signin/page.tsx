'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { trpc } from '@/trpc/client';
import { useUserStore } from '@/lib/store/userStore';
import Link from 'next/link';

// Form validation schema
const signinSchema = z.object({
    username: z.string()
        .min(1, 'ایمیل یا شماره موبایل الزامی است')
        .refine((value) => {
            // Basic email or mobile validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const mobileRegex = /^09\d{9}$/;
            return emailRegex.test(value) || mobileRegex.test(value);
        }, 'لطفاً ایمیل یا شماره موبایل معتبر وارد کنید'),
    password: z.string()
        .min(1, 'رمز عبور الزامی است'),
});

type SigninFormData = z.infer<typeof signinSchema>;

export default function StoreSigninPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const router = useRouter();

    // Form setup with react-hook-form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninFormData>({
        resolver: zodResolver(signinSchema),
        mode: 'onChange',
    });

    // Zustand store
    const { storeUser, storeToken, setStoreUser, _hasHydrated } = useUserStore();

    // Store login mutation
    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            // Store user data in Zustand
            setStoreUser({
                id: data.userId,
                username: data.username,
                role: data.role,
                profile: undefined // Profile will be loaded separately if needed
            }, data.token);

            router.push('/store/dashboard');
        },
        onError: (error) => {
            setError(error.message);
            setIsLoading(false);
        },
    });

    // Check if user is already logged in
    useEffect(() => {
        if (!_hasHydrated) {
            return;
        }

        if (storeToken && storeUser) {
            router.push('/store/dashboard');
            return;
        }
        setIsCheckingAuth(false);
    }, [storeToken, storeUser, router, _hasHydrated]);

    const onSubmit = (data: SigninFormData) => {
        setError('');
        setIsLoading(true);

        loginMutation.mutate({
            username: data.username,
            password: data.password,
        });
    };

    // Show loading while checking authentication
    if (isCheckingAuth || !_hasHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            ورود فروشگاه
                        </CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                            دسترسی به پنل مدیریت فروشگاه
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                ایمیل یا شماره موبایل
                            </label>
                            <Input
                                id="username"
                                type="text"
                                {...register('username')}
                                placeholder="example@email.com یا 09123456789"
                                className={`w-full text-right ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                                disabled={isLoading}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.username.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                رمز عبور
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password')}
                                    placeholder="رمز عبور خود را وارد کنید"
                                    className={`w-full pr-10 text-right ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>در حال ورود...</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <Lock className="w-4 h-4" />
                                    <span>ورود</span>
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center space-y-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            حساب کاربری ندارید؟{' '}
                            <Link href="/store/signup" className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium">
                                ثبت نام
                            </Link>
                        </p>

                        <div className="space-y-2">
                            <Link
                                href="/store/otp?type=login"
                                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                            >
                                ورود با کد تایید
                            </Link>
                        </div>

                        <Link
                            href="/"
                            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 ml-1" />
                            بازگشت به صفحه اصلی
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
