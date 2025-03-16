import { Router } from "express";
import {
  handleGetOrders,
  handlePostCreateOrder,
  handleDeleteOrders,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get(
  "/",
  authorizeRole(["ADMIN", "SALES", "OWNER", "STORE"]),
  handleGetOrders
);
router.post(
  "/create",
  authorizeRole(["ADMIN", "SALES", "OWNER", "STORE"]),
  handlePostCreateOrder
);
router.delete("/delete", authorizeRole(["ADMIN", "OWNER"]), handleDeleteOrders);

export { router as orderRoutes };
