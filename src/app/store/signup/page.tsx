'use client';

import { ArrowLeft, Eye, EyeOff, Store, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserStore } from '@/lib/store/userStore';
import { trpc } from '@/trpc/client';

import { zodResolver } from '@hookform/resolvers/zod';

// Form validation schema
const signupSchema = z
  .object({
    username: z
      .string()
      .min(1, 'ایمیل یا شماره موبایل الزامی است')
      .refine(value => {
        // Basic email or mobile validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^09\d{9}$/;
        return emailRegex.test(value) || mobileRegex.test(value);
      }, 'لطفاً ایمیل یا شماره موبایل معتبر وارد کنید'),
    password: z
      .string()
      .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'رمز عبور باید شامل حروف بزرگ، کوچک و عدد باشد'
      ),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن مطابقت ندارند',
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function StoreSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  // Zustand store
  const { storeUser, storeToken, _hasHydrated } = useUserStore();

  // Signup mutation
  const signupMutation = trpc.auth.signUp.useMutation({
    onSuccess: data => {
      setSuccess(
        'حساب کاربری با موفقیت ایجاد شد. لطفاً کد تایید ارسال شده را وارد کنید.'
      );
      setError('');
      setIsLoading(false);
      // Redirect to OTP verification page
      router.push(
        `/store/otp?username=${encodeURIComponent(data.username)}&type=signup&token=${encodeURIComponent(data.token)}`
      );
    },
    onError: error => {
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

  const onSubmit = (data: SignupFormData) => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    signupMutation.mutate({
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
      <Card className="w-full shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              ثبت نام فروشگاه
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              ایجاد حساب کاربری جدید برای مدیریت فروشگاه
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

            {success && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
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
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                رمز عبور
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="حداقل 8 کاراکتر"
                  className={`w-full pr-10 text-right ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                تکرار رمز عبور
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  placeholder="تکرار رمز عبور"
                  className={`w-full pr-10 text-right ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword.message}
                </p>
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
                  <span>در حال ثبت نام...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>ثبت نام</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              قبلاً حساب کاربری دارید؟{' '}
              <Link
                href="/store/signin"
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
              >
                ورود
              </Link>
            </p>

            <Link
              href="/store/signin"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              بازگشت به صفحه ورود
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
