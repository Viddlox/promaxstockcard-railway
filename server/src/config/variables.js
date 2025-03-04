module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  REDIS_URL: {
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASS,
    },
  },
};
