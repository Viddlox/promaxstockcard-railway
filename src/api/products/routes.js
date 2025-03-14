import { Router } from "express";
import {
  handleGetProducts,
  handlePostCreateProduct,
  handleDeleteProducts,
  handlePatchProduct,
} from "./handlers.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get("/", authorizeRole(["ADMIN", "AGENT"]), handleGetProducts);
router.post("/create", authorizeRole(["ADMIN"]), handlePostCreateProduct);
router.delete("/delete", authorizeRole(["ADMIN"]), handleDeleteProducts);
router.patch("/update", authorizeRole(["ADMIN"]), handlePatchProduct);

export { router as productRoutes };
