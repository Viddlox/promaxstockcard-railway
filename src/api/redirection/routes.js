import { Router } from "express";
import {
  handleGetRedirectionUrl,
  handleCreateRedirectionUrl,
} from "./handlers.js";

const router = Router();

router.get("/:id", handleGetRedirectionUrl);
router.post("/create", handleCreateRedirectionUrl);

export { router as redirectionRoutes };
