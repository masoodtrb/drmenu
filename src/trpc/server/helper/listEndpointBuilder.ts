import { z } from 'zod';

import { TRPCError } from '@trpc/server';

import {
  FilterOperation,
  QueryBuilder,
  QueryBuilderOptions,
  QueryBuilderResult,
  SearchFilter,
} from './queryBuilder';

/**
 * Advanced search filter schema
 */
export const searchFilterSchema = z.object({
  field: z.string(),
  value: z.any(),
  operation: z.enum([
    'eq',
    'ne',
    'gt',
    'gte',
    'lt',
    'lte',
    'in',
    'notIn',
    'contains',
    'startsWith',
    'endsWith',
    'isNull',
    'isNotNull',
    'between',
    'notContains',
    'regex',
    'search',
    'has',
    'hasNot',
    'some',
    'every',
    'none',
  ]),
  relation: z.string().optional(),
  caseSensitive: z.boolean().optional(),
});

/**
 * Generic list input schema that can be extended
 */
export const baseListInputSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
  advancedSearch: z.array(searchFilterSchema).optional(),
  orderBy: z.record(z.string(), z.enum(['asc', 'desc'])).optional(),
});

/**
 * Generic list response schema
 */
export interface BaseListResponse<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Configuration for building list endpoints
 */
export interface ListEndpointConfig<T> {
  model: any; // Prisma model
  searchFields?: string[];
  defaultFilters?: Record<string, any>;
  defaultIncludes?: Record<string, any>;
  defaultOrderBy?: Record<string, 'asc' | 'desc'>;
  maxLimit?: number;
  transformData?: (data: T[]) => any[];
  validateAccess?: (ctx: any) => Promise<boolean>;
  customFilters?: (input: any) => Record<string, any>;
}

/**
 * Generic list endpoint builder
 */
export class ListEndpointBuilder<T> {
  private config: ListEndpointConfig<T>;

  constructor(config: ListEndpointConfig<T>) {
    this.config = {
      maxLimit: 100,
      ...config,
    };
  }

  /**
   * Create a list endpoint procedure
   */
  createListEndpoint(inputSchema?: z.ZodSchema) {
    const schema = inputSchema || baseListInputSchema;

    return async (ctx: any, input: any) => {
      try {
        // Validate access if provided
        if (this.config.validateAccess) {
          const hasAccess = await this.config.validateAccess(ctx);
          if (!hasAccess) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Access denied',
            });
          }
        }

        const queryBuilder = new QueryBuilder(this.config.model, {
          limit: input.limit,
          offset: input.offset,
          orderBy: input.orderBy || this.config.defaultOrderBy,
          include: this.config.defaultIncludes,
          filters: this.config.defaultFilters,
        });

        // Add advanced search if provided
        if (input.advancedSearch && input.advancedSearch.length > 0) {
          queryBuilder.search(input.advancedSearch);
        }
        // Add legacy search if provided
        else if (input.search && this.config.searchFields) {
          queryBuilder.searchText(input.search, this.config.searchFields);
        }

        // Add custom filters if provided
        if (this.config.customFilters) {
          const customFilters = this.config.customFilters(input);
          queryBuilder.filter(customFilters);
        }

        const result = await queryBuilder.execute<T>();

        let data = result.data;
        if (this.config.transformData) {
          data = this.config.transformData(data);
        }

        return {
          data,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch data',
        });
      }
    };
  }
}

/**
 * Predefined list endpoint configurations for common entities
 */
export const ListEndpointConfigs = {
  /**
   * Store list configuration
   */
  store: {
    model: null, // Will be set dynamically
    searchFields: ['title'],
    defaultFilters: { deletedAt: null },
    defaultIncludes: {
      storeType: true,
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      _count: {
        select: {
          StoreBranch: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
    defaultOrderBy: { createdAt: 'desc' as const },
    customFilters: (input: any) => {
      const filters: Record<string, any> = {};
      if (input.active !== undefined) filters.active = input.active;
      if (input.storeTypeId) filters.storeTypeId = input.storeTypeId;
      if (input.userId) filters.userId = input.userId;
      return filters;
    },
  },

  /**
   * User list configuration
   */
  user: {
    model: null, // Will be set dynamically
    searchFields: ['username'],
    defaultFilters: { deletedAt: null },
    defaultIncludes: {
      Profile: true,
    },
    defaultOrderBy: { createdAt: 'desc' as const },
    customFilters: (input: any) => {
      const filters: Record<string, any> = {};
      if (input.role) filters.role = input.role;
      if (input.active !== undefined) filters.active = input.active;
      return filters;
    },
  },

  /**
   * File list configuration
   */
  file: {
    model: null, // Will be set dynamically
    searchFields: ['name'],
    defaultFilters: { deletedAt: null },
    defaultIncludes: {
      owner: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    defaultOrderBy: { createdAt: 'desc' as const },
    customFilters: (input: any) => {
      const filters: Record<string, any> = {};
      if (input.published !== undefined) filters.published = input.published;
      if (input.storageType) filters.storageType = input.storageType;
      if (input.ownerId) filters.ownerId = input.ownerId;
      return filters;
    },
  },
};

/**
 * Factory function to create list endpoints
 */
export function createListEndpoint<T>(
  config: ListEndpointConfig<T>,
  inputSchema?: z.ZodSchema
) {
  const builder = new ListEndpointBuilder<T>(config);
  return builder.createListEndpoint(inputSchema);
}

/**
 * Utility to create store list endpoint
 */
export function createStoreListEndpoint(db: any) {
  const config = {
    ...ListEndpointConfigs.store,
    model: db.store,
  };
  return createListEndpoint(
    config,
    z.object({
      ...baseListInputSchema.shape,
      active: z.boolean().optional(),
      storeTypeId: z.string().optional(),
      userId: z.string().optional(),
    })
  );
}

/**
 * Utility to create user list endpoint
 */
export function createUserListEndpoint(db: any) {
  const config = {
    ...ListEndpointConfigs.user,
    model: db.user,
  };
  return createListEndpoint(
    config,
    z.object({
      ...baseListInputSchema.shape,
      role: z.string().optional(),
      active: z.boolean().optional(),
    })
  );
}

/**
 * Utility to create file list endpoint
 */
export function createFileListEndpoint(db: any) {
  const config = {
    ...ListEndpointConfigs.file,
    model: db.file,
  };
  return createListEndpoint(
    config,
    z.object({
      ...baseListInputSchema.shape,
      published: z.boolean().optional(),
      storageType: z.string().optional(),
      ownerId: z.string().optional(),
    })
  );
}
