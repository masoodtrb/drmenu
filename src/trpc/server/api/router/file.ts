import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
  requireRoles,
} from "@/trpc/server";
import { TRPCError } from "@trpc/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const fileRouter = createTRPCRouter({
  // Upload a file
  upload: privateProcedure
    .input(
      z.object({
        name: z.string(),
        content: z.string(), // base64-encoded file content
        mimeType: z.string(),
        published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, content, mimeType, published = false } = input;
      const user = ctx.user;
      // Decode base64
      const buffer = Buffer.from(content, "base64");
      // Generate unique filename
      const ext = path.extname(name) || "";
      const fileId = uuidv4();
      const fileName = `${fileId}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      // Save file to disk
      await fs.writeFile(filePath, buffer);
      // Create DB record
      const file = await ctx.db.file.create({
        data: {
          name,
          path: filePath, // Store absolute or relative path, not public URL
          size: buffer.length,
          mimeType,
          published,
          storageType: "local",
          ownerId: user.id,
          publishedAt: published ? new Date() : null,
        },
      });
      return { success: true, file };
    }),

  // List files owned by the user
  list: privateProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const files = await ctx.db.file.findMany({
      where: { ownerId: user.id, deletedAt: null },
    });
    return { files };
  }),

  // Delete a file (stub)
  delete: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.user;
      // Find the file
      const file = await ctx.db.file.findUnique({
        where: { id: input.fileId },
      });
      if (!file || file.deletedAt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }
      // Only owner or admin can delete
      if (file.ownerId !== user.id && user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not allowed to delete this file",
        });
      }
      // Remove from disk (if local)
      if (file.storageType === "local") {
        const filePath = path.join(process.cwd(), "public", file.path);
        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          // If file is already gone, ignore
          if (err.code !== "ENOENT") throw err;
        }
      }
      // Soft-delete in DB
      await ctx.db.file.update({
        where: { id: file.id },
        data: { deletedAt: new Date() },
      });
      return { success: true };
    }),

  // Edit file metadata (stub)
  edit: privateProcedure
    .input(z.object({ fileId: z.string(), name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement file metadata update
      return { success: true };
    }),

  // Download a file (stub)
  download: publicProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.file.findUnique({
        where: { id: input.fileId },
      });
      if (!file || file.deletedAt) {
        throw new TRPCError({ code: "NOT_FOUND", message: "File not found" });
      }
      // Only allow if published
      if (!file.published) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not allowed to access this file",
        });
      }
      // Read file from disk
      if (file.storageType === "local") {
        const buffer = await fs.readFile(file.path);
        return buffer;
      }
      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Storage type not supported",
      });
    }),

  // Publish a file (stub)
  publish: requireRoles([Role.ADMIN])
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement publish logic
      return { success: true };
    }),

  // Unpublish a file (stub)
  unpublish: requireRoles([Role.ADMIN])
    .input(z.object({ fileId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // TODO: Implement unpublish logic
      return { success: true };
    }),
});
