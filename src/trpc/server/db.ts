import { PrismaClient } from '@prisma/client';

// Extend the global object to include the PrismaClient instance.
declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Soft delete middleware
(prisma as any).$use(async (params: any, next: any) => {
  // Check if the model has a deletedAt field (soft delete enabled)
  if (
    params.model /*  &&
    [
      "User",
      "Profile",
      "Store",
      "StoreBranch",
      "StoreType",
      "Category",
      "Item",
      "ItemImage",
      "File",
      "SubscriptionPlan",
      "Subscription",
    ].includes(params.model) */
  ) {
    if (params.action === 'delete') {
      // Change delete to update with deletedAt timestamp
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action === 'deleteMany') {
      // Change deleteMany to updateMany with deletedAt timestamp
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }
  }
  return next(params);
});

// In development, ensure the PrismaClient instance is not recreated on hot reloads.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
