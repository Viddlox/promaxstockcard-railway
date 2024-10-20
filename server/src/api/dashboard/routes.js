import { Router } from "express";
import {
  handleGetSalesSummary,
  handleGetInventorySummary,
} from "./handlers.js";

const router = Router();

router.get("/sales-summary", handleGetSalesSummary);
router.get("/inventory-summary", handleGetInventorySummary);

export { router as dashboardRoutes };
