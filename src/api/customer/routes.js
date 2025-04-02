import { Router } from "express";
import {
  handleGetCustomers,
  handleCreateCustomer,
  handleUpdateCustomer,
  handleDeleteCustomers,
  handleGetCustomersList,
} from "./handlers.js";

import { authorizeRole } from "../../middleware/index.js";

const router = Router();

router.get(
  "/list",
  authorizeRole(["ADMIN", "SALES", "OWNER"]),
  handleGetCustomersList
);
router.get("/", authorizeRole(["ADMIN", "OWNER"]), handleGetCustomers);
router.post("/create", authorizeRole(["ADMIN", "OWNER"]), handleCreateCustomer);
router.patch(
  "/update",
  authorizeRole(["ADMIN", "OWNER"]),
  handleUpdateCustomer
);
router.delete(
  "/delete",
  authorizeRole(["ADMIN", "OWNER"]),
  handleDeleteCustomers
);

export { router as customerRoutes };
