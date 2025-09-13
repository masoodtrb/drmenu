import { Role } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
  requireRoles,
} from '@/trpc/server';

import { TRPCError } from '@trpc/server';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

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
      const buffer = Buffer.from(content, 'base64');
      // Generate unique filename
      const ext = path.extname(name) || '';
      const fileId = uuidv4();
      const fileName = `${fileId}${ext}`;
      const filePath = path.join(UPLOAD_DIR, fileName);

      // Ensure upload directory exists
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Save file to disk
      await fs.writeFile(filePath, buffer);

      // Create DB record
      const file = await ctx.db.file.create({
        data: {
          name,
          path: fileName, // Store just the filename, not full path
          size: buffer.length,
          mimeType,
          published,
          storageType: 'local',
          ownerId: user.id,
          publishedAt: published ? new Date() : null,
        },
      });

      return {
        success: true,
        file: {
          id: file.id,
          name: file.name,
          url: `/api/files/${file.id}`, // Return the public URL using file ID
          size: file.size,
          mimeType: file.mimeType,
        },
      };
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
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
      }
      // Only owner or admin can delete
      if (file.ownerId !== user.id && user.role !== 'ADMIN') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not allowed to delete this file',
        });
      }
      // Remove from disk (if local)
      if (file.storageType === 'local') {
        const filePath = path.join(UPLOAD_DIR, file.path);
        try {
          await fs.unlink(filePath);
        } catch (err: any) {
          // If file is already gone, ignore
          if (err.code !== 'ENOENT') throw err;
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

  // Get file info and URL
  getFileInfo: publicProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.file.findUnique({
        where: { id: input.fileId },
      });
      if (!file || file.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
      }
      // Only allow if published
      if (!file.published) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not allowed to access this file',
        });
      }

      return {
        id: file.id,
        name: file.name,
        url: `/api/files/${file.path}`, // This will be served by Next.js API route
        size: file.size,
        mimeType: file.mimeType,
      };
    }),

  // Get file URL for serving (used by Next.js API route)
  getFileUrl: publicProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ ctx, input }) => {
      const file = await ctx.db.file.findUnique({
        where: { id: input.fileId },
      });
      if (!file || file.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' });
      }
      // Only allow if published
      if (!file.published) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not allowed to access this file',
        });
      }

      return {
        path: file.path,
        mimeType: file.mimeType,
      };
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
