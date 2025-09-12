'use client';

import { ArrowRight, Save, User } from 'lucide-react';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

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

export default function StoreProfilePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get current profile data
  const { data: profileData, isLoading, refetch } = trpc.profile.me.useQuery();

  // Update profile mutation
  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      refetch();
      router.push('/store/dashboard');
    },
    onError: error => {
      console.error('Profile update error:', error);
      alert('خطا در به‌روزرسانی پروفایل: ' + error.message);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const nationalId = formData.get('nationalId') as string;

    updateProfileMutation.mutate({
      firstName,
      lastName,
      nationalId,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">
                  در حال بارگذاری...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 space-x-reverse mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              تکمیل پروفایل
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              اطلاعات شخصی خود را تکمیل کنید
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              اطلاعات شخصی
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              لطفاً اطلاعات زیر را با دقت تکمیل کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    نام *
                  </label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    defaultValue={profileData?.profile?.firstName || ''}
                    placeholder="نام خود را وارد کنید"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="lastName"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    نام خانوادگی *
                  </label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    defaultValue={profileData?.profile?.lastName || ''}
                    placeholder="نام خانوادگی خود را وارد کنید"
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="nationalId"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  کد ملی *
                </label>
                <Input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  required
                  defaultValue={profileData?.profile?.nationalId || ''}
                  placeholder="کد ملی خود را وارد کنید"
                  className="w-full"
                  disabled={isSubmitting}
                  maxLength={10}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  کد ملی باید ۱۰ رقم باشد
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                      در حال ذخیره...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 ml-2" />
                      ذخیره اطلاعات
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/store/dashboard')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  بازگشت به داشبورد
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Current Profile Info */}
        {profileData?.profile && (
          <Card className="mt-6 shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                اطلاعات فعلی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    نام
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {profileData.profile.firstName || 'تکمیل نشده'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    نام خانوادگی
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {profileData.profile.lastName || 'تکمیل نشده'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    کد ملی
                  </p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {profileData.profile.nationalId || 'تکمیل نشده'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
