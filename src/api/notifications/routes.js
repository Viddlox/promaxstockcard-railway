import { Router } from "express";
import {
  handleGetNotifications,
  handleMarkNotificationsAsRead,
  handleMarkAllNotificationsAsRead,
  handleGetUnreadNotificationsCount,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get("/", authorizeRole(["ADMIN", "OWNER"]), handleGetNotifications);
router.get(
  "/unread-count",
  authorizeRole(["ADMIN", "OWNER"]),
  handleGetUnreadNotificationsCount
);
router.post(
  "/mark-as-read",
  authorizeRole(["ADMIN", "OWNER"]),
  handleMarkNotificationsAsRead
);
router.post(
  "/mark-all-as-read",
  authorizeRole(["ADMIN", "OWNER"]),
  handleMarkAllNotificationsAsRead
);

export { router as notificationRoutes };
