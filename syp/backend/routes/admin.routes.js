import { Router } from "express";
import { verifyToken, authorizeRoles } from "../middleware/auth.middleware.js";
import {
  getStats,
  getRecentActivity,
  getAllUsers,
  getUserById,
  deleteUser,
  getAllServices,
  deleteService,
  toggleService,
  getAllBookings,
  getAllReviews,
  deleteReview,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyToken, authorizeRoles("Admin"));

router.get("/stats",           getStats);
router.get("/activity",        getRecentActivity);

router.get("/users",           getAllUsers);
router.get("/users/:id",       getUserById);
router.delete("/users/:id",    deleteUser);

router.get("/services",        getAllServices);
router.delete("/services/:id", deleteService);
router.patch("/services/:id",  toggleService);

router.get("/bookings",        getAllBookings);

router.get("/reviews",         getAllReviews);
router.delete("/reviews/:id",  deleteReview);

export default router;
