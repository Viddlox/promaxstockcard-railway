import { Router } from "express";
import {
  handleGetCustomers,
  handleCreateCustomer,
  handleUpdateCustomer,
  handleDeleteCustomers,
} from "./handlers.js";

import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get("/", authorizeRole(["ADMIN", "AGENT"]), handleGetCustomers);
router.post("/create", authorizeRole(["ADMIN"]), handleCreateCustomer);
router.patch("/update", authorizeRole(["ADMIN"]), handleUpdateCustomer);
router.delete("/delete", authorizeRole(["ADMIN"]), handleDeleteCustomers);

export { router as customerRoutes };
