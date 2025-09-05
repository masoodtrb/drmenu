import { z } from 'zod';

// Advanced search filter schema
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

export const createStoreSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  storeTypeId: z.string().min(1, 'Store type is required'),
  active: z.boolean().optional().default(false),
});

export const updateStoreSchema = z.object({
  id: z.string().min(1, 'Store ID is required'),
  title: z.string().min(1, 'Title is required').optional(),
  storeTypeId: z.string().min(1, 'Store type is required').optional(),
  active: z.boolean().optional(),
});

export const getStoreByIdSchema = z.object({
  id: z.string().min(1, 'Store ID is required'),
});

export const deleteStoreSchema = z.object({
  id: z.string().min(1, 'Store ID is required'),
});

export const listStoresSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(10),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
  advancedSearch: z.array(searchFilterSchema).optional(),
  active: z.boolean().optional(),
  storeTypeId: z.string().optional(),
  userId: z.string().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  titlePattern: z.string().optional(),
  storeTypeIds: z.array(z.string()).optional(),
});
