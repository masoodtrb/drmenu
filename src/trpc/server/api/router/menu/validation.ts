import { z } from 'zod';

// Category validation schemas
export const createCategorySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  icon: z.string().min(1, 'Icon is required').max(50, 'Icon too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  active: z.boolean().optional(),
  storeBranchId: z.string().min(1, 'Store branch ID is required'),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title too long')
    .optional(),
  icon: z
    .string()
    .min(1, 'Icon is required')
    .max(50, 'Icon too long')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long')
    .optional(),
  active: z.boolean().optional(),
});

export const getCategoryByIdSchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
});

export const listCategoriesSchema = z.object({
  storeBranchId: z.string().min(1, 'Store branch ID is required'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  active: z.boolean().optional(),
  search: z.string().optional(),
});

// Item validation schemas
export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long'),
  price: z.number().positive('Price must be positive'),
  currency: z
    .string()
    .min(1, 'Currency is required')
    .max(10, 'Currency too long')
    .default('USD'),
  active: z.boolean().optional(),
  categoryId: z.string().min(1, 'Category ID is required'),
  imageIds: z.array(z.string()).optional(), // Array of file IDs for images
});

export const updateItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title too long')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description too long')
    .optional(),
  price: z.number().positive('Price must be positive').optional(),
  currency: z
    .string()
    .min(1, 'Currency is required')
    .max(10, 'Currency too long')
    .optional(),
  active: z.boolean().optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  imageIds: z.array(z.string()).optional(), // Array of file IDs for images
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        file: z.any().optional(),
        preview: z.string().optional(),
        isPrimary: z.boolean().optional(),
        uploadedFileId: z.string().optional(),
      })
    )
    .optional(), // Full images data with isPrimary information
});

export const getItemByIdSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
});

export const deleteItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
});

export const listItemsSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  storeBranchId: z.string().min(1, 'Store branch ID is required').optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  active: z.boolean().optional(),
  search: z.string().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
});

// Public menu schemas (for customers)
export const getPublicMenuSchema = z.object({
  storeBranchId: z.string().min(1, 'Store branch ID is required'),
  includeInactive: z.boolean().default(false),
});

export const getPublicItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'),
});
