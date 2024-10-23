import { Router } from "express";
import { handleGetOrders, handlePostCreateOrder, handleDeleteOrders } from "./handlers.js";

const router = Router()

router.get("/", handleGetOrders)
router.post("/create", handlePostCreateOrder)
router.delete("/delete", handleDeleteOrders)

export { router as orderRoutes }
