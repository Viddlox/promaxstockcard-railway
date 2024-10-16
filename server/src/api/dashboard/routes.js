import { Router } from "express";
import { handleGetTopProducts, handleGetSalesSummary, handleGetInventorySummary } from "./handlers.js";

const router = Router()

router.get("/top-products", handleGetTopProducts)
router.get("/sales-summary", handleGetSalesSummary)
router.get("/inventory-summary", handleGetInventorySummary)

export { router as dashboardRoutes }