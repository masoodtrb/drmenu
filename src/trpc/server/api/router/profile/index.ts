import {
  createTRPCRouter,
  privateProcedure,
  requireRoles,
} from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  // Get current user's profile (/me)
  me: privateProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const profile = await ctx.db.profile.findUnique({
      where: { userId: user.id },
    });
    return { user, profile };
  }),

  // Get current admin's profile (/admin/me)
  adminMe: requireRoles([Role.ADMIN]).query(async ({ ctx }) => {
    const user = ctx.user;
    const profile = await ctx.db.profile.findUnique({
      where: { userId: user.id },
    });
    return { user, profile };
  }),

  // Create profile
  createProfile: privateProcedure
    .input(
      z.object({
        firstName: z.string(),
        lastName: z.string(),
        nationalId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const profile = await ctx.db.profile.create({
        data: { ...input, userId: user.id },
      });
      return profile;
    }),

  // Update profile
  updateProfile: privateProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        nationalId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      const targetUserId = input.userId ?? user.id;
      // Only allow if admin or owner
      if (input.userId && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admin can update other users' profiles.",
        });
      }
      if (!input.userId && user.id !== targetUserId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own profile.",
        });
      }
      const profile = await ctx.db.profile.update({
        where: { userId: targetUserId },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          nationalId: input.nationalId,
        },
      });
      return profile;
    }),

  // Delete profile
  deleteProfile: requireRoles([Role.ADMIN]).mutation(async ({ ctx }) => {
    const user = ctx.user;
    await ctx.db.profile.delete({ where: { userId: user.id } });
    return { success: true };
  }),

  // Get profile by userId (admin only)
  getProfileByUserId: requireRoles([Role.ADMIN])
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const profile = await ctx.db.profile.findUnique({
        where: { userId: input.userId },
      });
      return profile;
    }),
});
