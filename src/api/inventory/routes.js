import { Router } from "express";
import {
  handleDeleteInventoryParts,
  handleGetInventory,
  handlePostCreateInventoryPart,
  handlePatchInventoryPart,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get("/", authorizeRole(["ADMIN", "OWNER", "STORE"]), handleGetInventory);
router.post(
  "/create",
  authorizeRole(["ADMIN", "OWNER"]),
  handlePostCreateInventoryPart
);
router.delete(
  "/delete",
  authorizeRole(["ADMIN", "OWNER"]),
  handleDeleteInventoryParts
);
router.patch(
  "/update",
  authorizeRole(["ADMIN", "OWNER"]),
  handlePatchInventoryPart
);

export { router as inventoryRoutes };
