import { Router } from "express";
import {
  handleCreateUser,
  handleGetUsers,
  handleDeleteUser,
} from "./handlers.js";

const router = Router();

router.get("/", handleGetUsers);
router.post("/create", handleCreateUser);
router.delete("/delete", handleDeleteUser);

export { router as productRoutes };
