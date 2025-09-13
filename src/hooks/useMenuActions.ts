'use client';

import { useCallback } from 'react';

import { useToast } from '@/components/ui/toast';

import { useMenuApi } from './useMenuApi';

export const useMenuActions = () => {
  const { success, error } = useToast();
  const api = useMenuApi();

  const createCategory = useCallback(
    async (data: {
      title: string;
      description: string;
      icon: string;
      active: boolean;
      storeBranchId: string;
    }) => {
      try {
        await api.createCategory.mutateAsync(data);
        success('دسته‌بندی با موفقیت ایجاد شد');
        return true;
      } catch (err: any) {
        error('خطا در ایجاد دسته‌بندی', err.message || 'خطای نامشخص');
        return false;
      }
    },
    [api.createCategory, success, error]
  );

  const updateCategory = useCallback(
    async (data: {
      id: string;
      title?: string;
      description?: string;
      icon?: string;
      active?: boolean;
    }) => {
      try {
        await api.updateCategory.mutateAsync(data);
        success('دسته‌بندی با موفقیت به‌روزرسانی شد');
        return true;
      } catch (err: any) {
        error('خطا در به‌روزرسانی دسته‌بندی', err.message || 'خطای نامشخص');
        return false;
      }
    },
    [api.updateCategory, success, error]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      try {
        await api.deleteCategory.mutateAsync({ id });
        success('دسته‌بندی با موفقیت حذف شد');
        return true;
      } catch (err: any) {
        error('خطا در حذف دسته‌بندی', err.message || 'خطای نامشخص');
        return false;
      }
    },
    [api.deleteCategory, success, error]
  );

  const createItem = useCallback(
    async (data: {
      title: string;
      description: string;
      price: number;
      currency: string;
      icon: string;
      active: boolean;
      categoryId: string;
      images?: any[];
    }) => {
      try {
        await api.createItem.mutateAsync(data);
        success('آیتم با موفقیت ایجاد شد');
        return true;
      } catch (err: any) {
        error('خطا در ایجاد آیتم', err.message || 'خطای نامشخص');
        return false;
      }
    },
    [api.createItem, success, error]
  );

  const updateItem = useCallback(
    async (data: {
      id: string;
      title?: string;
      description?: string;
      price?: number;
      currency?: string;
      icon?: string;
      active?: boolean;
      categoryId?: string;
      images?: any[];
    }) => {
      try {
        await api.updateItem.mutateAsync(data);
        success('آیتم با موفقیت به‌روزرسانی شد');
        return true;
      } catch (err: any) {
        error('خطا در به‌روزرسانی آیتم', err.message || 'خطای نامشخص');
        return false;
      }
    },
    [api.updateItem, success, error]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        await api.deleteItem.mutateAsync({ id });
        success('آیتم با موفقیت حذف شد');
        return true;
      } catch (err: any) {
        error('خطا در حذف آیتم', err.message || 'خطای نامشخص');
        return false;
      }
    },
    [api.deleteItem, success, error]
  );

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    // Expose API for direct access if needed
    api,
  };
};
