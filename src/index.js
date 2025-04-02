import dotenv from "dotenv";
// Load environment variables first
dotenv.config();

// Then import other modules
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import { passport } from "./config/passport.js";
import { createServer } from "http";
import { socketAuthMiddleware } from "./middleware/index.js";
import { initSocket } from "./config/socket.js";
import { shutdownRedis } from "./config/redis.js";
import { shutdownEmailQueue } from "./queues/notificationEmailQueue.js";

import { productRoutes } from "./api/products/routes.js";
import { inventoryRoutes } from "./api/inventory/routes.js";
import { orderRoutes } from "./api/orders/routes.js";
import { customerRoutes } from "./api/customer/routes.js";
import { userRoutes } from "./api/user/routes.js";
import { redirectionRoutes } from "./api/redirection/routes.js";
import { notificationRoutes } from "./api/notifications/routes.js";

/* CONFIGURATIONS */
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* Initialize Passport */
app.use(passport.initialize());
const passportAuth = passport.authenticate("jwt", { session: false });

/* Initialize Socket IO Server */
const httpServer = createServer(app);
const io = initSocket(httpServer); // Initialize Socket.IO
io.use(socketAuthMiddleware);

/* ROUTES */
app.use("/products", passportAuth, productRoutes);
app.use("/inventory", passportAuth, inventoryRoutes);
app.use("/orders", passportAuth, orderRoutes);
app.use("/customers", passportAuth, customerRoutes);
app.use("/redirection", passportAuth, redirectionRoutes);
app.use("/notifications", passportAuth, notificationRoutes);
app.use("/users", userRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3000;

// Use the httpServer (that has both Express and Socket.io) to listen
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id} | User: ${socket.user.userId} | Role: ${socket.user.role}`
  );

  // Users join both their role room and a personal room
  socket.join(`user:${socket.user.userId}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Global flag to prevent multiple shutdown attempts
let isShuttingDown = false;

// Simplified graceful shutdown handler
const gracefulShutdown = async (signal) => {
  // Prevent multiple shutdown attempts
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${signal} received. Shutting down...`);

  // Force exit after timeout (safety net)
  const forceExit = setTimeout(() => {
    console.error("Forcing exit after timeout");
    process.exit(1);
  }, 10000); // 10 seconds timeout

  try {
    // Shutdown all services at once
    await Promise.all([
      // Close HTTP server
      new Promise((resolve) => httpServer.close(resolve)),
      // Close email queue
      shutdownEmailQueue(signal),
      // Close Redis
      shutdownRedis(signal),
    ]);

    // Give a moment for any remaining callbacks
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Success
    clearTimeout(forceExit);
    console.log("Shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

// Register the shutdown handlers for different signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
