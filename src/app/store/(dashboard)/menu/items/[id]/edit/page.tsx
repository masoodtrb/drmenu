'use client';

import { useEffect, useState } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { ItemForm } from '@/components/forms/ItemForm';
import { LoadingPage } from '@/components/ui/loading';
import { useMenuActions } from '@/hooks/useMenuActions';
import { useMenuApi } from '@/hooks/useMenuApi';
import { type UpdateItemInput } from '@/lib/validations/menu';

interface Category {
  id: string;
  title: string;
}

interface ItemData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'IRR' | 'USD' | 'EUR';
  active: boolean;
  categoryId: string;
  images: any[];
}

export default function EditItemPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');
  const { id: itemId } = useParams();

  const [itemData, setItemData] = useState<ItemData | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { updateItem } = useMenuActions();
  const { getItemById, listCategories } = useMenuApi();

  // Use tRPC queries
  const itemQuery = getItemById({ id: itemId as string });
  const categoriesQuery = listCategories(
    {
      storeBranchId: branchId || '',
      limit: 100,
      offset: 0,
    },
    {
      enabled: !!branchId, // Only run query if branchId is available
    }
  );

  useEffect(() => {
    if (itemQuery.data?.item) {
      const item = itemQuery.data.item;
      setItemData({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        currency: item.currency as 'IRR' | 'USD' | 'EUR',
        active: item.active ?? false,
        categoryId: item.categoryId,
        images:
          item.images?.map((img: any) => ({
            id: img.id,
            file: null, // File object not available in edit mode
            preview: `/api/files/${img.file.id}`,
            isPrimary: img.isPrimary,
            uploadedFileId: img.fileId,
          })) || [],
      });
    }
  }, [itemQuery.data]);

  useEffect(() => {
    if (categoriesQuery.data?.categories) {
      setCategories(
        categoriesQuery.data.categories.map((cat: any) => ({
          id: cat.id,
          title: cat.title,
        }))
      );
    }
  }, [categoriesQuery.data]);

  useEffect(() => {
    if (itemQuery.isLoading || categoriesQuery.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [itemQuery.isLoading, categoriesQuery.isLoading]);

  const handleSubmit = async (data: any) => {
    const success = await updateItem({
      id: itemId,
      ...data,
    });

    if (success) {
      const redirectUrl = itemData?.categoryId
        ? `/store/menu/items?branch=${branchId}&category=${itemData.categoryId}`
        : `/store/menu/items?branch=${branchId}`;
      router.push(redirectUrl);
    }
  };

  const handleCancel = () => {
    const redirectUrl = itemData?.categoryId
      ? `/store/menu/items?branch=${branchId}&category=${itemData.categoryId}`
      : `/store/menu/items?branch=${branchId}`;
    router.push(redirectUrl);
  };

  if (loading) {
    return <LoadingPage message="در حال بارگذاری آیتم..." />;
  }

  if (itemQuery.error) {
    return <LoadingPage message="خطا در بارگذاری آیتم" />;
  }

  if (!itemData) {
    return <LoadingPage message="آیتم یافت نشد" />;
  }

  return (
    <ItemForm
      mode="edit"
      initialData={itemData}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      categories={categories}
    />
  );
}
