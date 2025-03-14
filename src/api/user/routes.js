import { Router } from "express";
import {
  handleCreateUser,
  handleGetUsers,
  handleDeleteUsers,
  handleSignIn,
  handleSignOut,
  generateTokensHandler,
  handleUpdateUser,
  handleGetMe,
} from "./handlers.js";
import { passport } from "../../config/passport.js";
import { authorizeDeleteUser } from "../../middleware/index.js";
import { authorizeRole } from "../../middleware/index.js";

const router = Router();
const passportAuth = passport.authenticate("jwt", { session: false });

router.post("/sign-in", handleSignIn);
router.post("/token", generateTokensHandler);
router.use(passportAuth);
router.get("/", authorizeRole(["ADMIN", "AGENT"]), handleGetUsers);
router.post("/create", authorizeRole(["ADMIN"]), handleCreateUser);
router.patch("/update", authorizeRole(["ADMIN"]), handleUpdateUser);
router.delete("/delete", authorizeDeleteUser, handleDeleteUsers);
router.get("/me", handleGetMe);
router.post("/sign-out", handleSignOut);

export { router as userRoutes };
