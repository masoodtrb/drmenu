import { Role } from '@prisma/client';

import {
  createTRPCRouter,
  privateProcedure,
  requireRoles,
} from '@/trpc/server';
import { getErrorMessage } from '@/trpc/server/constants/messages';
import {
  SearchFilter,
  StoreQueryBuilder,
} from '@/trpc/server/helper/queryBuilder';

import { TRPCError } from '@trpc/server';

import {
  createStoreSchema,
  deleteStoreSchema,
  getStoreByIdSchema,
  listStoresSchema,
  searchFilterSchema,
  updateStoreSchema,
} from './validation';

export const storeRouter = createTRPCRouter({
  // Create Store (Super Admin only)
  create: requireRoles([Role.ADMIN])
    .input(createStoreSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { title, storeTypeId, active } = input;
        const userId = ctx.user.id;

        // Check if store type exists
        const storeType = await ctx.db.storeType.findUnique({
          where: { id: storeTypeId },
        });

        if (!storeType) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store type not found',
          });
        }

        // Check if store with same title already exists for this user
        const existingStore = await ctx.db.store.findFirst({
          where: {
            title,
            userId,
            deletedAt: null,
          },
        });

        if (existingStore) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Store with this title already exists',
          });
        }

        const store = await ctx.db.store.create({
          data: {
            title,
            storeTypeId,
            active,
            userId,
          },
          include: {
            storeType: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        return {
          success: true,
          store,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create store',
        });
      }
    }),

  // Get Store by ID (Super Admin only)
  getById: requireRoles([Role.ADMIN])
    .input(getStoreByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;

        const store = await ctx.db.store.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          include: {
            storeType: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
            StoreBranch: {
              where: {
                deletedAt: null,
              },
              include: {
                Category: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        });

        if (!store) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store not found',
          });
        }

        return { store };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch store',
        });
      }
    }),

  // List Stores (Super Admin only)
  list: requireRoles([Role.ADMIN])
    .input(listStoresSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          limit,
          offset,
          search,
          advancedSearch,
          active,
          storeTypeId,
          userId,
          createdAfter,
          createdBefore,
          titlePattern,
          storeTypeIds,
        } = input;

        const queryBuilder = new StoreQueryBuilder()
          .paginate(limit, offset)
          .withRelations();

        // Add advanced search if provided
        if (advancedSearch && advancedSearch.length > 0) {
          queryBuilder.searchStoresAdvanced(advancedSearch as SearchFilter[]);
        }
        // Add legacy search if provided
        else if (search) {
          queryBuilder.searchStores(search);
        }

        // Add basic filters if provided
        if (active !== undefined) {
          queryBuilder.byActiveStatus(active);
        }

        if (storeTypeId) {
          queryBuilder.byStoreType(storeTypeId);
        }

        if (userId) {
          queryBuilder.byUser(userId);
        }

        // Add advanced filters
        if (createdAfter || createdBefore) {
          const startDate = createdAfter || new Date(0);
          const endDate = createdBefore || new Date();
          queryBuilder.byCreatedDateRange(startDate, endDate);
        }

        if (titlePattern) {
          queryBuilder.searchStoresAdvanced([
            { field: 'title', value: titlePattern, operation: 'contains' },
          ]);
        }

        if (storeTypeIds && storeTypeIds.length > 0) {
          queryBuilder.byStoreTypeAdvanced(storeTypeIds);
        }

        const result = await queryBuilder.execute();

        return {
          stores: result.data,
          totalCount: result.totalCount,
          hasMore: result.hasMore,
          currentPage: result.currentPage,
          totalPages: result.totalPages,
        };
      } catch (err: unknown) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch stores',
        });
      }
    }),

  // Update Store (Super Admin only)
  update: requireRoles([Role.ADMIN])
    .input(updateStoreSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, title, storeTypeId, active } = input;

        // Check if store exists
        const existingStore = await ctx.db.store.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });

        if (!existingStore) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store not found',
          });
        }

        // Check if store type exists (if provided)
        if (storeTypeId) {
          const storeType = await ctx.db.storeType.findUnique({
            where: { id: storeTypeId },
          });

          if (!storeType) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Store type not found',
            });
          }
        }

        // Check for title conflict (if title is being updated)
        if (title && title !== existingStore.title) {
          const titleConflict = await ctx.db.store.findFirst({
            where: {
              title,
              userId: existingStore.userId,
              id: { not: id },
              deletedAt: null,
            },
          });

          if (titleConflict) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Store with this title already exists',
            });
          }
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (storeTypeId !== undefined) updateData.storeTypeId = storeTypeId;
        if (active !== undefined) updateData.active = active;

        const store = await ctx.db.store.update({
          where: { id },
          data: updateData,
          include: {
            storeType: true,
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        });

        return {
          success: true,
          store,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update store',
        });
      }
    }),

  // Delete Store (Super Admin only)
  delete: requireRoles([Role.ADMIN])
    .input(deleteStoreSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;

        // Check if store exists
        const store = await ctx.db.store.findFirst({
          where: {
            id,
            deletedAt: null,
          },
          include: {
            StoreBranch: {
              where: {
                deletedAt: null,
              },
            },
          },
        });

        if (!store) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store not found',
          });
        }

        // Check if store has active branches
        if (store.StoreBranch.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot delete store with active branches',
          });
        }

        // Soft delete the store
        await ctx.db.store.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        return {
          success: true,
          message: 'Store deleted successfully',
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete store',
        });
      }
    }),

  // Get Store Types (Super Admin only)
  getStoreTypes: requireRoles([Role.ADMIN]).query(async ({ ctx }) => {
    try {
      const storeTypes = await ctx.db.storeType.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          title: 'asc',
        },
      });

      return { storeTypes };
    } catch (err: unknown) {
      console.error(err);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch store types',
      });
    }
  }),

  // Get My Stores (for STORE_ADMIN users)
  getMyStores: privateProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;

      const queryBuilder = new StoreQueryBuilder()
        .byUser(userId)
        .withRelations();

      const result = await queryBuilder.execute();

      return { stores: result.data };
    } catch (err: unknown) {
      console.error(err);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch your stores',
      });
    }
  }),

  // Get My Store by ID (for STORE_ADMIN users)
  getMyStoreById: privateProcedure
    .input(getStoreByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const userId = ctx.user.id;

        const store = await ctx.db.store.findFirst({
          where: {
            id,
            userId,
            deletedAt: null,
          },
          include: {
            storeType: true,
            StoreBranch: {
              where: {
                deletedAt: null,
              },
              include: {
                Category: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
        });

        if (!store) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store not found',
          });
        }

        return { store };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch store',
        });
      }
    }),
});
