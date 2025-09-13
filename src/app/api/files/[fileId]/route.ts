import { promises as fs } from 'fs';
import path from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { createTRPCContext } from '@/trpc/server';
import { fileRouter } from '@/trpc/server/api/router/file';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // Create tRPC context
    const ctx = await createTRPCContext({
      headers: request.headers,
      req: request,
      res: new Response(),
    });

    // Get file info from tRPC
    const caller = fileRouter.createCaller(ctx);
    const fileInfo = await caller.getFileUrl({ fileId });

    // Read file from disk
    const filePath = path.join(process.cwd(), 'uploads', fileInfo.path);
    const fileBuffer = await fs.readFile(filePath);

    // Try to determine content type from file extension
    const ext = path.extname(fileInfo.path).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
    };

    const contentType =
      mimeTypes[ext] || fileInfo.mimeType || 'application/octet-stream';

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
