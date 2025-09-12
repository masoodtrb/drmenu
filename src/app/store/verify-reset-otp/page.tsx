'use client';

import { ArrowLeft, KeyRound, Store } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { trpc } from '@/trpc/client';

import { zodResolver } from '@hookform/resolvers/zod';

// Form validation schema
const verifyOTPSchema = z.object({
  otp: z.string().length(5, 'کد تایید باید ۵ رقم باشد'),
});

type VerifyOTPFormData = z.infer<typeof verifyOTPSchema>;

export default function VerifyResetOTPPage() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form setup with react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VerifyOTPFormData>({
    resolver: zodResolver(verifyOTPSchema),
    mode: 'onChange',
  });

  const otpValue = watch('otp');

  // Get token and username from URL params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const usernameParam = searchParams.get('username');

    if (!tokenParam || !usernameParam) {
      router.push('/store/forgot-password');
      return;
    }

    setToken(tokenParam);
    setUsername(decodeURIComponent(usernameParam));
  }, [searchParams, router]);

  // Verify OTP mutation
  const verifyOTPMutation = trpc.auth.verifyPasswordResetOTP.useMutation({
    onSuccess: data => {
      setIsLoading(false);
      // Redirect to new password page with the reset token
      router.push(`/store/reset-password?token=${data.resetToken}`);
    },
    onError: error => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  const onSubmit = (data: VerifyOTPFormData) => {
    if (!token || !username) {
      setError('اطلاعات ناقص است. لطفاً دوباره تلاش کنید.');
      return;
    }

    setError('');
    setIsLoading(true);

    verifyOTPMutation.mutate({
      username,
      otp: data.otp,
      token,
    });
  };

  const handleOTPChange = (value: string) => {
    setValue('otp', value);
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      setTimeout(() => {
        onSubmit({ otp: value });
      }, 500);
    }
  };

  if (!token || !username) {
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
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              تایید کد
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              کد ۶ رقمی ارسال شده را وارد کنید
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  کد تایید به {username} ارسال شد
                </p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpValue}
                  onChange={handleOTPChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup dir="ltr">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {errors.otp && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {errors.otp.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={isLoading || !otpValue || otpValue.length !== 5}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال تایید...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4" />
                  <span>تایید کد</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              کد را دریافت نکردید؟{' '}
              <button
                type="button"
                onClick={() => {
                  // Resend OTP logic can be added here
                  window.location.reload();
                }}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
                disabled={isLoading}
              >
                ارسال مجدد
              </button>
            </div>

            <Link
              href="/store/forgot-password"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 ml-1" />
              بازگشت
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
