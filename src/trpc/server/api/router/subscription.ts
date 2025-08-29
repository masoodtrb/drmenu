import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
  requireRoles,
} from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { Role, SubscriptionStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";

// Validation schemas
const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameFa: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  descriptionFa: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  currency: z.string().default("IRR"),
  interval: z.enum(["MONTHLY", "YEARLY"]),
  features: z.record(z.any()),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  maxStores: z.number().int().min(1),
  maxBranches: z.number().int().min(1),
  maxPublishedMenus: z.number().int().min(1),
  maxItems: z.number().int().min(1),
  maxImages: z.number().int().min(1),
});

const updateSubscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required").optional(),
  nameFa: z.string().optional(),
  description: z.string().min(1, "Description is required").optional(),
  descriptionFa: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  currency: z.string().optional(),
  interval: z.enum(["MONTHLY", "YEARLY"]).optional(),
  features: z.record(z.any()).optional(),
  active: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  maxStores: z.number().int().min(1).optional(),
  maxBranches: z.number().int().min(1).optional(),
  maxPublishedMenus: z.number().int().min(1).optional(),
  maxItems: z.number().int().min(1).optional(),
  maxImages: z.number().int().min(1).optional(),
});

const subscribeSchema = z.object({
  planId: z.string(),
  paymentProvider: z.string(),
  paymentMethod: z.string().optional(),
});

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string(),
  cancelAtPeriodEnd: z.boolean().default(true),
});

const changePlanSchema = z.object({
  subscriptionId: z.string(),
  newPlanId: z.string(),
});

const publishMenuSchema = z.object({
  storeBranchId: z.string(),
});

