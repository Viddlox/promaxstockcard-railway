import { Router } from "express";
import {
  handleGetProducts,
  handlePostCreateProduct,
  handleDeleteProducts,
  handlePatchProduct,
  handleExportProducts,
  handleGetProductsList,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get(
  "/list",
  authorizeRole(["STORE", "ADMIN", "SALES", "OWNER"]),
  handleGetProductsList
);
router.get("/", authorizeRole(["ADMIN", "SALES", "OWNER"]), handleGetProducts);
router.post(
  "/create",
  authorizeRole(["ADMIN", "OWNER"]),
  handlePostCreateProduct
);
router.delete(
  "/delete",
  authorizeRole(["ADMIN", "OWNER"]),
  handleDeleteProducts
);
router.patch("/update", authorizeRole(["ADMIN", "OWNER"]), handlePatchProduct);
router.get("/export", authorizeRole(["ADMIN", "OWNER"]), handleExportProducts);

export { router as productRoutes };
