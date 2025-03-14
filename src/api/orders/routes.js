import { Router } from "express";
import {
  handleGetOrders,
  handlePostCreateOrder,
  handleDeleteOrders,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get("/", authorizeRole(["ADMIN", "AGENT"]), handleGetOrders);
router.post(
  "/create",
  authorizeRole(["ADMIN", "AGENT"]),
  handlePostCreateOrder
);
router.delete("/delete", authorizeRole(["ADMIN"]), handleDeleteOrders);

export { router as orderRoutes };
