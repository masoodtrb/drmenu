'use client';

import { ArrowRight, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type CreateStoreInput,
  createStoreSchema,
} from '@/lib/validations/store';

import { zodResolver } from '@hookform/resolvers/zod';

import { GeolocationMap } from './GeolocationMap';

interface StoreType {
  id: string;
  title: string;
}

interface StoreFormProps {
  onSubmit: (data: CreateStoreInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  storeTypes: StoreType[];
}

export function StoreForm({
  onSubmit,
  onCancel,
  loading = false,
  storeTypes,
}: StoreFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      title: '',
      address: '',
      phone: '',
      latitude: undefined,
      longitude: undefined,
      storeTypeId: '',
      active: true,
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: any) => {
    await onSubmit(data);
  };

  const handleActiveToggle = (active: boolean) => {
    setValue('active', active);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    console.log('Location changed:', { lat, lng }); // Debug log
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ایجاد فروشگاه جدید
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            فروشگاه جدیدی برای مدیریت منو ایجاد کنید
          </p>
        </div>
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="w-4 h-4 ml-2" />
          انصراف
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            اطلاعات فروشگاه
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                نام فروشگاه *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="مثال: رستوران سنتی، کافه مدرن"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                آدرس
              </label>
              <Textarea
                id="address"
                {...register('address')}
                placeholder="آدرس کامل فروشگاه..."
                rows={3}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                شماره تماس
              </label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="مثال: 021-12345678 یا 09123456789"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Geolocation */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                موقعیت جغرافیایی (اختیاری)
              </label>

              {/* Interactive Map */}
              <GeolocationMap
                latitude={watchedValues.latitude}
                longitude={watchedValues.longitude}
                onLocationChange={handleLocationChange}
                height="300px"
              />
            </div>

            {/* Store Type Selection */}
            <div className="space-y-2">
              <label
                htmlFor="storeTypeId"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                نوع فروشگاه *
              </label>
              <select
                id="storeTypeId"
                {...register('storeTypeId')}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.storeTypeId
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-slate-600'
                }`}
              >
                <option value="">انتخاب نوع فروشگاه</option>
                {storeTypes.map(storeType => (
                  <option key={storeType.id} value={storeType.id}>
                    {storeType.title}
                  </option>
                ))}
              </select>
              {errors.storeTypeId && (
                <p className="text-sm text-red-600">
                  {errors.storeTypeId.message}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                وضعیت
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleActiveToggle(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    watchedValues.active
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      watchedValues.active ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm">فعال</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleActiveToggle(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    !watchedValues.active
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-slate-600'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !watchedValues.active ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  />
                  <span className="text-sm">غیرفعال</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                فروشگاه‌های غیرفعال در سیستم نمایش داده نمی‌شوند
              </p>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                پیش‌نمایش
              </label>
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {watchedValues.title || 'نام فروشگاه'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {storeTypes.find(
                        st => st.id === watchedValues.storeTypeId
                      )?.title || 'نوع فروشگاه'}
                    </p>
                  </div>
                  <Badge
                    variant={watchedValues.active ? 'default' : 'secondary'}
                    className={
                      watchedValues.active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }
                  >
                    {watchedValues.active ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="flex-1"
              >
                {isSubmitting || loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2" />
                    در حال ایجاد...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    ایجاد فروشگاه
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                disabled={isSubmitting || loading}
              >
                انصراف
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
