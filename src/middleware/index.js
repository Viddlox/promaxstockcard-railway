import { formatErrorResponse } from "../utils/http.js";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/variables.js";

const { verify } = jwt;

const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(formatErrorResponse("Forbidden: Insufficient permissions"));
    }
    next();
  };
};

const authorizeDeleteUser = (req, res, next) => {
  const { userId, role } = req.user; // Extract from JWT
  const { userIds } = req.body; // Users being deleted

  // Ensure only OWNER can delete users
  if (role !== "OWNER") {
    return res
      .status(403)
      .json(formatErrorResponse("Forbidden: Only owners can delete users"));
  }

  // Prevent self-deletion
  if (userIds?.includes(userId)) {
    return res
      .status(403)
      .json(formatErrorResponse("Forbidden: You cannot delete yourself"));
  }

  next();
};

const socketAuthMiddleware = (socket, next) => {
  // Get token from auth object or headers
  let token = socket.handshake.auth.token;

  // If no token in auth, try headers
  if (!token && socket.handshake.headers.authorization) {
    const authHeader = socket.handshake.headers.authorization;
    token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;
  }

  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    // Clean the token if needed
    const cleanToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    const decoded = verify(cleanToken, jwtSecret);

    // Reject users who are not "admin" or "owner"
    if (!["ADMIN", "OWNER"].includes(decoded.role)) {
      return next(new Error("Authentication error: Unauthorized role"));
    }

    // Store user info in socket object
    socket.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return next(new Error(`Authentication error: ${error.message}`));
  }
};

export { socketAuthMiddleware, authorizeDeleteUser, authorizeRole };
