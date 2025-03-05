import { Router } from "express";
import { handleGetDashboardMetrics } from "./handlers.js";

const router = Router();

router.get("/", handleGetDashboardMetrics);

export { router as dashboardRoutes };
