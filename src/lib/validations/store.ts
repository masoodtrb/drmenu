import { z } from 'zod';

// Store validation schemas
export const createStoreSchema = z.object({
  title: z
    .string()
    .min(2, 'نام فروشگاه باید حداقل 2 کاراکتر باشد')
    .max(100, 'نام فروشگاه نمی‌تواند بیش از 100 کاراکتر باشد'),
  address: z
    .string()
    .min(10, 'آدرس باید حداقل 10 کاراکتر باشد')
    .max(500, 'آدرس نمی‌تواند بیش از 500 کاراکتر باشد')
    .optional(),
  phone: z
    .string()
    .min(10, 'شماره تماس باید حداقل 10 رقم باشد')
    .max(15, 'شماره تماس نمی‌تواند بیش از 15 رقم باشد')
    .regex(
      /^[0-9+\-\s()]+$/,
      'شماره تماس باید شامل اعداد، +، -، فاصله و پرانتز باشد'
    )
    .optional(),
  latitude: z
    .number()
    .min(-90, 'عرض جغرافیایی باید بین -90 تا 90 باشد')
    .max(90, 'عرض جغرافیایی باید بین -90 تا 90 باشد')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'طول جغرافیایی باید بین -180 تا 180 باشد')
    .max(180, 'طول جغرافیایی باید بین -180 تا 180 باشد')
    .optional(),
  storeTypeId: z.string().min(1, 'انتخاب نوع فروشگاه الزامی است'),
  active: z.boolean().default(true),
});

export const updateStoreSchema = z.object({
  id: z.string().min(1, 'شناسه فروشگاه الزامی است'),
  title: z
    .string()
    .min(2, 'نام فروشگاه باید حداقل 2 کاراکتر باشد')
    .max(100, 'نام فروشگاه نمی‌تواند بیش از 100 کاراکتر باشد')
    .optional(),
  address: z
    .string()
    .min(10, 'آدرس باید حداقل 10 کاراکتر باشد')
    .max(500, 'آدرس نمی‌تواند بیش از 500 کاراکتر باشد')
    .optional(),
  phone: z
    .string()
    .min(10, 'شماره تماس باید حداقل 10 رقم باشد')
    .max(15, 'شماره تماس نمی‌تواند بیش از 15 رقم باشد')
    .regex(
      /^[0-9+\-\s()]+$/,
      'شماره تماس باید شامل اعداد، +، -، فاصله و پرانتز باشد'
    )
    .optional(),
  latitude: z
    .number()
    .min(-90, 'عرض جغرافیایی باید بین -90 تا 90 باشد')
    .max(90, 'عرض جغرافیایی باید بین -90 تا 90 باشد')
    .optional(),
  longitude: z
    .number()
    .min(-180, 'طول جغرافیایی باید بین -180 تا 180 باشد')
    .max(180, 'طول جغرافیایی باید بین -180 تا 180 باشد')
    .optional(),
  storeTypeId: z.string().min(1, 'انتخاب نوع فروشگاه الزامی است').optional(),
  active: z.boolean().optional(),
});

// Type exports
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
