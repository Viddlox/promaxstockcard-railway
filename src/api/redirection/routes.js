import { Router } from "express";
import { handleCreateRedirectionUrl } from "./handlers.js";

const router = Router();

router.post("/create", handleCreateRedirectionUrl);

export { router as redirectionRoutes };
