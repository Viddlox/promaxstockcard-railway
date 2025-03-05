module.exports = {
  apps: [
    {
      name: "promax-stockcard",
      script: "src/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 80,
        JWT_SECRET: process.env.JWT_SECRET
      },
    },
  ],
}; 

