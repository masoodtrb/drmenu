'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ItemForm } from '@/components/forms/ItemForm';
import { useMenuActions } from '@/hooks/useMenuActions';
import { useMenuApi } from '@/hooks/useMenuApi';
import {
  type CreateItemInput,
  type UpdateItemInput,
} from '@/lib/validations/menu';

interface Category {
  id: string;
  title: string;
}

export default function CreateItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');
  const categoryId = searchParams.get('category');

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { createItem } = useMenuActions();
  const { listCategories } = useMenuApi();

  // Fetch categories from API using query
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = listCategories(
    {
      storeBranchId: branchId || '',
      limit: 100,
      offset: 0,
    },
    {
      enabled: !!branchId, // Only run query if branchId exists
    }
  );

  useEffect(() => {
    if (categoriesData?.categories) {
      setCategories(categoriesData.categories);
    }
    setLoading(categoriesLoading);
  }, [categoriesData, categoriesLoading]);

  const handleSubmit = async (data: CreateItemInput | UpdateItemInput) => {
    const success = await createItem(data as CreateItemInput);

    if (success) {
      const redirectUrl = categoryId
        ? `/store/menu/items?branch=${branchId}&category=${categoryId}`
        : `/store/menu/items?branch=${branchId}`;
      router.push(redirectUrl);
    }
  };

  const handleCancel = () => {
    const redirectUrl = categoryId
      ? `/store/menu/items?branch=${branchId}&category=${categoryId}`
      : `/store/menu/items?branch=${branchId}`;
    router.push(redirectUrl);
  };

  // Show loading state while fetching categories
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              در حال بارگذاری دسته‌بندی‌ها...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if no branch ID
  if (!branchId) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              خطا: شناسه شعبه یافت نشد
            </p>
            <button
              onClick={() => router.push('/store/menu')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              بازگشت به منو
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if categories failed to load
  if (categoriesError) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              خطا در بارگذاری دسته‌بندی‌ها
            </p>
            <button
              onClick={() => router.push('/store/menu')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              بازگشت به منو
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ItemForm
      mode="create"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      categories={categories}
      loading={loading}
    />
  );
}
