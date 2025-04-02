import { Router } from "express";
import {
  handleDeleteInventoryParts,
  handleGetInventory,
  handlePostCreateInventoryPart,
  handlePatchInventoryPart,
  handleExportInventory,
  handleGetInventoryList,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get(
  "/list",
  authorizeRole(["STORE", "ADMIN", "SALES", "OWNER"]),
  handleGetInventoryList
);
router.get("/", authorizeRole(["ADMIN", "OWNER"]), handleGetInventory);
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
router.get("/export", authorizeRole(["ADMIN", "OWNER"]), handleExportInventory);

export { router as inventoryRoutes };
