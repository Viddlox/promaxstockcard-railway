import { Router } from "express";
import { handleDeleteInventoryParts, handleGetInventory, handlePostCreateInventoryPart } from "./handlers.js";

const router = Router()

router.get("/", handleGetInventory)
router.post("/create", handlePostCreateInventoryPart)
router.delete("/delete", handleDeleteInventoryParts)

export { router as inventoryRoutes }