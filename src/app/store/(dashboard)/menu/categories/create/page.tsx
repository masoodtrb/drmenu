'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { CategoryForm } from '@/components/forms/CategoryForm';
import { useMenuActions } from '@/hooks/useMenuActions';
import {
  type CreateCategoryInput,
  type UpdateCategoryInput,
} from '@/lib/validations/menu';

export default function CreateCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get('branch');

  const { createCategory } = useMenuActions();

  const handleSubmit = async (
    data: CreateCategoryInput | UpdateCategoryInput
  ) => {
    const success = await createCategory({
      ...(data as CreateCategoryInput),
      storeBranchId: branchId || '',
    });

    if (success) {
      router.push(`/store/menu/categories?branch=${branchId}`);
    }
  };

  const handleCancel = () => {
    router.push(`/store/menu/categories?branch=${branchId}`);
  };

  return (
    <CategoryForm
      mode="create"
      initialData={{
        storeBranchId: branchId || '',
      }}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
