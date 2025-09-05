import { NextResponse } from "next/server";
import { db } from "@/trpc/server/db";
import { createClient } from "@/database/redis";

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    // Check Redis connection
    const redis = createClient();
    await redis.ping();
    await redis.disconnect();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        redis: "connected",
        application: "running",
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
