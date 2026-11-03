
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error("Missing Upstash Redis environment variables");
}

export const redis = new Redis({
  url,
  token,
});

// Save recent login metadata for 30 days.
export async function saveRecentLogin(
  userId: string,
  loginData: {
    loggedInAt: string;
    device: string;
  }
) {
  await redis.set(
    `user:login:${userId}`,
    loginData,
    { ex: 60 * 60 * 24 * 30 }
  );
}

// Save recent activity for 7 days.
export async function saveUserActivity(
  userId: string,
  activity: string
) {
  await redis.lpush(`user:activity:${userId}`, {
    activity,
    timestamp: new Date().toISOString(),
  });

  await redis.ltrim(`user:activity:${userId}`, 0, 19);

  await redis.expire(
    `user:activity:${userId}`,
    60 * 60 * 24 * 7
  );
}

// Get recent activity.
export async function getUserActivity(userId: string) {
  return redis.lrange(`user:activity:${userId}`, 0, 19);
}
