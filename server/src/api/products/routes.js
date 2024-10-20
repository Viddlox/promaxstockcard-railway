import { Router } from "express";
import {
  handleGetProducts,
  handlePostCreateProduct,
  handleGetTopProducts,
  handleDeleteProducts,
} from "./handlers.js";

const router = Router();

router.get("/", handleGetProducts);
router.get("/top", handleGetTopProducts);
router.post("/create", handlePostCreateProduct);
router.delete("/delete", handleDeleteProducts);

export { router as productRoutes };
