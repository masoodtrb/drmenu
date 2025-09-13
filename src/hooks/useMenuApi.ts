'use client';

import { useCallback } from 'react';

import { trpc } from '@/trpc/client';

export const useMenuApi = () => {
  const utils = trpc.useUtils();

  // Category operations
  const createCategory = trpc.menu.createCategory.useMutation({
    onSuccess: () => {
      utils.menu.listCategories.invalidate();
    },
  });

  const updateCategory = trpc.menu.updateCategory.useMutation({
    onSuccess: () => {
      utils.menu.listCategories.invalidate();
      utils.menu.getCategoryById.invalidate();
    },
  });

  const deleteCategory = trpc.menu.deleteCategory.useMutation({
    onSuccess: () => {
      utils.menu.listCategories.invalidate();
    },
  });

  const listCategories = trpc.menu.listCategories.useQuery;

  const getCategoryById = trpc.menu.getCategoryById.useQuery;

  // Item operations
  const createItem = trpc.menu.createItem.useMutation({
    onSuccess: () => {
      utils.menu.listItems.invalidate();
    },
  });

  const updateItem = trpc.menu.updateItem.useMutation({
    onSuccess: () => {
      utils.menu.listItems.invalidate();
      utils.menu.getItemById.invalidate();
    },
  });

  const deleteItem = trpc.menu.deleteItem.useMutation({
    onSuccess: () => {
      utils.menu.listItems.invalidate();
    },
  });

  const listItems = trpc.menu.listItems.useQuery;

  const getItemById = trpc.menu.getItemById.useQuery;

  // Store operations
  const listStores = trpc.store.list.useQuery;
  const getMyStores = trpc.store.getMyStores.useQuery;
  const getMyStoreTypes = trpc.store.getMyStoreTypes.useQuery;
  const createMyStore = trpc.store.createMyStore.useMutation({
    onSuccess: () => {
      utils.store.getMyStores.invalidate();
    },
  });

  // Public menu operations
  const getPublicMenu = trpc.menu.getPublicMenu.useQuery;

  const getPublicItem = trpc.menu.getPublicItem.useQuery;

  // Helper functions
  const refreshCategories = useCallback(() => {
    utils.menu.listCategories.invalidate();
  }, [utils.menu.listCategories]);

  const refreshItems = useCallback(() => {
    utils.menu.listItems.invalidate();
  }, [utils.menu.listItems]);

  const refreshAll = useCallback(() => {
    utils.menu.listCategories.invalidate();
    utils.menu.listItems.invalidate();
    utils.store.list.invalidate();
  }, [utils.menu.listCategories, utils.menu.listItems, utils.store.list]);

  return {
    // Category mutations
    createCategory,
    updateCategory,
    deleteCategory,

    // Category queries
    listCategories,
    getCategoryById,

    // Item mutations
    createItem,
    updateItem,
    deleteItem,

    // Item queries
    listItems,
    getItemById,

    // Store queries
    listStores,
    getMyStores,
    getMyStoreTypes,
    createMyStore,

    // Public queries
    getPublicMenu,
    getPublicItem,

    // File operations
    uploadFile: trpc.file.upload.useMutation(),
    listFiles: trpc.file.list.useQuery,
    deleteFile: trpc.file.delete.useMutation(),
    getFileInfo: trpc.file.getFileInfo.useQuery,

    // Helper functions
    refreshCategories,
    refreshItems,
    refreshAll,
  };
};
