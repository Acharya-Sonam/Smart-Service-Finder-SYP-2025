import { Router } from "express";
import { signup, login, getMe, forgotPassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword); 
router.get("/me", verifyToken, getMe);

export default router;