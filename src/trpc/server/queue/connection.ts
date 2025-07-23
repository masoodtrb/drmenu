import IORedis from "ioredis";

// You can customize these options as needed for your environment
export const connection = new IORedis({
  maxRetriesPerRequest: null,
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
});
// export const connection: RedisOptions = {
//   host: process.env.REDIS_HOST || "localhost",
//   port: Number(process.env.REDIS_PORT) || 6379,
//   // password: process.env.REDIS_PASSWORD, // Uncomment if needed
// };
