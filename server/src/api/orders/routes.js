import { Router } from "express";
import { handleGetOrders, handlePostCreateOrder } from "./handlers.js";

const router = Router()

router.get("/", handleGetOrders)
router.post("/create", handlePostCreateOrder)

export { router as orderRoutes }
