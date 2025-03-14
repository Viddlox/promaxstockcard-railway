import { Router } from "express";
import {
  handleDeleteInventoryParts,
  handleGetInventory,
  handlePostCreateInventoryPart,
  handlePatchInventoryPart,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get("/", authorizeRole(["ADMIN", "AGENT"]), handleGetInventory);
router.post("/create", authorizeRole(["ADMIN"]), handlePostCreateInventoryPart);
router.delete("/delete", authorizeRole(["ADMIN"]), handleDeleteInventoryParts);
router.patch("/update", authorizeRole(["ADMIN"]), handlePatchInventoryPart);

export { router as inventoryRoutes };
