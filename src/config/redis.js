import Redis from "ioredis";

// Create standard Redis client for general use
const redisConfig = {
  host: process.env.REDISHOST || "localhost",
  port: process.env.REDISPORT || 6379,
  password: process.env.REDISPASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null,
};

export const redisConnection = new Redis(redisConfig);

// Handle Redis connection events
redisConnection.on("connect", () => {
  console.log("Redis connected successfully");
});

redisConnection.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redisConnection.on("close", () => {
  console.log("Redis connection closed");
});

// Simplified graceful shutdown for Redis
export const shutdownRedis = async () => {
  try {
    await redisConnection.quit();
    return true;
  } catch (error) {
    console.error("Redis shutdown error:", error);
    redisConnection.disconnect();
    return false;
  }
};