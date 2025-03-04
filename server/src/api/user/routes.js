import { Router } from "express";
import {
  handleCreateUser,
  handleGetUsers,
  handleDeleteUsers,
  handleSignIn,
  handleSignOut,
  generateTokensHandler,
} from "./handlers.js";
import { passport } from "../../config/passport.js";

const router = Router();
const passportAuth = passport.authenticate("jwt", { session: false });

router.post("/sign-in", handleSignIn);
router.post("/token", generateTokensHandler);
router.use(passportAuth);
router.get("/", handleGetUsers);
router.post("/create", handleCreateUser);
router.delete("/delete", handleDeleteUsers);
router.post("/sign-out", handleSignOut);

export { router as userRoutes };
