// Advanced Search Examples for Query Builder
// This file demonstrates how to use the enhanced search functionality with array of objects

import { SearchFilter, FilterOperation } from "./queryBuilder";
import {
  StoreQueryBuilder,
  UserQueryBuilder,
  FileQueryBuilder,
} from "./queryBuilder";

// ============================================================================
// BASIC SEARCH EXAMPLES
// ============================================================================

export const basicSearchExamples = {
  // Simple equality search
  findStoreByTitle: (title: string): SearchFilter[] => [
    { field: "title", value: title, operation: "eq" },
  ],

  // Contains search (case-insensitive)
  findStoresContaining: (text: string): SearchFilter[] => [
    { field: "title", value: text, operation: "contains" },
  ],

  // Multiple field search
  findStoresByTitleOrDescription: (text: string): SearchFilter[] => [
    { field: "title", value: text, operation: "contains" },
    { field: "description", value: text, operation: "contains" },
  ],

  // Numeric comparisons
  findStoresByActiveStatus: (active: boolean): SearchFilter[] => [
    { field: "active", value: active, operation: "eq" },
  ],

  // Date range search
  findStoresCreatedBetween: (
    startDate: Date,
    endDate: Date
  ): SearchFilter[] => [
    { field: "createdAt", value: [startDate, endDate], operation: "between" },
  ],
};

// ============================================================================
// ADVANCED SEARCH EXAMPLES
// ============================================================================

export const advancedSearchExamples = {
  // Complex store search with multiple conditions
  findRestaurantsInActiveStatus: (): SearchFilter[] => [
    { field: "title", value: "restaurant", operation: "contains" },
    { field: "active", value: true, operation: "eq" },
    { field: "createdAt", value: new Date("2024-01-01"), operation: "gte" },
  ],

  // Search with nested relations
  findStoresByUserRole: (role: string): SearchFilter[] => [
    { field: "role", value: role, operation: "eq", relation: "user" },
  ],

  // Search with store type information
  findStoresByTypeName: (typeName: string): SearchFilter[] => [
    {
      field: "title",
      value: typeName,
      operation: "contains",
      relation: "storeType",
    },
  ],

  // Multiple store types
  findStoresByMultipleTypes: (typeIds: string[]): SearchFilter[] => [
    { field: "storeTypeId", value: typeIds, operation: "in" },
  ],

  // Case-sensitive search
  findStoresExactMatch: (title: string): SearchFilter[] => [
    { field: "title", value: title, operation: "eq", caseSensitive: true },
  ],

  // Pattern matching
  findStoresStartingWith: (prefix: string): SearchFilter[] => [
    { field: "title", value: prefix, operation: "startsWith" },
  ],

  findStoresEndingWith: (suffix: string): SearchFilter[] => [
    { field: "title", value: suffix, operation: "endsWith" },
  ],
};

// ============================================================================
// USER SEARCH EXAMPLES
// ============================================================================

export const userSearchExamples = {
  // Find users by role
  findUsersByRole: (role: string): SearchFilter[] => [
    { field: "role", value: role, operation: "eq" },
  ],

  // Find active users created after date
  findActiveUsersAfterDate: (date: Date): SearchFilter[] => [
    { field: "active", value: true, operation: "eq" },
    { field: "createdAt", value: date, operation: "gte" },
  ],

  // Find users with username pattern
  findUsersByUsernamePattern: (pattern: string): SearchFilter[] => [
    { field: "username", value: pattern, operation: "contains" },
  ],

  // Find users with specific roles
  findUsersByMultipleRoles: (roles: string[]): SearchFilter[] => [
    { field: "role", value: roles, operation: "in" },
  ],

  // Find users with profile information
  findUsersWithProfile: (): SearchFilter[] => [
    { field: "id", value: null, operation: "isNotNull", relation: "Profile" },
  ],
};

// ============================================================================
// FILE SEARCH EXAMPLES
// ============================================================================

export const fileSearchExamples = {
  // Find files by size range
  findFilesBySizeRange: (minSize: number, maxSize: number): SearchFilter[] => [
    { field: "size", value: [minSize, maxSize], operation: "between" },
  ],

  // Find files by MIME type
  findFilesByMimeType: (mimeTypes: string[]): SearchFilter[] => [
    { field: "mimeType", value: mimeTypes, operation: "in" },
  ],

  // Find published files
  findPublishedFiles: (): SearchFilter[] => [
    { field: "published", value: true, operation: "eq" },
  ],

  // Find files by owner
  findFilesByOwner: (ownerId: string): SearchFilter[] => [
    { field: "ownerId", value: ownerId, operation: "eq" },
  ],

  // Find files by storage type
  findFilesByStorageType: (storageType: string): SearchFilter[] => [
    { field: "storageType", value: storageType, operation: "eq" },
  ],

  // Find files with specific extensions
  findFilesByExtension: (extensions: string[]): SearchFilter[] => [
    {
      field: "name",
      value: extensions.map((ext) => `%${ext}`),
      operation: "endsWith",
    },
  ],
};

// ============================================================================
// COMPLEX SEARCH EXAMPLES
// ============================================================================

