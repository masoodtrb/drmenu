import { z } from 'zod';

// Category validation schemas
export const createCategorySchema = z.object({
  title: z
    .string()
    .min(2, 'نام دسته‌بندی باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام دسته‌بندی نمی‌تواند بیش از 50 کاراکتر باشد'),
  description: z
    .string()
    .min(10, 'توضیحات باید حداقل 10 کاراکتر باشد')
    .max(500, 'توضیحات نمی‌تواند بیش از 500 کاراکتر باشد'),
  icon: z.string().min(1, 'انتخاب آیکون الزامی است'),
  active: z.boolean().default(true),
  storeBranchId: z.string().min(1, 'شناسه شعبه الزامی است'),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1, 'شناسه دسته‌بندی الزامی است'),
  title: z
    .string()
    .min(2, 'نام دسته‌بندی باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام دسته‌بندی نمی‌تواند بیش از 50 کاراکتر باشد')
    .optional(),
  description: z
    .string()
    .min(10, 'توضیحات باید حداقل 10 کاراکتر باشد')
    .max(500, 'توضیحات نمی‌تواند بیش از 500 کاراکتر باشد')
    .optional(),
  icon: z.string().min(1, 'انتخاب آیکون الزامی است').optional(),
  active: z.boolean().optional(),
});

// Item validation schemas
export const createItemSchema = z.object({
  title: z
    .string()
    .min(2, 'نام آیتم باید حداقل 2 کاراکتر باشد')
    .max(100, 'نام آیتم نمی‌تواند بیش از 100 کاراکتر باشد'),
  description: z
    .string()
    .min(10, 'توضیحات باید حداقل 10 کاراکتر باشد')
    .max(1000, 'توضیحات نمی‌تواند بیش از 1000 کاراکتر باشد'),
  price: z
    .number()
    .positive('قیمت باید عدد مثبت باشد')
    .max(999999999, 'قیمت نمی‌تواند بیش از 999,999,999 باشد'),
  currency: z.enum(['IRR', 'USD', 'EUR']).default('IRR'),
  active: z.boolean().default(true),
  categoryId: z.string().min(1, 'انتخاب دسته‌بندی الزامی است'),
  images: z.array(z.any()).optional().default([]),
  imageIds: z.array(z.string()).optional().default([]),
});

export const updateItemSchema = z.object({
  id: z.string().min(1, 'شناسه آیتم الزامی است'),
  title: z
    .string()
    .min(2, 'نام آیتم باید حداقل 2 کاراکتر باشد')
    .max(100, 'نام آیتم نمی‌تواند بیش از 100 کاراکتر باشد')
    .optional(),
  description: z
    .string()
    .min(10, 'توضیحات باید حداقل 10 کاراکتر باشد')
    .max(1000, 'توضیحات نمی‌تواند بیش از 1000 کاراکتر باشد')
    .optional(),
  price: z
    .number()
    .positive('قیمت باید عدد مثبت باشد')
    .max(999999999, 'قیمت نمی‌تواند بیش از 999,999,999 باشد')
    .optional(),
  currency: z.enum(['IRR', 'USD', 'EUR']).optional(),
  active: z.boolean().optional(),
  categoryId: z.string().min(1, 'انتخاب دسته‌بندی الزامی است').optional(),
  images: z.array(z.any()).optional(),
  imageIds: z.array(z.string()).optional(),
});

// Type exports
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
