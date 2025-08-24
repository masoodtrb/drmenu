import { Redis } from "ioredis";

const redisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0", 10),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

// Create separate connections for different purposes
export const redisConnection = new Redis(redisOptions);
export const redisSubscriber = new Redis(redisOptions);
export const redisPublisher = new Redis(redisOptions);

// Graceful shutdown - only in Node.js runtime
if (process.env.NEXT_RUNTIME === "nodejs" && typeof process !== "undefined") {
  process.on("SIGINT", async () => {
    await redisConnection.quit();
    await redisSubscriber.quit();
    await redisPublisher.quit();
    process.exit(0);
  });
}
