import { NextResponse } from 'next/server';

import { redisConnection } from '@/database/redis';
import { prisma as db } from '@/trpc/server/db';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    // Check Redis connection
    const redis = redisConnection;
    await redis.ping();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        application: 'running',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