export const complexSearchExamples = {
  // Find stores with active branches
  findStoresWithActiveBranches: (): SearchFilter[] => [
    { field: "active", value: true, operation: "eq" },
    {
      field: "id",
      value: null,
      operation: "isNotNull",
      relation: "StoreBranch",
    },
  ],

  // Find stores with specific user role
  findStoresByOwnerRole: (role: string): SearchFilter[] => [
    { field: "role", value: role, operation: "eq", relation: "user" },
  ],

  // Find stores with multiple conditions
  findComplexStores: (params: {
    titlePattern?: string;
    active?: boolean;
    storeTypeIds?: string[];
    createdAfter?: Date;
    createdBefore?: Date;
  }): SearchFilter[] => {
    const filters: SearchFilter[] = [];

    if (params.titlePattern) {
      filters.push({
        field: "title",
        value: params.titlePattern,
        operation: "contains",
      });
    }

    if (params.active !== undefined) {
      filters.push({ field: "active", value: params.active, operation: "eq" });
    }

    if (params.storeTypeIds && params.storeTypeIds.length > 0) {
      filters.push({
        field: "storeTypeId",
        value: params.storeTypeIds,
        operation: "in",
      });
    }

    if (params.createdAfter || params.createdBefore) {
      const startDate = params.createdAfter || new Date(0);
      const endDate = params.createdBefore || new Date();
      filters.push({
        field: "createdAt",
        value: [startDate, endDate],
        operation: "between",
      });
    }

    return filters;
  },

  // Find users with specific profile attributes
  findUsersByProfileAttributes: (params: {
    firstName?: string;
    lastName?: string;
    nationalId?: string;
  }): SearchFilter[] => {
    const filters: SearchFilter[] = [];

    if (params.firstName) {
      filters.push({
        field: "firstName",
        value: params.firstName,
        operation: "contains",
        relation: "Profile",
      });
    }

    if (params.lastName) {
      filters.push({
        field: "lastName",
        value: params.lastName,
        operation: "contains",
        relation: "Profile",
      });
    }

    if (params.nationalId) {
      filters.push({
        field: "nationalId",
        value: params.nationalId,
        operation: "eq",
        relation: "Profile",
      });
    }

    return filters;
  },
};

// ============================================================================
// QUERY BUILDER USAGE EXAMPLES
// ============================================================================

export const queryBuilderUsageExamples = {
  // Advanced store search
  advancedStoreSearch: async (db: any, filters: SearchFilter[]) => {
    const queryBuilder = new StoreQueryBuilder()
      .paginate(20, 0)
      .searchStoresAdvanced(filters)
      .withRelations();

    return await queryBuilder.execute();
  },

  // Complex user search
  complexUserSearch: async (db: any, filters: SearchFilter[]) => {
    const queryBuilder = new UserQueryBuilder()
      .paginate(15, 0)
      .searchUsersAdvanced(filters)
      .withProfile();

    return await queryBuilder.execute();
  },

  // File search with size constraints
  fileSearchWithSizeConstraints: async (db: any, filters: SearchFilter[]) => {
    const queryBuilder = new FileQueryBuilder()
      .paginate(25, 0)
      .searchFilesAdvanced(filters)
      .withOwner();

    return await queryBuilder.execute();
  },
};

// ============================================================================
// CLIENT-SIDE USAGE EXAMPLES
// ============================================================================

export const clientSideExamples = {
  // Example of how to use advanced search from client
  searchStoresAdvanced: {
    // Find restaurants created in 2024
    restaurants2024: [
      { field: "title", value: "restaurant", operation: "contains" },
      {
        field: "createdAt",
        value: [new Date("2024-01-01"), new Date("2024-12-31")],
        operation: "between",
      },
    ],

    // Find active stores by specific user
    activeStoresByUser: (userId: string) => [
      { field: "active", value: true, operation: "eq" },
      { field: "userId", value: userId, operation: "eq" },
    ],

    // Find stores with specific types
    storesByTypes: (typeIds: string[]) => [
      { field: "storeTypeId", value: typeIds, operation: "in" },
    ],

    // Find stores with title pattern and date range
    storesByPatternAndDate: (
      pattern: string,
      startDate: Date,
      endDate: Date
    ) => [
      { field: "title", value: pattern, operation: "contains" },
      { field: "createdAt", value: [startDate, endDate], operation: "between" },
    ],
  },

  // Example of how to use in tRPC call
  trpcUsageExample: `
    // Client-side usage
    const result = await api.store.list.query({
      limit: 20,
      offset: 0,
      advancedSearch: [
        { field: "title", value: "restaurant", operation: "contains" },
        { field: "active", value: true, operation: "eq" },
        { field: "createdAt", value: [new Date("2024-01-01"), new Date("2024-12-31")], operation: "between" }
      ]
    });
  `,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const searchUtilities = {
  // Create a date range filter
  createDateRangeFilter: (
    field: string,
    startDate: Date,
    endDate: Date
  ): SearchFilter => ({
    field,
    value: [startDate, endDate],
    operation: "between",
  }),

  // Create a text search filter
  createTextSearchFilter: (
    field: string,
    text: string,
    operation: "contains" | "startsWith" | "endsWith" = "contains"
  ): SearchFilter => ({
    field,
    value: text,
    operation,
  }),

  // Create an equality filter
  createEqualityFilter: (field: string, value: any): SearchFilter => ({
    field,
    value,
    operation: "eq",
  }),

  // Create an "in" filter for arrays
  createInFilter: (field: string, values: any[]): SearchFilter => ({
    field,
    value: values,
    operation: "in",
  }),

  // Create a null check filter
  createNullCheckFilter: (field: string, isNull: boolean): SearchFilter => ({
    field,
    value: null,
    operation: isNull ? "isNull" : "isNotNull",
  }),

  // Combine multiple filters
  combineFilters: (...filters: SearchFilter[][]): SearchFilter[] => {
    return filters.flat();
  },
};
