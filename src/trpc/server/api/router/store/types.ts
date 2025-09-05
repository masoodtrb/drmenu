import { Category, Store, StoreBranch, StoreType, User } from '@prisma/client';

// Base types
export type StoreWithRelations = Store & {
  storeType: StoreType;
  user: Pick<User, 'id' | 'username'>;
  StoreBranch: (StoreBranch & {
    Category: Category[];
  })[];
  _count?: {
    StoreBranch: number;
  };
};

export type StoreTypeWithRelations = StoreType & {
  Store: Store[];
};

// API Response types
export type CreateStoreResponse = {
  success: boolean;
  store: StoreWithRelations;
};

export type UpdateStoreResponse = {
  success: boolean;
  store: StoreWithRelations;
};

export type DeleteStoreResponse = {
  success: boolean;
  message: string;
};

export type GetStoreResponse = {
  store: StoreWithRelations;
};

export type ListStoresResponse = {
  stores: StoreWithRelations[];
  totalCount: number;
  hasMore: boolean;
};

export type GetStoreTypesResponse = {
  storeTypes: StoreType[];
};

export type GetMyStoresResponse = {
  stores: StoreWithRelations[];
};

// Input types
export type CreateStoreInput = {
  title: string;
  storeTypeId: string;
  active?: boolean;
};

export type UpdateStoreInput = {
  id: string;
  title?: string;
  storeTypeId?: string;
  active?: boolean;
};

export type GetStoreByIdInput = {
  id: string;
};

export type DeleteStoreInput = {
  id: string;
};

export type ListStoresInput = {
  limit?: number;
  offset?: number;
  search?: string;
  active?: boolean;
  storeTypeId?: string;
};

// Filter types for internal use
export type StoreWhereClause = {
  deletedAt: null;
  title?: {
    contains: string;
    mode: 'insensitive';
  };
  active?: boolean;
  storeTypeId?: string;
};
