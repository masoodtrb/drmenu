'use client';

import { ArrowLeft, Mail, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useState } from 'react';

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
import { trpc } from '@/trpc/client';

import { zodResolver } from '@hookform/resolvers/zod';

// Form validation schema
const forgotPasswordSchema = z.object({
  username: z
    .string()
    .min(1, 'ایمیل یا شماره موبایل الزامی است')
    .refine(value => {
      // Basic email or mobile validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^09\d{9}$/;
      return emailRegex.test(value) || mobileRegex.test(value);
    }, 'لطفاً ایمیل یا شماره موبایل معتبر وارد کنید'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  // Send OTP mutation
  const sendOTPMutation = trpc.auth.sendOTP.useMutation({
    onSuccess: (data, variables) => {
      setSuccess(true);
      setIsLoading(false);
      // Redirect to OTP verification page with the token
      router.push(
        `/store/verify-reset-otp?token=${data.token}&username=${encodeURIComponent(variables.username)}`
      );
    },
    onError: error => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setError('');
    setSuccess(false);
    setIsLoading(true);

    sendOTPMutation.mutate({
      username: data.username,
      type: 'PASSWORD_RESET',
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                کد تایید ارسال شد
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
                کد تایید به ایمیل یا شماره موبایل شما ارسال شد
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              لطفاً صندوق ورودی ایمیل یا پیامک‌های خود را بررسی کنید
            </p>
            <Link
              href="/store/signin"
              className="inline-flex items-center text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              بازگشت به ورود
            </Link>
          </CardContent>
        </Card>
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
              فراموشی رمز عبور
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              ایمیل یا شماره موبایل خود را وارد کنید
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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ارسال...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>ارسال کد تایید</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <Link
              href="/store/signin"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              بازگشت به ورود
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
