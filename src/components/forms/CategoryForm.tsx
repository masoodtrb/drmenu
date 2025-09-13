'use client';

import { ArrowRight, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type CreateCategoryInput,
  createCategorySchema,
  type UpdateCategoryInput,
  updateCategorySchema,
} from '@/lib/validations/menu';

import { zodResolver } from '@hookform/resolvers/zod';

const categoryIcons = [
  '🥗',
  '🍽️',
  '🍰',
  '🥤',
  '☕',
  '🍕',
  '🍔',
  '🌮',
  '🍜',
  '🍱',
  '🥙',
  '🌯',
  '🍲',
  '🥘',
  '🍳',
  '🥞',
  '🧇',
  '🍞',
  '🥐',
  '🥖',
  '🧀',
  '🥚',
  '🥓',
  '🍖',
  '🍗',
  '🥩',
  '🦐',
  '🐟',
  '🦑',
  '🦀',
  '🍇',
  '🍈',
  '🍉',
  '🍊',
  '🍋',
  '🍌',
  '🍍',
  '🥭',
  '🍎',
  '🍏',
  '🍐',
  '🍑',
  '🍒',
  '🍓',
  '🫐',
  '🥝',
  '🍅',
  '🫒',
  '🥥',
  '🥑',
];

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreateCategoryInput & UpdateCategoryInput>;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  categoryInfo?: {
    itemsCount: number;
    createdAt: string;
  };
}

export function CategoryForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  categoryInfo,
}: CategoryFormProps) {
  const schema =
    mode === 'create' ? createCategorySchema : updateCategorySchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      icon: initialData?.icon || '🥗',
      active: initialData?.active ?? true,
      storeBranchId: initialData?.storeBranchId || '',
      id: initialData?.id || '',
    },
  });

  const watchedValues = watch();

  console.log({ errors });

  const handleFormSubmit = async (
    data: CreateCategoryInput | UpdateCategoryInput
  ) => {
    console.log(data);
    await onSubmit(data);
  };

  const handleIconSelect = (icon: string) => {
    setValue('icon', icon);
  };

  const handleActiveToggle = (active: boolean) => {
    setValue('active', active);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'create' ? 'ایجاد دسته‌بندی جدید' : 'ویرایش دسته‌بندی'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {mode === 'create'
              ? 'دسته‌بندی جدیدی برای منوی خود ایجاد کنید'
              : `ویرایش اطلاعات دسته‌بندی "${initialData?.title}"`}
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
            اطلاعات دسته‌بندی
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Info (only for edit mode) */}
          {mode === 'edit' && categoryInfo && (
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  تعداد آیتم‌ها:
                </p>
                <p className="font-semibold">{categoryInfo.itemsCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  تاریخ ایجاد:
                </p>
                <p className="font-semibold">
                  {new Date(categoryInfo.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                نام دسته‌بندی *
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="مثال: پیش‌غذا، غذای اصلی، دسر"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                توضیحات *
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="توضیحات کوتاهی درباره این دسته‌بندی بنویسید..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                انتخاب آیکون
              </label>
              <div className="grid grid-cols-6 gap-2 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                {categoryIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleIconSelect(icon)}
                    className={`w-10 h-10 text-xl rounded-lg border-2 transition-all hover:scale-110 ${
                      watchedValues.icon === icon
                        ? 'border-green-500 bg-green-100 dark:bg-green-900'
                        : 'border-gray-200 dark:border-slate-600 hover:border-green-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  آیکون انتخاب شده:
                </span>
                <span className="text-2xl">{watchedValues.icon}</span>
              </div>
              {errors.icon && (
                <p className="text-sm text-red-600">{errors.icon.message}</p>
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
                دسته‌بندی‌های غیرفعال در منوی مشتریان نمایش داده نمی‌شوند
              </p>
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                پیش‌نمایش
              </label>
              <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{watchedValues.icon}</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {watchedValues.title || 'نام دسته‌بندی'}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {watchedValues.description || 'توضیحات دسته‌بندی'}
                    </p>
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
                    {mode === 'create' ? 'در حال ایجاد...' : 'در حال ذخیره...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    {mode === 'create' ? 'ایجاد دسته‌بندی' : 'ذخیره تغییرات'}
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
