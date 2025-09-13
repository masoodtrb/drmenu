'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  id: string;
  title: string;
  storeType: {
    id: string;
    title: string;
  };
  StoreBranch: StoreBranch[];
  active: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  active: boolean;
  storeBranchId: string;
  Item?: Item[];
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  active: boolean;
  categoryId: string;
  ItemImage?: ItemImage[];
}

interface ItemImage {
  id: string;
  url: string;
  alt: string;
  itemId: string;
}

interface StoreBranch {
  id: string;
  title: string;
  description: string;
  active: boolean;
  menuPublished: boolean;
  storeId: string;
  Category?: Category[];
}

interface MenuStoreState {
  // Selected store and branch
  selectedStoreId: string | null;
  selectedBranchId: string | null;

  // Store and branch data
  stores: Store[];
  branches: StoreBranch[];

  // Actions
  setSelectedStore: (storeId: string | null) => void;
  setSelectedBranch: (branchId: string | null) => void;
  setStores: (stores: Store[]) => void;
  setBranches: (branches: StoreBranch[]) => void;

  // Getters
  getSelectedStore: () => Store | null;
  getSelectedBranch: () => StoreBranch | null;
  getBranchesForSelectedStore: () => StoreBranch[];

  // Reset
  reset: () => void;
}

export const useMenuStore = create<MenuStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      selectedStoreId: null,
      selectedBranchId: null,
      stores: [],
      branches: [],

      // Actions
      setSelectedStore: (storeId: string | null) => {
        set({
          selectedStoreId: storeId,
          selectedBranchId: null, // Reset branch when store changes
        });
      },

      setSelectedBranch: (branchId: string | null) => {
        set({ selectedBranchId: branchId });
      },

      setStores: (stores: Store[]) => {
        set({ stores });
      },

      setBranches: (branches: StoreBranch[]) => {
        set({ branches });
      },

      // Getters
      getSelectedStore: () => {
        const { selectedStoreId, stores } = get();
        return stores.find(store => store.id === selectedStoreId) || null;
      },

      getSelectedBranch: () => {
        const { selectedBranchId, branches } = get();
        return branches.find(branch => branch.id === selectedBranchId) || null;
      },

      getBranchesForSelectedStore: () => {
        const { selectedStoreId, branches } = get();
        return branches.filter(branch => branch.storeId === selectedStoreId);
      },

      // Reset
      reset: () => {
        set({
          selectedStoreId: null,
          selectedBranchId: null,
          stores: [],
          branches: [],
        });
      },
    }),
    {
      name: 'menu-store',
      partialize: state => ({
        selectedStoreId: state.selectedStoreId,
        selectedBranchId: state.selectedBranchId,
      }),
    }
  )
);
