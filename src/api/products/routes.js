import { Router } from "express";
import {
  handleGetProducts,
  handlePostCreateProduct,
  handleDeleteProducts,
  handlePatchProduct,
} from "./handlers.js";

const router = Router();

router.get("/", handleGetProducts);
router.post("/create", handlePostCreateProduct);
router.delete("/delete", handleDeleteProducts);
router.patch("/update", handlePatchProduct);

export { router as productRoutes };
