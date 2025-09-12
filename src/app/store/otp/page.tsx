'use client';

import { ArrowLeft, CheckCircle, Clock, RefreshCw, Store } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useUserStore } from '@/lib/store/userStore';
import {
  isEmail,
  isMobile,
  validateEmailWithPersian,
  validateMobileWithPersian,
} from '@/lib/util/commonValidations';
import { trpc } from '@/trpc/client';

import { zodResolver } from '@hookform/resolvers/zod';

// Form validation schema for username input (when needed)
const usernameSchema = z.object({
  username: z
    .string()
    .min(1, 'ایمیل یا شماره موبایل الزامی است')
    .refine(value => {
      return isEmail(value) || isMobile(value);
    }, 'لطفاً ایمیل یا شماره موبایل معتبر وارد کنید'),
});

// OTP validation schema
const otpSchema = z.object({
  otp: z
    .string()
    .length(5, 'کد تایید باید 5 رقمی باشد')
    .regex(/^\d{5}$/, 'کد تایید باید فقط شامل اعداد باشد'),
});

type UsernameFormData = z.infer<typeof usernameSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function StoreOTPPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showUsernameInput, setShowUsernameInput] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const username = searchParams.get('username');
  const type = searchParams.get('type') || 'signup';
  const token = searchParams.get('token');

  // Form setup for username input (when needed)
  const {
    register: registerUsername,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    mode: 'onChange',
  });

  // Form setup for OTP input
  const {
    setValue: setOtpValue,
    formState: { errors: otpErrors },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
  });

  // Zustand store
  const { storeUser, storeToken, setStoreUser, _hasHydrated } = useUserStore();

  // Verify user mutation (for signup)
  const verifyUserMutation = trpc.auth.verifyUser.useMutation({
    onSuccess: data => {
      setSuccess('حساب کاربری با موفقیت تایید شد!');
      setError('');
      setIsLoading(false);

      // Redirect to login page after successful verification
      setTimeout(() => {
        router.push('/store/signin');
      }, 2000);
    },
    onError: error => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  // Login with OTP mutation (for login)
  const loginWithOTPMutation = trpc.auth.loginWithOTP.useMutation({
    onSuccess: data => {
      // Store user data in Zustand
      setStoreUser(
        {
          id: data.userId,
          username: data.username,
          role: data.role,
          profile: data.profile
            ? {
                firstName: data.profile.firstName,
                lastName: data.profile.lastName,
                nationalId: data.profile.nationalId || '',
              }
            : undefined,
        },
        data.token
      );

      router.push('/store/dashboard');
    },
    onError: error => {
      setError(error.message);
      setIsLoading(false);
    },
  });

  // Send OTP mutation
  const sendOTPMutation = trpc.auth.sendOTP.useMutation({
    onSuccess: data => {
      setSuccess('کد تایید جدید ارسال شد');
      setError('');
      setIsResending(false);
      setCountdown(60);

      // Update URL with new token if provided
      if (data.token && username) {
        const newUrl = `/store/otp?username=${encodeURIComponent(username)}&type=${type}&token=${encodeURIComponent(data.token)}`;
        window.history.replaceState({}, '', newUrl);
      }
    },
    onError: error => {
      setError(error.message);
      setIsResending(false);
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

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle OTP change
  const handleOtpChange = (value: string) => {
    setOtp(value);
    setOtpValue('otp', value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (otp.length !== 5) {
      setError('لطفاً کد 5 رقمی را کامل وارد کنید');
      setIsLoading(false);
      return;
    }

    if (type === 'signup') {
      verifyUserMutation.mutate({
        username: username || '',
        otp: otp,
        token: token || '',
      });
    } else {
      // For login OTP
      loginWithOTPMutation.mutate({
        username: username || '',
        otp: otp,
        token: token || '',
      });
    }
  };

  const handleResendOTP = async () => {
    if (!username) {
      setError('نام کاربری یافت نشد');
      return;
    }

    setIsResending(true);
    setError('');

    sendOTPMutation.mutate({
      username,
      type: type === 'signup' ? 'SIGNUP' : 'LOGIN',
    });
  };

  const onSubmitUsername = (data: UsernameFormData) => {
    setError('');
    setIsResending(true);

    // Normalize username (convert Persian numbers to English)
    let normalizedUsername = data.username;

    // Check if it's a mobile number and normalize it
    if (isMobile(data.username)) {
      const mobileValidation = validateMobileWithPersian(data.username);
      normalizedUsername = mobileValidation.normalized;
    } else if (isEmail(data.username)) {
      const emailValidation = validateEmailWithPersian(data.username);
      normalizedUsername = emailValidation.normalized;
    }

    sendOTPMutation.mutate({
      username: normalizedUsername,
      type: 'LOGIN',
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
              تایید کد
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              {type === 'signup'
                ? 'کد تایید ارسال شده را وارد کنید'
                : 'کد تایید برای ورود ارسال شد'}
            </CardDescription>
            {username ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                <p>{username}</p>
                {isMobile(username) ? (
                  <p className="text-xs mt-1">کد تایید به پیامک ارسال شد</p>
                ) : (
                  <p className="text-xs mt-1">کد تایید به ایمیل ارسال شد</p>
                )}
              </div>
            ) : (
              type === 'login' && (
                <form
                  onSubmit={handleUsernameSubmit(onSubmitUsername)}
                  className="mt-4 space-y-4"
                >
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
                      {...registerUsername('username')}
                      placeholder="example@email.com یا 09123456789 یا ۰۹۱۲۳۴۵۶۷۸۹"
                      className={`w-full text-right ${usernameErrors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                      disabled={isResending}
                    />
                    {usernameErrors.username && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {usernameErrors.username.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    disabled={isResending}
                  >
                    {isResending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>در حال ارسال...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>ارسال کد تایید</span>
                      </div>
                    )}
                  </Button>
                </form>
              )
            )}
          </div>
        </CardHeader>

        <CardContent>
          {username ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 text-center block">
                  کد 5 رقمی تایید
                </label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={5}
                    value={otp}
                    onChange={handleOtpChange}
                    disabled={isLoading}
                    className="gap-3"
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup dir="ltr">
                      <InputOTPSlot
                        index={0}
                        className="w-12 h-12 text-lg font-semibold"
                      />
                      <InputOTPSlot
                        index={1}
                        className="w-12 h-12 text-lg font-semibold"
                      />
                      <InputOTPSlot
                        index={2}
                        className="w-12 h-12 text-lg font-semibold"
                      />
                      <InputOTPSlot
                        index={3}
                        className="w-12 h-12 text-lg font-semibold"
                      />
                      <InputOTPSlot
                        index={4}
                        className="w-12 h-12 text-lg font-semibold"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpErrors.otp && (
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {otpErrors.otp.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoading || otp.length !== 5}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>در حال تایید...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>تایید کد</span>
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
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
            </div>
          )}

          {username && (
            <div className="mt-6 text-center space-y-4">
              <div className="space-y-2">
                {countdown > 0 ? (
                  <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>ارسال مجدد تا {countdown} ثانیه دیگر</span>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/20"
                  >
                    {isResending ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال ارسال...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>ارسال مجدد کد</span>
                      </div>
                    )}
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Link
                  href={type === 'signup' ? '/store/signup' : '/store/signin'}
                  className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 ml-1" />
                  بازگشت
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
