import { Router } from "express";
import {
  handleGetProducts,
  handlePostCreateProduct,
  handleDeleteProducts,
} from "./handlers.js";

const router = Router();

router.get("/", handleGetProducts);
router.post("/create", handlePostCreateProduct);
router.delete("/delete", handleDeleteProducts);

export { router as productRoutes };
