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
  updateBookingStatus,
  getSystemLogs,
  getProviderLocations,
  getRevenueStats
} from "../controllers/admin.controller.js";

const router = Router();

router.use(verifyToken, authorizeRoles("Admin"));

// Dashboard stats
router.get("/stats", getStats);
router.get("/activity", getRecentActivity);
router.get("/revenue", getRevenueStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.delete("/users/:id", deleteUser);

// Service management
router.get("/services", getAllServices);
router.delete("/services/:id", deleteService);
router.patch("/services/:id/toggle", toggleService);

// Booking management
router.get("/bookings", getAllBookings);
router.patch("/bookings/:id/status", updateBookingStatus);

// Review management
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);

// System logs
router.get("/logs", getSystemLogs);

// Live location tracking
router.get("/locations", getProviderLocations);

export default router;