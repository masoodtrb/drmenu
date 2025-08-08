import { User } from "@prisma/client";
import { redisConnection } from "@/database/redis";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/trpc/server/db";

const USER_HASH_EXPIRE_SECONDS = 60 * 60; // 1 hour

async function storeUserAsHash(
  userKey: string,
  userData: User,
  expireSeconds: number = USER_HASH_EXPIRE_SECONDS
) {
  try {
    const key = `user:${userKey}`;
    // Convert all values to strings for Redis hash
    const hashData: Record<string, any> = {};
    for (const [key, value] of Object.entries(userData)) {
      hashData[key] =
        typeof value === "object" ? JSON.stringify(value) : String(value);
    }
    await redisConnection.hmset(key, hashData);
    await redisConnection.expire(key, expireSeconds);
    console.log("User stored as hash successfully");
  } catch (error) {
    console.error("Error storing user as hash:", error);
  }
}

// Fetch user object from hash
async function fetchUserFromHash(userKey: string) {
  try {
    const key = `user:${userKey}`;
    const userData = (await redisConnection.hgetall(key)) as any as User;
    return Object.keys(userData).length > 0 ? userData : null;
  } catch (error) {
    console.error("Error fetching user from hash:", error);
    return null;
  }
}

function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.username === "string" &&
    typeof obj.password === "string" &&
    typeof obj.role === "string"
  );
}

export const checkUser = async (autToken: string): Promise<User> => {
  try {
    const redisUser = await fetchUserFromHash(autToken);
    if (redisUser && isUser(redisUser)) return redisUser;
    // If not found in Redis, try to verify and decode the JWT
    const payload = jwt.verify(
      autToken,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    // If payload contains userId, fetch user from DB
    if (payload && typeof payload === "object" && payload.userId) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (user) {
        await storeUserAsHash(autToken, user);
        return user;
      }
    }
    throw new Error("User not found or invalid token");
  } catch (error) {
    console.error(error);
    throw error;
  }
};
