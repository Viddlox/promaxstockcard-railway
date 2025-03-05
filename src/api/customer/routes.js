import { Router } from "express";
import { handleGetCustomers } from "./handlers.js";

const router = Router();

router.get("/", handleGetCustomers);

export { router as customerRoutes };
