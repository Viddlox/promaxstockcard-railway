import { formatErrorResponse } from "../utils/http.js";

export const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json(formatErrorResponse("Forbidden: Insufficient permissions"));
    }
    next();
  };
};

export const authorizeDeleteUser = (req, res, next) => {
  const { userId, role } = req.user; // Extract from JWT
  const { userIds } = req.body; // Users being deleted

  // Ensure only ADMIN can delete users
  if (role !== "ADMIN") {
    return res
      .status(403)
      .json(formatErrorResponse("Forbidden: Only admins can delete users"));
  }

  // Prevent self-deletion
  if (userIds?.includes(userId)) {
    return res
      .status(403)
      .json(formatErrorResponse("Forbidden: You cannot delete yourself"));
  }

  next();
};
