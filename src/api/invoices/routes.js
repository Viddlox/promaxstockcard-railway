import { Router } from "express";
import { handleGetInvoices, handlePostCreateInvoice } from "./handlers.js";

const router = Router();

router.get("/", handleGetInvoices);
router.post("/create", handlePostCreateInvoice);

export { router as invoicesRoutes };
