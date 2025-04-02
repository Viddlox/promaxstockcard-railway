import { Server } from "socket.io";

/** @type {Server | null} */
let ioInstance = null;

/**
 * Initializes the Socket.IO server
 * @param {import("http").Server} httpServer - The HTTP server instance
 * @returns {Server} - The initialized Socket.IO instance
 */
export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Force WebSocket only, prevent duplicate connections
    transports: ["websocket"],
    // Prevent multiple connections from same client
    allowEIO3: true,
    pingTimeout: 30000,
    pingInterval: 25000,
    cleanupEmptyChildNamespaces: true,
  });
  return ioInstance;
};

/**
 * Gets the existing Socket.IO instance
 * @returns {Server} - The Socket.IO instance
 * @throws {Error} If Socket.IO is not initialized
 */
export const getSocket = () => {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized. Call initSocket() first.");
  }
  return ioInstance;
};
