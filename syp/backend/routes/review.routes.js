import { Router } from "express";
import { createReview, getProviderReviews } from "../controllers/review.controller.js";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", verifyToken, authorizeRoles("Customer"), createReview);
router.get("/provider/:providerId", getProviderReviews);

export default router;
