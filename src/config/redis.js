import Redis from "ioredis";

// Parse Redis URL if provided
const redisUrl = process.env.REDIS_URL || process.env.REDIS_PUBLIC_URL;
let redisConfig;

if (redisUrl) {
  // If we have a URL, parse it and add family=0
  const redisURL = new URL(redisUrl);
  redisConfig = {
    host: redisURL.hostname,
    port: redisURL.port,
    username: redisURL.username || undefined, // Only include if present
    password: redisURL.password || undefined, // Only include if present
    family: 0, // Enable dual stack lookup (IPv4 + IPv6)
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: null,
  };
} else {
  // Fallback for local development
  redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    family: 0,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
}

// Create Redis client with proper configuration
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