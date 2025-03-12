import { Router } from "express";
import {
  handleDeleteInventoryParts,
  handleGetInventory,
  handlePostCreateInventoryPart,
  handlePatchInventoryPart,
} from "./handlers.js";

const router = Router();

router.get("/", handleGetInventory);
router.post("/create", handlePostCreateInventoryPart);
router.delete("/delete", handleDeleteInventoryParts);
router.patch("/update", handlePatchInventoryPart);

export { router as inventoryRoutes };
