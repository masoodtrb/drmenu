'use client';

import { useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { CategoryForm } from '@/components/forms/CategoryForm';
import { LoadingPage } from '@/components/ui/loading';
import { useMenuActions } from '@/hooks/useMenuActions';
import { type UpdateCategoryInput } from '@/lib/validations/menu';

interface CategoryData {
  id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  itemsCount: number;
  createdAt: string;
}

export default function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get('store');
  const categoryId = params.id;

  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const { updateCategory } = useMenuActions();

  // Mock data - در آینده از API دریافت خواهد شد
  const mockCategory: CategoryData = {
    id: categoryId,
    title: 'پیش‌غذا',
    description: 'انواع پیش‌غذاهای سنتی و مدرن',
    icon: '🥗',
    active: true,
    itemsCount: 12,
    createdAt: '2024-01-15',
  };

  useEffect(() => {
    // Simulate API call to fetch category data
    setTimeout(() => {
      setCategoryData(mockCategory);
      setLoading(false);
    }, 1000);
  }, [categoryId]);

  const handleSubmit = async (data: UpdateCategoryInput) => {
    const success = await updateCategory({
      id: categoryId,
      ...data,
    });

    if (success) {
      router.push(`/store/menu/categories?store=${storeId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/store/menu/categories?store=${storeId}`);
  };

  if (loading) {
    return <LoadingPage message="در حال بارگذاری دسته‌بندی..." />;
  }

  if (!categoryData) {
    return <LoadingPage message="دسته‌بندی یافت نشد" />;
  }

  return (
    <CategoryForm
      mode="edit"
      initialData={categoryData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      categoryInfo={{
        itemsCount: categoryData.itemsCount,
        createdAt: categoryData.createdAt,
      }}
    />
  );
}
