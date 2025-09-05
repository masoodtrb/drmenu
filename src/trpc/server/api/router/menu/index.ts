import { Role } from '@prisma/client';

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
  requireRoles,
} from '@/trpc/server';
import { getErrorMessage } from '@/trpc/server/constants/messages';

import { TRPCError } from '@trpc/server';

import {
  createCategorySchema,
  createItemSchema,
  deleteCategorySchema,
  deleteItemSchema,
  getCategoryByIdSchema,
  getItemByIdSchema,
  getPublicItemSchema,
  getPublicMenuSchema,
  listCategoriesSchema,
  listItemsSchema,
  updateCategorySchema,
  updateItemSchema,
} from './validation';

export const menuRouter = createTRPCRouter({
  // ==================== CATEGORY ENDPOINTS ====================

  // Create Category
  createCategory: privateProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { title, icon, description, active, storeBranchId } = input;
        const userId = ctx.user.id;

        // Check if store branch exists and user has access
        const storeBranch = await ctx.db.storeBranch.findFirst({
          where: {
            id: storeBranchId,
            userId,
            deletedAt: null,
          },
          include: {
            store: true,
          },
        });

        if (!storeBranch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store branch not found or access denied',
          });
        }

        // Check if category with same title already exists in this branch
        const existingCategory = await ctx.db.category.findFirst({
          where: {
            title,
            storeBranchId,
            deletedAt: null,
          },
        });

        if (existingCategory) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Category with this title already exists in this branch',
          });
        }

        const category = await ctx.db.category.create({
          data: {
            title,
            icon,
            description,
            active: active ?? false,
            storeBranchId,
          },
          include: {
            branch: {
              include: {
                store: true,
              },
            },
          },
        });

        return {
          success: true,
          category,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create category',
        });
      }
    }),

  // Get Category by ID
  getCategoryById: privateProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const userId = ctx.user.id;

        const category = await ctx.db.category.findFirst({
          where: {
            id,
            deletedAt: null,
            branch: {
              userId,
              deletedAt: null,
            },
          },
          include: {
            branch: {
              include: {
                store: true,
              },
            },
            Item: {
              where: {
                deletedAt: null,
              },
              include: {
                images: {
                  include: {
                    file: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found',
          });
        }

        return { category };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch category',
        });
      }
    }),

  // List Categories
  listCategories: privateProcedure
    .input(listCategoriesSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { storeBranchId, limit, offset, active, search } = input;
        const userId = ctx.user.id;

        // Verify user has access to this store branch
        const storeBranch = await ctx.db.storeBranch.findFirst({
          where: {
            id: storeBranchId,
            userId,
            deletedAt: null,
          },
        });

        if (!storeBranch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store branch not found or access denied',
          });
        }

        const whereClause: any = {
          storeBranchId,
          deletedAt: null,
        };

        if (active !== undefined) {
          whereClause.active = active;
        }

        if (search) {
          whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [categories, totalCount] = await Promise.all([
          ctx.db.category.findMany({
            where: whereClause,
            include: {
              Item: {
                where: {
                  deletedAt: null,
                },
                select: {
                  id: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip: offset,
          }),
          ctx.db.category.count({
            where: whereClause,
          }),
        ]);

        return {
          categories,
          totalCount,
          hasMore: offset + limit < totalCount,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch categories',
        });
      }
    }),

  // Update Category
  updateCategory: privateProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, title, icon, description, active } = input;
        const userId = ctx.user.id;

        // Check if category exists and user has access
        const existingCategory = await ctx.db.category.findFirst({
          where: {
            id,
            deletedAt: null,
            branch: {
              userId,
              deletedAt: null,
            },
          },
        });

        if (!existingCategory) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found or access denied',
          });
        }

        // Check for title conflict if title is being updated
        if (title && title !== existingCategory.title) {
          const titleConflict = await ctx.db.category.findFirst({
            where: {
              title,
              storeBranchId: existingCategory.storeBranchId,
              id: { not: id },
              deletedAt: null,
            },
          });

          if (titleConflict) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Category with this title already exists in this branch',
            });
          }
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (icon !== undefined) updateData.icon = icon;
        if (description !== undefined) updateData.description = description;
        if (active !== undefined) updateData.active = active;

        const category = await ctx.db.category.update({
          where: { id },
          data: updateData,
          include: {
            branch: {
              include: {
                store: true,
              },
            },
          },
        });

        return {
          success: true,
          category,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update category',
        });
      }
    }),

  // Delete Category
  deleteCategory: privateProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const userId = ctx.user.id;

        // Check if category exists and user has access
        const category = await ctx.db.category.findFirst({
          where: {
            id,
            deletedAt: null,
            branch: {
              userId,
              deletedAt: null,
            },
          },
          include: {
            Item: {
              where: {
                deletedAt: null,
              },
            },
          },
        });

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found or access denied',
          });
        }

        // Check if category has items
        if (category.Item.length > 0) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Cannot delete category with existing items',
          });
        }

        // Soft delete the category
        await ctx.db.category.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        return {
          success: true,
          message: 'Category deleted successfully',
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete category',
        });
      }
    }),

  // ==================== ITEM ENDPOINTS ====================

  // Create Item
  createItem: privateProcedure
    .input(createItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          title,
          icon,
          description,
          price,
          currency,
          active,
          categoryId,
          imageIds,
        } = input;
        const userId = ctx.user.id;

        // Check if category exists and user has access
        const category = await ctx.db.category.findFirst({
          where: {
            id: categoryId,
            deletedAt: null,
            branch: {
              userId,
              deletedAt: null,
            },
          },
        });

        if (!category) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Category not found or access denied',
          });
        }

        // Check if item with same title already exists in this category
        const existingItem = await ctx.db.item.findFirst({
          where: {
            title,
            categoryId,
            deletedAt: null,
          },
        });

        if (existingItem) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Item with this title already exists in this category',
          });
        }

        // Create the item
        const item = await ctx.db.item.create({
          data: {
            title,
            icon,
            description,
            price,
            currency,
            active: active ?? false,
            categoryId,
          },
          include: {
            category: {
              include: {
                branch: {
                  include: {
                    store: true,
                  },
                },
              },
            },
          },
        });

        // Add images if provided
        if (imageIds && imageIds.length > 0) {
          // Verify that all files exist and belong to the user
          const files = await ctx.db.file.findMany({
            where: {
              id: { in: imageIds },
              ownerId: userId,
              deletedAt: null,
            },
          });

          if (files.length !== imageIds.length) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Some files not found or access denied',
            });
          }

          // Create item images
          const itemImages = imageIds.map((fileId, index) => ({
            itemId: item.id,
            fileId,
            order: index,
            isPrimary: index === 0, // First image is primary
          }));

          await ctx.db.itemImage.createMany({
            data: itemImages,
          });
        }

        // Fetch the item with images
        const itemWithImages = await ctx.db.item.findUnique({
          where: { id: item.id },
          include: {
            category: {
              include: {
                branch: {
                  include: {
                    store: true,
                  },
                },
              },
            },
            images: {
              include: {
                file: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        });

        return {
          success: true,
          item: itemWithImages,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create item',
        });
      }
    }),

  // Get Item by ID
  getItemById: privateProcedure
    .input(getItemByIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const userId = ctx.user.id;

        const item = await ctx.db.item.findFirst({
          where: {
            id,
            deletedAt: null,
            category: {
              branch: {
                userId,
                deletedAt: null,
              },
            },
          },
          include: {
            category: {
              include: {
                branch: {
                  include: {
                    store: true,
                  },
                },
              },
            },
            images: {
              include: {
                file: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        });

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found',
          });
        }

        return { item };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch item',
        });
      }
    }),

  // List Items
  listItems: privateProcedure
    .input(listItemsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          categoryId,
          storeBranchId,
          limit,
          offset,
          active,
          search,
          minPrice,
          maxPrice,
        } = input;
        const userId = ctx.user.id;

        const whereClause: any = {
          deletedAt: null,
        };

        // Filter by category if provided
        if (categoryId) {
          whereClause.categoryId = categoryId;
          // Verify user has access to this category
          const category = await ctx.db.category.findFirst({
            where: {
              id: categoryId,
              deletedAt: null,
              branch: {
                userId,
                deletedAt: null,
              },
            },
          });

          if (!category) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Category not found or access denied',
            });
          }
        }

        // Filter by store branch if provided
        if (storeBranchId) {
          whereClause.category = {
            storeBranchId,
            deletedAt: null,
            branch: {
              userId,
              deletedAt: null,
            },
          };
        }

        if (active !== undefined) {
          whereClause.active = active;
        }

        if (search) {
          whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }

        if (minPrice !== undefined) {
          whereClause.price = { gte: minPrice };
        }

        if (maxPrice !== undefined) {
          whereClause.price = { ...whereClause.price, lte: maxPrice };
        }

        const [items, totalCount] = await Promise.all([
          ctx.db.item.findMany({
            where: whereClause,
            include: {
              category: {
                include: {
                  branch: {
                    include: {
                      store: true,
                    },
                  },
                },
              },
              images: {
                include: {
                  file: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: limit,
            skip: offset,
          }),
          ctx.db.item.count({
            where: whereClause,
          }),
        ]);

        return {
          items,
          totalCount,
          hasMore: offset + limit < totalCount,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch items',
        });
      }
    }),

  // Update Item
  updateItem: privateProcedure
    .input(updateItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const {
          id,
          title,
          icon,
          description,
          price,
          currency,
          active,
          categoryId,
          imageIds,
        } = input;
        const userId = ctx.user.id;

        // Check if item exists and user has access
        const existingItem = await ctx.db.item.findFirst({
          where: {
            id,
            deletedAt: null,
            category: {
              branch: {
                userId,
                deletedAt: null,
              },
            },
          },
        });

        if (!existingItem) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found or access denied',
          });
        }

        // Check if category exists and user has access (if category is being updated)
        if (categoryId && categoryId !== existingItem.categoryId) {
          const category = await ctx.db.category.findFirst({
            where: {
              id: categoryId,
              deletedAt: null,
              branch: {
                userId,
                deletedAt: null,
              },
            },
          });

          if (!category) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Category not found or access denied',
            });
          }
        }

        // Check for title conflict if title is being updated
        if (title && title !== existingItem.title) {
          const titleConflict = await ctx.db.item.findFirst({
            where: {
              title,
              categoryId: categoryId || existingItem.categoryId,
              id: { not: id },
              deletedAt: null,
            },
          });

          if (titleConflict) {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Item with this title already exists in this category',
            });
          }
        }

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (icon !== undefined) updateData.icon = icon;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (currency !== undefined) updateData.currency = currency;
        if (active !== undefined) updateData.active = active;
        if (categoryId !== undefined) updateData.categoryId = categoryId;

        const item = await ctx.db.item.update({
          where: { id },
          data: updateData,
          include: {
            category: {
              include: {
                branch: {
                  include: {
                    store: true,
                  },
                },
              },
            },
          },
        });

        // Update images if provided
        if (imageIds !== undefined) {
          // Remove existing images
          await ctx.db.itemImage.deleteMany({
            where: { itemId: id },
          });

          // Add new images if provided
          if (imageIds.length > 0) {
            // Verify that all files exist and belong to the user
            const files = await ctx.db.file.findMany({
              where: {
                id: { in: imageIds },
                ownerId: userId,
                deletedAt: null,
              },
            });

            if (files.length !== imageIds.length) {
              throw new TRPCError({
                code: 'BAD_REQUEST',
                message: 'Some files not found or access denied',
              });
            }

            // Create item images
            const itemImages = imageIds.map((fileId, index) => ({
              itemId: id,
              fileId,
              order: index,
              isPrimary: index === 0, // First image is primary
            }));

            await ctx.db.itemImage.createMany({
              data: itemImages,
            });
          }
        }

        // Fetch the item with images
        const itemWithImages = await ctx.db.item.findUnique({
          where: { id },
          include: {
            category: {
              include: {
                branch: {
                  include: {
                    store: true,
                  },
                },
              },
            },
            images: {
              include: {
                file: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        });

        return {
          success: true,
          item: itemWithImages,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update item',
        });
      }
    }),

  // Delete Item
  deleteItem: privateProcedure
    .input(deleteItemSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id } = input;
        const userId = ctx.user.id;

        // Check if item exists and user has access
        const item = await ctx.db.item.findFirst({
          where: {
            id,
            deletedAt: null,
            category: {
              branch: {
                userId,
                deletedAt: null,
              },
            },
          },
        });

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found or access denied',
          });
        }

        // Soft delete the item
        await ctx.db.item.update({
          where: { id },
          data: { deletedAt: new Date() },
        });

        return {
          success: true,
          message: 'Item deleted successfully',
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete item',
        });
      }
    }),

  // ==================== PUBLIC MENU ENDPOINTS ====================

  // Get Public Menu (for customers)
  getPublicMenu: publicProcedure
    .input(getPublicMenuSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { storeBranchId, includeInactive } = input;

        // Check if store branch exists and is active
        const storeBranch = await ctx.db.storeBranch.findFirst({
          where: {
            id: storeBranchId,
            active: true,
            deletedAt: null,
            store: {
              active: true,
              deletedAt: null,
            },
          },
          include: {
            store: true,
          },
        });

        if (!storeBranch) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Store branch not found or inactive',
          });
        }

        const categoryWhereClause: any = {
          storeBranchId,
          deletedAt: null,
        };

        if (!includeInactive) {
          categoryWhereClause.active = true;
        }

        const categories = await ctx.db.category.findMany({
          where: categoryWhereClause,
          include: {
            Item: {
              where: {
                deletedAt: null,
                ...(includeInactive ? {} : { active: true }),
              },
              include: {
                images: {
                  include: {
                    file: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        return {
          storeBranch,
          categories,
        };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch menu',
        });
      }
    }),

  // Get Public Item (for customers)
  getPublicItem: publicProcedure
    .input(getPublicItemSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { id } = input;

        const item = await ctx.db.item.findFirst({
          where: {
            id,
            deletedAt: null,
            active: true,
            category: {
              active: true,
              deletedAt: null,
              branch: {
                active: true,
                deletedAt: null,
                store: {
                  active: true,
                  deletedAt: null,
                },
              },
            },
          },
          include: {
            category: {
              include: {
                branch: {
                  include: {
                    store: true,
                  },
                },
              },
            },
            images: {
              include: {
                file: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        });

        if (!item) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Item not found or inactive',
          });
        }

        return { item };
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof TRPCError) {
          throw err;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch item',
        });
      }
    }),
});
