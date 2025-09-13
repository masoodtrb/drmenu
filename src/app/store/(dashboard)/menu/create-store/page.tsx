'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { StoreForm } from '@/components/forms/StoreForm';
import { useMenuApi } from '@/hooks/useMenuApi';
import { type CreateStoreInput } from '@/lib/validations/store';

interface StoreType {
  id: string;
  title: string;
}

export default function CreateStorePage() {
  const router = useRouter();
  const { createMyStore, getMyStoreTypes } = useMenuApi();

  // Get store types from API
  const { data: storeTypesData, isLoading: loadingStoreTypes } =
    getMyStoreTypes();
  const storeTypes = storeTypesData?.storeTypes || [];

  const handleSubmit = async (data: CreateStoreInput) => {
    try {
      await createMyStore.mutateAsync(data);
      router.push('/store/menu');
    } catch (error) {
      console.error('Error creating store:', error);
    }
  };

  const handleCancel = () => {
    router.push('/store/menu');
  };

  if (loadingStoreTypes) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">
              در حال بارگذاری...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StoreForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      storeTypes={storeTypes}
      loading={createMyStore.isPending}
    />
  );
}
