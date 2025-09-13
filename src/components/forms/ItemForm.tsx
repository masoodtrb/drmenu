'use client';

import { ArrowRight, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import ImageUpload from '@/components/ImageUpload';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMenuApi } from '@/hooks/useMenuApi';
import {
  type CreateItemInput,
  createItemSchema,
  type UpdateItemInput,
  updateItemSchema,
} from '@/lib/validations/menu';

import { zodResolver } from '@hookform/resolvers/zod';

interface Category {
  id: string;
  title: string;
}

interface UploadedImage {
  id: string;
  file: File | null; // Can be null for existing images
  preview: string;
  isPrimary?: boolean;
  uploadedFileId?: string; // ID from the database after upload
}

interface ItemFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CreateItemInput>;
  onSubmit: (data: CreateItemInput | UpdateItemInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  categories: Category[];
}

export function ItemForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  categories,
}: ItemFormProps) {
  const schema = mode === 'create' ? createItemSchema : updateItemSchema;
  const { uploadFile } = useMenuApi();

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
      price: initialData?.price || 0,
      currency: initialData?.currency || 'IRR',
      active: initialData?.active ?? true,
      categoryId: initialData?.categoryId || '',
      images: initialData?.images || [],
      ...(mode === 'edit' && { id: (initialData as any)?.id || '' }),
    },
  });

  const watchedValues = watch();

  const handleFormSubmit = async (data: CreateItemInput | UpdateItemInput) => {
    // Extract uploaded file IDs from images
    const imageIds = (data.images || [])
      .map((image: any) => image.uploadedFileId)
      .filter(Boolean);

    // Add imageIds to the data
    const dataWithImageIds = {
      ...data,
      imageIds,
    };

    await onSubmit(dataWithImageIds);
  };

  const handleActiveToggle = (active: boolean) => {
    setValue('active', active);
  };

  const handleImagesChange = async (images: UploadedImage[]) => {
    // Upload new images that don't have uploadedFileId yet
    const updatedImages = await Promise.all(
      images.map(async image => {
        if (image.uploadedFileId) {
          return image; // Already uploaded
        }

        // Skip if file is null (existing images)
        if (!image.file) {
          return image;
        }

        try {
          // Convert file to base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data:image/...;base64, prefix
              const base64Data = result.split(',')[1];
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(image.file!);
          });

          // Upload file
          const uploadResult = await uploadFile.mutateAsync({
            name: image.file!.name,
            content: base64,
            mimeType: image.file!.type,
            published: true, // Publish immediately for menu items
          });

          return {
            ...image,
            uploadedFileId: uploadResult.file.id,
          };
        } catch (error) {
          console.error('Failed to upload image:', error);
          return image; // Return original image if upload fails
        }
      })
    );

    setValue('images', updatedImages);
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'IRR') {
      return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'create' ? 'ایجاد آیتم جدید' : 'ویرایش آیتم'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {mode === 'create'
              ? 'آیتم جدیدی برای منوی خود ایجاد کنید'
              : `ویرایش اطلاعات آیتم "${initialData?.title}"`}
          </p>
        </div>
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="w-4 h-4 ml-2" />
          انصراف
        </Button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                اطلاعات آیتم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                {/* Title */}
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    نام آیتم *
                  </label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="مثال: کباب کوبیده، سالاد سزار"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">
                      {errors.title.message}
                    </p>
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
                    placeholder="توضیحات کامل آیتم را بنویسید..."
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Price and Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="price"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      قیمت *
                    </label>
                    <Input
                      id="price"
                      type="number"
                      {...register('price', { valueAsNumber: true })}
                      placeholder="0"
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-600">
                        {errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="currency"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      ارز
                    </label>
                    <select
                      id="currency"
                      {...register('currency')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="IRR">تومان (IRR)</option>
                      <option value="USD">دلار (USD)</option>
                      <option value="EUR">یورو (EUR)</option>
                    </select>
                    {errors.currency && (
                      <p className="text-sm text-red-600">
                        {errors.currency.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label
                    htmlFor="categoryId"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    دسته‌بندی *
                  </label>
                  <select
                    id="categoryId"
                    {...register('categoryId')}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                      errors.categoryId
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-slate-600'
                    }`}
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-sm text-red-600">
                      {errors.categoryId.message}
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
                    آیتم‌های غیرفعال در منوی مشتریان نمایش داده نمی‌شوند
                  </p>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    تصاویر آیتم
                  </label>
                  <ImageUpload
                    images={watchedValues.images || []}
                    onImagesChange={handleImagesChange}
                    maxImages={5}
                    maxSize={5}
                  />
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
                        {mode === 'create'
                          ? 'در حال ایجاد...'
                          : 'در حال ذخیره...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        {mode === 'create' ? 'ایجاد آیتم' : 'ذخیره تغییرات'}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>پیش‌نمایش</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {watchedValues.title || 'نام آیتم'}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {watchedValues.description || 'توضیحات آیتم'}
                  </p>
                </div>

                {watchedValues.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      قیمت:
                    </span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(
                        watchedValues.price,
                        watchedValues.currency || 'IRR'
                      )}
                    </span>
                  </div>
                )}

                {watchedValues.categoryId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      دسته‌بندی:
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {categories.find(c => c.id === watchedValues.categoryId)
                        ?.title || 'نامشخص'}
                    </Badge>
                  </div>
                )}

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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
