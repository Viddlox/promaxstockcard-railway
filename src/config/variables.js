const jwtSecret = process.env.JWT_SECRET;

const redisConfig = {
  host: process.env.REDISHOST || "localhost",
  port: process.env.REDISPORT || 6379,
  password: process.env.REDISPASSWORD,
};

const queueConfig = {
  MIN_JOB_RETRY_DELAY: 1000 * 5,
  MAX_JOB_RETRY_DELAY: 1000 * 60,
  MAX_JOB_RETRY: 20,
  BACKGROUND_RUNNING: true,
};

export { jwtSecret, redisConfig, queueConfig };