export const subscriptionRouter = createTRPCRouter({
  // Admin: Create subscription plan
  createPlan: privateProcedure
    .use(requireRoles([Role.ADMIN]))
    .input(createSubscriptionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      // Check if plan name is unique
      const existingPlan = await db.subscriptionPlan.findFirst({
        where: { name: input.name, deletedAt: null },
      });

      if (existingPlan) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A plan with this name already exists",
        });
      }

      // If this is set as default, unset other default plans
      if (input.isDefault) {
        await db.subscriptionPlan.updateMany({
          where: { isDefault: true, deletedAt: null },
          data: { isDefault: false },
        });
      }

      const plan = await db.subscriptionPlan.create({
        data: {
          name: input.name,
          nameFa: input.nameFa,
          description: input.description,
          descriptionFa: input.descriptionFa,
          price: input.price,
          currency: input.currency,
          interval: input.interval,
          features: input.features,
          active: input.active,
          isDefault: input.isDefault,
          maxStores: input.maxStores,
          maxBranches: input.maxBranches,
          maxPublishedMenus: input.maxPublishedMenus,
          maxItems: input.maxItems,
          maxImages: input.maxImages,
        },
      });

      return { success: true, plan };
    }),

  // Public: List subscription plans
  listPlans: publicProcedure
    .input(
      z.object({
        active: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { active, limit, offset } = input;

      const where = {
        deletedAt: null,
        ...(active !== undefined && { active }),
      };

      const [plans, total] = await Promise.all([
        db.subscriptionPlan.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        db.subscriptionPlan.count({ where }),
      ]);

      return {
        plans,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Admin: Update subscription plan
  updatePlan: privateProcedure
    .use(requireRoles([Role.ADMIN]))
    .input(updateSubscriptionPlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, ...updateData } = input;

      // Check if plan exists
      const existingPlan = await db.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!existingPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }

      // Check if plan name is unique (if name is being updated)
      if (updateData.name && updateData.name !== existingPlan.name) {
        const nameExists = await db.subscriptionPlan.findFirst({
          where: { name: updateData.name, deletedAt: null, id: { not: id } },
        });

        if (nameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A plan with this name already exists",
          });
        }
      }

      // If this is set as default, unset other default plans
      if (updateData.isDefault) {
        await db.subscriptionPlan.updateMany({
          where: { isDefault: true, deletedAt: null, id: { not: id } },
          data: { isDefault: false },
        });
      }

      const plan = await db.subscriptionPlan.update({
        where: { id },
        data: updateData,
      });

      return { success: true, plan };
    }),

  // Admin: Delete subscription plan
  deletePlan: privateProcedure
    .use(requireRoles([Role.ADMIN]))
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id } = input;

      // Check if plan exists
      const plan = await db.subscriptionPlan.findUnique({
        where: { id },
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
        },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found",
        });
      }

      // Check if plan has active subscriptions
      if (plan.subscriptions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete plan with active subscriptions",
        });
      }

      // Soft delete the plan
      await db.subscriptionPlan.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return { success: true };
    }),

  // User: Subscribe to a plan
  subscribe: privateProcedure
    .input(subscribeSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { planId, paymentProvider, paymentMethod } = input;

      // Check if plan exists and is active
      const plan = await db.subscriptionPlan.findFirst({
        where: { id: planId, active: true, deletedAt: null },
      });

      if (!plan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Subscription plan not found or inactive",
        });
      }

      // Check if user already has an active subscription
      const existingSubscription = await db.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
      });

      if (existingSubscription) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User already has an active subscription",
        });
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();
      if (plan.interval === "MONTHLY") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      // Create subscription
      const subscription = await db.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: "ACTIVE",
          startDate,
          endDate,
          paymentProvider,
          paymentProviderId: null, // Will be updated after payment processing
        },
      });

      // Create initial payment record
      const payment = await db.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: plan.price,
          currency: plan.currency,
          status: "PENDING",
          paymentProvider,
          paymentMethod,
          description: `Subscription to ${plan.name}`,
        },
      });

      return {
        success: true,
        subscription,
        payment,
        plan,
      };
    }),

  // User: Get user's subscription
  getUserSubscription: privateProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const subscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ["ACTIVE", "TRIAL", "PAST_DUE"] },
      },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        branchMenuSubscriptions: {
          include: {
            storeBranch: {
              include: {
                store: true,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return { subscription: null };
    }

    // Calculate usage statistics
    const userStores = await db.store.count({
      where: { userId: user.id, deletedAt: null },
    });

    const userBranches = await db.storeBranch.count({
      where: { userId: user.id, deletedAt: null },
    });

    const publishedMenus = await db.storeBranch.count({
      where: {
        userId: user.id,
        menuPublished: true,
        deletedAt: null,
      },
    });

    const totalItems = await db.item.count({
      where: {
        category: {
          storeBranch: {
            userId: user.id,
            deletedAt: null,
          },
        },
        deletedAt: null,
      },
    });

    const totalImages = await db.file.count({
      where: {
        ownerId: user.id,
        deletedAt: null,
      },
    });

    return {
      subscription,
      usage: {
        stores: userStores,
        branches: userBranches,
        publishedMenus,
        items: totalItems,
        images: totalImages,
        limits: {
          maxStores: subscription.plan.maxStores,
          maxBranches: subscription.plan.maxBranches,
          maxPublishedMenus: subscription.plan.maxPublishedMenus,
          maxItems: subscription.plan.maxItems,
          maxImages: subscription.plan.maxImages,
        },
      },
    };
  }),

  // User: Cancel subscription
  cancel: privateProcedure
    .input(cancelSubscriptionSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { subscriptionId, cancelAtPeriodEnd } = input;

      const subscription = await db.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId: user.id,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active subscription not found",
        });
      }

      const updatedSubscription = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancelAtPeriodEnd,
          cancelledAt: cancelAtPeriodEnd ? new Date() : null,
          status: cancelAtPeriodEnd ? "CANCELLED" : subscription.status,
        },
      });

      return { success: true, subscription: updatedSubscription };
    }),

  // User: Change subscription plan
  changePlan: privateProcedure
    .input(changePlanSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { subscriptionId, newPlanId } = input;

      // Check if new plan exists
      const newPlan = await db.subscriptionPlan.findFirst({
        where: { id: newPlanId, active: true, deletedAt: null },
      });

      if (!newPlan) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "New subscription plan not found",
        });
      }

      // Check if current subscription exists
      const currentSubscription = await db.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId: user.id,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
        include: { plan: true },
      });

      if (!currentSubscription) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Active subscription not found",
        });
      }

      // Update subscription plan
      const updatedSubscription = await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          planId: newPlanId,
          // Note: In a real implementation, you'd handle proration here
        },
        include: { plan: true },
      });

      return { success: true, subscription: updatedSubscription };
    }),

  // User: Publish menu (requires active subscription)
  publishMenu: privateProcedure
    .input(publishMenuSchema)
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { storeBranchId } = input;

      // Check if user has active subscription
      const subscription = await db.subscription.findFirst({
        where: {
          userId: user.id,
          status: { in: ["ACTIVE", "TRIAL"] },
        },
        include: { plan: true },
      });

      if (!subscription) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active subscription required to publish menu",
        });
      }

      // Check if store branch exists and belongs to user
      const storeBranch = await db.storeBranch.findFirst({
        where: {
          id: storeBranchId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!storeBranch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store branch not found",
        });
      }

      // Check if menu is already published
      if (storeBranch.menuPublished) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Menu is already published",
        });
      }

      // Check published menu limits
      const publishedMenusCount = await db.storeBranch.count({
        where: {
          userId: user.id,
          menuPublished: true,
          deletedAt: null,
        },
      });

      if (publishedMenusCount >= subscription.plan.maxPublishedMenus) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Maximum ${subscription.plan.maxPublishedMenus} published menus allowed`,
        });
      }

      // Publish the menu
      const updatedBranch = await db.storeBranch.update({
        where: { id: storeBranchId },
        data: {
          menuPublished: true,
          menuPublishedAt: new Date(),
        },
      });

      // Create branch menu subscription record
      await db.branchMenuSubscription.create({
        data: {
          storeBranchId,
          subscriptionId: subscription.id,
          isActive: true,
        },
      });

      return { success: true, storeBranch: updatedBranch };
    }),

  // User: Unpublish menu
  unpublishMenu: privateProcedure
    .input(z.object({ storeBranchId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;
      const { storeBranchId } = input;

      // Check if store branch exists and belongs to user
      const storeBranch = await db.storeBranch.findFirst({
        where: {
          id: storeBranchId,
          userId: user.id,
          deletedAt: null,
        },
      });

      if (!storeBranch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store branch not found",
        });
      }

      // Unpublish the menu
      const updatedBranch = await db.storeBranch.update({
        where: { id: storeBranchId },
        data: {
          menuPublished: false,
          menuPublishedAt: null,
        },
      });

      // Deactivate branch menu subscription
      await db.branchMenuSubscription.updateMany({
        where: { storeBranchId },
        data: { isActive: false },
      });

      return { success: true, storeBranch: updatedBranch };
    }),

  // Public: Get published menus
  getPublishedMenus: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { db } = ctx;
      const { limit, offset, search } = input;

      const where = {
        menuPublished: true,
        deletedAt: null,
        store: { deletedAt: null },
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { store: { title: { contains: search, mode: "insensitive" } } },
          ],
        }),
      };

      const [branches, total] = await Promise.all([
        db.storeBranch.findMany({
          where,
          include: {
            store: {
              include: {
                storeType: true,
              },
            },
            Category: {
              where: { active: true, deletedAt: null },
              include: {
                Item: {
                  where: { active: true, deletedAt: null },
                  include: {
                    images: {
                      include: { file: true },
                      orderBy: { order: "asc" },
                    },
                  },
                  orderBy: { sortOrder: "asc" },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { menuPublishedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        db.storeBranch.count({ where }),
      ]);

      return {
        branches,
        total,
        hasMore: offset + limit < total,
      };
    }),

  // Admin: Get subscription statistics
  getStats: privateProcedure
    .use(requireRoles([Role.ADMIN]))
    .query(async ({ ctx }) => {
      const { db } = ctx;

      const [
        totalPlans,
        activePlans,
        totalSubscriptions,
        activeSubscriptions,
        totalRevenue,
        monthlyRevenue,
      ] = await Promise.all([
        db.subscriptionPlan.count({ where: { deletedAt: null } }),
        db.subscriptionPlan.count({
          where: { active: true, deletedAt: null },
        }),
        db.subscription.count(),
        db.subscription.count({
          where: { status: { in: ["ACTIVE", "TRIAL"] } },
        }),
        db.payment.aggregate({
          where: { status: "COMPLETED" },
          _sum: { amount: true },
        }),
        db.payment.aggregate({
          where: {
            status: "COMPLETED",
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        plans: {
          total: totalPlans,
          active: activePlans,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
          monthly: monthlyRevenue._sum.amount || 0,
        },
      };
    }),
});
